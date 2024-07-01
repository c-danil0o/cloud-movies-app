export interface Movie {
  id: string;
  upload_status: string;
  name: string;
  description: string;
  episode_number?: number;
  year: number;
  genre: string;
  director: string;
  duration: number;
  rating: number;
  fileSize: number;
  actors: string,
  created_at: string;
  modified_at: string;
  thumbnail: string;
  search_field?: string;
}

export interface Rating{
  id: string;
  user: string;
  email: string;
  movie_id: string;
  grade: number;
}
