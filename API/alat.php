<?php

require_once dirname(__DIR__) . '/config/database.php';

function tampilkanDaftarMobil(): never
{
    $kategori = ambilKategoriDariUrl();
    $query = siapkanQueryDaftarMobil($kategori);
    $stmt = jalankanQuery($query);
    $daftarMobil = $stmt->fetchAll();

    kirimJson(200, [
        'status' => 'success',
        'data' => $daftarMobil
    ]);
}

function ambilKategoriDariUrl(): ?string
{
    return $_GET['kategori'] ?? null;
}

function siapkanQueryDaftarMobil(?string $kategori): array
{
    if ($kategori) {
        return [
            'sql' => 'SELECT * FROM alat WHERE kategori = :kategori ORDER BY id DESC',
            'params' => ['kategori' => $kategori]
        ];
    }

    return [
        'sql' => 'SELECT * FROM alat ORDER BY id DESC',
        'params' => []
    ];
}

function jalankanQuery(array $query): PDOStatement
{
    $stmt = db()->prepare($query['sql']);
    $stmt->execute($query['params']);
    return $stmt;
}

function tambahMobil(): never
{
    $rawInput = ambilBodyRequest();
    $data = bacaJson($rawInput);
    $mobil = rapikanDataMobil($data);
    validasiDataMobil($mobil);
    $mobil = simpanMobil($mobil);

    kirimJson(201, [
        'status' => 'success',
        'code' => 201,
        'message' => 'Data unit mobil berhasil ditambahkan ke basis data',
        'data' => $mobil
    ]);
}

function ambilBodyRequest(): string
{
    return (string) file_get_contents('php://input');
}

function bacaJson(string $rawInput): array
{
    $data = json_decode($rawInput, true);

    if ($rawInput === '' || json_last_error() !== JSON_ERROR_NONE) {
        kirimJson(400, [
            'status' => 'error',
            'code' => 400,
            'message' => 'Format JSON tidak valid atau body kosong: ' . json_last_error_msg()
        ]);
    }

    if (!is_array($data)) {
        kirimJson(400, [
            'status' => 'error',
            'code' => 400,
            'message' => 'Format JSON tidak valid atau body kosong: body harus berupa objek JSON.'
        ]);
    }

    return $data;
}

function rapikanDataMobil(array $data): array
{
    $rapikan = fn(string $kunci): string =>
        isset($data[$kunci]) && is_scalar($data[$kunci]) ? trim((string) $data[$kunci]) : '';

    return [
        'nama' => $rapikan('nama'),
        'kategori' => $rapikan('kategori'),
        'jumlah' => $data['jumlah'] ?? null,
        'kondisi' => $rapikan('kondisi')
    ];
}

function validasiDataMobil(array $mobil): void
{
    $errors = [];

    if (strlen($mobil['nama']) < 3) {
        $errors['nama'] = 'Nama unit mobil wajib diisi dan minimal 3 karakter.';
    }

    if ($mobil['kategori'] === '') {
        $errors['kategori'] = 'Kategori kendaraan wajib diisi.';
    }

    if (!is_numeric($mobil['jumlah']) || (int) $mobil['jumlah'] <= 0) {
        $errors['jumlah'] = 'Jumlah unit harus berupa angka bulat lebih besar dari 0.';
    }

    if ($mobil['kondisi'] === '') {
        $errors['kondisi'] = 'Kondisi kendaraan wajib diisi.';
    }

    if (!empty($errors)) {
        kirimJson(422, [
            'status' => 'fail',
            'code' => 422,
            'message' => 'Data tidak memenuhi aturan bisnis yang ditentukan.',
            'errors' => $errors
        ]);
    }
}

function simpanMobil(array $mobil): array
{
    $mobil['jumlah'] = (int) $mobil['jumlah'];

    $stmt = db()->prepare('INSERT INTO alat (nama, kategori, jumlah, kondisi) VALUES (:nama, :kategori, :jumlah, :kondisi)');
    $stmt->execute($mobil);

    return ['id' => (int) db()->lastInsertId()] + $mobil;
}

function kirimJson(int $statusCode, array $isi): never
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($isi);
    exit();
}

try {
    $method = $_SERVER['REQUEST_METHOD'] ?? '';

    if ($method === 'GET') {
        tampilkanDaftarMobil();
    }

    if ($method === 'POST') {
        tambahMobil();
    }

    kirimJson(405, [
        'status' => 'error',
        'code' => 405,
        'message' => 'Method Not Allowed'
    ]);
} catch (PDOException $e) {
    error_log('[alat.php] ' . $e->getMessage());
    kirimJson(500, [
        'status' => 'error',
        'code' => 500,
        'message' => 'Database sedang bermasalah. Coba lagi nanti.'
    ]);
}
