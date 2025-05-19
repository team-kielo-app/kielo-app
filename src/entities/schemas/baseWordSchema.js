import { schema } from 'normalizr'

const baseWordSchema = new schema.Entity('baseWords', {}, { idAttribute: 'id' })

export default baseWordSchema
