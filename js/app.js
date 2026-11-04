import { ringkasMobil } from './utils.js';

let daftarMobil = [];
const ENDPOINT_ALAT = './API/alat.php';

async function requestApi(url, options = {}) {
    const headers = { 'Accept': 'application/json' };
    if (options.body) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, { ...options, headers });

    if (response.status === 204) {
        return null;
    }

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(payload.error?.message ?? `HTTP ${response.status}`);
        error.status = response.status;
        error.fields = payload.error?.fields ?? {};
        throw error;
    }

    return payload;
}

async function fetchMobil() {
    const payload = await requestApi(ENDPOINT_ALAT);
    return payload.data;
}

function cariMobilById(id) {
    if (typeof id !== 'number') {
        return 'ID harus berupa angka.';
    }
    const hasil = daftarMobil.find(item => item.id === id);
    return hasil || `Mobil dengan ID ${id} tidak ditemukan.`;
}

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
let itemsPerPage = parseInt(localStorage.getItem('itemsPerPage')) || 10;
if (itemsPerPage < 6) {
    itemsPerPage = 10;
}
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

        const actions = document.createElement('p');
        actions.className = 'card-actions';

        const btnDetail = document.createElement('button');
        btnDetail.type = 'button';
        btnDetail.className = 'btn-detail';
        btnDetail.textContent = 'Detail';

        const btnEdit = document.createElement('button');
        btnEdit.type = 'button';
        btnEdit.className = 'btn-edit';
        btnEdit.textContent = 'Edit';

        const btnHapus = document.createElement('button');
        btnHapus.type = 'button';
        btnHapus.className = 'btn-hapus';
        btnHapus.textContent = 'Hapus';

        actions.append(btnDetail, btnEdit, btnHapus);
        article.append(title, info, actions);
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
    const card = e.target.closest('.card');
    if (!card) {
        return;
    }
    const itemId = Number(card.dataset.id);

    if (e.target.classList.contains('btn-detail')) {
        const selectedItem = daftarMobil.find(item => item.id === itemId);
        if (selectedItem) {
            alert(`[INFO MOBIL]\nNama: ${selectedItem.nama}\nKategori: ${selectedItem.kategori}\nJumlah: ${selectedItem.jumlah}\nKondisi: ${selectedItem.kondisi}`);
        }
    }

    if (e.target.classList.contains('btn-edit')) {
        mulaiEdit(itemId);
    }

    if (e.target.classList.contains('btn-hapus')) {
        hapusAlat(itemId);
    }
});

const alatForm = document.getElementById('alat-form');
const alatJudul = document.getElementById('judul-form-alat');
const alatFeedback = document.getElementById('alat-feedback');
const alatSubmit = document.getElementById('alat-submit');
const alatBatal = document.getElementById('alat-batal');
const alatFields = {
    id: document.getElementById('alat-id'),
    nama: document.getElementById('alat-nama'),
    kategori: document.getElementById('alat-kategori'),
    jumlah: document.getElementById('alat-jumlah'),
    kondisi: document.getElementById('alat-kondisi')
};
const kolomAlat = ['nama', 'kategori', 'jumlah', 'kondisi'];

function tampilkanFeedback(pesan, tipe) {
    alatFeedback.textContent = pesan;
    alatFeedback.className = `status-box ${tipe === 'error' ? 'error-box' : 'success-box'}`;
    alatFeedback.hidden = false;
}

function bersihkanErrorAlat() {
    kolomAlat.forEach(name => {
        alatFields[name].classList.remove('input-error');
        document.getElementById(`alat-${name}Error`).textContent = '';
    });
}

function tampilkanErrorAlat(fieldErrors) {
    Object.entries(fieldErrors).forEach(([name, pesan]) => {
        const errorText = document.getElementById(`alat-${name}Error`);
        if (alatFields[name] && errorText) {
            alatFields[name].classList.add('input-error');
            errorText.textContent = pesan;
        }
    });
}

function resetFormAlat() {
    alatForm.reset();
    alatFields.id.value = '';
    alatJudul.textContent = 'Tambah Data Mobil';
    alatSubmit.textContent = 'Simpan Data';
    alatBatal.hidden = true;
    bersihkanErrorAlat();
}

async function mulaiEdit(id) {
    try {
        const payload = await requestApi(`${ENDPOINT_ALAT}?id=${encodeURIComponent(id)}`);
        const alat = payload.data;

        alatFields.id.value = alat.id;
        kolomAlat.forEach(name => {
            alatFields[name].value = alat[name];
        });

        alatJudul.textContent = `Edit Data Mobil #${alat.id}`;
        alatSubmit.textContent = 'Simpan Perubahan';
        alatBatal.hidden = false;
        bersihkanErrorAlat();
        alatForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        alatFields.nama.focus();
    } catch (error) {
        tampilkanFeedback(error.message, 'error');
    }
}

async function hapusAlat(id) {
    const alat = daftarMobil.find(item => item.id === id);
    const nama = alat ? alat.nama : `id ${id}`;

    if (!confirm(`Hapus data "${nama}"?`)) {
        return;
    }

    try {
        await requestApi(`${ENDPOINT_ALAT}?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
        if (Number(alatFields.id.value) === id) {
            resetFormAlat();
        }
        tampilkanFeedback(`Data "${nama}" berhasil dihapus.`, 'success');
        await initDashboard();
    } catch (error) {
        tampilkanFeedback(error.message, 'error');
    }
}

alatForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    bersihkanErrorAlat();

    const id = alatFields.id.value;
    const jumlah = alatFields.jumlah.value;
    const body = {
        nama: alatFields.nama.value,
        kategori: alatFields.kategori.value,
        jumlah: jumlah === '' ? null : Number(jumlah),
        kondisi: alatFields.kondisi.value
    };

    alatSubmit.disabled = true;

    try {
        const url = id ? `${ENDPOINT_ALAT}?id=${encodeURIComponent(id)}` : ENDPOINT_ALAT;
        const payload = await requestApi(url, {
            method: id ? 'PUT' : 'POST',
            body: JSON.stringify(body)
        });

        tampilkanFeedback(payload.message, 'success');
        resetFormAlat();
        await initDashboard();
    } catch (error) {
        tampilkanErrorAlat(error.fields ?? {});
        tampilkanFeedback(error.message, 'error');
    } finally {
        alatSubmit.disabled = false;
    }
});

alatBatal.addEventListener('click', resetFormAlat);

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

async function initDashboard() {
    daftar.replaceChildren();
    if (statusLoading) statusLoading.hidden = false;
    if (statusError) statusError.hidden = true;

    try {
        daftarMobil = await fetchMobil();
        renderItems();

        console.log('--- RINGKASAN STATISTIK MOBIL ---');
        const statistik = ringkasMobil(daftarMobil);
        console.log(statistik);
    } catch (error) {
        console.error('Terjadi kesalahan:', error.message);
        if (statusError) {
            statusError.hidden = false;
            if (errorMessage) {
                errorMessage.textContent = 'Data kendaraan belum dapat dimuat. Silakan periksa koneksi atau coba lagi.';
            }
        }
    } finally {
        if (statusLoading) statusLoading.hidden = true;
    }
}

if (btnRetry) {
    btnRetry.addEventListener('click', () => {
        initDashboard();
    });
}

initDashboard();