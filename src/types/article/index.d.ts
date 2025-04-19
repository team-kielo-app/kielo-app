export type ArticleType = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  subtitle?: string;
  category?: string | string[];
  thumbnail_image?: ImageType;
  date?: string;
  source?: string;
  content?: string[];
  vocabulary?: VocabularyType[];
};

export type ImageType = {
  id: string;
  mini_data: string;
  url: string;
  title: string;
  owner: string;
};

export type VocabularyType = {
  word: string;
  translation: string;
  example: string;
};

