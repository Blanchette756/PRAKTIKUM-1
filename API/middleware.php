<?php
declare(strict_types=1);

function jsonMiddleware(): void {
    header('Content-Type: application/json; charset=utf-8');

    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if (in_array($method, ['POST', 'PUT', 'PATCH'], true)) {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '';

        if (!str_contains(strtolower($contentType), 'application/json')) {
            http_response_code(415);
            echo json_encode([
                'status' => 'error',
                'code' => 415,
                'message' => 'Header Content-Type wajib berupa application/json'
            ], JSON_UNESCAPED_UNICODE);
            exit();
        }
    }
}
