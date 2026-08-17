'use client';
import { useEffect, useState } from 'react';
import { supabase } from './lib/clientes';
import SubirPelicula from './components/SubirPelicula';
import FeedVotacion from './components/FeedVotacion';
import Leaderboard from './components/Leaderboard';

export default function Home() {
  const [tab, setTab] = useState('feed');
  const [sesion, setSesion] = useState(null);
  const [semanaId, setSemanaId] = useState(null);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSesion(data.session));
    supabase.auth.onAuthStateChange((_e, s) => setSesion(s));
    supabase.from('semanas').select('id').order('id', { ascending: false })
      .limit(1).single().then(({ data }) => setSemanaId(data?.id));
  }, []);

  function validarCampos() {
    if (!email.trim() || !pass.trim()) {
      setAuthError('Completá el email y la contraseña.');
      return false;
    }
    if (pass.length < 6) {
      setAuthError('La contraseña tiene que tener al menos 6 caracteres.');
      return false;
    }
    setAuthError('');
    return true;
  }

  async function entrar() {
    if (!validarCampos()) return;
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) setAuthError(error.message);
  }

  async function registrarme() {
    if (!validarCampos()) return;
    const { error } = await supabase.auth.signUp({ email, password: pass });
    if (error) setAuthError(error.message);
  }

  if (!sesion)
    return (
      <div className="max-w-sm mx-auto p-6 space-y-3">
        <h1 className="text-xl font-bold text-center">Cine Aura 🎬</h1>
        <input className="w-full border rounded-lg px-3 py-2" placeholder="Email"
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border rounded-lg px-3 py-2" type="password"
          placeholder="Contraseña" value={pass} onChange={(e) => setPass(e.target.value)} />
        {authError && (
          <p className="text-sm text-red-600 text-center">{authError}</p>
        )}
        <button className="w-full bg-black text-white rounded-lg py-2" onClick={entrar}>
          Entrar
        </button>
        <button className="w-full border rounded-lg py-2" onClick={registrarme}>
          Registrarme
        </button>
      </div>
    );

  return (
    <div className="pb-16">
      {tab === 'subir' && <SubirPelicula semanaId={semanaId} />}
      {tab === 'feed' && <FeedVotacion />}
      {tab === 'ranking' && <Leaderboard />}

      <nav className="fixed bottom-0 inset-x-0 bg-white border-t flex">
        {[['feed', '🎬 Feed'], ['subir', '⬆️ Subir'], ['ranking', '✨ Ranking']].map(
          ([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 py-3 text-sm ${tab === id ? 'font-bold' : 'text-gray-500'}`}>
              {label}
            </button>
          )
        )}
      </nav>
    </div>
  );
}
