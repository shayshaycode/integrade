<?php
header('Content-Type: application/json');
require_once 'db.php';

$conn = get_db_connection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || !isset($data['room']) || !isset($data['answers']) || !is_array($data['answers'])) {
        echo json_encode(['success' => false, 'error' => 'Invalid data']);
        exit;
    }
    $room = $data['room'];
    $answers = $data['answers'];
    $stmt = $conn->prepare('INSERT INTO poll_results (room, question_idx, option_idx, created_at) VALUES (?, ?, ?, NOW())');
    try {
        foreach ($answers as $idx => $choice) {
            $stmt->execute([$room, $idx, $choice]);
        }
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'DB insert failed']);
    }
    exit;
}

if ($method === 'GET') {
    $room = $_GET['room'] ?? '';
    if ($room === '') {
        echo json_encode(['success' => false, 'error' => 'Missing room']);
        exit;
    }
    $stmt = $conn->prepare('SELECT question_idx, option_idx, COUNT(*) as cnt FROM poll_results WHERE room = ? GROUP BY question_idx, option_idx');
    $stmt->execute([$room]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $results = [];
    foreach ($rows as $row) {
        $q = (int)$row['question_idx'];
        $o = (int)$row['option_idx'];
        if (!isset($results[$q])) $results[$q] = [];
        $results[$q][$o] = (int)$row['cnt'];
    }
    echo json_encode(['success' => true, 'results' => $results]);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
