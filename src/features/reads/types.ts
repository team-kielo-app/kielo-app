import { ApiStatusType } from '@lib/api.d'
import { ArticleBrand } from '@features/articles/types' // Assuming Brand is needed

// Snippet of article details returned by the Reads API
interface ArticleDetailsSnippet {
  id: string // This is the ArticleVersion ID
  title: string
  publication_date: string
  brand?: ArticleBrand | null
  thumbnail?: {
    // Assuming thumbnail info is included
    serve_base_url: string
    variants: { [key: string]: { path: string } } // Simplified variants needed for URL
    media_id: string
  } | null
  // Add other snippet fields if provided (e.g., difficulty)
}

// Structure for a single read entry from the API list
export interface ReadArticle {
  article_version_id: string
  read_at: string // ISO Date string
  article_details?: ArticleDetailsSnippet | null // Populated by the list endpoint
}

// Structure for the reads list API response
export interface ReadArticleListResponse {
  articles: ReadArticle[]
  // Add pagination details if applicable
}

// Structure for POST request payload
export interface MarkReadPayload {
  article_version_id: string
}

// Redux state for this slice
export interface ReadsState {
  readArticles: ReadArticle[] // List of read articles
  status: ApiStatusType
  error: string | null
  // Optional: Track status for marking as read
  markReadStatus: { [articleVersionId: string]: ApiStatusType }
  markReadError: { [articleVersionId: string]: string | null }
}
