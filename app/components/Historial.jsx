'use client';
// components/Historial.jsx
// Archivo de semanas ya cerradas: película, autor, puntos finales,
// y el detalle de cada voto (quién, puntaje, "ya la vi", comentario).
// Usa get_historial() — solo trae semanas con cerrada = true.

import { useEffect, useState } from 'react';
import { supabase } from '../lib/clientes';

function agruparPorSemana(filas) {
  const semanas = new Map();
  for (const f of filas) {
    if (!semanas.has(f.semana_id)) {
      semanas.set(f.semana_id, {
        semana_id: f.semana_id,
        fecha_inicio: f.fecha_inicio,
        fecha_fin: f.fecha_fin,
        peliculas: new Map(),
      });
    }
    const semana = semanas.get(f.semana_id);
    if (!semana.peliculas.has(f.pelicula_id)) {
      semana.peliculas.set(f.pelicula_id, {
        pelicula_id: f.pelicula_id,
        titulo: f.titulo,
        anio: f.anio,
        poster_url: f.poster_url,
        autor: f.autor,
        puntos_obtenidos: f.puntos_obtenidos,
        penalizada: f.penalizada,
        votos: [],
      });
    }
    if (f.votante) {
      semana.peliculas.get(f.pelicula_id).votos.push({
        votante: f.votante,
        puntaje: f.puntaje,
        ya_la_vi: f.ya_la_vi,
        comentario: f.comentario,
      });
    }
  }
  return [...semanas.values()]
    .sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio))
    .map((s) => ({ ...s, peliculas: [...s.peliculas.values()] }));
}

export default function Historial() {
  const [semanas, setSemanas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    supabase.rpc('get_historial').then(({ data, error }) => {
      if (!error) setSemanas(agruparPorSemana(data || []));
      setCargando(false);
    });
  }, []);

  if (cargando) return <p className="p-4 text-center">Cargando…</p>;
  if (!semanas.length)
    return <p className="p-4 text-center">Todavía no se cerró ninguna semana.</p>;

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      {semanas.map((s) => (
        <div key={s.semana_id} className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500">
            Semana {s.fecha_inicio} — {s.fecha_fin}
          </h2>

          {s.peliculas.map((p) => (
            <div key={p.pelicula_id} className="border rounded-xl p-3 flex gap-3">
              {p.poster_url && (
                <img src={p.poster_url} alt="" className="w-20 h-28 object-cover rounded-lg" />
              )}
              <div className="flex-1 space-y-2">
                <p className="font-medium">
                  {p.titulo} {p.anio && <span className="text-gray-500">({p.anio})</span>}
                </p>
                <p className="text-sm text-gray-600">
                  Subida por <b>{p.autor}</b>
                  {p.penalizada
                    ? ' — 😅 todos la habían visto (−1)'
                    : p.puntos_obtenidos != null && ` — +${p.puntos_obtenidos} aura`}
                </p>

                {p.votos.length > 0 && (
                  <ul className="space-y-1 text-sm border-t pt-2">
                    {p.votos.map((v, i) => (
                      <li key={i}>
                        <b>{v.votante}</b>
                        {v.puntaje != null && ` — ${v.puntaje} ⭐`}
                        {v.ya_la_vi && ' — Ya la vi capo'}
                        {v.comentario && <span className="block text-gray-600">“{v.comentario}”</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
