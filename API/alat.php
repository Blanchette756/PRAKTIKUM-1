<?php
header('Content-Type: application/json; charset=utf-8');

require_once dirname(__DIR__) . '/config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

function kirimJson(int $statusCode, array $body): void {
    http_response_code($statusCode);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit();
}

function kirimError(int $statusCode, string $message, array $fields = []): void {
    $error = [
        'code' => $statusCode,
        'message' => $message
    ];
    if ($fields) {
        $error['fields'] = $fields;
    }
    kirimJson($statusCode, ['error' => $error]);
}

function bacaBodyJson(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);

    if (!is_array($data)) {
        kirimError(400, 'Body request harus berupa JSON object yang valid.');
    }
    return $data;
}

function validasiAlat(array $input): array {
    $nama = trim((string)($input['nama'] ?? ''));
    $kategori = trim((string)($input['kategori'] ?? ''));
    $jumlah = filter_var($input['jumlah'] ?? null, FILTER_VALIDATE_INT);
    $kondisi = trim((string)($input['kondisi'] ?? ''));

    $errors = [];

    if (mb_strlen($nama) < 3 || mb_strlen($nama) > 120) {
        $errors['nama'] = 'Nama wajib diisi, 3-120 karakter.';
    }
    if ($kategori === '' || mb_strlen($kategori) > 80) {
        $errors['kategori'] = 'Kategori wajib diisi, maksimal 80 karakter.';
    }
    if ($jumlah === false || $jumlah < 0) {
        $errors['jumlah'] = 'Jumlah harus angka bulat 0 atau lebih.';
    }
    if (!in_array($kondisi, ['Baik', 'Perlu Cek', 'Rusak'], true)) {
        $errors['kondisi'] = 'Kondisi harus Baik, Perlu Cek, atau Rusak.';
    }

    if ($errors) {
        kirimError(422, 'Data alat tidak valid.', $errors);
    }

    return compact('nama', 'kategori', 'jumlah', 'kondisi');
}

if ($method === 'GET') {
    // ===== GET BY ID: /API/alat.php?id=1 =====
    if (isset($_GET['id'])) {
        $id = filter_var($_GET['id'], FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1]
        ]);

        if ($id === false) {
            kirimError(400, 'Parameter id harus berupa angka bulat positif.');
        }

        $stmt = db()->prepare('SELECT * FROM alat WHERE id = :id');
        $stmt->execute(['id' => $id]);
        $alat = $stmt->fetch();

        if (!$alat) {
            kirimError(404, "Data alat dengan id {$id} tidak ditemukan.");
        }

        kirimJson(200, [
            'status' => 'success',
            'data' => $alat
        ]);
    }

    // ===== GET COLLECTION: /API/alat.php atau ?kategori=SUV =====
    $kategori = trim((string)($_GET['kategori'] ?? ''));

    if ($kategori !== '') {
        $stmt = db()->prepare('SELECT * FROM alat WHERE kategori = :kategori ORDER BY id DESC');
        $stmt->execute(['kategori' => $kategori]);
    } else {
        $stmt = db()->query('SELECT * FROM alat ORDER BY id DESC');
    }

    $data = $stmt->fetchAll();

    kirimJson(200, [
        'status' => 'success',
        'total' => count($data),
        'data' => $data
    ]);
}

// ===== POST CREATE: /API/alat.php (body JSON) =====
if ($method === 'POST') {
    $input = bacaBodyJson();
    $alat = validasiAlat($input);

    $stmt = db()->prepare(
        'INSERT INTO alat (nama, kategori, jumlah, kondisi)
         VALUES (:nama, :kategori, :jumlah, :kondisi)'
    );
    $stmt->execute($alat);

    $alat = ['id' => (int)db()->lastInsertId()] + $alat;

    kirimJson(201, [
        'status' => 'success',
        'message' => 'Data alat berhasil ditambahkan.',
        'data' => $alat
    ]);
}

kirimError(405, 'Method tidak diizinkan.');
