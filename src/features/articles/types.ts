import { Status } from "../../types"; // Import shared Status type

export interface Article {
  id: string;
  date: string; // Consider using Date object after fetching
  url: string;
  title: string;
  content: string; // Keep as string for now
  created_at: string;
  updated_at: string;
}

export interface ArticlesState {
  items: Article[];
  status: Status;
  error: string | null;
}
