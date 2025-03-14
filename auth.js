// DOM Elements
const fanAccountBtn = document.getElementById("fan-account")
const artistAccountBtn = document.getElementById("artist-account")
const signupForm = document.getElementById("signup-form")
const artistFields = document.getElementById("artist-fields")

// Account type selection
let selectedAccountType = null

// Initialize auth functionality
function initAuth() {
  // Set up account type selection
  if (fanAccountBtn && artistAccountBtn) {
    fanAccountBtn.addEventListener("click", () => {
      selectAccountType("fan")
    })

    artistAccountBtn.addEventListener("click", () => {
      selectAccountType("artist")
    })
  }

  // Set up signup form submission
  if (signupForm) {
    signupForm.addEventListener("submit", handleSignup)
  }
}

// Select account type
function selectAccountType(type) {
  selectedAccountType = type

  // Update UI
  if (type === "fan") {
    fanAccountBtn.classList.add("selected")
    artistAccountBtn.classList.remove("selected")
    artistFields.classList.add("hidden")
  } else {
    artistAccountBtn.classList.add("selected")
    fanAccountBtn.classList.remove("selected")
    artistFields.classList.remove("hidden")
  }

  // Show signup form
  signupForm.classList.remove("hidden")

  // Scroll to form
  signupForm.scrollIntoView({ behavior: "smooth" })
}

// Handle signup form submission
function handleSignup(e) {
  e.preventDefault()

  // Get form data
  const username = document.getElementById("username").value
  const email = document.getElementById("email").value
  const password = document.getElementById("password").value

  // Validate password
  if (password.length < 8) {
    alert("Password must be at least 8 characters long")
    return
  }

  // Get artist-specific data if applicable
  let artistData = {}
  if (selectedAccountType === "artist") {
    artistData = {
      artistName: document.getElementById("artist-name").value,
      genre: document.getElementById("genre").value,
    }

    // Validate artist fields
    if (!artistData.artistName) {
      alert("Please enter your artist or band name")
      return
    }

    if (!artistData.genre) {
      alert("Please select a primary genre")
      return
    }
  }

  // Prepare data for submission
  const userData = {
    username,
    email,
    password,
    accountType: selectedAccountType,
    ...artistData,
  }

  // In a real app, you would send this data to your server
  console.log("Signup data:", userData)

  // For demo purposes, simulate successful signup
  alert(`Account created successfully! Welcome to MusicWave, ${username}!`)

  // Redirect to home page (in a real app, you might redirect to a dashboard)
  window.location.href = "index.html"
}

// Initialize auth when DOM is loaded
document.addEventListener("DOMContentLoaded", initAuth)

// Mock functions for checkAuth, updateAuthUI, and register
// Replace these with your actual implementation
async function checkAuth() {
  // Your implementation here
  return Promise.resolve()
}

function updateAuthUI() {
  // Your implementation here
}

async function register(formData) {
  // Your implementation here
  return Promise.resolve()
}

// Initialize auth state
document.addEventListener("DOMContentLoaded", async () => {
  await checkAuth()

  // Update UI based on auth state
  updateAuthUI()

  // Listen for login/logout events
  document.addEventListener("userLogin", updateAuthUI)
  document.addEventListener("userLogout", updateAuthUI)

  // Set up signup form if it exists
  const signupForm = document.getElementById("signup-form")
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      // Create FormData object
      const formData = new FormData(signupForm)

      try {
        // Call register function
        await register(formData)

        // Redirect to home page on success
        window.location.href = "index.html"
      } catch (error) {
        alert(error.message || "Registration failed. Please try again.")
      }
    })
  }

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    const userAccount = document.getElementById("user-account")
    const userDropdown = document.getElementById("user-dropdown")

    if (userAccount && userDropdown && !userAccount.contains(e.target)) {
      userDropdown.classList.remove("active")
    }
  })
})

