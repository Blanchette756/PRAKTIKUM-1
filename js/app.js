import { ringkasInventaris } from './utils.js';

const inventaris = [
    { id: 1, nama: 'Router', kategori: 'Jaringan', jumlah: 4, kondisi: 'Baik' },
    { id: 2, nama: 'Multimeter', kategori: 'Elektronika', jumlah: 6, kondisi: 'Baik' },
    { id: 3, nama: 'Kabel UTP', kategori: 'Jaringan', jumlah: 20, kondisi: 'Perlu Cek' }
];

const alatBaik = inventaris.filter(item => item.kondisi === 'Baik');
const namaAlat = inventaris.map(({ nama }) => nama);
const totalUnit = inventaris.reduce((total, item) => total + item.jumlah, 0);

console.log('--- DAFTAR ALAT KONDISI BAIK ---');
console.table(alatBaik);

console.log('--- NAMA SEMUA ALAT ---');
console.log(namaAlat);

console.log(`Total seluruh unit alat: ${totalUnit}`);

console.log('--- RINGKASAN STATISTIK INVENTARIS ---');
console.log(ringkasInventaris(inventaris));