export interface Movie {
  id?: string;
  upload_status: string;
  name: string;
  description: string;
  episode_number?: number;
  year: number;
  directors: string[];
  genre: string;
  duration: number;
  rating: number;
  fileSize: number;
  actors: string[];
  created_at: number;
  modified_at: number;
  thumbnail: string;
  search_field?: string;
}
