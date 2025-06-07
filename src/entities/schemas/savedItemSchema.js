import { schema } from 'normalizr'
import { ARTICLE_SCHEMA_SINGLE } from '@entities/schemas'
import BASE_WORD_SCHEMA from './baseWordSchema'

const itemDetailSchema = new schema.Union(
  {
    ArticleVersion: ARTICLE_SCHEMA_SINGLE,
    BaseWord: BASE_WORD_SCHEMA
  },
  entity => {
    return entity.item_type
  }
)

const apiSavedItemSchema = new schema.Entity(
  'savedEntries',
  {
    item_details: itemDetailSchema
  },
  {
    idAttribute: value => `${value.item_type}-${value.item_id}`
  }
)

const savedItemArraySchema = new schema.Array(apiSavedItemSchema)

export default savedItemArraySchema
