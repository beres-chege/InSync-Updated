<?php
// Include database connection
require_once '../../includes/config.php';

// Get track ID from URL parameter
$track_id = isset($_GET['id']) ? intval($_GET['id']) : null;

if (!$track_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Track ID is required']);
    exit;
}

// Connect to database
$conn = connectDB();

// Get track information
$stmt = $conn->prepare("
    SELECT t.file_path, t.title, a.title as album_title, ap.artist_name
    FROM tracks t
    JOIN albums a ON t.album_id = a.album_id
    JOIN artist_profiles ap ON a.artist_id = ap.profile_id
    WHERE t.track_id = ?
");
$stmt->bind_param("i", $track_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Track not found']);
    $stmt->close();
    $conn->close();
    exit;
}

$track = $result->fetch_assoc();
$file_path = MUSIC_DIR . $track['file_path'];

// Check if file exists
if (!file_exists($file_path)) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Track file not found']);
    $stmt->close();
    $conn->close();
    exit;
}

// Increment play count
$update_stmt = $conn->prepare("UPDATE tracks SET plays = plays + 1 WHERE track_id = ?");
$update_stmt->bind_param("i", $track_id);
$update_stmt->execute();
$update_stmt->close();

// Close database connection
$stmt->close();
$conn->close();

// Set appropriate headers for streaming
$file_size = filesize($file_path);
$file_ext = pathinfo($file_path, PATHINFO_EXTENSION);

switch ($file_ext) {
    case 'mp3':
        header('Content-Type: audio/mpeg');
        break;
    case 'wav':
        header('Content-Type: audio/wav');
        break;
    case 'ogg':
        header('Content-Type: audio/ogg');
        break;
    case 'm4a':
        header('Content-Type: audio/mp4');
        break;
    default:
        header('Content-Type: application/octet-stream');
}

header('Content-Length: ' . $file_size);
header('Content-Disposition: inline; filename="' . $track['title'] . '.' . $file_ext . '"');
header('Accept-Ranges: bytes');

// Handle range requests (for seeking)
if (isset($_SERVER['HTTP_RANGE'])) {
    // Parse the range header
    list($unit, $range) = explode('=', $_SERVER['HTTP_RANGE'], 2);
    
    if ($unit == 'bytes') {
        // Multiple ranges could be specified at the same time, but we'll only support a single range
        list($start, $end) = explode('-', $range, 2);
        
        $start = empty($start) ? 0 : intval($start);
        $end = empty($end) ? ($file_size - 1) : intval($end);
        
        // Set partial content headers
        header('HTTP/1.1 206 Partial Content');
        header('Content-Length: ' . ($end - $start + 1));
        header('Content-Range: bytes ' . $start . '-' . $end . '/' . $file_size);
        
        // Seek to the requested position
        $fp = fopen($file_path, 'rb');
        fseek($fp, $start);
        $data = fread($fp, $end - $start + 1);
        fclose($fp);
        echo $data;
    } else {
        header('HTTP/1.1 416 Requested Range Not Satisfiable');
        header('Content-Range: bytes */' . $file_size);
        exit;
    }
} else {
    // Output the entire file
    readfile($file_path);
}
?>

