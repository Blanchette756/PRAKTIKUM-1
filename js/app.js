import { ringkasMobil } from './utils.js';

const daftarMobil = [
    { id: 1, nama: 'Toyota Avanza', kategori: 'MPV', jumlah: 5, kondisi: 'Baik', lokasi: 'Pool Pusat' },
    { id: 2, nama: 'Honda Brio', kategori: 'City Car', jumlah: 3, kondisi: 'Baik', lokasi: 'Pool Bandara' },
    { id: 3, nama: 'Mitsubishi Pajero', kategori: 'SUV', jumlah: 2, kondisi: 'Perlu Servis', lokasi: 'Pool Pusat' }
];

const mobilBaik = daftarMobil.filter(item => item.kondisi === 'Baik');
const namaMobil = daftarMobil.map(({ nama }) => nama);
const totalUnit = daftarMobil.reduce((total, item) => total + item.jumlah, 0);

const mobilPoolPusat = daftarMobil.filter(item => item.lokasi === 'Pool Pusat');
console.log('--- MOBIL DI POOL PUSAT ---');
console.table(mobilPoolPusat);

function cariMobilById(id) {
    if (typeof id !== 'number') {
        return 'ID harus berupa angka.';
    }
    const hasil = daftarMobil.find(item => item.id === id);
    return hasil || `Mobil dengan ID ${id} tidak ditemukan.`;
}

console.log('--- CARI MOBIL (ID: 2) ---');
console.log(cariMobilById(2));

console.log('--- UJI ID TIDAK DITEMUKAN (ID: 99) ---');
console.log(cariMobilById(99));

console.log('--- RINGKASAN SETIAP ITEM ---');
const ringkasanItem = daftarMobil.map(({ nama, jumlah, lokasi, kondisi }) =>
    `Mobil: ${nama} | Jumlah: ${jumlah} unit | Lokasi: ${lokasi} | Kondisi: ${kondisi}`
);
ringkasanItem.forEach(teks => console.log(teks));

console.log('--- DAFTAR MOBIL KONDISI BAIK ---');
console.table(mobilBaik);

console.log('--- NAMA SEMUA MOBIL ---');
console.log(namaMobil);

console.log(`Total seluruh unit mobil: ${totalUnit}`);

console.log('--- RINGKASAN STATISTIK MOBIL ---');
try {
    const statistik = ringkasMobil(daftarMobil);
    console.log(statistik);
} catch (error) {
    console.error('Terjadi kesalahan:', error.message);
}