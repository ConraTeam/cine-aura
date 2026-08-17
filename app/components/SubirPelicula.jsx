'use client';
// components/SubirPelicula.jsx
// Formulario de subida semanal: busca en TMDB, elige resultado, sube.
// La restricción "una por semana" la garantiza el UNIQUE(semana_id, usuario_id)
// de la base — acá solo mostramos el error de forma amigable.

import { useState } from 'react';
import { supabase, buscarTMDB } from '../lib/clientes';

export default function SubirPelicula({ semanaId, onSubida }) {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState([]);
  const [elegida, setElegida] = useState(null);
  const [estado, setEstado] = useState(''); // '', 'buscando', 'subiendo', 'ok', 'error'
  const [mensaje, setMensaje] = useState('');

  async function buscar() {
    setEstado('buscando');
    setResultados(await buscarTMDB(query));
    setEstado('');
  }

  async function subir() {
    if (!elegida) return;
    setEstado('subiendo');
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('peliculas').insert({
      semana_id: semanaId,
      usuario_id: user.id,
      titulo: elegida.titulo,
      anio: elegida.anio,
      poster_url: elegida.poster,
    });
    if (error) {
      setEstado('error');
      setMensaje(
        error.code === '23505'
          ? 'Ya subiste tu película esta semana.'
          : 'No se pudo subir. Probá de nuevo.'
      );
    } else {
      setEstado('ok');
      setMensaje('¡Película subida! Queda anónima hasta el cierre.');
      onSubida?.();
    }
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-3">
      <h2 className="text-lg font-semibold">Subir película de la semana</h2>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2"
          placeholder="Título…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && buscar()}
        />
        <button
          onClick={buscar}
          className="bg-black text-white rounded-lg px-4 py-2"
          disabled={estado === 'buscando'}
        >
          Buscar
        </button>
      </div>

      {resultados.map((r, i) => (
        <button
          key={i}
          onClick={() => setElegida(r)}
          className={`w-full flex items-center gap-3 border rounded-lg p-2 text-left ${
            elegida === r ? 'border-black bg-gray-100' : 'border-gray-200'
          }`}
        >
          {r.poster && (
            <img src={r.poster} alt="" className="w-10 h-14 object-cover rounded" />
          )}
          <span>
            {r.titulo} {r.anio && <span className="text-gray-500">({r.anio})</span>}
          </span>
        </button>
      ))}

      {elegida && (
        <button
          onClick={subir}
          disabled={estado === 'subiendo'}
          className="w-full bg-green-600 text-white rounded-lg py-3 font-medium"
        >
          Subir “{elegida.titulo}”
        </button>
      )}

      {mensaje && (
        <p className={estado === 'error' ? 'text-red-600' : 'text-green-700'}>
          {mensaje}
        </p>
      )}
    </div>
  );
}
