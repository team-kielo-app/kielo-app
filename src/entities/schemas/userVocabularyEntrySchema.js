// src/entities/schemas/baseWordSchema.js
import { schema } from 'normalizr'

const baseWordSchema = new schema.Entity(
  'baseWords',
  {},
  // Ensure this 'id' matches the unique ID field in your BaseWordSnippet/BaseWordDetail objects
  // that come from the API's item_details or vocabulary list.
  { idAttribute: 'id' } // Or 'base_word_id' if that's the field name
)

export default baseWordSchema
