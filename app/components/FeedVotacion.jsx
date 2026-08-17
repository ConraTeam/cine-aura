'use client';
// components/FeedVotacion.jsx
// Feed anónimo: lee vía rpc get_feed() (el servidor decide qué mostrar).
// Voto = puntaje 1-5 y/o "Ya la vi capo". upsert => se puede corregir
// el voto mientras la semana esté abierta.

import { useEffect, useState } from 'react';
import { supabase } from '../lib/clientes';

export default function FeedVotacion() {
  const [feed, setFeed] = useState([]);
  const [cargando, setCargando] = useState(true);

  async function cargar() {
    const { data, error } = await supabase.rpc('get_feed');
    if (!error) setFeed(data || []);
    setCargando(false);
  }

  useEffect(() => { cargar(); }, []);

  async function votar(pelicula, { puntaje, ya_la_vi }) {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('votos').upsert(
      {
        pelicula_id: pelicula.pelicula_id,
        votante_id: user.id,
        puntaje: puntaje ?? pelicula.mi_puntaje,
        ya_la_vi: ya_la_vi ?? pelicula.mi_ya_la_vi,
      },
      { onConflict: 'pelicula_id,votante_id' }
    );
    cargar();
  }

  if (cargando) return <p className="p-4 text-center">Cargando…</p>;
  if (!feed.length) return <p className="p-4 text-center">Todavía no hay películas esta semana.</p>;

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      {feed.map((p) => (
        <div key={p.pelicula_id} className="border rounded-xl p-3 flex gap-3">
          {p.poster_url && (
            <img src={p.poster_url} alt="" className="w-20 h-28 object-cover rounded-lg" />
          )}
          <div className="flex-1 space-y-2">
            <p className="font-medium">
              {p.titulo} {p.anio && <span className="text-gray-500">({p.anio})</span>}
            </p>

            {/* Autor: solo aparece cuando la semana cerró */}
            {p.autor && (
              <p className="text-sm text-gray-600">
                Subida por <b>{p.autor}</b>
                {p.penalizada
                  ? ' — 😅 todos la habían visto (−1)'
                  : p.puntos_obtenidos != null && ` — +${p.puntos_obtenidos} aura`}
              </p>
            )}

            {p.es_mia && !p.semana_cerrada && (
              <p className="text-sm text-blue-600">Tu película (no podés votarla)</p>
            )}

            {/* Controles de voto */}
            {!p.es_mia && !p.semana_cerrada && (
              <>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => votar(p, { puntaje: n })}
                      className={`w-9 h-9 rounded-full border text-sm ${
                        p.mi_puntaje === n
                          ? 'bg-yellow-400 border-yellow-500 font-bold'
                          : 'border-gray-300'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => votar(p, { ya_la_vi: !p.mi_ya_la_vi })}
                  className={`text-sm rounded-full px-3 py-1 border ${
                    p.mi_ya_la_vi
                      ? 'bg-red-100 border-red-400 text-red-700'
                      : 'border-gray-300 text-gray-600'
                  }`}
                >
                  {p.mi_ya_la_vi ? '✔ Ya la vi capo' : 'Ya la vi capo'}
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
