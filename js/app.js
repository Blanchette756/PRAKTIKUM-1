import { ringkasMobil } from './utils.js';

const ENDPOINT_MOBIL = './data/Mobil.json';

let daftarMobil = [];
let currentFilter = 'Semua';
let itemsPerPage = 10;
let interaksiTerpasang = false;

const daftar = document.querySelector('#daftar-alat');
const tombolFilter = document.querySelectorAll('[data-filter]');
const searchInput = document.querySelector('#search-input');
const itemsPerPageSelect = document.querySelector('#items-per-page');
const themeButton = document.querySelector('#theme-button');
const statusLoading = document.getElementById('status-loading');
const statusError = document.getElementById('status-error');
const errorMessage = document.getElementById('error-message');
const btnRetry = document.getElementById('btn-retry');
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

async function initDashboard() {
    const endpoint = ambilEndpoint();
    const request = siapkanRequest(endpoint);
    tampilkanLoading();

    try {
        const response = await tungguResponse(request);
        daftarMobil = await bacaDataMobil(response);
    } catch (error) {
        sembunyikanLoading();
        tampilkanError(error);
        return;
    }

    const pilihan = ambilPilihanFilter();
    const wadah = kosongkanDaftar();
    const pilihanRapi = rapikanPilihanFilter(pilihan);
    const aturanFilter = buatAturanFilter(pilihanRapi);
    sembunyikanLoading();
    const mobilTampil = saringMobil(daftarMobil, aturanFilter, pilihanRapi.jumlahTampil);
    renderKartuMobil(mobilTampil, wadah);
    pasangInteraksi();
    const statistik = hitungStatistik(daftarMobil);
    tampilkanStatistik(statistik);
}

function renderItems() {
    const pilihanRapi = rapikanPilihanFilter(ambilPilihanFilter());
    const wadah = kosongkanDaftar();
    const aturanFilter = buatAturanFilter(pilihanRapi);
    const mobilTampil = saringMobil(daftarMobil, aturanFilter, pilihanRapi.jumlahTampil);
    renderKartuMobil(mobilTampil, wadah);
}

function siapkanHalaman() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.dataset.theme = savedTheme;
    themeButton.addEventListener('click', gantiTema);

    itemsPerPage = parseInt(localStorage.getItem('itemsPerPage')) || 10;
    if (itemsPerPage < 6) {
        itemsPerPage = 10;
    }
    itemsPerPageSelect.value = itemsPerPage;

    if (btnRetry) {
        btnRetry.addEventListener('click', () => initDashboard());
    }

    if (form) {
        siapkanFormLaporan();
    }
}

function gantiTema() {
    const currentTheme = document.documentElement.dataset.theme;
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('theme', nextTheme);
}

function ambilEndpoint() {
    return ENDPOINT_MOBIL;
}

function siapkanRequest(endpoint) {
    return new Request(endpoint, {
        headers: { Accept: 'application/json' }
    });
}

function tampilkanLoading() {
    daftar.replaceChildren();
    if (statusLoading) statusLoading.hidden = false;
    if (statusError) statusError.hidden = true;
}

