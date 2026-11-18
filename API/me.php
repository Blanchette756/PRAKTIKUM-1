<?php
declare(strict_types=1);
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');

require_once dirname(__DIR__) . '/config/database.php';
require_once __DIR__ . '/middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Allow: GET');
    tolakAkses(405, 'Method tidak diizinkan. Gunakan GET.');
}

$login = requireLogin();

try {
    $stmt = db()->prepare('SELECT id, nama, email, role, created_at FROM users WHERE id = :id');
    $stmt->execute(['id' => $login['user_id']]);
    $user = $stmt->fetch();

    if (!$user) {
        tolakAkses(401, 'Akun tidak ditemukan. Silakan login kembali.');
    }

    $user['id'] = (int)$user['id'];
    $user['csrf_token'] = buatCsrfToken();

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'data' => $user
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    error_log('[API me] ' . $e->getMessage() . ' di ' . $e->getFile() . ':' . $e->getLine());
    tolakAkses(500, 'Terjadi kesalahan pada server.');
}
