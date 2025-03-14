<?php
// Include database connection
require_once '../../includes/config.php';

// Set headers for API response
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

// Connect to database
$conn = connectDB();

// Get user data
$stmt = $conn->prepare("
    SELECT user_id, username, email, user_type
    FROM users
    WHERE user_id = ?
");
$stmt->bind_param("i", $_SESSION['user_id']);
$stmt->execute();
$result = $stmt->get_result();

// Check if user exists
if ($result->num_rows === 0) {
    // User not found, destroy session
    session_unset();
    session_destroy();
    
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'User not found']);
    $stmt->close();
    $conn->close();
    exit;
}

// Get user data
$user = $result->fetch_assoc();

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

// Return success response
http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'User is authenticated',
    'user' => $user,
    'profile' => $profile
]);

// Close connection
$stmt->close();
$conn->close();
?>

