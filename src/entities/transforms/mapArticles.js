import { map } from "transducers.js";

export default map((item) => {
  const { id, ...rest } = item;
  return { ...rest, id, articleId: id };
});

