import { RootState } from "@store/store";

export const selectArticlePagination = (state: RootState) =>
  state.pagination.articlePagination;