async function tungguResponse(request) {
    const response = await fetch(request);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Gagal memuat data kendaraan`);
    }
    return response;
}

async function bacaDataMobil(response) {
    const data = await response.json();
    if (!Array.isArray(data)) {
        throw new TypeError('Data kendaraan harus berupa array');
    }
    return data;
}

function ambilPilihanFilter() {
    return {
        filter: currentFilter,
        kataKunci: searchInput.value,
        jumlahTampil: itemsPerPage
    };
}

function kosongkanDaftar() {
    daftar.replaceChildren();
    return daftar;
}

function rapikanPilihanFilter(pilihan) {
    return {
        ...pilihan,
        kataKunci: pilihan.kataKunci.toLowerCase()
    };
}

function buatAturanFilter(pilihan) {
    return item => {
        const cocokFilter = pilihan.filter === 'Semua' || item.kondisi === pilihan.filter;
        const cocokCari = item.nama.toLowerCase().includes(pilihan.kataKunci);
        return cocokFilter && cocokCari;
    };
}

function sembunyikanLoading() {
    if (statusLoading) statusLoading.hidden = true;
}

function saringMobil(data, aturanFilter, jumlahTampil) {
    return data.filter(aturanFilter).slice(0, jumlahTampil);
}

function renderKartuMobil(mobilTampil, wadah) {
    if (mobilTampil.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.textContent = 'Tidak ada mobil yang sesuai kriteria.';
        wadah.append(emptyMsg);
        return;
    }

    mobilTampil.forEach(item => {
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
        wadah.append(article);
    });
}

function pasangInteraksi() {
    if (interaksiTerpasang) {
        return;
    }
    interaksiTerpasang = true;

    tombolFilter.forEach(button => {
        button.addEventListener('click', () => {
            currentFilter = button.dataset.filter;
            renderItems();
        });
    });

    searchInput.addEventListener('input', () => {
        renderItems();
    });

    itemsPerPageSelect.addEventListener('change', (e) => {
        itemsPerPage = parseInt(e.target.value);
        localStorage.setItem('itemsPerPage', itemsPerPage);
        renderItems();
    });

    daftar.addEventListener('click', tampilkanDetailMobil);
}

function tampilkanDetailMobil(e) {
    if (!e.target.classList.contains('btn-detail')) {
        return;
    }

    const card = e.target.closest('.card');
    const selectedItem = daftarMobil.find(item => item.id === parseInt(card.dataset.id));

    if (selectedItem) {
        alert(`[INFO MOBIL]\nNama: ${selectedItem.nama}\nLokasi: ${selectedItem.lokasi}\nJumlah: ${selectedItem.jumlah}\nKondisi: ${selectedItem.kondisi}`);
    }
}

function hitungStatistik(data) {
    return ringkasMobil(data);
}

function tampilkanStatistik(statistik) {
    console.log('--- RINGKASAN STATISTIK MOBIL ---');
    console.log(statistik);
}

function tampilkanError(error) {
    console.error('Terjadi kesalahan:', error.message);
    if (statusError) {
        statusError.hidden = false;
        if (errorMessage) {
            errorMessage.textContent = 'Data kendaraan belum dapat dimuat. Silakan periksa koneksi atau coba lagi.';
        }
    }
}

function cariMobilById(id) {
    if (typeof id !== 'number') {
        return 'ID harus berupa angka.';
    }
    const hasil = daftarMobil.find(item => item.id === id);
    return hasil || `Mobil dengan ID ${id} tidak ditemukan.`;
}

function siapkanFormLaporan() {
    Object.keys(fields).forEach(name => {
        const eventName = name === 'setuju' ? 'change' : 'input';

        fields[name].addEventListener(eventName, () => {
            validateField(name);
            if (errorSummary && !errorSummary.hidden) {
                renderErrorSummary(kumpulkanErrorForm().map(item => item.message));
            }
        });
    });

    form.addEventListener('submit', kirimLaporan);
}

function kirimLaporan(event) {
    event.preventDefault();

    const errors = kumpulkanErrorForm();

    Object.keys(fields).forEach(name => {
        const gagal = errors.find(item => item.name === name);
        if (gagal) {
            setFieldError(name, gagal.message);
        } else {
            clearFieldError(name);
        }
    });

    renderErrorSummary(errors.map(item => item.message));

    if (errors.length > 0) {
        fields[errors[0].name].focus();
        return;
    }

    alert('Laporan kendaraan berhasil dikirim.');
    form.reset();
    Object.keys(fields).forEach(name => clearFieldError(name));
}

function kumpulkanErrorForm() {
    return Object.keys(fields)
        .map(name => ({ name, message: rules[name](getFieldValue(name, fields[name])) }))
        .filter(item => item.message);
}

function getFieldValue(name, field) {
    if (name === 'setuju') {
        return field.checked;
    }

    return field.value;
}

function validateField(name) {
    const message = rules[name](getFieldValue(name, fields[name]));

    if (message) {
        setFieldError(name, message);
        return false;
    }

    clearFieldError(name);
    return true;
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

siapkanHalaman();
initDashboard();
