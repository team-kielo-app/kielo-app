import type { ArticleType } from "types/article";
import type { Status } from "types";

export interface Article extends ArticleType {}

export interface ArticlesState {
  items: Article[];
  status: Status;
  error: string | null;
  lastFetched: number | null;
}

