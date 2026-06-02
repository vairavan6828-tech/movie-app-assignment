export interface Review {
  id: string;
  movieId: string;
  author: string;
  content: string;
  timestamp: string;
}

export interface Movie {
  id: string;
  title: string;
  tagline: string;
  vote_average: number;
  release_date: string;
  runtime: number; // in minutes
  genres: string[];
  overview: string;
  popularity?: number;
  vote_count?: number;
  budget?: number;
  revenue?: number;
  trailer_url?: string;
  reviews?: Review[];
}

export interface ApiMovieListResponse {
  movies: Movie[];
}

export interface ApiMovieDetailResponse {
  movie: Movie;
}
