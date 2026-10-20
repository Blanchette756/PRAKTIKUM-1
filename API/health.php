<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); 
    echo json_encode([
        'status' => 'error',
        'message' => 'Method tidak diizinkan. Hanya menerima GET.'
    ]);
    exit();
}

http_response_code(200);

echo json_encode([
    'status' => 'healthy',
    'message' => 'API siap dan berjalan dengan baik',
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => phpversion()
]);
