import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Calendar, Clock, Star, Landmark, Award, Film, CircleDollarSign, Compass } from "lucide-react";
import { Movie } from "../types";

interface MovieDetailProps {
  movieId: string;
  onBack: () => void;
}

export default function MovieDetail({ movieId, onBack }: MovieDetailProps) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMovieDetail() {
      try {
        setLoading(true);
        const response = await fetch(`/api/movies/${movieId}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Movie not found in archive");
          }
          throw new Error("Failed to load movie details");
        }
        const data = await response.json();
        setMovie(data.movie);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "An error occurred while fetching details.");
      } finally {
        setLoading(false);
      }
    }

    fetchMovieDetail();
  }, [movieId]);

  // Localized date formatting based on browser settings (using undefined defaults to browser navigator settings)
  const formatReleaseDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const dateObj = new Date(dateStr);
      return dateObj.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Currency utility for elegant display
  const formatCurrencyValue = (val?: number) => {
    if (val === undefined || val === 0) return "Unavailable";
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4" id="detail-loading-indicator">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-[#27272a]"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-[#ef4444] animate-spin"></div>
        </div>
        <span className="text-sm font-mono text-[#71717a]">Loading film stats...</span>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-xl mx-auto text-center space-y-4 shadow-xl" id="detail-error">
        <p className="text-red-400 font-mono text-sm">{error || "Movie catalog data unavailable."}</p>
        <button
          onClick={onBack}
          className="bg-[#27272a] hover:bg-[#323235] text-[#e5e7eb] text-xs font-semibold px-5 py-2.5 rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer border border-[#3e3e42]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to list
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
      id={`movie-details-${movie.id}`}
    >
      {/* Return button */}
      <div>
        <button
          onClick={onBack}
          className="group text-[#ef4444] hover:text-red-450 transition-colors inline-flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider cursor-pointer"
          id="btn-back-to-list"
        >
          &larr; Return to list
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Film Meta / Poster Board container */}
        <div className="lg:col-span-5 space-y-6">
          <div 
            className="relative overflow-hidden bg-gradient-to-br from-[#0c0c0d] to-[#111112] border border-[#27272a] rounded-xl p-6 md:p-8 flex flex-col justify-between aspect-[3/4] shadow-2xl relative"
            id="movie-poster-mock"
          >
            {/* Ambient decorative cinematic soundwave or pattern backing */}
            <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/80 to-transparent pointer-events-none z-0" />
            
            {/* Top Info Tag */}
            <div className="z-10 flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-widest text-[#ef4444] border border-[#ef4444]/30 bg-[#ef4444]/5 px-2.5 py-1 rounded-full uppercase font-bold">
                Archived Film
              </span>
              <div className="flex items-center gap-1 bg-[#0a0a0b]/90 border border-[#27272a] px-3 py-1.5 rounded-lg">
                <Star className="w-4 h-4 text-[#ef4444] fill-[#ef4444]" />
                <span className="text-sm font-mono font-bold text-[#e5e7eb]">
                  {movie.vote_average.toFixed(1)} <span className="text-xs text-[#71717a]">/ 10</span>
                </span>
              </div>
            </div>

            {/* Middle giant display icon and styling */}
            <div className="flex justify-center py-8 z-10 text-[#27272a] group">
              <Film className="w-24 h-24 text-[#27272a]/70 antialiased" />
            </div>

            {/* Title / Tagline block on Bottom overlay */}
            <div className="z-10 space-y-3 pt-6">
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((g) => (
                  <span
                    key={g}
                    className="text-[10px] bg-[#1c1c1f] text-[#a1a1aa] px-2.5 py-1 rounded font-semibold tracking-wide border border-[#27272a]"
                  >
                    {g}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-none">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="text-base text-[#a1a1aa] italic font-serif leading-relaxed font-light">
                  "{movie.tagline}"
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Detailed metrics and stats */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Story Overview Card */}
          <div className="bg-[#111112] border border-[#27272a] rounded-xl p-6 md:p-8 shadow-xl space-y-6" id="overview-card">
            <div className="space-y-4">
              <h2 className="text-sm font-bold tracking-widest text-[#71717a] uppercase flex items-center gap-2 border-b border-[#27272a] pb-3">
                <Compass className="w-4.5 h-4.5 text-[#ef4444]" />
                Overview
              </h2>
              <p className="text-sm text-[#d1d5db] leading-relaxed font-sans text-justify">
                {movie.overview}
              </p>
            </div>

            {/* Quick Metrics (Localized date and calculation runtime) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-[#0a0a0b]/60 border border-[#27272a] rounded-xl p-4 space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-bold font-mono text-[#71717a] block">
                  Release Date (Browser Localized)
                </span>
                <span className="text-sm text-[#e5e7eb] flex items-center gap-2 pt-1 font-semibold">
                  <Calendar className="w-4 h-4 text-[#ef4444] shrink-0" />
                  {formatReleaseDate(movie.release_date)}
                </span>
              </div>

              <div className="bg-[#0a0a0b]/60 border border-[#27272a] rounded-xl p-4 space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-bold font-mono text-[#71717a] block">
                  Runtime (Minutes Formatted)
                </span>
                <div className="text-sm text-[#e5e7eb] flex items-center gap-2 pt-1 font-semibold">
                  <Clock className="w-4 h-4 text-[#ef4444] shrink-0" />
                  <span>
                    {movie.runtime} minutes
                    <span className="text-xs text-[#71717a] font-normal ml-1.5">
                      ({~~(movie.runtime / 60)}h {movie.runtime % 60}m)
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* financial parameters and score card */}
          <div className="bg-[#111112] border border-[#27272a] rounded-xl p-6 md:p-8 shadow-xl space-y-6" id="financials-card">
            <h2 className="text-sm font-bold tracking-widest text-[#71717a] uppercase flex items-center gap-2 border-b border-[#27272a] pb-3">
              <Award className="w-4.5 h-4.5 text-[#ef4444]" />
              Box Office & Stats
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box office budget */}
              <div className="flex items-start gap-3.5">
                <div className="bg-[#0a0a0b] p-2.5 border border-[#27272a] rounded-lg text-[#ef4444] shrink-0">
                  <Landmark className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#71717a] font-bold block">
                    Estimated Budget
                  </span>
                  <span className="text-base text-[#e5e7eb] font-mono font-semibold pt-1 block">
                    {formatCurrencyValue(movie.budget)}
                  </span>
                </div>
              </div>

              {/* Box office revenue */}
              <div className="flex items-start gap-3.5">
                <div className="bg-[#0a0a0b] p-2.5 border border-[#27272a] rounded-lg text-emerald-500 shrink-0">
                  <CircleDollarSign className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#71717a] font-bold block">
                    Box Office Revenue
                  </span>
                  <span className="text-base text-[#e5e7eb] font-mono font-semibold pt-1 block">
                    {formatCurrencyValue(movie.revenue)}
                  </span>
                </div>
              </div>

              {/* Popularity indicator */}
              <div className="flex items-start gap-3.5 pt-2 border-t border-[#27272a]/40 md:border-t-0 md:pt-0">
                <div className="bg-[#0a0a0b] p-2.5 border border-[#27272a] rounded-lg text-sky-500 shrink-0">
                  <Compass className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#71717a] font-bold block">
                    System Popularity Index
                  </span>
                  <span className="text-base text-[#e5e7eb] font-mono font-semibold pt-1 block">
                    {movie.popularity !== undefined ? movie.popularity.toFixed(1) : "N/A"}
                  </span>
                </div>
              </div>

              {/* Vote counts */}
              <div className="flex items-start gap-3.5 pt-2 border-t border-[#27272a]/40 md:border-t-0 md:pt-0">
                <div className="bg-[#0a0a0b] p-2.5 border border-[#27272a] rounded-lg text-purple-500 shrink-0">
                  <Award className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#71717a] font-bold block">
                    Archived User Votes
                  </span>
                  <span className="text-base text-[#e5e7eb] font-mono font-semibold pt-1 block">
                    {movie.vote_count !== undefined ? movie.vote_count.toLocaleString() : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
