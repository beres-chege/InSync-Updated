// Authentication functions for InSync

// API endpoints
const API_URL = "http://localhost/insync/api"
const AUTH_ENDPOINTS = {
  register: `${API_URL}/auth/register.php`,
  login: `${API_URL}/auth/login.php`,
  logout: `${API_URL}/auth/logout.php`,
  check: `${API_URL}/auth/check.php`,
}

// User state
let currentUser = null
let userProfile = null

// Check if user is logged in
async function checkAuth() {
  try {
    const response = await fetch(AUTH_ENDPOINTS.check, {
      method: "GET",
      credentials: "include",
    })

    const data = await response.json()

    if (data.success) {
      currentUser = data.user
      userProfile = data.profile
      return true
    } else {
      currentUser = null
      userProfile = null
      return false
    }
  } catch (error) {
    console.error("Auth check error:", error)
    currentUser = null
    userProfile = null
    return false
  }
}

// Register a new user
async function register(userData) {
  try {
    // If userData contains files, use FormData
    let requestOptions = {}

    if (userData instanceof FormData) {
      requestOptions = {
        method: "POST",
        credentials: "include",
        body: userData,
      }
    } else {
      requestOptions = {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      }
    }

    const response = await fetch(AUTH_ENDPOINTS.register, requestOptions)
    const data = await response.json()

    if (data.success) {
      // After registration, log the user in
      return await login({
        email: userData.email || userData.get("email"),
        password: userData.password || userData.get("password"),
      })
    } else {
      throw new Error(data.message || "Registration failed")
    }
  } catch (error) {
    console.error("Registration error:", error)
    throw error
  }
}

// Login user
async function login(credentials) {
  try {
    // Prepare login data
    const loginData = {
      username_or_email: credentials.username || credentials.email,
      password: credentials.password,
      remember_me: credentials.remember_me || false,
    }

    const response = await fetch(AUTH_ENDPOINTS.login, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    })

    const data = await response.json()

    if (data.success) {
      currentUser = data.user
      userProfile = data.profile

      // Dispatch login event
      const event = new CustomEvent("userLogin", { detail: { user: currentUser, profile: userProfile } })
      document.dispatchEvent(event)

      return { user: currentUser, profile: userProfile }
    } else {
      throw new Error(data.message || "Login failed")
    }
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

// Logout user
async function logout() {
  try {
    const response = await fetch(AUTH_ENDPOINTS.logout, {
      method: "POST",
      credentials: "include",
    })

    const data = await response.json()

    if (data.success) {
      currentUser = null
      userProfile = null

      // Dispatch logout event
      const event = new CustomEvent("userLogout")
      document.dispatchEvent(event)

      return true
    } else {
      throw new Error(data.message || "Logout failed")
    }
  } catch (error) {
    console.error("Logout error:", error)
    throw error
  }
}

// Get current user
function getCurrentUser() {
  return { user: currentUser, profile: userProfile }
}

// Check if user is an artist
function isArtist() {
  return currentUser && currentUser.user_type === "artist"
}

// Initialize auth state
document.addEventListener("DOMContentLoaded", async () => {
  await checkAuth()

  // Update UI based on auth state
  updateAuthUI()

  // Listen for login/logout events
  document.addEventListener("userLogin", updateAuthUI)
  document.addEventListener("userLogout", updateAuthUI)

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    const userAccount = document.getElementById("user-account")
    const userDropdown = document.getElementById("user-dropdown")

    if (userAccount && userDropdown && !userAccount.contains(e.target)) {
      userDropdown.classList.remove("active")
    }
  })
})

// Update UI based on auth state
function updateAuthUI() {
  const loggedOutNav = document.getElementById("logged-out-nav")
  const loggedInNav = document.getElementById("logged-in-nav")

  if (!loggedOutNav || !loggedInNav) return

  if (currentUser) {
    // User is logged in
    loggedOutNav.classList.add("hidden")
    loggedInNav.classList.remove("hidden")

    // Update user avatar and dropdown info
    const userAvatar = document.getElementById("user-avatar")
    const dropdownAvatar = document.getElementById("dropdown-avatar")
    const dropdownName = document.getElementById("dropdown-name")
    const dropdownEmail = document.getElementById("dropdown-email")

    if (userAvatar && userProfile) {
      // Set avatar image
      const avatarSrc = userProfile.profile_image
        ? `uploads/profile_images/${userProfile.profile_image}`
        : "/placeholder.svg?height=32&width=32"
      userAvatar.src = avatarSrc
    }

    if (dropdownAvatar && userProfile) {
      // Set dropdown avatar image
      const avatarSrc = userProfile.profile_image
        ? `uploads/profile_images/${userProfile.profile_image}`
        : "/placeholder.svg?height=64&width=64"
      dropdownAvatar.src = avatarSrc
    }

    if (dropdownName) {
      // Set name based on user type
      if (currentUser.user_type === "artist" && userProfile) {
        dropdownName.textContent = userProfile.artist_name || currentUser.username
      } else if (userProfile) {
        dropdownName.textContent = userProfile.display_name || currentUser.username
      } else {
        dropdownName.textContent = currentUser.username
      }
    }

    if (dropdownEmail) {
      dropdownEmail.textContent = currentUser.email
    }

    // Set up logout link
    const logoutLink = document.getElementById("logout-link")
    if (logoutLink) {
      logoutLink.addEventListener("click", async (e) => {
        e.preventDefault()
        await logout()
        window.location.href = "index.html"
      })
    }

    // Set up user dropdown toggle
    const userAccountBtn = document.getElementById("user-account")
    const userDropdown = document.getElementById("user-dropdown")

    if (userAccountBtn && userDropdown) {
      userAccountBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        userDropdown.classList.toggle("active")
      })

      // Close dropdown when clicking outside
      document.addEventListener("click", (e) => {
        if (!userAccountBtn.contains(e.target)) {
          userDropdown.classList.remove("active")
        }
      })
    }
  } else {
    // User is logged out
    loggedOutNav.classList.remove("hidden")
    loggedInNav.classList.add("hidden")
  }
}

