<?php
header('Content-Type: application/json');
require_once 'db.php';

$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

if (!$username || !$password) {
    echo json_encode(['success' => false, 'error' => 'Missing credentials']);
    exit;
}

$conn = get_db_connection();
$stmt = $conn->prepare('SELECT id FROM users WHERE username = ?');
$stmt->execute([$username]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'error' => 'Username already exists']);
    exit;
}

$hash = password_hash($password, PASSWORD_DEFAULT);
$insert = $conn->prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
try {
    $insert->execute([$username, $hash]);
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Registration failed']);
}
