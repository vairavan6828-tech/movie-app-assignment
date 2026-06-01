import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Film, Star, ArrowUpRight, RotateCcw } from "lucide-react";
import { Movie } from "../types";

interface MovieListProps {
  onSelectMovie: (id: string) => void;
}

export default function MovieList({ onSelectMovie }: MovieListProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");

  const [allGenres, setAllGenres] = useState<string[]>([]);

  useEffect(() => {
    async function fetchMovies() {
      try {
        setLoading(true);
        // Build query string based on filters
        const params = new URLSearchParams();
        if (searchTerm) params.append("search", searchTerm);
        if (selectedGenre) params.append("genre", selectedGenre);

        const response = await fetch(`/api/movies?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch movies list");
        }
        const data = await response.json();
        setMovies(data.movies || []);

        // Also compile all available genres once if not already compiled to offer easy tags
        if (allGenres.length === 0 && data.movies) {
          const genresSet = new Set<string>();
          data.movies.forEach((m: Movie) => {
            m.genres.forEach((g) => genresSet.add(g));
          });
          setAllGenres(Array.from(genresSet).sort());
        }
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "An error occurred while loading movies.");
      } finally {
        setLoading(false);
      }
    }

    // Debounce search input for seamless feeling
    const timeoutId = setTimeout(() => {
      fetchMovies();
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedGenre]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedGenre("");
  };

  return (
    <div className="space-y-8" id="movie-list-container">
      {/* Search & Theme Controls Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111112] border border-[#27272a] rounded-xl p-6 shadow-xl space-y-4"
        id="controls-banner"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-[#ef4444]" id="film-icon-icon" />
              Browse Movies
            </h2>
            <p className="text-xs text-[#a1a1aa]">
              Explore archived titles by genre, title, or catalog query.
            </p>
          </div>
          {(searchTerm || selectedGenre) && (
            <button
              onClick={handleResetFilters}
              className="text-xs bg-[#27272a] hover:bg-[#323235] text-[#e5e7eb] px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 self-start md:self-auto transition-colors cursor-pointer border border-[#3e3e42]"
              id="btn-reset-filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          {/* Search Box */}
          <div className="relative md:col-span-8 flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-[#71717a] pointer-events-none" />
            <input
              type="text"
              id="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search movie titles, taglines..."
              className="w-full bg-[#0a0a0b] text-[#e5e7eb] text-sm pl-10 pr-4 py-3 border border-[#27272a] rounded-xl focus:border-[#ef4444] focus:ring-1 focus:ring-[#ef4444] focus:outline-none transition-all placeholder:text-[#52525b] text-ellipsis"
            />
          </div>

          {/* Genre Selection Dropdown */}
          <div className="md:col-span-4">
            <select
              id="genre-select"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full bg-[#0a0a0b] text-[#e5e7eb] text-sm px-4 py-3 border border-[#27272a] rounded-xl focus:border-[#ef4444] focus:ring-1 focus:ring-[#ef4444] focus:outline-none transition-all cursor-pointer"
            >
              <option value="">All Genres</option>
              {allGenres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Tags under controls */}
        {allGenres.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#27272a]/60">
            <span className="text-xs font-mono text-[#71717a] mr-1.5">Quick Genres:</span>
            {allGenres.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(selectedGenre === g ? "" : g)}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  selectedGenre === g
                    ? "bg-[#e50914] text-white shadow-md shadow-red-950/20 font-bold"
                    : "bg-[#1c1c1f] text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#e5e7eb]"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Grid List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4" id="loading-indicator">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-[#27272a]"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-[#ef4444] animate-spin"></div>
          </div>
          <span className="text-sm font-mono text-[#71717a]">Sifting archives...</span>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center" id="error-banner">
          <p className="text-red-400 text-sm font-mono">{error}</p>
          <button
            onClick={() => setSearchTerm("")}
            className="mt-3 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[#27272a] rounded-2xl bg-[#111112]/20" id="empty-state">
          <Film className="w-10 h-10 text-[#27272a] mx-auto mb-3" />
          <p className="text-[#a1a1aa] text-sm">No matching treasures found</p>
          <p className="text-[#71717a] text-xs mt-1">Try relaxing your search terms or genre selections.</p>
        </div>
      ) : (
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          id="movies-grid"
        >
          {movies.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
              whileHover={{ y: -4 }}
              onClick={() => onSelectMovie(movie.id)}
              className="group bg-[#18181b] border border-transparent hover:border-[#e50914] rounded-lg overflow-hidden cursor-pointer shadow-lg hover:bg-[#1c1c1f] transition-all flex flex-col justify-between"
              id={`movie-card-${movie.id}`}
            >
              {/* Card Poster Representation */}
              <div className="relative aspect-[16/10] bg-gradient-to-br from-[#0c0c0d] to-[#18181b] flex flex-col justify-end p-4 border-b border-[#27272a] transition-all">
                {/* Visual Icon Accent */}
                <div className="absolute top-3 left-3 bg-[#111112]/90 border border-[#27272a] p-2 rounded-lg text-[#71717a] group-hover:text-[#ef4444] transition-colors">
                  <Film className="w-4 h-4" />
                </div>

                {/* Rating Badge */}
                <div className="absolute top-3 right-3 bg-[rgba(229,9,20,0.1)] border border-[#ef4444]/20 px-2 py-1 rounded flex items-center gap-1 shadow-md">
                  <Star className="w-3.5 h-3.5 text-[#ef4444] fill-[#ef4444]" />
                  <span className="text-xs font-mono font-bold text-[#ef4444]">
                    {movie.vote_average.toFixed(1)}
                  </span>
                </div>

                {/* Genres minimal strip */}
                <div className="flex flex-wrap gap-1.5 pointer-events-none mb-1">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre}
                      className="text-[10px] font-semibold text-[#a1a1aa] bg-[#27272a] px-2 py-0.5 rounded"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="text-base font-bold text-[#e5e7eb] group-hover:text-[#ef4444] transition-colors line-clamp-2 leading-snug">
                      {movie.title}
                    </h3>
                    <ArrowUpRight className="w-4 h-4 text-[#71717a] group-hover:text-[#ef4444] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all mt-0.5 shrink-0" />
                  </div>
                  <p className="text-xs text-[#a1a1aa] line-clamp-2 italic font-serif leading-relaxed">
                    "{movie.tagline}"
                  </p>
                </div>

                {/* Movie card Footer info */}
                <div className="flex items-center justify-between pt-3 border-t border-[#27272a] text-[11px] text-[#71717a] font-mono">
                  <span>Rating (Standard):</span>
                  <span className="text-[#ef4444] font-bold">{movie.vote_average}/10</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
