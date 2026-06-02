export const MOVIE_POSTERS: Record<string, string> = {
  "1": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80", // Inception
  "2": "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=600&q=80", // The Dark Knight
  "3": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80", // Interstellar
  "4": "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=600&q=80", // Pulp Fiction
  "5": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80", // Spirited Away
  "6": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80", // Parasite
  "7": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80", // The Matrix
  "8": "https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?auto=format&fit=crop&w=600&q=80", // Spider-Man: Into the Spider-Verse
  "9": "https://images.unsplash.com/photo-1524230507669-e298d2568f8d?auto=format&fit=crop&w=600&q=80", // Whiplash
  "10": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80" // Gladiator
};

export function getMoviePoster(id: string): string {
  return MOVIE_POSTERS[id] || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80"; // Default cinematic photo
}
