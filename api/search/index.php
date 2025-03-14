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

// Get search query
$query = isset($_GET['q']) ? sanitizeInput($_GET['q']) : '';
$type = isset($_GET['type']) ? sanitizeInput($_GET['type']) : 'all';
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;

// Validate search query
if (empty($query)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Search query is required']);
    exit;
}

// Connect to database
$conn = connectDB();

// Prepare search results
$results = [
    'artists' => [],
    'albums' => [],
    'tracks' => [],
    'playlists' => []
];

// Search for artists
if ($type === 'all' || $type === 'artists') {
    $stmt = $conn->prepare("
        SELECT ap.profile_id, ap.artist_name, ap.bio, ap.location, ap.profile_image, ap.followers, u.username
        FROM artist_profiles ap
        JOIN users u ON ap.user_id = u.user_id
        WHERE ap.artist_name LIKE ? OR u.username LIKE ?
        LIMIT ?
    ");
    $search_param = "%$query%";
    $stmt->bind_param("ssi", $search_param, $search_param, $limit);
    $stmt->execute();
    $artist_results = $stmt->get_result();
    
    while ($artist = $artist_results->fetch_assoc()) {
        $results['artists'][] = $artist;
    }
    
    $stmt->close();
}

// Search for albums
if ($type === 'all' || $type === 'albums') {
    $stmt = $conn->prepare("
        SELECT a.album_id, a.title, a.description, a.cover_image, a.release_date, a.genre, 
               ap.profile_id as artist_id, ap.artist_name
        FROM albums a
        JOIN artist_profiles ap ON a.artist_id = ap.profile_id
        WHERE a.title LIKE ? OR a.description LIKE ? OR ap.artist_name LIKE ?
        LIMIT ?
    ");
    $search_param = "%$query%";
    $stmt->bind_param("sssi", $search_param, $search_param, $search_param, $limit);
    $stmt->execute();
    $album_results = $stmt->get_result();
    
    while ($album = $album_results->fetch_assoc()) {
        $results['albums'][] = $album;
    }
    
    $stmt->close();
}

// Search for tracks
if ($type === 'all' || $type === 'tracks') {
    $stmt = $conn->prepare("
        SELECT t.track_id, t.title, t.duration, t.plays, t.price,
               a.album_id, a.title as album_title, a.cover_image,
               ap.profile_id as artist_id, ap.artist_name
        FROM tracks t
        JOIN albums a ON t.album_id = a.album_id
        JOIN artist_profiles ap ON a.artist_id = ap.profile_id
        WHERE t.title LIKE ? OR a.title LIKE ? OR ap.artist_name LIKE ?
        LIMIT ?
    ");
    $search_param = "%$query%";
    $stmt->bind_param("sssi", $search_param, $search_param, $search_param, $limit);
    $stmt->execute();
    $track_results = $stmt->get_result();
    
    while ($track = $track_results->fetch_assoc()) {
        $results['tracks'][] = $track;
    }
    
    $stmt->close();
}

// Search for playlists
if ($type === 'all' || $type === 'playlists') {
    $stmt = $conn->prepare("
        SELECT p.playlist_id, p.title, p.description, p.cover_image, p.is_public,
               u.username, u.user_id
        FROM playlists p
        JOIN users u ON p.user_id = u.user_id
        WHERE p.title LIKE ? AND p.is_public = 1
        LIMIT ?
    ");
    $search_param = "%$query%";
    $stmt->bind_param("si", $search_param, $limit);
    $stmt->execute();
    $playlist_results = $stmt->get_result();
    
    while ($playlist = $playlist_results->fetch_assoc()) {
        $results['playlists'][] = $playlist;
    }
    
    $stmt->close();
}

// Return search results
http_response_code(200);
echo json_encode([
    'success' => true,
    'query' => $query,
    'results' => $results
]);

// Close connection
$conn->close();
?>

