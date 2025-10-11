export type BlogPost = {
  slug: string;
  title: string;
  date: string; // ISO
  excerpt: string;
  tags: string[];
  description?: string;
};
export type BlogStore = {
  version: string;
  count: number;
  posts: BlogPost[];
};
