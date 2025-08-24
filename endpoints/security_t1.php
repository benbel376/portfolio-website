<?php
// Minimal auth endpoint for demo/testing purposes only
// DO NOT use in production without proper security

header('Content-Type: application/json');
session_start();

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'status':
            echo json_encode(['authenticated' => !empty($_SESSION['auth'])]);
            break;

        case 'login':
            $input = file_get_contents('php://input');
            $data = json_decode($input, true) ?: [];
            $username = trim($data['username'] ?? '');
            $password = trim($data['password'] ?? '');

            // Very basic demo check (replace with real validation)
            if ($username === 'admin' && $password === 'admin') {
                $_SESSION['auth'] = true;
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
            }
            break;

        case 'logout':
            $_SESSION['auth'] = false;
            echo json_encode(['success' => true]);
            break;

        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid action']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error']);
}

?>


