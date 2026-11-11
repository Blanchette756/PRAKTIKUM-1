<?php
declare(strict_types=1);
ini_set('display_errors', '0');

require_once __DIR__ . '/middleware.php';
require_once dirname(__DIR__) . '/config/database.php';

jsonMiddleware();

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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    kirimError(405, 'Method tidak diizinkan. Gunakan POST.');
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        kirimError(400, 'Body request harus berupa JSON object yang valid.');
    }

    $email = strtolower(trim((string)($input['email'] ?? '')));
    $password = (string)($input['password'] ?? '');

    $errors = [];
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'Email wajib diisi dengan format yang valid.';
    }
    if ($password === '') {
        $errors['password'] = 'Password wajib diisi.';
    }
    if ($errors) {
        kirimError(422, 'Data login tidak valid.', $errors);
    }

    $stmt = db()->prepare('SELECT id, nama, email, password_hash, role FROM users WHERE email = :email');
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        kirimError(401, 'Email atau password salah.');
    }

    kirimJson(200, [
        'status' => 'success',
        'message' => 'Login berhasil.',
        'data' => [
            'id' => (int)$user['id'],
            'nama' => $user['nama'],
            'email' => $user['email'],
            'role' => $user['role']
        ]
    ]);
} catch (Throwable $e) {
    error_log('[API login] ' . $e->getMessage() . ' di ' . $e->getFile() . ':' . $e->getLine());
    kirimError(500, 'Terjadi kesalahan pada server.');
}
