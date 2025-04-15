import { Status } from "@types";

export interface Article {
  id: string;
  date: string;
  url: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ArticlesState {
  items: Article[];
  status: Status;
  error: string | null;
  lastFetched: number | null;
}

