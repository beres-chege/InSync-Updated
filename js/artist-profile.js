// Artist profile management for InSync

// API endpoints
const API_URL = "http://localhost/insync/api"
const ARTIST_ENDPOINTS = {
  get: `${API_URL}/artists/get.php`,
  update: `${API_URL}/artists/update.php`,
  createAlbum: `${API_URL}/albums/create.php`,
  uploadTrack: `${API_URL}/tracks/upload.php`,
}

// Get artist profile by ID or username
async function getArtistProfile(idOrUsername) {
  try {
    let url = ARTIST_ENDPOINTS.get

    // Check if parameter is a number (ID) or string (username)
    if (typeof idOrUsername === "number" || !isNaN(Number.parseInt(idOrUsername))) {
      url += `?id=${idOrUsername}`
    } else {
      url += `?username=${idOrUsername}`
    }

    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
    })

    const data = await response.json()

    if (data.success) {
      return data.artist
    } else {
      throw new Error(data.message || "Failed to get artist profile")
    }
  } catch (error) {
    console.error("Get artist profile error:", error)
    throw error
  }
}

// Update artist profile
async function updateArtistProfile(profileData) {
  try {
    // Use FormData for file uploads
    const formData = new FormData()

    // Add text fields
    if (profileData.artist_name) formData.append("artist_name", profileData.artist_name)
    if (profileData.bio) formData.append("bio", profileData.bio)
    if (profileData.location) formData.append("location", profileData.location)
    if (profileData.website) formData.append("website", profileData.website)

    // Add file fields
    if (profileData.profile_image instanceof File) {
      formData.append("profile_image", profileData.profile_image)
    }

    if (profileData.banner_image instanceof File) {
      formData.append("banner_image", profileData.banner_image)
    }

    const response = await fetch(ARTIST_ENDPOINTS.update, {
      method: "POST",
      credentials: "include",
      body: formData,
    })

    const data = await response.json()

    if (data.success) {
      return data.profile
    } else {
      throw new Error(data.message || "Failed to update artist profile")
    }
  } catch (error) {
    console.error("Update artist profile error:", error)
    throw error
  }
}

// Create a new album
async function createAlbum(albumData) {
  try {
    // Use FormData for file uploads
    const formData = new FormData()

    // Add text fields
    formData.append("title", albumData.title)
    if (albumData.description) formData.append("description", albumData.description)
    if (albumData.release_date) formData.append("release_date", albumData.release_date)
    if (albumData.genre) formData.append("genre", albumData.genre)
    if (albumData.price) formData.append("price", albumData.price)

    // Add cover image
    if (albumData.cover_image instanceof File) {
      formData.append("cover_image", albumData.cover_image)
    }

    const response = await fetch(ARTIST_ENDPOINTS.createAlbum, {
      method: "POST",
      credentials: "include",
      body: formData,
    })

    const data = await response.json()

    if (data.success) {
      return data.album_id
    } else {
      throw new Error(data.message || "Failed to create album")
    }
  } catch (error) {
    console.error("Create album error:", error)
    throw error
  }
}

// Upload a track to an album
async function uploadTrack(trackData) {
  try {
    // Use FormData for file uploads
    const formData = new FormData()

    // Add text fields
    formData.append("album_id", trackData.album_id)
    formData.append("title", trackData.title)
    if (trackData.track_number) formData.append("track_number", trackData.track_number)
    if (trackData.price) formData.append("price", trackData.price)

    // Add track file
    if (trackData.track_file instanceof File) {
      formData.append("track_file", trackData.track_file)
    } else {
      throw new Error("Track file is required")
    }

    const response = await fetch(ARTIST_ENDPOINTS.uploadTrack, {
      method: "POST",
      credentials: "include",
      body: formData,
    })

    const data = await response.json()

    if (data.success) {
      return data.track_id
    } else {
      throw new Error(data.message || "Failed to upload track")
    }
  } catch (error) {
    console.error("Upload track error:", error)
    throw error
  }
}

