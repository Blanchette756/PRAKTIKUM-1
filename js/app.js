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
const form = document.getElementById('laporanForm');
const errorSummary = document.getElementById('formErrorSummary');

const fields = {
    nama: document.getElementById('nama'),
    email: document.getElementById('email'),
    kategori: document.getElementById('kategori'),
    tanggal: document.getElementById('tanggal'),
    detail: document.getElementById('detail'),
    setuju: document.getElementById('setuju')
};

const rules = {
    nama: value => value.trim().length >= 5 ? '' : 'Nama minimal 5 karakter.',
    email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : 'Email harus valid.',
    kategori: value => value ? '' : 'Kategori kendaraan harus dipilih.',
    tanggal: value => value ? '' : 'Tanggal laporan wajib diisi.',
    detail: value => value.trim().length >= 10 ? '' : 'Detail kendala minimal 10 karakter.',
    setuju: value => value ? '' : 'Anda harus menyetujui data laporan.'
};

function getFieldValue(name, field) {
    if (name === 'setuju') {
        return field.checked;
    }

    return field.value;
}

function clearFieldError(name) {
    const field = fields[name];
    const errorText = document.getElementById(`${name}Error`);

    if (field) {
        field.classList.remove('input-error');
        field.classList.add('input-valid');
    }

    if (errorText) {
        errorText.textContent = '';
    }
}

function setFieldError(name, message) {
    const field = fields[name];
    const errorText = document.getElementById(`${name}Error`);

    if (field) {
        field.classList.remove('input-valid');
        field.classList.add('input-error');
    }

    if (errorText) {
        errorText.textContent = message;
    }
}

function validateField(name) {
    const field = fields[name];
    const value = getFieldValue(name, field);
    const message = rules[name](value);

    if (message) {
        setFieldError(name, message);
        return false;
    }

    clearFieldError(name);
    return true;
}

function renderErrorSummary(errors) {
    if (!errorSummary) {
        return;
    }

    if (!errors.length) {
        errorSummary.hidden = true;
        errorSummary.innerHTML = '';
        return;
    }

    errorSummary.hidden = false;
    errorSummary.innerHTML = `<ul>${errors.map(error => `<li>${error}</li>`).join('')}</ul>`;
}

function validateForm() {
    const errorMessages = [];

    Object.keys(fields).forEach(name => {
        const field = fields[name];
        const value = getFieldValue(name, field);
        const message = rules[name](value);

        if (message) {
            setFieldError(name, message);
            errorMessages.push(message);
        } else {
            clearFieldError(name);
        }
    });

    renderErrorSummary(errorMessages);
    return errorMessages.length === 0;
}

if (form) {
    Object.keys(fields).forEach(name => {
        const field = fields[name];
        const eventName = name === 'setuju' ? 'change' : 'input';

        field.addEventListener(eventName, () => {
            validateField(name);
            if (errorSummary && !errorSummary.hidden) {
                const currentErrors = [];
                Object.keys(fields).forEach(fieldName => {
                    const fieldValue = getFieldValue(fieldName, fields[fieldName]);
                    const message = rules[fieldName](fieldValue);
                    if (message) {
                        currentErrors.push(message);
                    }
                });
                renderErrorSummary(currentErrors);
            }
        });
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const isValid = validateForm();

        if (!isValid) {
            const order = ['nama', 'email', 'kategori', 'tanggal', 'detail', 'setuju'];
            const firstInvalid = order.find(name => !validateField(name));

            if (firstInvalid && fields[firstInvalid]) {
                fields[firstInvalid].focus();
            }
            return;
        }

        renderErrorSummary([]);
        alert('Laporan kendaraan berhasil dikirim.');
        form.reset();
        Object.keys(fields).forEach(name => clearFieldError(name));
    });
}

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