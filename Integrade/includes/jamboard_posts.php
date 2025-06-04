<?php
header('Content-Type: application/json');
require_once 'db.php';

$conn = get_db_connection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $room = $_GET['room'] ?? '';
    $stmt = $conn->prepare('SELECT id, room, username, avatar, title, content, attachment, filename, created_at FROM jamboard_posts WHERE room = ? ORDER BY created_at DESC');
    $stmt->execute([$room]);
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'posts' => $posts]);
    exit;
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) { echo json_encode(['success' => false, 'error' => 'Invalid data']); exit; }
    $stmt = $conn->prepare('INSERT INTO jamboard_posts (room, username, avatar, title, content, attachment, filename, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())');
    try {
        $stmt->execute([
            $data['room'] ?? '',
            $data['username'] ?? 'Anonymous',
            $data['avatar'] ?? '',
            $data['title'] ?? '',
            $data['content'] ?? '',
            $data['attachment'] ?? '',
            $data['filename'] ?? ''
        ]);
        $id = $conn->lastInsertId();
        echo json_encode(['success' => true, 'id' => $id]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'DB insert failed']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
