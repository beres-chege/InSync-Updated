<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');  // Default XAMPP has no password
define('DB_NAME', 'insync_db');

// Create database connection
function connectDB() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    
    return $conn;
}

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Site URL
define('SITE_URL', 'http://localhost/insync');

// Upload directories
define('UPLOAD_DIR', $_SERVER['DOCUMENT_ROOT'] . '/insync/uploads/');
define('PROFILE_IMG_DIR', UPLOAD_DIR . 'profile_images/');
define('BANNER_IMG_DIR', UPLOAD_DIR . 'banner_images/');
define('ALBUM_IMG_DIR', UPLOAD_DIR . 'album_covers/');
define('MUSIC_DIR', UPLOAD_DIR . 'music/');

// Create upload directories if they don't exist
$directories = [UPLOAD_DIR, PROFILE_IMG_DIR, BANNER_IMG_DIR, ALBUM_IMG_DIR, MUSIC_DIR];
foreach ($directories as $dir) {
    if (!file_exists($dir)) {
        mkdir($dir, 0755, true);
    }
}

// Function to sanitize input data
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Function to generate a random string (for filenames)
function generateRandomString($length = 10) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, strlen($characters) - 1)];
    }
    return $randomString;
}
?>

