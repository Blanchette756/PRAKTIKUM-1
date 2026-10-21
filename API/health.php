<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method tidak diizinkan. Hanya menerima GET.'
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

http_response_code(200);

echo json_encode([
    'status' => 'ok'
], JSON_UNESCAPED_UNICODE);
