<?php
// Include database connection
require_once '../../includes/config.php';

// Set headers for API response
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Check if it's a GET request
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get artist ID from URL parameter
$artist_id = isset($_GET['id']) ? intval($_GET['id']) : null;
$username = isset($_GET['username']) ? sanitizeInput($_GET['username']) : null;

if (!$artist_id && !$username) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Artist ID or username is required']);
    exit;
}

// Connect to database
$conn = connectDB();

// Prepare SQL statement based on provided parameter
if ($artist_id) {
    $stmt = $conn->prepare("
        SELECT ap.profile_id, ap.artist_name, ap.bio, ap.location, ap.profile_image, 
               ap.banner_image, ap.website, ap.followers, u.username
        FROM artist_profiles ap
        JOIN users u ON ap.user_id = u.user_id
        WHERE ap.profile_id = ?
    ");
    $stmt->bind_param("i", $artist_id);
} else {
    $stmt = $conn->prepare("
        SELECT ap.profile_id, ap.artist_name, ap.bio, ap.location, ap.profile_image, 
               ap.banner_image, ap.website, ap.followers, u.username
        FROM artist_profiles ap
        JOIN users u ON ap.user_id = u.user_id
        WHERE u.username = ?
    ");
    $stmt->bind_param("s", $username);
}

$stmt->execute();
$result = $stmt->get_result();

// Check if artist exists
if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Artist not found']);
    $stmt->close();
    $conn->close();
    exit;
}

// Get artist data
$artist = $result->fetch_assoc();

// Get artist's albums
$albums_stmt = $conn->prepare("
    SELECT album_id, title, description, cover_image, release_date, genre, price
    FROM albums
    WHERE artist_id = ?
    ORDER BY release_date DESC
");
$albums_stmt->bind_param("i", $artist['profile_id']);
$albums_stmt->execute();
$albums_result = $albums_stmt->get_result();

// Fetch all albums
$albums = [];
while ($album = $albums_result->fetch_assoc()) {
    // Get tracks for this album
    $tracks_stmt = $conn->prepare("
        SELECT track_id, title, duration, track_number, price, plays
        FROM tracks
        WHERE album_id = ?
        ORDER BY track_number
    ");
    $tracks_stmt->bind_param("i", $album['album_id']);
    $tracks_stmt->execute();
    $tracks_result = $tracks_stmt->get_result();
    
    // Fetch all tracks
    $tracks = [];
    while ($track = $tracks_result->fetch_assoc()) {
        $tracks[] = $track;
    }
    
    // Add tracks to album
    $album['tracks'] = $tracks;
    $albums[] = $album;
    
    $tracks_stmt->close();
}

// Add albums to artist data
$artist['albums'] = $albums;

// Return success response
http_response_code(200);
echo json_encode([
    'success' => true,
    'artist' => $artist
]);

// Close connections
$albums_stmt->close();
$stmt->close();
$conn->close();
?>

