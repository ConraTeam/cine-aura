export default function manifest() {
  return {
    name: 'Cine Aura',
    short_name: 'Cine Aura',
    description: 'Subí una película por semana, votá las de tus amigos, sumá Aura puntos.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#1a0b2e',
    icons: [{ src: '/icon', sizes: '512x512', type: 'image/png' }],
  };
}
