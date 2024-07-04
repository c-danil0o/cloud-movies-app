export interface MovieDto {
    id: string;
    name: string;
    description: string;
    episode_number?: number;
    year: number;
    genre: string;
    director: string;
    duration: number;
    rating: number;
    fileSize: number;
    actors: string;
    thumbnail: string;
    upload_status: string;
}
