import { mergeEntities, removeEntity } from './utils'
import { fetchSavedItemsThunk } from '@features/savedItems/savedItemsActions'
import {
  LOGIN_SUCCESS,
  SOCIAL_LOGIN_SUCCESS,
  INITIALIZE_AUTH_SUCCESS
} from '@features/auth/authActionTypes'

const initialState = {
  articles: {},
  users: {},
  baseWords: {}
}

export default function entities(state = initialState, action) {
  if (
    action.response?.entities &&
    Object.keys(action.response.entities).length > 0
  ) {
    let nextState = state

    for (const [entityName, entityMap] of Object.entries(
      action.response.entities
    )) {
      if (state[entityName]) {
        nextState = {
          ...nextState,
          [entityName]: mergeEntities(state[entityName], entityMap)
        }
      }
    }

    return nextState
  }

  const directEntityPayloadActions = [
    LOGIN_SUCCESS,
    SOCIAL_LOGIN_SUCCESS,
    INITIALIZE_AUTH_SUCCESS,
    fetchSavedItemsThunk.fulfilled.type
  ]

  if (
    directEntityPayloadActions.includes(action.type) &&
    action.payload?.entities &&
    Object.keys(action.payload.entities).length > 0
  ) {
    let nextState = state
    for (const [entityName, entityMap] of Object.entries(
      action.payload.entities
    )) {
      if (state[entityName] || initialState[entityName]) {
        nextState = {
          ...nextState,
          [entityName]: mergeEntities(state[entityName] || {}, entityMap)
        }
      }
    }
    if (
      action.verb?.toLowerCase() === 'delete' &&
      action.meta?.entityName &&
      action.meta?.itemId
    ) {
      nextState = removeEntity(
        nextState,
        action.meta.entityName,
        action.meta.itemId
      )
    }
    return nextState
  }

  return state
}
