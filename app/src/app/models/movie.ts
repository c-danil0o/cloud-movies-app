export interface Movie {
  id?: string;
  name: string;
  description: string;
  episode_number?:number;
  year: number;
  director: string;
  genre: string;
  duration: number;
  rating: number;
  fileSize: number;
  actors: string[];
}
