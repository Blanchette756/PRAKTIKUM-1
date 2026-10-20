<?php
header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'data' => [
            [
                'id' => 1,
                'nama' => 'Toyota Avanza 1.3 G',
                'kategori' => 'MPV',
                'jumlah' => 4,
                'kondisi' => 'Baik',
                'lokasi' => 'Kantor Pusat'
            ],
            [
                'id' => 2,
                'nama' => 'Honda Brio Satya E',
                'kategori' => 'City Car',
                'jumlah' => 3,
                'kondisi' => 'Baik',
                'lokasi' => 'Bandara'
            ],
            [
                'id' => 3,
                'nama' => 'Mitsubishi Pajero Sport Dakar',
                'kategori' => 'SUV',
                'jumlah' => 2,
                'kondisi' => 'Perlu Servis',
                'lokasi' => 'Kantor Pusat'
            ]
        ]
    ]);
    exit();
}

if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);

    if (json_last_error() !== JSON_ERROR_NONE || empty($rawInput)) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'code' => 400,
            'message' => 'Format JSON tidak valid atau body kosong: ' . json_last_error_msg()
        ]);
        exit();
    }

    $errors = [];

    if (empty($data['nama']) || strlen(trim($data['nama'])) < 3) {
        $errors['nama'] = 'Nama unit mobil wajib diisi dan minimal 3 karakter.';
    }

    if (empty($data['kategori'])) {
        $errors['kategori'] = 'Kategori kendaraan wajib diisi.';
    }

    if (!isset($data['jumlah']) || !is_numeric($data['jumlah']) || (int)$data['jumlah'] <= 0) {
        $errors['jumlah'] = 'Jumlah unit harus berupa angka bulat lebih besar dari 0.';
    }

    if (empty($data['kondisi'])) {
        $errors['kondisi'] = 'Kondisi kendaraan wajib diisi.';
    }

    if (empty($data['lokasi'])) {
        $errors['lokasi'] = 'Lokasi pool wajib diisi.';
    }

    if (!empty($errors)) {
        http_response_code(422);
        echo json_encode([
            'status' => 'fail',
            'code' => 422,
            'message' => 'Data tidak memenuhi aturan bisnis yang ditentukan.',
            'errors' => $errors
        ]);
        exit();
    }

    http_response_code(201);
    echo json_encode([
        'status' => 'success',
        'code' => 201,
        'message' => 'Data unit mobil berhasil ditambahkan',
        'data' => [
            'id' => random_int(10, 999),
            'nama' => trim($data['nama']),
            'kategori' => trim($data['kategori']),
            'jumlah' => (int)$data['jumlah'],
            'kondisi' => trim($data['kondisi']),
            'lokasi' => trim($data['lokasi'])
        ]
    ]);
    exit();
}

http_response_code(405);
echo json_encode([
    'status' => 'error',
    'code' => 405,
    'message' => 'Method Not Allowed'
]);
