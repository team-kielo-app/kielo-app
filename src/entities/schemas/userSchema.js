import { schema } from 'normalizr'

const userSchema = new schema.Entity('users', {}, { idAttribute: 'id' })

export default userSchema
