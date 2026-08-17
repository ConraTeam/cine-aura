'use client';
// components/Leaderboard.jsx
// Ranking continuo por aura_puntos (lee directo de perfiles).

import { useEffect, useState } from 'react';
import { supabase } from '../lib/clientes';

export default function Leaderboard() {
  const [filas, setFilas] = useState([]);

  useEffect(() => {
    supabase
      .from('perfiles')
      .select('nombre, aura_puntos')
      .order('aura_puntos', { ascending: false })
      .then(({ data }) => setFilas(data || []));
  }, []);

  const medallas = ['🥇', '🥈', '🥉'];

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-lg font-semibold mb-3">Leaderboard</h2>
      <ol className="space-y-2">
        {filas.map((f, i) => (
          <li
            key={f.nombre}
            className="flex justify-between items-center border rounded-lg px-3 py-2"
          >
            <span>
              {medallas[i] || `${i + 1}.`} {f.nombre}
            </span>
            <span className="font-bold">{f.aura_puntos} ✨</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
