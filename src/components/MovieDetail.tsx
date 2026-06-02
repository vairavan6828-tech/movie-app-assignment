import { useState, useEffect, FormEvent } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Star,
  Landmark,
  Award,
  Film,
  CircleDollarSign,
  Compass,
  X,
  Play,
  MessageSquare,
  Send,
  User
} from "lucide-react";
import { Movie, Review } from "../types";
import { getMoviePoster } from "../movie_posters";

interface MovieDetailProps {
  movieId: string;
  onBack: () => void;
}

export default function MovieDetail({ movieId, onBack }: MovieDetailProps) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Video trailer & Review submission states
  const [showTrailer, setShowTrailer] = useState(false);
  const [playEmbedded, setPlayEmbedded] = useState(false);
  const [newAuthor, setNewAuthor] = useState("");
  const [newContent, setNewContent] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  // Esc keyboard handler for fluid overlay dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowTrailer(false);
        setPlayEmbedded(false);
      }
    };
    if (showTrailer) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showTrailer]);

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

  // Localized date formatting based on browser settings
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

  // Submission handler for film content reviews
  const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    const trimmedAuthor = newAuthor.trim();
    const trimmedContent = newContent.trim();

    if (!trimmedAuthor) {
      setFormError("Please enter your name to register your review.");
      return;
    }
    if (!trimmedContent) {
      setFormError("Review description cannot be blank.");
      return;
    }

    try {
      setSubmittingReview(true);
      const response = await fetch(`/api/movies/${movieId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          author: trimmedAuthor,
          content: trimmedContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit review.");
      }

      const data = await response.json();
      const createdReview: Review = data.review;

      // Local state sync to keep UI super fluid
      setMovie((prevMovie) => {
        if (!prevMovie) return null;
        const updatedReviews = prevMovie.reviews
          ? [createdReview, ...prevMovie.reviews]
          : [createdReview];
        return {
          ...prevMovie,
          reviews: updatedReviews,
        };
      });

      setNewAuthor("");
      setNewContent("");
      setFormSuccess(true);

      // Auto clear green notification banner after 3 seconds
      setTimeout(() => {
        setFormSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || "An error occurred while submitting your review.");
    } finally {
      setSubmittingReview(false);
    }
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
      className="space-y-8"
      id={`movie-details-${movie.id}`}
    >
      {/* Return button */}
      <div>
        <button
          onClick={onBack}
          className="group text-[#ef4444] hover:text-red-400 transition-colors inline-flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider cursor-pointer"
          id="btn-back-to-list"
        >
          &larr; Return to list
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Film Meta / Poster Board container */}
        <div className="lg:col-span-5 space-y-4">
          <div
            className="relative overflow-hidden bg-[#0c0c0d] border border-[#27272a] rounded-xl p-6 md:p-8 flex flex-col justify-between aspect-[3/4] shadow-2xl"
            id="movie-poster-mock"
          >
            {/* Real-world representative stock/poster image inside detail container background */}
            <img
              src={getMoviePoster(movie.id)}
              alt={`${movie.title} Poster`}
              className="absolute inset-0 w-full h-full object-cover opacity-50 transition-all duration-300 z-0 animate-fade-in"
              referrerPolicy="no-referrer"
            />

            {/* Ambient decorative cinematic gradient overlay for perfect contrast */}
            <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/75 to-[#0a0a0b]/40 pointer-events-none z-10" />

            {/* Top Info Tag */}
            <div className="z-25 flex items-center justify-between relative">
              <span className="text-[10px] font-mono tracking-widest text-[#ef4444] border border-[#ef4444]/30 bg-[#ef4444]/5 px-2.5 py-1 rounded-full uppercase font-bold">
                Archived Film
              </span>
              <div className="flex items-center gap-1 bg-[#0a0a0b]/92 border border-[#27272a] px-3 py-1.5 rounded-lg">
                <Star className="w-4 h-4 text-[#ef4444] fill-[#ef4444]" />
                <span className="text-sm font-mono font-bold text-[#e5e7eb]">
                  {movie.vote_average.toFixed(1)} <span className="text-xs text-[#71717a]">/ 10</span>
                </span>
              </div>
            </div>

            {/* Middle giant display icon and styling */}
            <div className="flex justify-center py-8 z-25 text-[#27272a] group relative">
              <Film className="w-24 h-24 text-[#27272a]/50 antialiased" />
            </div>

            {/* Title / Tagline block on Bottom overlay */}
            <div className="z-25 space-y-3 pt-6 relative">
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((g) => (
                  <span
                    key={g}
                    className="text-[10px] bg-[#1c1c1f]/90 backdrop-blur text-[#a1a1aa] px-2.5 py-1 rounded font-semibold tracking-wide border border-[#27272a]"
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

          {/* Interactive Cinematic Watch Trailer Section */}
          <div className="pt-2">
            {movie.trailer_url ? (
              <button
                onClick={() => setShowTrailer(true)}
                className="w-full bg-[#ef4444] hover:bg-[#dc2626] text-white py-3 px-4 rounded-xl font-extrabold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer text-sm tracking-wide"
                id="btn-watch-trailer"
              >
                <Play className="w-4.5 h-4.5 fill-current" />
                Play Official Trailer
              </button>
            ) : (
              <div className="text-[#71717a] py-3 text-xs text-center font-mono border border-dashed border-[#27272a] rounded-xl bg-[#111112]/30">
                Trailer currently unavailable for this title
              </div>
            )}
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

      {/* Full-width Reviews and Thoughts Area */}
      <div className="grid grid-cols-1 gap-6 pt-6" id="reviews-section">
        <div className="bg-[#111112] border border-[#27272a] rounded-xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="border-b border-[#27272a] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#ef4444]" />
                Viewer Discussions
              </h2>
              <p className="text-xs text-[#a1a1aa] mt-0.5">
                Read what other critics are saying or submit your own review.
              </p>
            </div>
            <div className="text-xs font-mono bg-[#1c1c1f] px-3 py-1.5 rounded-lg border border-[#27272a] text-[#a1a1aa] self-start sm:self-auto">
              {movie.reviews?.length || 0} Reviews Posted
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Review Form - 5 cols */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono text-[#a1a1aa]">
                Write a Review
              </h3>

              <form onSubmit={handleReviewSubmit} className="space-y-4 bg-[#0a0a0b]/40 p-5 rounded-xl border border-[#27272a]/60">
                <div>
                  <label className="block text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider mb-1.5">
                    Your Name
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3 w-4 h-4 text-[#71717a]" />
                    <input
                      type="text"
                      placeholder="e.g. Jean-Luc"
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      className="w-full bg-[#0a0a0b] text-[#e5e7eb] text-sm pl-10 pr-4 py-2.5 border border-[#27272a] rounded-lg focus:border-[#ef4444] focus:ring-1 focus:ring-[#ef4444] focus:outline-none transition-all placeholder:text-[#52525b]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider mb-1.5">
                    Comment
                  </label>
                  <textarea
                    placeholder="What did you think of the cinematography, screenplay, and sound design?"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    rows={4}
                    className="w-full bg-[#0a0a0b] text-[#e5e7eb] text-sm px-4 py-2.5 border border-[#27272a] rounded-lg focus:border-[#ef4444] focus:ring-1 focus:ring-[#ef4444] focus:outline-none transition-all placeholder:text-[#52525b] resize-none"
                    required
                  ></textarea>
                </div>

                {formError && (
                  <div className="text-xs text-red-400 font-mono bg-red-950/20 border border-red-500/20 p-2.5 rounded-lg">
                    {formError}
                  </div>
                )}

                {formSuccess && (
                  <div className="text-xs text-emerald-400 font-mono bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-lg">
                    Review successfully published!
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-[#ef4444] hover:bg-[#dc2626] disabled:bg-[#ef4444]/50 text-white text-xs font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>

            {/* Reviews List - 7 cols */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono text-[#a1a1aa]">
                Discussions & Reviews
              </h3>

              {!movie.reviews || movie.reviews.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-[#27272a] rounded-xl bg-[#0a0a0b]/10 text-[#71717a]">
                  <MessageSquare className="w-8 h-8 text-[#27272a] mx-auto mb-2" />
                  <p className="text-sm font-mono">No reviews posted yet.</p>
                  <p className="text-xs mt-1">Be the first to share your thoughts on {movie.title}!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
                  {movie.reviews.map((review, i) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.05, 0.3) }}
                      className="bg-[#0a0a0b]/70 border border-[#27272a] p-4 rounded-xl space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#1c1c1f] border border-[#27272a] flex items-center justify-center text-[#ef4444] font-bold text-xs select-none">
                            {review.author[0]?.toUpperCase() || "?"}
                          </div>
                          <span className="text-sm font-bold text-[#e5e7eb]">{review.author}</span>
                        </div>
                        <span className="text-[10px] text-[#71717a] font-mono flex items-center gap-1 shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(review.timestamp).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-[#d1d5db] font-sans leading-relaxed whitespace-pre-wrap pl-9">
                        {review.content}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Embedded YouTube video overlay modal */}
      {showTrailer && movie.trailer_url && (
        <div 
          onClick={() => {
            setShowTrailer(false);
            setPlayEmbedded(false);
          }}
          className="fixed inset-0 bg-[#060608]/95 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-zoom-out"
          id="trailer-modal-backdrop"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0f0f11] border border-[#27272a] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative cursor-default"
            id="trailer-modal-inner"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#27272a] bg-[#111113]">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-[#ef4444]" />
                <span className="font-bold text-white text-sm md:text-base">{movie.title} - Official Trailer</span>
              </div>
              <button
                onClick={() => {
                  setShowTrailer(false);
                  setPlayEmbedded(false);
                }}
                className="text-[#a1a1aa] hover:text-white p-1 rounded-lg hover:bg-[#27272a] transition-all cursor-pointer"
                id="btn-close-trailer-modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video / Control Hub Container */}
            <div className="relative aspect-video w-full bg-black flex flex-col items-center justify-center overflow-hidden">
              {playEmbedded ? (
                /* True iframe wrapper */
                <iframe
                  src={`${movie.trailer_url}?autoplay=1`}
                  title={`${movie.title} Trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0 z-0 animate-fade-in"
                  id="trailer-iframe-element"
                ></iframe>
              ) : (
                /* Gorgeous non-blocking Cinema Ready card to avoid sandboxed iframe freeze */
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none" id="cinema-preview-screen">
                  {/* Blurred movie poster background decoration */}
                  <img
                    src={getMoviePoster(movie.id)}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm scale-105 pointer-events-none"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f11] via-[#0f0f11]/85 to-transparent pointer-events-none" />

                  {/* Core Content */}
                  <div className="z-10 space-y-5 max-w-md">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] animate-pulse">
                      <Play className="w-8 h-8 fill-current ml-0.5" />
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-lg font-black text-white">Stream Official {movie.title} Trailer</h4>
                      <p className="text-xs text-[#a1a1aa] leading-normal px-4">
                        Standard browser-sandboxed environments may restrict or freeze dynamic video streams. Please select your preferred playback method.
                      </p>
                    </div>

                    {/* Dual Launch Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                      <a
                        href={movie.trailer_url.replace("embed/", "watch?v=")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#ef4444] hover:bg-[#dc2626] text-white text-xs font-bold py-3 px-5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md inline-block"
                        id="btn-trailer-launch-external"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        Open in New Tab (Safe & Fast)
                      </a>
                      <button
                        onClick={() => setPlayEmbedded(true)}
                        className="bg-[#27272a] hover:bg-[#323235] text-white text-xs font-bold py-3 px-5 rounded-xl border border-[#3e3e42] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        id="btn-trailer-launch-embedded"
                      >
                        <Film className="w-4 h-4" />
                        Play Inline
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Support / Quick Escape bar */}
            <div className="p-4 border-t border-[#27272a] flex flex-col sm:flex-row justify-between items-center gap-3 bg-[#111113]">
              <div className="text-[11px] text-[#71717a] font-mono">
                {playEmbedded 
                  ? "Getting stuck or video not loading? Switch to the safe tab link."
                  : "Esc or clicking outside the window closes the trailer view."
                }
              </div>
              <div className="flex items-center gap-2">
                {playEmbedded && (
                  <button
                    onClick={() => setPlayEmbedded(false)}
                    className="text-xs text-[#a1a1aa] hover:text-white px-3 py-1.5 rounded bg-[#1c1c1f] border border-[#27272a] cursor-pointer"
                    id="btn-stop-embedded-trailer"
                  >
                    Close Direct Stream
                  </button>
                )}
                <a
                  href={movie.trailer_url.replace("embed/", "watch?v=")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#ef4444] hover:text-red-400 px-3 py-1.5 rounded transition-colors inline-flex items-center gap-1 cursor-pointer font-mono"
                  id="btn-trailer-external-alternate"
                >
                  YouTube Link &rarr;
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
