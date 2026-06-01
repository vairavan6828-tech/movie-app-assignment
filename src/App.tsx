/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Film, Clapperboard, Sparkles } from "lucide-react";
import MovieList from "./components/MovieList";
import MovieDetail from "./components/MovieDetail";

export default function App() {
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e5e7eb] flex flex-col font-sans selection:bg-[#e50914] selection:text-white antialiased" id="app-root">
      
      {/* Primary Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#111112] border-b border-[#27272a] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer select-none group"
            onClick={() => setSelectedMovieId(null)}
            id="brand-logo"
          >
            <span className="text-xl font-extrabold tracking-tighter text-[#e50914] transition-transform duration-200 group-hover:scale-105">
              MOVIE.API
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-[10px] font-mono text-[#a1a1aa] bg-[#27272a] px-3 py-1 rounded-full uppercase tracking-wider shrink-0" id="dev-badge">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse"></span>
            <span>Proxy: Connected</span>
          </div>
        </div>
      </header>

      {/* Main Screen Content View */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 z-10">
        {!selectedMovieId ? (
          <MovieList onSelectMovie={(id) => setSelectedMovieId(id)} />
        ) : (
          <MovieDetail movieId={selectedMovieId} onBack={() => setSelectedMovieId(null)} />
        )}
      </main>

      {/* Simple, Non-intrusive Cinematic Footer */}
      <footer className="border-t border-[#27272a] bg-[#111112] py-6 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[#71717a] text-xs font-mono">
            <span>© {new Date().getFullYear()} MOVIE.API Archive Catalog. All Rights Reserved.</span>
          </div>
          <p className="text-[#71717a] text-[11px] font-mono text-center md:text-right">
            Interactive metadata powered by Node Express & server proxy.
          </p>
        </div>
      </footer>
    </div>
  );
}
