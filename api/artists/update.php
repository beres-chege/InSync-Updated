<?php
// Include database connection
require_once '../../includes/config.php';

// Set headers for API response
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Check if user is logged in
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'artist') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

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

// Connect to database
$conn = connectDB();

// Get artist profile ID
$stmt = $conn->prepare("SELECT profile_id FROM artist_profiles WHERE user_id = ?");
$stmt->bind_param("i", $_SESSION['user_id']);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Artist profile not found']);
    $stmt->close();
    $conn->close();
    exit;
}

$profile = $result->fetch_assoc();
$profile_id = $profile['profile_id'];

// Prepare update data
$updateFields = [];
$params = [];
$types = "";

// Artist name
if (isset($data['artist_name']) && !empty($data['artist_name'])) {
    $updateFields[] = "artist_name = ?";
    $params[] = sanitizeInput($data['artist_name']);
    $types .= "s";
}

// Bio
if (isset($data['bio'])) {
    $updateFields[] = "bio = ?";
    $params[] = sanitizeInput($data['bio']);
    $types .= "s";
}

// Location
if (isset($data['location'])) {
    $updateFields[] = "location = ?";
    $params[] = sanitizeInput($data['location']);
    $types .= "s";
}

// Website
if (isset($data['website'])) {
    $updateFields[] = "website = ?";
    $params[] = sanitizeInput($data['website']);
    $types .= "s";
}

// Handle profile image upload
if (isset($_FILES['profile_image']) && $_FILES['profile_image']['error'] === UPLOAD_ERR_OK) {
    $file_tmp = $_FILES['profile_image']['tmp_name'];
    $file_name = $_FILES['profile_image']['name'];
    $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
    
    // Check if file is an image
    $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif'];
    if (!in_array($file_ext, $allowed_extensions)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid file type for profile image']);
        $stmt->close();
        $conn->close();
        exit;
    }
    
    // Generate unique filename
    $new_file_name = 'profile_' . $_SESSION['user_id'] . '_' . generateRandomString() . '.' . $file_ext;
    $upload_path = PROFILE_IMG_DIR . $new_file_name;
    
    // Move uploaded file
    if (move_uploaded_file($file_tmp, $upload_path)) {
        $updateFields[] = "profile_image = ?";
        $params[] = $new_file_name;
        $types .= "s";
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to upload profile image']);
        $stmt->close();
        $conn->close();
        exit;
    }
}

// Handle banner image upload
if (isset($_FILES['banner_image']) && $_FILES['banner_image']['error'] === UPLOAD_ERR_OK) {
    $file_tmp = $_FILES['banner_image']['tmp_name'];
    $file_name = $_FILES['banner_image']['name'];
    $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
    
    // Check if file is an image
    $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif'];
    if (!in_array($file_ext, $allowed_extensions)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid file type for banner image']);
        $stmt->close();
        $conn->close();
        exit;
    }
    
    // Generate unique filename
    $new_file_name = 'banner_' . $_SESSION['user_id'] . '_' . generateRandomString() . '.' . $file_ext;
    $upload_path = BANNER_IMG_DIR . $new_file_name;
    
    // Move uploaded file
    if (move_uploaded_file($file_tmp, $upload_path)) {
        $updateFields[] = "banner_image = ?";
        $params[] = $new_file_name;
        $types .= "s";
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to upload banner image']);
        $stmt->close();
        $conn->close();
        exit;
    }
}

// Check if there are fields to update
if (empty($updateFields)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No fields to update']);
    $stmt->close();
    $conn->close();
    exit;
}

// Build update query
$sql = "UPDATE artist_profiles SET " . implode(", ", $updateFields) . " WHERE profile_id = ?";
$params[] = $profile_id;
$types .= "i";

// Prepare and execute update statement
$update_stmt = $conn->prepare($sql);
$update_stmt->bind_param($types, ...$params);
$result = $update_stmt->execute();

if ($result) {
    // Get updated profile data
    $get_stmt = $conn->prepare("
        SELECT profile_id, artist_name, bio, location, profile_image, banner_image, website, followers
        FROM artist_profiles
        WHERE profile_id = ?
    ");
    $get_stmt->bind_param("i", $profile_id);
    $get_stmt->execute();
    $updated_profile = $get_stmt->get_result()->fetch_assoc();
    
    // Return success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Profile updated successfully',
        'profile' => $updated_profile
    ]);
    
    $get_stmt->close();
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to update profile']);
}

// Close connections
$update_stmt->close();
$stmt->close();
$conn->close();
?>

