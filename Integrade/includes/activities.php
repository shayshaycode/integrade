<?php
header('Content-Type: application/json');
require_once 'db.php';
session_start();

$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit;
}

$conn = get_db_connection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    if ($name === '') {
        echo json_encode(['success' => false, 'error' => 'Missing name']);
        exit;
    }
    $stmt = $conn->prepare('INSERT INTO activities (user_id, name, created_at) VALUES (?, ?, NOW())');
    try {
        $stmt->execute([$user_id, $name]);
        $id = $conn->lastInsertId();
        echo json_encode(['success' => true, 'id' => $id]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'DB insert failed']);
    }
    exit;
}

$stmt = $conn->prepare('SELECT id, name, created_at FROM activities WHERE user_id = ? ORDER BY created_at DESC');
$stmt->execute([$user_id]);
$activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode(['success' => true, 'activities' => $activities]);
