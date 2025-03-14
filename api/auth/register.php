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
$required_fields = ['username', 'email', 'password', 'user_type'];
foreach ($required_fields as $field) {
    if (!isset($data[$field]) || empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
        exit;
    }
}

// Sanitize input
$username = sanitizeInput($data['username']);
$email = sanitizeInput($data['email']);
$password = $data['password']; // Will be hashed, no need to sanitize
$user_type = sanitizeInput($data['user_type']);

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit;
}

// Validate user type
if (!in_array($user_type, ['fan', 'artist'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid user type']);
    exit;
}

// Validate password strength
if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters long']);
    exit;
}

// Handle profile picture upload
$profile_image = null;
if (isset($_FILES['profile_picture']) && $_FILES['profile_picture']['error'] === UPLOAD_ERR_OK) {
    $file_tmp = $_FILES['profile_picture']['tmp_name'];
    $file_name = $_FILES['profile_picture']['name'];
    $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
    
    // Check if file is an image
    $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif'];
    if (!in_array($file_ext, $allowed_extensions)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid file type for profile picture']);
        exit;
    }
    
    // Generate unique filename
    $new_file_name = 'profile_' . generateRandomString() . '.' . $file_ext;
    $upload_path = PROFILE_IMG_DIR . $new_file_name;
    
    // Move uploaded file
    if (move_uploaded_file($file_tmp, $upload_path)) {
        $profile_image = $new_file_name;
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to upload profile picture']);
        exit;
    }
}

// Connect to database
$conn = connectDB();

// Check if username already exists
$stmt = $conn->prepare("SELECT user_id FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'Username already exists']);
    $stmt->close();
    $conn->close();
    exit;
}

// Check if email already exists
$stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'Email already exists']);
    $stmt->close();
    $conn->close();
    exit;
}

// Hash password
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// Begin transaction
$conn->begin_transaction();

try {
    // Insert user
    $stmt = $conn->prepare("INSERT INTO users (username, email, password, user_type) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $username, $email, $hashed_password, $user_type);
    $stmt->execute();
    $user_id = $stmt->insert_id;
    
    // Create profile based on user type
    if ($user_type === 'artist') {
        // Get artist-specific data
        $artist_name = isset($data['artist_name']) ? sanitizeInput($data['artist_name']) : $username;
        $location = isset($data['location']) ? sanitizeInput($data['location']) : '';
        $bio = isset($data['bio']) ? sanitizeInput($data['bio']) : '';
        
        // Insert artist profile
        if ($profile_image) {
            $stmt = $conn->prepare("INSERT INTO artist_profiles (user_id, artist_name, location, bio, profile_image) VALUES (?, ?, ?, ?, ?)");
            $stmt->bind_param("issss", $user_id, $artist_name, $location, $bio, $profile_image);
        } else {
            $stmt = $conn->prepare("INSERT INTO artist_profiles (user_id, artist_name, location, bio) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("isss", $user_id, $artist_name, $location, $bio);
        }
        $stmt->execute();
    } else {
        // Insert fan profile
        $display_name = isset($data['display_name']) ? sanitizeInput($data['display_name']) : $username;
        
        if ($profile_image) {
            $stmt = $conn->prepare("INSERT INTO fan_profiles (user_id, display_name, profile_image) VALUES (?, ?, ?)");
            $stmt->bind_param("iss", $user_id, $display_name, $profile_image);
        } else {
            $stmt = $conn->prepare("INSERT INTO fan_profiles (user_id, display_name) VALUES (?, ?)");
            $stmt->bind_param("is", $user_id, $display_name);
        }
        $stmt->execute();
    }
    
    // Commit transaction
    $conn->commit();
    
    // Return success response
    http_response_code(201);
    echo json_encode([
        'success' => true, 
        'message' => 'User registered successfully',
        'user_id' => $user_id,
        'user_type' => $user_type
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Registration failed: ' . $e->getMessage()]);
}

// Close connection
$stmt->close();
$conn->close();
?>

