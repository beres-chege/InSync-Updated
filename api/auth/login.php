<?php
// Include database connection
require_once '../../includes/config.php';

// Set headers for API response
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);

// If data is null, try to get from $_POST
if ($data === null) {
    $data = $_POST;
}

// Validate required fields
if (!isset($data['username_or_email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Username/email and password are required']);
    exit;
}

// Sanitize input
$username_or_email = sanitizeInput($data['username_or_email']);
$password = $data['password']; // Will be verified, no need to sanitize
$remember_me = isset($data['remember_me']) ? (bool)$data['remember_me'] : false;

// Connect to database
$conn = connectDB();

// Prepare SQL statement to check if input is email or username
$stmt = $conn->prepare("
    SELECT u.user_id, u.username, u.email, u.password, u.user_type 
    FROM users u
    WHERE u.email = ? OR u.username = ?
");
$stmt->bind_param("ss", $username_or_email, $username_or_email);
$stmt->execute();
$result = $stmt->get_result();

// Check if user exists
if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
    $stmt->close();
    $conn->close();
    exit;
}

// Get user data
$user = $result->fetch_assoc();

// Verify password
if (!password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
    $stmt->close();
    $conn->close();
    exit;
}

// Update last login time
$update_stmt = $conn->prepare("UPDATE users SET last_login = NOW() WHERE user_id = ?");
$update_stmt->bind_param("i", $user['user_id']);
$update_stmt->execute();
$update_stmt->close();

// Get profile data based on user type
$profile = null;
if ($user['user_type'] === 'artist') {
    $profile_stmt = $conn->prepare("
        SELECT profile_id, artist_name, bio, location, profile_image, banner_image, followers
        FROM artist_profiles
        WHERE user_id = ?
    ");
    $profile_stmt->bind_param("i", $user['user_id']);
    $profile_stmt->execute();
    $profile = $profile_stmt->get_result()->fetch_assoc();
    $profile_stmt->close();
} else {
    $profile_stmt = $conn->prepare("
        SELECT profile_id, display_name, profile_image
        FROM fan_profiles
        WHERE user_id = ?
    ");
    $profile_stmt->bind_param("i", $user['user_id']);
    $profile_stmt->execute();
    $profile = $profile_stmt->get_result()->fetch_assoc();
    $profile_stmt->close();
}

// Create session
$_SESSION['user_id'] = $user['user_id'];
$_SESSION['username'] = $user['username'];
$_SESSION['email'] = $user['email'];
$_SESSION['user_type'] = $user['user_type'];
$_SESSION['profile_id'] = $profile ? $profile['profile_id'] : null;

// Remove password from user data
unset($user['password']);

// Return success response
http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Login successful',
    'user' => $user,
    'profile' => $profile
]);

// Close connection
$stmt->close();
$conn->close();
?>

