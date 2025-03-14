// Settings page functionality for InSync

// Declare API_URL, checkAuth, and getCurrentUser
const API_URL = "https://your-api-url.com" // Replace with your actual API URL
async function checkAuth() {
  // Implement your authentication check here
  // For example, check for a token in local storage
  return localStorage.getItem("token") !== null
}

function getCurrentUser() {
  // Implement your user retrieval logic here
  // For example, decode the token from local storage
  const token = localStorage.getItem("token")
  if (token) {
    // Dummy user and profile data for demonstration
    const user = {
      user_id: 1,
      username: "testuser",
      email: "test@example.com",
      user_type: "artist",
    }
    const profile = {
      display_name: "Test User",
      artist_name: "Test Artist",
      profile_image: "test.jpg",
      banner_image: "banner.jpg",
      bio: "Test bio",
      location: "Test location",
      website: "Test website",
    }
    return { user, profile }
  }
  return { user: null, profile: null }
}

document.addEventListener("DOMContentLoaded", async () => {
  // Check if user is logged in
  const authStatus = await checkAuth()

  if (!authStatus) {
    // Redirect to login page if not logged in
    window.location.href = "login.html"
    return
  }

  // Get current user
  const { user, profile } = getCurrentUser()

  // Update dashboard UI
  const dashboardAvatar = document.getElementById("dashboard-avatar")
  const dashboardName = document.getElementById("dashboard-name")

  if (dashboardAvatar && profile) {
    // Set avatar image
    const avatarSrc = profile.profile_image
      ? `uploads/profile_images/${profile.profile_image}`
      : "/placeholder.svg?height=100&width=100"
    dashboardAvatar.src = avatarSrc
  }

  if (dashboardName) {
    // Set name based on user type
    if (user.user_type === "artist" && profile) {
      dashboardName.textContent = profile.artist_name || user.username
    } else if (profile) {
      dashboardName.textContent = profile.display_name || user.username
    } else {
      dashboardName.textContent = user.username
    }
  }

  // Show user type specific elements
  if (user.user_type === "artist") {
    const artistElements = document.querySelectorAll(".artist-only")
    artistElements.forEach((el) => el.classList.remove("hidden"))
  } else {
    const fanElements = document.querySelectorAll(".fan-only")
    fanElements.forEach((el) => el.classList.remove("hidden"))
  }

  // Fill profile form with current user data
  const usernameInput = document.getElementById("username")
  const emailInput = document.getElementById("email")
  const displayNameInput = document.getElementById("display-name")
  const artistNameInput = document.getElementById("artist-name")
  const currentProfilePicture = document.getElementById("current-profile-picture")

  if (usernameInput) usernameInput.value = user.username
  if (emailInput) emailInput.value = user.email

  if (user.user_type === "fan" && displayNameInput && profile) {
    displayNameInput.value = profile.display_name || ""
  }

  if (user.user_type === "artist" && artistNameInput && profile) {
    artistNameInput.value = profile.artist_name || ""
  }

  if (currentProfilePicture && profile) {
    const profileImageSrc = profile.profile_image
      ? `uploads/profile_images/${profile.profile_image}`
      : "/placeholder.svg?height=100&width=100"
    currentProfilePicture.src = profileImageSrc
  }

  // Fill artist form if user is an artist
  if (user.user_type === "artist") {
    const bioInput = document.getElementById("bio")
    const locationInput = document.getElementById("location")
    const websiteInput = document.getElementById("website")
    const currentBannerImage = document.getElementById("current-banner-image")

    if (bioInput && profile) bioInput.value = profile.bio || ""
    if (locationInput && profile) locationInput.value = profile.location || ""
    if (websiteInput && profile) websiteInput.value = profile.website || ""

    if (currentBannerImage && profile) {
      const bannerImageSrc = profile.banner_image
        ? `uploads/banner_images/${profile.banner_image}`
        : "/placeholder.svg?height=150&width=500"
      currentBannerImage.src = bannerImageSrc
    }
  }

  // Set up profile form submission
  const profileForm = document.getElementById("profile-form")
  if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const profileError = document.getElementById("profile-error")
      const profileSuccess = document.getElementById("profile-success")

      profileError.classList.add("hidden")
      profileSuccess.classList.add("hidden")

      try {
        // Create FormData object
        const formData = new FormData(profileForm)

        // Add user_id to formData
        formData.append("user_id", user.user_id)

        // Send update request
        const response = await fetch(`${API_URL}/users/update_profile.php`, {
          method: "POST",
          credentials: "include",
          body: formData,
        })

        const data = await response.json()

        if (data.success) {
          profileSuccess.textContent = "Profile updated successfully"
          profileSuccess.classList.remove("hidden")

          // Update profile picture if it was changed
          if (data.profile && data.profile.profile_image) {
            const newProfileImageSrc = `uploads/profile_images/${data.profile.profile_image}`

            // Update all profile pictures on the page
            if (currentProfilePicture) currentProfilePicture.src = newProfileImageSrc
            if (dashboardAvatar) dashboardAvatar.src = newProfileImageSrc

            // Update user avatar in dropdown
            const userAvatar = document.getElementById("user-avatar")
            const dropdownAvatar = document.getElementById("dropdown-avatar")

            if (userAvatar) userAvatar.src = newProfileImageSrc
            if (dropdownAvatar) dropdownAvatar.src = newProfileImageSrc
          }
        } else {
          throw new Error(data.message || "Failed to update profile")
        }
      } catch (error) {
        profileError.textContent = error.message || "An error occurred while updating your profile"
        profileError.classList.remove("hidden")
      }
    })
  }

  // Set up password form submission
  const passwordForm = document.getElementById("password-form")
  if (passwordForm) {
    passwordForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const passwordError = document.getElementById("password-error")
      const passwordSuccess = document.getElementById("password-success")

      passwordError.classList.add("hidden")
      passwordSuccess.classList.add("hidden")

      const currentPassword = document.getElementById("current-password").value
      const newPassword = document.getElementById("new-password").value
      const confirmPassword = document.getElementById("confirm-password").value

      // Validate passwords
      if (newPassword.length < 8) {
        passwordError.textContent = "New password must be at least 8 characters long"
        passwordError.classList.remove("hidden")
        return
      }

      if (newPassword !== confirmPassword) {
        passwordError.textContent = "New passwords do not match"
        passwordError.classList.remove("hidden")
        return
      }

      try {
        // Send password update request
        const response = await fetch(`${API_URL}/users/change_password.php`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
          }),
        })

        const data = await response.json()

        if (data.success) {
          passwordSuccess.textContent = "Password changed successfully"
          passwordSuccess.classList.remove("hidden")

          // Clear password fields
          document.getElementById("current-password").value = ""
          document.getElementById("new-password").value = ""
          document.getElementById("confirm-password").value = ""
        } else {
          throw new Error(data.message || "Failed to change password")
        }
      } catch (error) {
        passwordError.textContent = error.message || "An error occurred while changing your password"
        passwordError.classList.remove("hidden")
      }
    })
  }

  // Set up artist form submission
  const artistForm = document.getElementById("artist-form")
  if (artistForm && user.user_type === "artist") {
    artistForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const artistError = document.getElementById("artist-error")
      const artistSuccess = document.getElementById("artist-success")

      artistError.classList.add("hidden")
      artistSuccess.classList.add("hidden")

      try {
        // Create FormData object
        const formData = new FormData(artistForm)

        // Send update request
        const response = await fetch(`${API_URL}/artists/update.php`, {
          method: "POST",
          credentials: "include",
          body: formData,
        })

        const data = await response.json()

        if (data.success) {
          artistSuccess.textContent = "Artist profile updated successfully"
          artistSuccess.classList.remove("hidden")

          // Update banner image if it was changed
          if (data.profile && data.profile.banner_image) {
            const newBannerImageSrc = `uploads/banner_images/${data.profile.banner_image}`

            // Update banner image on the page
            const currentBannerImage = document.getElementById("current-banner-image")
            if (currentBannerImage) currentBannerImage.src = newBannerImageSrc
          }
        } else {
          throw new Error(data.message || "Failed to update artist profile")
        }
      } catch (error) {
        artistError.textContent = error.message || "An error occurred while updating your artist profile"
        artistError.classList.remove("hidden")
      }
    })
  }
})

