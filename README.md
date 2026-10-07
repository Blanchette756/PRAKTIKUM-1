# Praktikum Pemrograman Web 

## Identitas Mahasiswa dan Mata Kuliah
*   **Nama:** Rizky Rahmad Dani
*   **Npm:** 2440304001
*   **Program Studi:** Teknik Komputer, Semester 5
*   **Institusi:** Universitas Borneo Tarakan
*   **Mata Kuliah:** Praktikum Pemrograman Web

## Deskripsi Proyek
Repositori ini merupakan proyek Praktikum Pemrograman Web berbasis Outcome-Based Education (OBE). Proyek ini mengembangkan antarmuka sistem pengelolaan pool mobil dengan struktur HTML5 semantik dan standar aksesibilitas web dasar.

## Fitur yang Telah Diselesaikan
*   Penyusunan elemen semantik HTML5 (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
*   Penerapan hierarki judul (*heading hierarchy*) yang logis.
*   Pembuatan formulir kontak dan pelaporan kendala kendaraan dengan integrasi atribut `<label>` dan `<input>`.
*   Penerapan teks alternatif (`alt`) pada gambar dan tautan pintasan (*skip link*) untuk navigasi papan ketik.
*   Penerapan manajemen kontrol versi (*branching*, *commit*, dan *merging*) menggunakan Git.

## Kebijakan dan Integritas Pengembangan
Pengembangan basis kode ini mematuhi prinsip transparansi. Asisten kecerdasan buatan (AI) hanya difungsikan sebagai alat bantu analisis logika dan *debugging* sekunder. Seluruh eksekusi, penyesuaian arsitektur, dan verifikasi akhir sepenuhnya berada di bawah kendali dan tanggung jawab pengembang utama.

## Teknologi yang Digunakan
*   HTML5
*   Laragon (Apache & PHP 8.4)
*   Git / GitHub

## Cara Menjalankan Proyek
Untuk menjalankan proyek ini pada lingkungan pengembangan lokal, silakan ikuti prosedur instruksional berikut:
1.  Buka aplikasi **Laragon** pada sistem operasi Windows Anda.
2.  Tekan tombol **Start All** untuk menginisialisasi layanan peladen web Apache.
3.  Pastikan direktori repositori ini (`pemweb-obe`) ditempatkan secara tepat di dalam direktori akar Laragon, yaitu pada lintasan absolut `C:\laragon\www\pemweb-obe`.
4.  Buka peramban web modern dan akses proyek melalui tautan URL lokal yang tertera di bawah.

## URL Lokal
*   `http://localhost/pemweb-obe/`

## Dokumentasi Endpoint API 

Tabel spesifikasi endpoint REST API/JSON yang digunakan pada sistem Manajemen Mobil:

| Komponen | Penjelasan Teknis |
| :--- | :--- |
| **Nama Endpoint** | Endpoint Data Kendaraan |
| **Method** | GET |
| **URL / Lintasan** | `./data/Mobil.json` (Akses server: `http://localhost/pemweb-obe/data/Mobil.json`) |
| **Tujuan / Fungsi** | Mengambil seluruh daftar unit kendaraan untuk dirender ke dalam antarmuka dashboard |
| **Parameter Query / Body** | Tidak ada (Static JSON Resource) |
| **Header Request** | `Accept: application/json` |
| **Status Berhasil** | `200 OK` (mengembalikan Array of Objects kendaraan) |
| **Status Galat** | `404 Not Found` (berkas tidak ada) / `500 Internal Server Error` |
| **Respon Galat UI** | Menampilkan elemen pesan galat ramah pengguna disertai tombol *Coba Lagi* (*retry*) |

