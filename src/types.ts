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
}

export interface ApiMovieListResponse {
  movies: Movie[];
}

export interface ApiMovieDetailResponse {
  movie: Movie;
}
