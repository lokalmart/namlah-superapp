import type { AntActivity, NestPin, RoleConfig, RoleId, StoreItem } from './types';

export const roleConfigs: Record<RoleId, RoleConfig> = {
  member: {
    id: 'member',
    label: 'Member',
    theme: '#1f7a4d',
    homeMode: 'Belanja koloni',
    headline: 'Lihat sarang terdekat dan aktivitas belanja lokal.',
    summary: 'Member melihat gudang, promo, titik pickup, dan jejak aktivitas koloni.',
    featuredActions: ['Belanja kebutuhan', 'Cek titik pickup', 'Lihat riwayat'],
  },
  surveyor: {
    id: 'surveyor',
    label: 'Surveyor',
    theme: '#286fbc',
    homeMode: 'Survey lapangan',
    headline: 'Pantau titik UMKM yang perlu dikunjungi dan divalidasi.',
    summary: 'Surveyor melihat pin calon UMKM, kunjungan ulang, dan draft validasi.',
    featuredActions: ['Buka daftar survey', 'Tambah UMKM', 'Ambil lokasi'],
  },
  kurir: {
    id: 'kurir',
    label: 'Kurir',
    theme: '#b75f1d',
    homeMode: 'Rute pengantaran',
    headline: 'Ikuti jalur pengiriman dan pickup koloni hari ini.',
    summary: 'Kurir melihat rute, pickup, bukti sampai, dan kendala pengiriman.',
    featuredActions: ['Ambil pickup', 'Update status', 'Foto bukti'],
  },
  kasir: {
    id: 'kasir',
    label: 'Kasir',
    theme: '#6c4fc2',
    homeMode: 'Outlet aktif',
    headline: 'Pantau outlet, transaksi, dan stok cepat di titik kasir.',
    summary: 'Kasir melihat antrian transaksi, item laris, dan audit harian.',
    featuredActions: ['Buka POS', 'Cek stok', 'Tutup shift'],
  },
  umkm: {
    id: 'umkm',
    label: 'UMKM',
    theme: '#a53f55',
    homeMode: 'Produk & stok',
    headline: 'Lihat pesanan, stok produk, dan status validasi usaha.',
    summary: 'UMKM memantau produk aktif, stok, order masuk, dan pembayaran.',
    featuredActions: ['Update stok', 'Tambah produk', 'Cek order'],
  },
  admin: {
    id: 'admin',
    label: 'Admin Koloni',
    theme: '#27555d',
    homeMode: 'Kesehatan sarang',
    headline: 'Awasi kondisi sarang, role aktif, dan kerja koloni.',
    summary: 'Admin melihat kesehatan koloni, aktivitas role, dan validasi data.',
    featuredActions: ['Validasi role', 'Lihat dashboard', 'Buka laporan'],
  },
  koperasi: {
    id: 'koperasi',
    label: 'Koperasi',
    theme: '#8a6a1d',
    homeMode: 'Anggota & SHU',
    headline: 'Pantau anggota, program, dan ringkasan SHU dummy.',
    summary: 'Koperasi melihat anggota, simpanan, program, dan transparansi laporan.',
    featuredActions: ['Cek anggota', 'Lihat SHU', 'Buka rapat'],
  },
};

export const roleOrder: RoleId[] = ['member', 'surveyor', 'kurir', 'kasir', 'umkm', 'admin', 'koperasi'];

export const nestPins: NestPin[] = [
  { id: 'sarang-pusat', type: 'nest', label: 'Sarang Pusat Kedawung', x: 49, y: 48, status: 'active', activityCount: 42, roles: roleOrder },
  { id: 'umkm-bu-siti', type: 'survey', label: 'Survey UMKM Bu Siti', x: 26, y: 64, status: 'urgent', activityCount: 7, roles: ['surveyor', 'admin'] },
  { id: 'gudang-sembako', type: 'stock', label: 'Gudang Sembako', x: 72, y: 34, status: 'active', activityCount: 18, roles: ['member', 'umkm', 'admin', 'koperasi'] },
  { id: 'rute-utara', type: 'route', label: 'Rute Kurir Utara', x: 63, y: 72, status: 'active', activityCount: 12, roles: ['kurir', 'admin'] },
  { id: 'outlet-a', type: 'store', label: 'Outlet Kasir A', x: 34, y: 30, status: 'calm', activityCount: 9, roles: ['member', 'kasir', 'admin'] },
  { id: 'koperasi', type: 'finance', label: 'Ruang Koperasi', x: 82, y: 58, status: 'calm', activityCount: 5, roles: ['koperasi', 'admin', 'member'] },
];

export const activities: AntActivity[] = [
  { id: 'a1', roleId: 'member', pinId: 'gudang-sembako', title: 'Paket dapur koloni siap checkout', time: '09:12', severity: 'good' },
  { id: 'a2', roleId: 'surveyor', pinId: 'umkm-bu-siti', title: 'Kunjungan ulang butuh foto produk', time: '09:18', severity: 'warn' },
  { id: 'a3', roleId: 'kurir', pinId: 'rute-utara', title: 'Pickup rute utara menunggu konfirmasi', time: '09:24', severity: 'info' },
  { id: 'a4', roleId: 'kasir', pinId: 'outlet-a', title: 'Outlet A mencatat 18 transaksi pagi', time: '09:31', severity: 'good' },
  { id: 'a5', roleId: 'umkm', pinId: 'gudang-sembako', title: 'Stok keripik perlu update harga', time: '09:36', severity: 'warn' },
  { id: 'a6', roleId: 'admin', pinId: 'sarang-pusat', title: '3 role-ID baru menunggu validasi', time: '09:42', severity: 'info' },
  { id: 'a7', roleId: 'koperasi', pinId: 'koperasi', title: 'Program belanja anggota masuk rekap', time: '09:49', severity: 'good' },
];

export const storeItems: StoreItem[] = [
  { id: 'beras', title: 'Beras Koloni 5kg', category: 'Sembako', price: 'Rp68.000', stock: '32 sak' },
  { id: 'telur', title: 'Telur Ayam Lokal', category: 'Dapur', price: 'Rp29.000', stock: '18 kg' },
  { id: 'sayur', title: 'Paket Sayur Pagi', category: 'Segar', price: 'Rp22.000', stock: '44 paket' },
  { id: 'kopi', title: 'Kopi UMKM Cirebon', category: 'UMKM', price: 'Rp38.000', stock: '21 pouch' },
  { id: 'kurir', title: 'Voucher Kurir Koloni', category: 'Layanan', price: 'Rp8.000', stock: 'aktif' },
  { id: 'shu', title: 'Program Belanja Anggota', category: 'Koperasi', price: 'Dummy', stock: 'pilot' },
];
