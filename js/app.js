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

const daftar = document.querySelector('#daftar-alat');
const tombolFilter = document.querySelectorAll('[data-filter]');
const searchInput = document.querySelector('#search-input');
const itemsPerPageSelect = document.querySelector('#items-per-page');
const themeButton = document.querySelector('#theme-button');

let currentFilter = 'Semua';
let searchQuery = '';
let itemsPerPage = parseInt(localStorage.getItem('itemsPerPage')) || 5;
itemsPerPageSelect.value = itemsPerPage;

function renderItems() {
    daftar.replaceChildren();

    let filteredData = daftarMobil.filter(item => {
        const matchFilter = currentFilter === 'Semua' || item.kondisi === currentFilter;
        const matchSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase());
        return matchFilter && matchSearch;
    });

    const displayData = filteredData.slice(0, itemsPerPage);

    if (displayData.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.textContent = 'Tidak ada mobil yang sesuai kriteria.';
        daftar.append(emptyMsg);
        return;
    }

    displayData.forEach(item => {
        const article = document.createElement('article');
        article.className = 'card';
        article.dataset.id = item.id;

        const title = document.createElement('h3');
        title.textContent = item.nama;

        const info = document.createElement('p');
        info.textContent = `${item.kategori} - ${item.jumlah} unit - ${item.kondisi}`;

        const btnDetail = document.createElement('button');
        btnDetail.className = 'btn-detail';
        btnDetail.textContent = 'Detail Mobil';
        btnDetail.style.marginTop = '0.5rem';

        article.append(title, info, btnDetail);
        daftar.append(article);
    });
}

tombolFilter.forEach(button => {
    button.addEventListener('click', () => {
        currentFilter = button.dataset.filter;
        renderItems();
    });
});

searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderItems();
});

daftar.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-detail')) {
        const card = e.target.closest('.card');
        const itemId = card.dataset.id;
        const selectedItem = daftarMobil.find(item => item.id == parseInt(itemId));

        if (selectedItem) {
            alert(`[INFO MOBIL]\nNama: ${selectedItem.nama}\nLokasi: ${selectedItem.lokasi}\nJumlah: ${selectedItem.jumlah}\nKondisi: ${selectedItem.kondisi}`);
        }
    }
});

itemsPerPageSelect.addEventListener('change', (e) => {
    itemsPerPage = parseInt(e.target.value);
    localStorage.setItem('itemsPerPage', itemsPerPage);
    renderItems();
});

const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.dataset.theme = savedTheme;

themeButton.addEventListener('click', () => {
    const currentTheme = document.documentElement.dataset.theme;
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('theme', nextTheme);
});

renderItems();

console.log('--- RINGKASAN STATISTIK MOBIL ---');
try {
    const statistik = ringkasMobil(daftarMobil);
    console.log(statistik);
} catch (error) {
    console.error('Terjadi kesalahan:', error.message);
}