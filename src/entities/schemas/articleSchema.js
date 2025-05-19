import { schema } from 'normalizr'

const articleSchema = new schema.Entity(
  'articles',
  {},
  {
    idAttribute: 'id'
  }
)

articleSchema.define({})

export default new schema.Array(articleSchema)
export { articleSchema as ARTICLE_SCHEMA_SINGLE }