// Load artist profile page
async function loadArtistProfilePage() {
  try {
    // Get artist username from URL
    const urlParams = new URLSearchParams(window.location.search)
    const username = urlParams.get("username")

    if (!username) {
      throw new Error("Artist username is required")
    }

    // Get artist profile
    const artist = await getArtistProfile(username)

    // Update page elements
    document.title = `${artist.artist_name} - InSync`

    // Set header background
    const artistHeader = document.getElementById("artist-header")
    if (artistHeader) {
      artistHeader.style.backgroundImage = `url('uploads/banner_images/${artist.banner_image}')`
    }

    // Set profile image
    const artistAvatar = document.getElementById("artist-avatar")
    if (artistAvatar) {
      artistAvatar.src = `uploads/profile_images/${artist.profile_image}`
      artistAvatar.alt = artist.artist_name
    }

    // Set artist name
    const artistName = document.getElementById("artist-name")
    if (artistName) {
      artistName.textContent = artist.artist_name
    }

    // Set artist location
    const artistLocation = document.getElementById("artist-location")
    if (artistLocation) {
      artistLocation.textContent = artist.location || ""
    }

    // Set artist followers
    const artistFollowers = document.getElementById("artist-followers")
    if (artistFollowers) {
      artistFollowers.textContent = `${artist.followers} followers`
    }

    // Set artist releases count
    const artistReleases = document.getElementById("artist-releases")
    if (artistReleases) {
      artistReleases.textContent = `${artist.albums.length} releases`
    }

    // Set artist bio
    const artistBio = document.getElementById("artist-bio")
    if (artistBio) {
      artistBio.textContent = artist.bio || "No bio available"
    }

    // Load albums
    const artistAlbums = document.getElementById("artist-albums")
    if (artistAlbums && artist.albums.length > 0) {
      artistAlbums.innerHTML = ""

      artist.albums.forEach((album) => {
        const albumCard = document.createElement("div")
        albumCard.className = "album-card"
        albumCard.innerHTML = `
                    <div class="album-cover">
                        <img src="uploads/album_covers/${album.cover_image}" alt="${album.title}">
                        <div class="play-overlay">
                            <div class="play-button" data-album-id="${album.album_id}">
                                <i class="fas fa-play"></i>
                            </div>
                        </div>
                    </div>
                    <div class="album-info">
                        <div class="album-title">${album.title}</div>
                        <div class="album-artist">${album.release_date ? new Date(album.release_date).getFullYear() : ""} · ${album.genre || "Unknown genre"}</div>
                    </div>
                `

        artistAlbums.appendChild(albumCard)

        // Add event listener to play button
        const playButton = albumCard.querySelector(".play-button")
        playButton.addEventListener("click", (e) => {
          e.stopPropagation()
          playAlbum(album)
        })

        // Add event listener to album card
        albumCard.addEventListener("click", () => {
          window.location.href = `album.html?id=${album.album_id}`
        })
      })
    } else if (artistAlbums) {
      artistAlbums.innerHTML = "<p>No albums available</p>"
    }

    // Load discography
    const discographyList = document.getElementById("discography-list")
    if (discographyList && artist.albums.length > 0) {
      discographyList.innerHTML = ""

      // Sort albums by release date (newest first)
      const sortedAlbums = [...artist.albums].sort((a, b) => {
        return new Date(b.release_date) - new Date(a.release_date)
      })

      sortedAlbums.forEach((album) => {
        const discographyItem = document.createElement("div")
        discographyItem.className = "discography-item"
        discographyItem.innerHTML = `
                    <img src="uploads/album_covers/${album.cover_image}" alt="${album.title}" class="discography-cover">
                    <div class="discography-info">
                        <div class="discography-title">${album.title}</div>
                        <div class="discography-year">${album.release_date ? new Date(album.release_date).getFullYear() : ""} · ${album.tracks.length} tracks</div>
                    </div>
                `

        discographyList.appendChild(discographyItem)

        // Add event listener to discography item
        discographyItem.addEventListener("click", () => {
          window.location.href = `album.html?id=${album.album_id}`
        })
      })
    } else if (discographyList) {
      discographyList.innerHTML = "<p>No discography available</p>"
    }

    // Load social links
    const socialLinks = document.getElementById("artist-social-links")
    if (socialLinks) {
      socialLinks.innerHTML = ""

      if (artist.website) {
        const websiteLink = document.createElement("a")
        websiteLink.href = artist.website
        websiteLink.target = "_blank"
        websiteLink.innerHTML = '<i class="fas fa-globe"></i>'
        socialLinks.appendChild(websiteLink)
      }
    }
  } catch (error) {
    console.error("Load artist profile error:", error)
    // Display error message
    const artistContent = document.querySelector(".artist-content")
    if (artistContent) {
      artistContent.innerHTML = `<div class="error-message">Error loading artist profile: ${error.message}</div>`
    }
  }
}

// Mock playAlbum function or import it from another module
function playAlbum(album) {
  console.log(`Playing album: ${album.title}`)
  // Add your actual playAlbum logic here
}

// Initialize artist profile page
document.addEventListener("DOMContentLoaded", () => {
  // Check if we're on the artist profile page
  if (window.location.pathname.includes("artist.html")) {
    loadArtistProfilePage()
  }
})

// Export functions
window.artistProfile = {
  getArtistProfile,
  updateArtistProfile,
  createAlbum,
  uploadTrack,
}

