<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/config/session.php';

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

function tolakAkses(int $statusCode, string $message): never {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'error' => [
            'code' => $statusCode,
            'message' => $message
        ]
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

function requireLogin(): array {
    mulaiSession();

    if (empty($_SESSION['user_id'])) {
        tolakAkses(401, 'Silakan login terlebih dahulu.');
    }

    return [
        'user_id' => (int)$_SESSION['user_id'],
        'role' => (string)($_SESSION['role'] ?? '')
    ];
}

function requireRole(array $roles): array {
    $user = requireLogin();

    if (!in_array($user['role'], $roles, true)) {
        tolakAkses(403, 'Akses ditolak. Role Anda tidak memiliki izin untuk aksi ini.');
    }

    return $user;
}

function buatCsrfToken(): string {
    mulaiSession();

    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }

    return $_SESSION['csrf'];
}

function requireCsrf(): void {
    mulaiSession();

    $tokenSession = (string)($_SESSION['csrf'] ?? '');
    $tokenRequest = (string)($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');

    if ($tokenSession === '' || !hash_equals($tokenSession, $tokenRequest)) {
        tolakAkses(403, 'Permintaan tidak valid. CSRF token tidak cocok.');
    }
}
