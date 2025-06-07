import { seq } from 'transducers.js'
import { apiClient } from '@lib/api'
import { normalize, Schema } from 'normalizr'
import type { AppDispatch, RootState } from '@store/store'
import type { ThunkAction } from 'redux-thunk'
import type { PaginationMeta, EntityMeta } from './types'

type ApiVerb = 'GET' | 'POST' | 'PUT' | 'DELETE'

// Type for the parameters passed INTO the generated thunk
interface ApiRequestParams {
  queryString?: string
  body?: Record<string, unknown> | unknown[] | undefined
  meta: PaginationMeta | EntityMeta
}

// Generic types for transform functions
type TransformFunction<Input = any, Output = any> = (data: Input) => Output
type BeforeTransform = TransformFunction
type XfTransform = any
type AfterTransform = TransformFunction

// Type for the configuration of the factory itself
interface ApiThunkConfig {
  types: [string, string, string] // Request, Success, Failure
  endpoint: string
  verb: ApiVerb
  schema?: Schema
  transform?: [
    before?: BeforeTransform,
    xf?: XfTransform,
    after?: AfterTransform
  ]
  cb?: (err: Error | null, res?: any) => void
}

// Extracted Factory Function (~80 lines)
export function createApiRequestThunk({
  types,
  endpoint,
  verb,
  schema,
  transform: [before, xf, after] = [null, null, null],
  cb
}: ApiThunkConfig): (
  params: ApiRequestParams
) => ThunkAction<Promise<any>, RootState, unknown, any> {
  const [requestType, successType, failureType] = types

  // Return the actual thunk action creator
  return ({ queryString = '', body, meta }) =>
    async (dispatch: AppDispatch) => {
      const finalEndpoint = `${endpoint}${queryString}`

      // Dispatch request action immediately
      dispatch({ type: requestType, meta })

      try {
        // Perform API call using apiClient
        let response: any
        switch (verb) {
          case 'POST':
            response = await apiClient.post(finalEndpoint, body, dispatch) // Pass dispatch if needed
            break
          case 'PUT':
            response = await apiClient.put(finalEndpoint, body, dispatch)
            break
          case 'DELETE':
            response = await apiClient.delete(finalEndpoint, dispatch)
            break
          case 'GET':
          default:
            response = await apiClient.get(finalEndpoint, dispatch)
            break
        }

        // --- Data Processing ---
        // 1. Transform Raw Response (if transform function provided)
        let dataToProcess = before ? before(response) : response
        dataToProcess = xf ? seq(dataToProcess, xf) : dataToProcess
        dataToProcess = after ? after(dataToProcess) : dataToProcess

        // 2. Normalize Data (if schema provided)
        let normalizedData: {
          result?: any
          entities?: Record<string, Record<string, any>> // More specific type
          [key: string]: any
        } = {}
        if (schema && dataToProcess) {
          // Add _lastFetchedAt to items before normalization if dataToProcess is an array
          // If dataToProcess is a single object (for single entity fetch), add it there.
          const now = Date.now()
          let processableDataWithTimestamp = dataToProcess
          if (Array.isArray(dataToProcess)) {
            processableDataWithTimestamp = dataToProcess.map(item =>
              item && typeof item === 'object'
                ? { ...item, _lastFetchedAt: now }
                : item
            )
          } else if (dataToProcess && typeof dataToProcess === 'object') {
            processableDataWithTimestamp = {
              ...dataToProcess,
              _lastFetchedAt: now
            }
          }

          normalizedData = normalize(processableDataWithTimestamp, schema)
          // normalizedData.entities will now have items with _lastFetchedAt
        } else {
          // If no schema, pass dataToProcess through, primarily for non-entity responses
          // The `result` field will be based on dataToProcess itself.
          // Ensure entities is an empty object if no schema.
          normalizedData.result = dataToProcess // Or handle as needed if dataToProcess is not the "result"
          normalizedData.entities = {}
        }

        // Ensure pagination fields exist on the final response object for the reducer
        const finalResponse = {
          ...normalizedData, // Includes result, entities from normalization
          nextPageKey:
            response?.nextPageKey ?? normalizedData.nextPageKey ?? null, // Prioritize raw response keys
          prevPageKey:
            response?.prevPageKey ?? normalizedData.prevPageKey ?? null,
          totalCount: response?.totalCount ?? normalizedData.totalCount ?? 0
        }

        // Dispatch success action
        dispatch({ type: successType, response: finalResponse, meta })
        if (cb) cb(null, finalResponse) // Callback with processed data
        return finalResponse // Resolve promise with processed data
      } catch (error: any) {
        console.error(
          `API Request Thunk Failed [${verb} ${finalEndpoint}]:`,
          error
        )
        const errorMessage = error.message || 'API request failed'
        // Dispatch failure action
        dispatch({ type: failureType, error: errorMessage, meta })
        if (cb) cb(error) // Callback with error
        throw error // Reject promise
      }
    }
}
