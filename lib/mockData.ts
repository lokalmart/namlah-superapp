import type { AntActivity, NestPin, RoleConfig, RoleId, StoreItem } from './types';

export const roleConfigs: Record<RoleId, RoleConfig> = {
  member: {
    id: 'member',
    label: 'Member',
    theme: '#31a866',
    homeMode: 'Explorer koloni',
    headline: 'Jelajahi sarang, ambil misi belanja, dan lihat titik pickup.',
    summary: 'Member melihat gudang, promo, titik pickup, dan jejak aktivitas koloni seperti quest harian.',
    featuredActions: ['Ambil quest belanja', 'Cek pickup', 'Lihat inventory'],
  },
  surveyor: {
    id: 'surveyor',
    label: 'Surveyor',
    theme: '#44a2ff',
    homeMode: 'Scout lapangan',
    headline: 'Buka kabut peta dan validasi titik UMKM baru.',
    summary: 'Surveyor melihat pin calon UMKM, kunjungan ulang, dan draft validasi sebagai scout mission.',
    featuredActions: ['Buka scout map', 'Tambah titik', 'Ambil lokasi'],
  },
  kurir: {
    id: 'kurir',
    label: 'Kurir',
    theme: '#ff8a2f',
    homeMode: 'Runner route',
    headline: 'Kawal jalur suplai dan selesaikan rute pengantaran.',
    summary: 'Kurir melihat rute, pickup, bukti sampai, dan kendala pengiriman sebagai runner mission.',
    featuredActions: ['Ambil pickup', 'Update rute', 'Foto bukti'],
  },
  kasir: {
    id: 'kasir',
    label: 'Kasir',
    theme: '#8b72ff',
    homeMode: 'Trade post',
    headline: 'Kelola pos dagang, transaksi, dan stok cepat.',
    summary: 'Kasir melihat antrian transaksi, item laris, dan audit harian seperti trade post HUD.',
    featuredActions: ['Buka trade post', 'Cek stok', 'Tutup shift'],
  },
  umkm: {
    id: 'umkm',
    label: 'UMKM',
    theme: '#df5877',
    homeMode: 'Crafting den',
    headline: 'Rawat crafting den produk, stok, dan pesanan.',
    summary: 'UMKM memantau produk aktif, stok, order masuk, dan pembayaran seperti crafting inventory.',
    featuredActions: ['Update stok', 'Craft produk', 'Cek order'],
  },
  admin: {
    id: 'admin',
    label: 'Admin Koloni',
    theme: '#3b7f88',
    homeMode: 'Hive command',
    headline: 'Komando sarang, role aktif, dan ritme kerja koloni.',
    summary: 'Admin melihat kesehatan koloni, aktivitas role, dan validasi data sebagai hive command.',
    featuredActions: ['Validasi role', 'Lihat HUD', 'Buka laporan'],
  },
  koperasi: {
    id: 'koperasi',
    label: 'Koperasi',
    theme: '#c3972e',
    homeMode: 'Treasury hall',
    headline: 'Jaga treasury hall, anggota, program, dan SHU dummy.',
    summary: 'Koperasi melihat anggota, simpanan, program, dan transparansi laporan sebagai treasury HUD.',
    featuredActions: ['Cek anggota', 'Lihat SHU', 'Buka rapat'],
  },
};

export const roleOrder: RoleId[] = ['member', 'surveyor', 'kurir', 'kasir', 'umkm', 'admin', 'koperasi'];

export const nestPins: NestPin[] = [
  { id: 'sarang-pusat', type: 'nest', label: 'Queen Hive Kedawung', x: 49, y: 48, status: 'active', activityCount: 42, roles: roleOrder },
  { id: 'umkm-bu-siti', type: 'survey', label: 'Scout Node Bu Siti', x: 26, y: 64, status: 'urgent', activityCount: 7, roles: ['surveyor', 'admin'] },
  { id: 'gudang-sembako', type: 'stock', label: 'Food Vault Sembako', x: 72, y: 34, status: 'active', activityCount: 18, roles: ['member', 'umkm', 'admin', 'koperasi'] },
  { id: 'rute-utara', type: 'route', label: 'Runner Path Utara', x: 63, y: 72, status: 'active', activityCount: 12, roles: ['kurir', 'admin'] },
  { id: 'outlet-a', type: 'store', label: 'Trade Post A', x: 34, y: 30, status: 'calm', activityCount: 9, roles: ['member', 'kasir', 'admin'] },
  { id: 'koperasi', type: 'finance', label: 'Treasury Hall', x: 82, y: 58, status: 'calm', activityCount: 5, roles: ['koperasi', 'admin', 'member'] },
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
