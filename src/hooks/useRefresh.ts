// src/hooks/useRefresh.ts
import { useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@store/store' // Your AppDispatch type

// Define the type for the action creator function passed to the hook
// It should be a function that returns a Promise (typically wrapping a dispatched thunk)
type RefreshActionCreator = () => Promise<any>

/**
 * Custom hook to manage pull-to-refresh state and execution.
 *
 * @param onRefreshAction - An async function (usually wrapping a Redux thunk dispatch)
 *                          that performs the data refetching. It MUST return a Promise.
 * @returns A tuple containing:
 *          - isRefreshing (boolean): Whether the refresh is currently active.
 *          - handleRefresh (function): The callback function to pass to RefreshControl's onRefresh prop.
 */
export const useRefresh = (
  onRefreshAction: RefreshActionCreator
): [boolean, () => Promise<void>] => {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const dispatch = useDispatch<AppDispatch>() // Although dispatch isn't directly used here,
  // the action passed often uses it.

  const handleRefresh = useCallback(async () => {
    console.log('Pull-to-refresh triggered')
    setIsRefreshing(true)
    try {
      // Execute the passed-in refresh action function
      await onRefreshAction()
      console.log('Refresh action completed successfully.')
      // Optionally add a small delay if UI updates need time
      // await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error('Error during refresh action:', error)
      // Optionally show a toast or other feedback about the error
    } finally {
      setIsRefreshing(false)
      console.log('Refresh state set to false.')
    }
  }, [onRefreshAction]) // Dependency array includes the action creator

  return [isRefreshing, handleRefresh]
}
