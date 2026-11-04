<?php
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', '0');

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

try {
    if ($method === 'GET') {
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

    if ($method === 'PUT' || $method === 'PATCH') {
        $id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1]
        ]);
        if ($id === false) {
            kirimError(400, 'Parameter id wajib diisi dan harus angka bulat positif.');
        }

        $stmt = db()->prepare('SELECT nama, kategori, jumlah, kondisi FROM alat WHERE id = :id');
        $stmt->execute(['id' => $id]);
        $lama = $stmt->fetch();
        if (!$lama) {
            kirimError(404, "Data alat dengan id {$id} tidak ditemukan.");
        }

        $input = bacaBodyJson();
        if ($method === 'PATCH') {
            $diubah = array_intersect_key($input, $lama);
            if (!$diubah) {
                kirimError(422, 'Tidak ada field yang diubah.', [
                    'body' => 'Isi minimal satu field: nama, kategori, jumlah, atau kondisi.'
                ]);
            }
            $input = $diubah + $lama;
        }
        $alat = validasiAlat($input);

        $stmt = db()->prepare(
            'UPDATE alat
             SET nama = :nama, kategori = :kategori, jumlah = :jumlah, kondisi = :kondisi
             WHERE id = :id'
        );
        $stmt->execute($alat + ['id' => $id]);

        kirimJson(200, [
            'status' => 'success',
            'message' => 'Data alat berhasil diperbarui.',
            'data' => ['id' => $id] + $alat
        ]);
    }

    if ($method === 'DELETE') {
        $id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1]
        ]);
        if ($id === false) {
            kirimError(400, 'Parameter id wajib diisi dan harus angka bulat positif.');
        }

        $stmt = db()->prepare('SELECT id FROM alat WHERE id = :id');
        $stmt->execute(['id' => $id]);
        if (!$stmt->fetch()) {
            kirimError(404, "Data alat dengan id {$id} tidak ditemukan.");
        }

        try {
            $stmt = db()->prepare('DELETE FROM alat WHERE id = :id');
            $stmt->execute(['id' => $id]);
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') {
                kirimError(409, 'Data alat masih dipakai di tabel peminjaman, tidak bisa dihapus.');
            }
            throw $e;
        }

        http_response_code(204);
        exit();
    }

    kirimError(405, 'Method tidak diizinkan.');
} catch (Throwable $e) {
    error_log('[API alat] ' . $e->getMessage() . ' di ' . $e->getFile() . ':' . $e->getLine());
    kirimError(500, 'Terjadi kesalahan pada server.');
}
