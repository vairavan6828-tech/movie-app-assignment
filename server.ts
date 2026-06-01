import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import { Movie } from "./src/types";

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

      res.status(200).json({ movies });
    } catch (error) {
      console.error("Error in GET /api/movies:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // 2. Get single movie by ID
  app.get("/api/movies/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const movies = await readMoviesData();
      const movie = movies.find((m) => m.id === id);

      if (!movie) {
        res.status(404).json({ error: "Movie not found" });
        return;
      }

      res.status(200).json({ movie });
    } catch (error) {
      console.error(`Error in GET /api/movies/${req.params.id}:`, error);
      res.status(500).json({ error: "Internal Server Error" });
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
