<?php
/**
 * Authentication API Endpoint
 * Handles login, logout, and authentication status with JWT support
 */

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';

try {
    switch ($action) {
        case 'check_auth':
            checkAuthentication();
            break;
            
        case 'login':
            handleLogin();
            break;
            
        case 'logout':
            handleLogout();
            break;
            
        default:
            throw new Exception('Invalid action. Available actions: check_auth, login, logout', 400);
    }
} catch (Exception $e) {
    http_response_code($e->getCode() ?: 500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

function checkAuthentication() {
    $isAuthenticated = isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === true;
    
    $response = [
        'success' => true,
        'authenticated' => $isAuthenticated
    ];
    
    // Include user info if authenticated
    if ($isAuthenticated) {
        $response['user'] = $_SESSION['user'] ?? 'Admin';
        $response['sessionId'] = session_id();
        $response['token'] = $_SESSION['token'] ?? null;
    }
    
    echo json_encode($response);
}

function handleLogin() {
    $input = json_decode(file_get_contents('php://input'), true);
    $username = $input['username'] ?? $_POST['username'] ?? '';
    $password = $input['password'] ?? $_POST['password'] ?? '';
    
    // TODO: Replace with proper authentication system
    if ($username === 'admin' && $password === 'admin') {
        $_SESSION['authenticated'] = true;
        $_SESSION['user'] = $username;
        $_SESSION['login_time'] = time();
        
        // Generate JWT token
        $token = generateJWTToken($username, session_id());
        $_SESSION['token'] = $token;
        
        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'user' => $username,
            'sessionId' => session_id(),
            'token' => $token
        ]);
    } else {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid credentials'
        ]);
    }
}

function handleLogout() {
    // Clear session data
    $_SESSION = array();
    
    // Destroy the session cookie
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    
    // Destroy the session
    session_destroy();
    
    echo json_encode([
        'success' => true,
        'message' => 'Logout successful'
    ]);
}

function generateJWTToken($username, $sessionId) {
    // JWT Secret (should be in environment variable in production)
    $secret = 'portfolio_jwt_secret_2024';
    
    // JWT Header
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    
    // JWT Payload
    $payload = json_encode([
        'iss' => 'portfolio_site',
        'sub' => $username,
        'sess' => $sessionId,
        'iat' => time(),
        'exp' => time() + (60 * 60 * 8) // 8 hours
    ]);
    
    // Encode
    $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    // Create signature
    $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, $secret, true);
    $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    // Return JWT
    return $base64Header . "." . $base64Payload . "." . $base64Signature;
}

function validateJWTToken($token) {
    $secret = 'portfolio_jwt_secret_2024';
    
    // Split the token
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return false;
    }
    
    $header = $parts[0];
    $payload = $parts[1];
    $signature = $parts[2];
    
    // Verify signature
    $expectedSignature = hash_hmac('sha256', $header . "." . $payload, $secret, true);
    $expectedBase64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($expectedSignature));
    
    if ($signature !== $expectedBase64Signature) {
        return false;
    }
    
    // Decode payload
    $decodedPayload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $payload)), true);
    
    // Check expiration
    if (isset($decodedPayload['exp']) && $decodedPayload['exp'] < time()) {
        return false;
    }
    
    return $decodedPayload;
}
?> 