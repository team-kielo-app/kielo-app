import { schema } from "normalizr";

const articleSchema = new schema.Entity(
  "articles",
  {},
  {
    idAttribute: "articleId",
  }
);

articleSchema.define({});

export default new schema.Array(articleSchema);

