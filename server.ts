import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import { Movie, Review } from "./src/types";

// Static mapping of high-quality official trailers for each of the famous 10 curated films
const TRAILER_MAP: Record<string, string> = {
  "1": "https://www.youtube.com/embed/YoHD9XEInc0", // Inception
  "2": "https://www.youtube.com/embed/EXeTwQWrcwY", // The Dark Knight
  "3": "https://www.youtube.com/embed/zSWdZVtXT7E", // Interstellar
  "4": "https://www.youtube.com/embed/s7EdQ4FqbhY", // Pulp Fiction
  "5": "https://www.youtube.com/embed/ByXuk9QqQkk", // Spirited Away
  "6": "https://www.youtube.com/embed/5xH0HfJhAKY", // Parasite
  "7": "https://www.youtube.com/embed/vKQi3bBA1y8", // The Matrix
  "8": "https://www.youtube.com/embed/g4HnCcI1IHY", // Spider-Man: Into the Spider-Verse
  "9": "https://www.youtube.com/embed/7d_jQyG8DQY", // Whiplash
  "10": "https://www.youtube.com/embed/P5ieIbInFpg" // Gladiator
};

// In-memory persistent database store of movie user reviews
const reviewsStore: Review[] = [
  {
    id: "review-1-1",
    movieId: "1",
    author: "Nolan Fanatic",
    content: "Absolutely mind-bending! Cobb's dynamic conflict combined with Zimmer's roaring horns makes this a cinematic landmark.",
    timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString() // 2 days ago
  },
  {
    id: "review-1-2",
    movieId: "1",
    author: "Cinema_Savant",
    content: "The folding city of Paris still looks incredible today. A deeply intellectual film that actually respects its audience's intellect.",
    timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString() // 12 hrs ago
  },
  {
    id: "review-2-1",
    movieId: "2",
    author: "GothamKnight",
    content: "Heath Ledger's performance as the Joker is legendary. A gritty masterpiece that feels more like a crime thriller than a simple action flick.",
    timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString()
  },
  {
    id: "review-3-1",
    movieId: "3",
    author: "Astro_Girl",
    content: "The organ music during the docking sequence still gives me intense goosebumps. A magnificent portrayal of cosmic solitude and human love.",
    timestamp: new Date(Date.now() - 72 * 3600 * 1000).toISOString()
  },
  {
    id: "review-4-1",
    movieId: "4",
    author: "Vincent_Vega",
    content: "Tarantino's non-linear narrative and razor-sharp dialogue at its absolute peak. Royale with cheese classic!",
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  }
];

async function readMoviesData(): Promise<Movie[]> {
  try {
    const filePath = path.join(process.cwd(), "server", "movies_metadata.json");
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as Movie[];
  } catch (error) {
    console.error("Failed to read movies metadata:", error);
    return [];
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Endpoints
  // 1. List movies
  app.get("/api/movies", async (req, res) => {
    try {
      const { search, genre } = req.query;
      let movies = await readMoviesData();

      // Implement optional robust search/filter for polished capability
      if (search && typeof search === "string") {
        const query = search.toLowerCase();
        movies = movies.filter(
          (m) =>
            m.title.toLowerCase().includes(query) ||
            m.tagline.toLowerCase().includes(query)
        );
      }

      if (genre && typeof genre === "string") {
        const query = genre.toLowerCase();
        movies = movies.filter((m) =>
          m.genres.some((g) => g.toLowerCase() === query)
        );
      }

      // Populate trailers and reviews count
      const enrichedMovies = movies.map((m) => ({
        ...m,
        trailer_url: TRAILER_MAP[m.id],
        reviews: reviewsStore.filter((r) => r.movieId === m.id)
      }));

      res.status(200).json({ movies: enrichedMovies });
    } catch (error) {
      console.error("Error in GET /api/movies:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // 2. Get single movie by ID with its reviews and trailers
  app.get("/api/movies/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const movies = await readMoviesData();
      const movie = movies.find((m) => m.id === id);

      if (!movie) {
        res.status(404).json({ error: "Movie not found" });
        return;
      }

      // Attach trailer link & retrieve movie-specific reviews
      const movieReviews = reviewsStore
        .filter((r) => r.movieId === id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      const enrichedMovie: Movie = {
        ...movie,
        trailer_url: TRAILER_MAP[id],
        reviews: movieReviews
      };

      res.status(200).json({ movie: enrichedMovie });
    } catch (error) {
      console.error(`Error in GET /api/movies/${req.params.id}:`, error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // 3. Post a movie review
  app.post("/api/movies/:id/reviews", async (req, res) => {
    try {
      const { id } = req.params;
      const { author, content } = req.body;

      if (!author || typeof author !== "string" || !author.trim()) {
        res.status(400).json({ error: "Name is required and cannot be empty." });
        return;
      }

      if (!content || typeof content !== "string" || !content.trim()) {
        res.status(400).json({ error: "Review comment content is required." });
        return;
      }

      // Check if movie exists
      const movies = await readMoviesData();
      const movieExists = movies.some((m) => m.id === id);
      if (!movieExists) {
        res.status(404).json({ error: "The movie does not exist." });
        return;
      }

      const newReview: Review = {
        id: `review-${id}-${Date.now()}`,
        movieId: id,
        author: author.trim(),
        content: content.trim(),
        timestamp: new Date().toISOString()
      };

      reviewsStore.push(newReview);

      res.status(201).json({ review: newReview });
    } catch (error) {
      console.error(`Error in POST /api/movies/${req.params.id}/reviews:`, error);
      res.status(500).json({ error: "Failed to persist review comment." });
    }
  });

  // Vite Middleware Integrations depending on environment
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();
