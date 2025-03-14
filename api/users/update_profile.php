<?php
// Include database connection
require_once '../../includes/config.php';

// Set headers for API response
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
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

// Get user ID from session
$user_id = $_SESSION['user_id'];

// Get POST data
$email = isset($_POST['email']) ? sanitizeInput($_POST['email']) : null;

// Connect to database
$conn = connectDB();

// Begin transaction
$conn->begin_transaction();

try {
    // Update email if provided
    if ($email) {
        // Check if email is already in use by another user
        $stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ? AND user_id != ?");
        $stmt->bind_param("si", $email, $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            throw new Exception('Email is already in use by another user');
        }
        
        // Update email
        $stmt = $conn->prepare("UPDATE users SET email = ? WHERE user_id = ?");
        $stmt->bind_param("si", $email, $user_id);
        $stmt->execute();
    }
    
    // Get user type
    $stmt = $conn->prepare("SELECT user_type FROM users WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    
    // Update profile based on user type
    if ($user['user_type'] === 'artist') {
        // Get artist profile ID
        $stmt = $conn->prepare("SELECT profile_id FROM artist_profiles WHERE user_id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            throw new Exception('Artist profile not found');
        }
        
        $profile = $result->fetch_assoc();
        $profile_id = $profile['profile_id'];
        
        // Get artist-specific data
        $artist_name = isset($_POST['artist_name']) ? sanitizeInput($_POST['artist_name']) : null;
        
        // Update artist name if provided
        if ($artist_name) {
            $stmt = $conn->prepare("UPDATE artist_profiles SET artist_name = ? WHERE profile_id = ?");
            $stmt->bind_param("si", $artist_name, $profile_id);
            $stmt->execute();
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
                throw new Exception('Invalid file type for profile picture');
            }
            
            // Generate unique filename
            $new_file_name = 'profile_' . $user_id . '_' . generateRandomString() . '.' . $file_ext;
            $upload_path = PROFILE_IMG_DIR . $new_file_name;
            
            // Move uploaded file
            if (move_uploaded_file($file_tmp, $upload_path)) {
                $profile_image = $new_file_name;
                
                // Update profile image
                $stmt = $conn->prepare("UPDATE artist_profiles SET profile_image = ? WHERE profile_id = ?");
                $stmt->bind_param("si", $profile_image, $profile_id);
                $stmt->execute();
            } else {
                throw new Exception('Failed to upload profile picture');
            }
        }
        
        // Get updated profile data
        $stmt = $conn->prepare("
            SELECT profile_id, artist_name, bio, location, profile_image, banner_image, website, followers
            FROM artist_profiles
            WHERE profile_id = ?
        ");
        $stmt->bind_param("i", $profile_id);
        $stmt->execute();
        $updated_profile = $stmt->get_result()->fetch_assoc();
    } else {
        // Fan profile
        // Get fan profile ID
        $stmt = $conn->prepare("SELECT profile_id FROM fan_profiles WHERE user_id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            throw new Exception('Fan profile not found');
        }
        
        $profile = $result->fetch_assoc();
        $profile_id = $profile['profile_id'];
        
        // Get fan-specific data
        $display_name = isset($_POST['display_name']) ? sanitizeInput($_POST['display_name']) : null;
        
        // Update display name if provided
        if ($display_name) {
            $stmt = $conn->prepare("UPDATE fan_profiles SET display_name = ? WHERE profile_id = ?");
            $stmt->bind_param("si", $display_name, $profile_id);
            $stmt->execute();
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
                throw new Exception('Invalid file type for profile picture');
            }
            
            // Generate unique filename
            $new_file_name = 'profile_' . $user_id . '_' . generateRandomString() . '.' . $file_ext;
            $upload_path = PROFILE_IMG_DIR . $new_file_name;
            
            // Move uploaded file
            if (move_uploaded_file($file_tmp, $upload_path)) {
                $profile_image = $new_file_name;
                
                // Update profile image
                $stmt = $conn->prepare("UPDATE fan_profiles SET profile_image = ? WHERE profile_id = ?");
                $stmt->bind_param("si", $profile_image, $profile_id);
                $stmt->execute();
            } else {
                throw new Exception('Failed to upload profile picture');
            }
        }
        
        // Get updated profile data
        $stmt = $conn->prepare("
            SELECT profile_id, display_name, profile_image
            FROM fan_profiles
            WHERE profile_id = ?
        ");
        $stmt->bind_param("i", $profile_id);
        $stmt->execute();
        $updated_profile = $stmt->get_result()->fetch_assoc();
    }
    
    // Commit transaction
    $conn->commit();
    
    // Return success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Profile updated successfully',
        'profile' => $updated_profile
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

// Close connection
$conn->close();
?>

