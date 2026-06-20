import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Namlah Superapp',
    short_name: 'Namlah',
    description: 'Namlah Superapp untuk Semut-ID, role, map koloni, transaksi, scan, dan akun Odoo.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f6f3ea',
    theme_color: '#1f7a4d',
    categories: ['business', 'productivity', 'shopping'],
    icons: [
      {
        src: '/icons/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/maskable.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
