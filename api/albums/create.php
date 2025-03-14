<?php
// Include database connection
require_once '../../includes/config.php';

// Set headers for API response
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Check if user is logged in and is an artist
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
$title = isset($_POST['title']) ? sanitizeInput($_POST['title']) : null;
$description = isset($_POST['description']) ? sanitizeInput($_POST['description']) : null;
$release_date = isset($_POST['release_date']) ? sanitizeInput($_POST['release_date']) : date('Y-m-d');
$genre = isset($_POST['genre']) ? sanitizeInput($_POST['genre']) : null;
$price = isset($_POST['price']) ? floatval($_POST['price']) : 0.00;

// Validate required fields
if (!$title) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Album title is required']);
    exit;
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
$artist_id = $profile['profile_id'];

// Handle album cover upload
$cover_image = 'default_album.jpg';
if (isset($_FILES['cover_image']) && $_FILES['cover_image']['error'] === UPLOAD_ERR_OK) {
    $file_tmp = $_FILES['cover_image']['tmp_name'];
    $file_name = $_FILES['cover_image']['name'];
    $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
    
    // Check if file is an image
    $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif'];
    if (!in_array($file_ext, $allowed_extensions)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid file type for album cover']);
        $stmt->close();
        $conn->close();
        exit;
    }
    
    // Generate unique filename
    $new_file_name = 'album_' . $artist_id . '_' . generateRandomString() . '.' . $file_ext;
    $upload_path = ALBUM_IMG_DIR . $new_file_name;
    
    // Move uploaded file
    if (move_uploaded_file($file_tmp, $upload_path)) {
        $cover_image = $new_file_name;
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to upload album cover']);
        $stmt->close();
        $conn->close();
        exit;
    }
}

// Insert album
$insert_stmt = $conn->prepare("
    INSERT INTO albums (artist_id, title, description, cover_image, release_date, genre, price)
    VALUES (?, ?, ?, ?, ?, ?, ?)
");
$insert_stmt->bind_param("isssssd", $artist_id, $title, $description, $cover_image, $release_date, $genre, $price);
$result = $insert_stmt->execute();

if ($result) {
    $album_id = $insert_stmt->insert_id;
    
    // Return success response
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Album created successfully',
        'album_id' => $album_id
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to create album']);
}

// Close connections
$insert_stmt->close();
$stmt->close();
$conn->close();
?>

