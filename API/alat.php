<?php
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', '0');

require_once dirname(__DIR__) . '/config/database.php';
require_once __DIR__ . '/middleware.php';

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

        $where = [];
        $params = [];

        $kategori = trim((string)($_GET['kategori'] ?? ''));
        if ($kategori !== '') {
            $where[] = 'kategori = :kategori';
            $params['kategori'] = $kategori;
        }

        $kondisi = trim((string)($_GET['kondisi'] ?? ''));
        if ($kondisi !== '') {
            if (!in_array($kondisi, ['Baik', 'Perlu Cek', 'Rusak'], true)) {
                kirimError(400, 'Parameter kondisi harus Baik, Perlu Cek, atau Rusak.');
            }
            $where[] = 'kondisi = :kondisi';
            $params['kondisi'] = $kondisi;
        }

        $cari = trim((string)($_GET['q'] ?? ''));
        if ($cari !== '') {
            $where[] = 'nama LIKE :cari';
            $params['cari'] = '%' . $cari . '%';
        }

        $sqlWhere = $where ? ' WHERE ' . implode(' AND ', $where) : '';

        $stmt = db()->prepare('SELECT COUNT(*) FROM alat' . $sqlWhere);
        $stmt->execute($params);
        $total = (int)$stmt->fetchColumn();

        $pakaiPagination = isset($_GET['page']) || isset($_GET['limit']);
        $page = filter_var($_GET['page'] ?? 1, FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1]
        ]);
        $limit = filter_var($_GET['limit'] ?? 10, FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1, 'max_range' => 100]
        ]);
        if ($page === false || $limit === false) {
            kirimError(400, 'Parameter page minimal 1 dan limit harus 1-100.');
        }

        $sql = 'SELECT * FROM alat' . $sqlWhere . ' ORDER BY id DESC';
        if ($pakaiPagination) {
            $sql .= ' LIMIT :limit OFFSET :offset';
        }

        $stmt = db()->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        if ($pakaiPagination) {
            $stmt->bindValue('limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue('offset', ($page - 1) * $limit, PDO::PARAM_INT);
        }
        $stmt->execute();
        $data = $stmt->fetchAll();

        $respons = [
            'status' => 'success',
            'total' => $total,
            'data' => $data
        ];
        if ($pakaiPagination) {
            $respons['pagination'] = [
                'page' => $page,
                'limit' => $limit,
                'total_page' => (int)ceil($total / $limit)
            ];
        }

        kirimJson(200, $respons);
    }

    if ($method === 'POST') {
        requireRole(['admin', 'petugas']);

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
        requireRole(['admin', 'petugas']);

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
        requireRole(['admin']);

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
