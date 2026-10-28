CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin','petugas','viewer') NOT NULL DEFAULT 'viewer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE alat (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(120) NOT NULL,
    kategori VARCHAR(80) NOT NULL,
    jumlah INT UNSIGNED NOT NULL DEFAULT 0,
    kondisi ENUM('Baik','Perlu Cek','Rusak') NOT NULL DEFAULT 'Baik',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE peminjaman (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    alat_id BIGINT UNSIGNED NOT NULL,
    jumlah INT UNSIGNED NOT NULL DEFAULT 1,
    tanggal_pinjam DATE NOT NULL,
    tanggal_kembali DATE NULL,
    status ENUM('Diajukan','Dipinjam','Selesai','Ditolak') NOT NULL DEFAULT 'Diajukan',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_peminjaman_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_peminjaman_alat FOREIGN KEY (alat_id) REFERENCES alat(id)
);