// src/entities/schemas/savedItemSchema.js
import { schema } from 'normalizr'
import { ARTICLE_SCHEMA_SINGLE } from './articleSchema'
import BASE_WORD_SCHEMA from './baseWordSchema'

// Define a schema for the 'item_details' based on 'item_type'
const itemDetailSchema = new schema.Union(
  {
    ArticleVersion: ARTICLE_SCHEMA_SINGLE,
    BaseWord: BASE_WORD_SCHEMA
    // Add other types here if they can be saved, e.g.:
    // GrammarConcept: grammarConceptSchema,
  },
  'item_type'
) // Use 'item_type' from the parent SavedItem to determine which schema to use for item_details

// Define the main savedItem schema
// Use a unique identifier for saved items themselves if the API provides one for the saved entry itself
// e.g. if API returns { saved_entry_id: '...', item_id: '...', item_type: '...' }
// If not, we can use a composite key or just process the details.
// For now, let's assume the combination of item_type and item_id is unique for a saved entry.
// We are primarily interested in normalizing the item_details.
const savedItemSchemaDefinition = {
  item_details: itemDetailSchema
}

// We won't create an 'entities.savedItems' store in the main entities reducer for the SavedItem wrapper itself,
// because our savedItemsSlice will store the list of {item_id, item_type, saved_at, notes}.
// We are using this schema primarily to extract and normalize the item_details.
// However, if SavedItem itself had a unique ID from the backend like `saved_interaction_id`,
// you could make `savedItemEntity = new schema.Entity('savedEntries', savedItemSchemaDefinition, { idAttribute: 'saved_interaction_id'})`
// and then `new schema.Array(savedItemEntity)`.
// For now, let's assume we just process an array of these objects and normalize details.

// This schema is designed to process an object that *contains* item_details
// If the API returns an array of SavedItem objects where item_details is a field,
// we'll map over this array and normalize each item_details individually if needed,
// or create a wrapper schema if the structure is [{ item_details: {...}, item_type: '...' }]
// Let's assume the API returns: { items: [ { item_type, item_id, item_details: {...} }, ... ] }
// The thunk will extract `response.items` and then normalize that array.

// The schema for a single saved item, focusing on its details
const savedItemDetailExtractorSchema = new schema.Object({
  item_details: itemDetailSchema
})
// For an array of such items:
const savedItemArraySchema = new schema.Array(savedItemDetailExtractorSchema)

export default savedItemArraySchema
// If you needed to normalize the SavedItem wrapper itself (if it had its own ID):
// export const savedItemEntity = new schema.Entity('savedListEntries', { item_details: itemDetailSchema }, {
//   idAttribute: (value) => `${value.item_type}-${value.item_id}`, // Process a composite ID
// });
// export default new schema.Array(savedItemEntity);
