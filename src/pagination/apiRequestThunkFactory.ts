// src/pagination/apiRequestThunkFactory.ts
// --- NEW FILE: Optional extraction of the thunk factory ---
import { seq } from "transducers.js";
import { apiClient } from "@lib/api";
import { normalize } from "normalizr";
import { AppDispatch, RootState } from "@store/store"; // Assuming types
import { ThunkAction } from "redux-thunk";
import { PaginationMeta, EntityMeta } from "./constants";

type ApiVerb = "GET" | "POST" | "PUT" | "DELETE";

// Type for the parameters passed INTO the generated thunk
interface ApiRequestParams {
  queryString?: string;
  body?: any;
  meta: PaginationMeta | EntityMeta;
  credentials?: any; // If needed by apiClient
}

// Type for the configuration of the factory itself
interface ApiThunkConfig {
  types: [string, string, string]; // Request, Success, Failure
  endpoint: string;
  verb: ApiVerb;
  schema?: any; // normalizr schema
  transform?: [any?, any?, any?]; // Optional transform function
  cb?: (err: Error | null, res?: any) => void; // Optional callback
}

// Extracted Factory Function (~80 lines)
export function createApiRequestThunk({
  types,
  endpoint,
  verb,
  schema,
  transform: [before, xf, after] = [null, null, null],
  cb,
}: ApiThunkConfig): (
  params: ApiRequestParams
) => ThunkAction<Promise<any>, RootState, unknown, any> {
  const [requestType, successType, failureType] = types;

  // Return the actual thunk action creator
  return ({ queryString = "", body, meta, credentials }) =>
    async (dispatch: AppDispatch) => {
      const finalEndpoint = `${endpoint}${queryString}`;

      // Dispatch request action immediately
      dispatch({ type: requestType, meta });

      try {
        // Perform API call using apiClient
        let response: any;
        // apiClient methods might need dispatch/credentials passed
        switch (verb) {
          case "POST":
            response = await apiClient.post(finalEndpoint, body, dispatch); // Pass dispatch if needed
            break;
          case "PUT":
            response = await apiClient.put(finalEndpoint, body, dispatch);
            break;
          case "DELETE":
            response = await apiClient.delete(finalEndpoint, dispatch);
            break;
          case "GET":
          default:
            response = await apiClient.get(finalEndpoint, dispatch);
            break;
        }

        // --- Data Processing ---
        // 1. Transform Raw Response (if transform function provided)
        let dataToProcess = before ? before(response) : response;
        dataToProcess = xf ? seq(dataToProcess, xf) : dataToProcess;
        dataToProcess = after ? after(dataToProcess) : dataToProcess;

        // 2. Normalize Data (if schema provided)
        let normalizedData: {
          result?: any;
          entities?: any;
          [key: string]: any;
        } = {};
        if (schema && dataToProcess) {
          normalizedData = normalize(dataToProcess, schema);
        } else {
          // Fallback structure if no schema: try to extract common fields
          normalizedData.result = Array.isArray(dataToProcess)
            ? dataToProcess.map((item: any) => item?.id ?? item?.key) // Extract IDs
            : dataToProcess?.id ?? dataToProcess?.key; // Single item ID?

          // Pass through common pagination/response fields if they exist on raw response
          if (response) {
            if (response.nextPageKey !== undefined)
              normalizedData.nextPageKey = response.nextPageKey;
            if (response.prevPageKey !== undefined)
              normalizedData.prevPageKey = response.prevPageKey;
            if (response.totalCount !== undefined)
              normalizedData.totalCount = response.totalCount;
            // If data was nested (e.g., response.items) and no transform/schema handled it:
            if (
              !normalizedData.result &&
              response.items &&
              Array.isArray(response.items)
            ) {
              normalizedData.result = response.items.map(
                (item: any) => item?.id ?? item?.key
              );
            }
          }
          // Ensure entities field exists, even if empty
          if (!normalizedData.entities) normalizedData.entities = {};
        }

        // Ensure pagination fields exist on the final response object for the reducer
        const finalResponse = {
          ...normalizedData, // Includes result, entities from normalization
          nextPageKey:
            response?.nextPageKey ?? normalizedData.nextPageKey ?? null, // Prioritize raw response keys
          prevPageKey:
            response?.prevPageKey ?? normalizedData.prevPageKey ?? null,
          totalCount: response?.totalCount ?? normalizedData.totalCount ?? 0,
        };

        // Dispatch success action
        dispatch({ type: successType, response: finalResponse, meta });
        if (cb) cb(null, finalResponse); // Callback with processed data
        return finalResponse; // Resolve promise with processed data
      } catch (error: any) {
        console.error(
          `API Request Thunk Failed [${verb} ${finalEndpoint}]:`,
          error
        );
        const errorMessage = error.message || "API request failed";
        // Dispatch failure action
        dispatch({ type: failureType, error: errorMessage, meta });
        if (cb) cb(error); // Callback with error
        throw error; // Reject promise
      }
    };
}

