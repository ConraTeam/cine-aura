// lib/clientes.js
// Cliente Supabase (browser) + helper de búsqueda en TMDB.
// Variables en .env.local:
//   NEXT_PUBLIC_SUPABASE_URL=...
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
//   NEXT_PUBLIC_TMDB_KEY=...   (API Read Access Token o api_key v3)

import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Busca películas en TMDB (en español) y devuelve título, año y póster.
export async function buscarTMDB(query) {
  if (!query || query.length < 2) return [];
  const url =
    `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}` +
    `&language=es-AR&api_key=${process.env.NEXT_PUBLIC_TMDB_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results || []).slice(0, 5).map((m) => ({
    titulo: m.title,
    anio: m.release_date ? Number(m.release_date.slice(0, 4)) : null,
    poster: m.poster_path
      ? `https://image.tmdb.org/t/p/w342${m.poster_path}`
      : null,
  }));
}
