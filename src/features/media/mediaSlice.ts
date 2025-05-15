// src/features/media/mediaSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { MediaState, MediaMetadata } from './types'
import { apiClient } from '@lib/api' // Your API client
import { AppDispatch, RootState } from '@store/store' // Your store types
import { ApiStatusType } from '@/lib/api.d'

const initialState: MediaState = {
  metadataById: {},
  statusById: {},
  errorById: {}
}

// Thunk to fetch media metadata if not already cached or loading/failed recently
export const fetchMediaMetadataThunk = createAsyncThunk<
  MediaMetadata, // Return type
  string, // Argument type: mediaId
  { dispatch: AppDispatch; state: RootState; rejectValue: string } // ThunkAPI config
>(
  'media/fetchMetadata',
  async (mediaId, { getState, dispatch, rejectWithValue }) => {
    const { media } = getState() // Get current media state
    const existingStatus = media.statusById[mediaId]

    // Don't refetch if already loading or succeeded recently
    // Add timestamp check later if needed for cache invalidation
    if (existingStatus === 'loading' || existingStatus === 'succeeded') {
      // If succeeded, return existing data directly to avoid dispatching fulfilled again
      if (existingStatus === 'succeeded' && media.metadataById[mediaId]) {
        // This won't actually dispatch fulfilled, but prevents API call
        // Consider just returning null or a specific status if no API call is made
        return media.metadataById[mediaId] as MediaMetadata // Return cached data
      }
      // If loading, let the existing request complete.
      // Throwing an error here might be too aggressive, maybe return a specific signal?
      // For simplicity, we let it proceed but it won't make a network call if caught by shouldFetch
      // console.log(`Fetch skipped for ${mediaId}, status: ${existingStatus}`);
      // return rejectWithValue('Fetch skipped, already loading/succeeded'); // Option
    }

    try {
      const metadata = await apiClient.get<MediaMetadata>(
        `/media/${mediaId}`, // Your metadata endpoint
        dispatch // Pass dispatch if your apiClient needs it
      )
      return metadata
    } catch (error: any) {
      const message =
        error?.data?.error || error?.message || 'Failed to fetch media metadata'
      console.error(`Error fetching metadata for ${mediaId}:`, error)
      return rejectWithValue(message)
    }
  }
  //   { // Optional: Prevent fetching if already loading/succeeded
  //     condition: (mediaId, { getState }) => {
  //       const { media } = getState() as RootState;
  //       const status = media.statusById[mediaId];
  //       if (status === 'loading' || status === 'succeeded') {
  //         console.log(`Fetch condition failed for ${mediaId}, status: ${status}`);
  //         return false; // Don't fetch
  //       }
  //       return true;
  //     },
  //   }
)

const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {
    clearMediaCache(state) {
      state.metadataById = {}
      state.statusById = {}
      state.errorById = {}
    }
    // Add other reducers if needed
  },
  extraReducers: builder => {
    builder
      .addCase(fetchMediaMetadataThunk.pending, (state, action) => {
        const mediaId = action.meta.arg
        state.statusById[mediaId] = 'loading'
        state.errorById[mediaId] = null // Clear previous error
      })
      .addCase(
        fetchMediaMetadataThunk.fulfilled,
        (state, action: PayloadAction<MediaMetadata>) => {
          const mediaId = action.payload.media_id
          state.statusById[mediaId] = 'succeeded'
          state.metadataById[mediaId] = action.payload
          state.errorById[mediaId] = null
        }
      )
      .addCase(fetchMediaMetadataThunk.rejected, (state, action) => {
        const mediaId = action.meta.arg
        state.statusById[mediaId] = 'failed'
        state.metadataById[mediaId] = undefined // Clear potentially stale data
        state.errorById[mediaId] = action.payload ?? 'Unknown error'
      })
  }
})

export const { clearMediaCache } = mediaSlice.actions
export default mediaSlice.reducer

// --- Selectors ---
export const selectMediaMetadata = (
  state: RootState,
  mediaId: string
): MediaMetadata | undefined => state.media.metadataById[mediaId]
export const selectMediaStatus = (
  state: RootState,
  mediaId: string
): ApiStatusType | undefined => state.media.statusById[mediaId]
export const selectMediaError = (
  state: RootState,
  mediaId: string
): string | null | undefined => state.media.errorById[mediaId]
