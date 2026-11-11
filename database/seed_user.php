<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('Script seed hanya boleh dijalankan lewat terminal.');
}

require_once dirname(__DIR__) . '/config/database.php';

$pdo = db();

$nama = 'Admin Pemweb';
$email = 'admin@pemweb.test';
$role = 'admin';
$password = (string)($_ENV['SEED_PASSWORD'] ?? '');

if (mb_strlen($password) < 8) {
    fwrite(STDERR, "SEED_PASSWORD di .env wajib diisi, minimal 8 karakter.\n");
    exit(1);
}

$stmt = $pdo->prepare('SELECT id FROM users WHERE email = :email');
$stmt->execute(['email' => $email]);
if ($stmt->fetch()) {
    echo "User {$email} sudah ada, seed dilewati.\n";
    exit(0);
}

$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare(
    'INSERT INTO users (nama, email, password_hash, role)
     VALUES (:nama, :email, :password_hash, :role)'
);
$stmt->execute([
    'nama' => $nama,
    'email' => $email,
    'password_hash' => $hash,
    'role' => $role,
]);

echo "User berhasil dibuat.\n";
echo "id            : " . $pdo->lastInsertId() . "\n";
echo "nama          : {$nama}\n";
echo "email         : {$email}\n";
echo "role          : {$role}\n";
echo "password_hash : {$hash}\n";
echo "password_verify: " . (password_verify($password, $hash) ? 'cocok' : 'tidak cocok') . "\n";
