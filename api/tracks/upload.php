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
$album_id = isset($_POST['album_id']) ? intval($_POST['album_id']) : null;
$title = isset($_POST['title']) ? sanitizeInput($_POST['title']) : null;
$track_number = isset($_POST['track_number']) ? intval($_POST['track_number']) : 1;
$price = isset($_POST['price']) ? floatval($_POST['price']) : 0.00;

// Validate required fields
if (!$album_id || !$title) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Album ID and track title are required']);
    exit;
}

// Connect to database
$conn = connectDB();

// Verify album belongs to the artist
$stmt = $conn->prepare("
    SELECT a.album_id
    FROM albums a
    JOIN artist_profiles ap ON a.artist_id = ap.profile_id
    WHERE a.album_id = ? AND ap.user_id = ?
");
$stmt->bind_param("ii", $album_id, $_SESSION['user_id']);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'You do not have permission to add tracks to this album']);
    $stmt->close();
    $conn->close();
    exit;
}

// Handle music file upload
if (!isset($_FILES['track_file']) || $_FILES['track_file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Track file is required']);
    $stmt->close();
    $conn->close();
    exit;
}

$file_tmp = $_FILES['track_file']['tmp_name'];
$file_name = $_FILES['track_file']['name'];
$file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));

// Check if file is a valid audio format
$allowed_extensions = ['mp3', 'wav', 'ogg', 'm4a'];
if (!in_array($file_ext, $allowed_extensions)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid file type for track']);
    $stmt->close();
    $conn->close();
    exit;
}

// Generate unique filename
$new_file_name = 'track_' . $album_id . '_' . generateRandomString() . '.' . $file_ext;
$upload_path = MUSIC_DIR . $new_file_name;

// Move uploaded file
if (!move_uploaded_file($file_tmp, $upload_path)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to upload track file']);
    $stmt->close();
    $conn->close();
    exit;
}

// Get track duration (in a real app, you would use a library like getID3)
// For this example, we'll set a placeholder duration
$duration = 180; // 3 minutes in seconds

// Insert track
$insert_stmt = $conn->prepare("
    INSERT INTO tracks (album_id, title, file_path, duration, track_number, price)
    VALUES (?, ?, ?, ?, ?, ?)
");
$insert_stmt->bind_param("issidi", $album_id, $title, $new_file_name, $duration, $track_number, $price);
$result = $insert_stmt->execute();

if ($result) {
    $track_id = $insert_stmt->insert_id;
    
    // Return success response
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Track uploaded successfully',
        'track_id' => $track_id
    ]);
} else {
    // Delete uploaded file if database insert fails
    unlink($upload_path);
    
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to save track information']);
}

// Close connections
$insert_stmt->close();
$stmt->close();
$conn->close();
?>

