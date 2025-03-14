// Assuming these variables are defined elsewhere or imported
// For demonstration purposes, let's declare them here.
const artistAlbumsContainer = document.getElementById("artist-albums-container") // Replace with your actual element ID
const artistAlbums = [] // Replace with your actual album data
const artistData = { name: "Unknown Artist" } // Replace with your actual artist data

// Update the loadArtistAlbums function to handle play button clicks
function loadArtistAlbums(sortBy = "newest") {
  if (!artistAlbumsContainer) return

  // Sort albums
  const sortedAlbums = [...artistAlbums]

  switch (sortBy) {
    case "newest":
      sortedAlbums.sort((a, b) => b.year - a.year)
      break
    case "oldest":
      sortedAlbums.sort((a, b) => a.year - b.year)
      break
    case "a-z":
      sortedAlbums.sort((a, b) => a.title.localeCompare(b.title))
      break
    case "z-a":
      sortedAlbums.sort((a, b) => b.title.localeCompare(a.title))
      break
  }

  // Clear container
  artistAlbumsContainer.innerHTML = ""

  // Create album cards
  sortedAlbums.forEach((album) => {
    const albumCard = document.createElement("div")
    albumCard.className = "album-card"

    albumCard.innerHTML = `
      <div class="album-cover">
        <img src="${album.cover}" alt="${album.title}">
        <div class="play-overlay">
          <div class="play-button">
            <i class="fas fa-play"></i>
          </div>
        </div>
      </div>
      <div class="album-info">
        <div class="album-title">${album.title}</div>
        <div class="album-artist">${album.type} · ${album.year}</div>
      </div>
    `

    // Add event listener to play button
    const playButton = albumCard.querySelector(".play-button")
    playButton.addEventListener("click", (e) => {
      e.stopPropagation()

      // Create a track object for the player
      const track = {
        id: album.id,
        title: album.title,
        artist: artistData.name,
        album: album.title,
        albumArt: album.cover,
        src: "https://example.com/audio/track1.mp3", // Placeholder URL
      }

      // Call the global playAlbum function from player.js
      window.playAlbum =
        window.playAlbum ||
        ((track) => {
          console.log(`Playing: ${track.title} by ${track.artist}`)

          // If player.js is loaded, this will be overridden
          const playerBar = document.getElementById("player-bar")
          if (playerBar) {
            playerBar.classList.add("active")

            const miniPlayerToggle = document.getElementById("mini-player-toggle")
            if (miniPlayerToggle) {
              miniPlayerToggle.classList.add("active")
            }

            const footer = document.querySelector("footer")
            if (footer) {
              footer.classList.add("player-active")
            }

            // Update player info
            const currentTrackEl = document.getElementById("current-track")
            const currentArtistEl = document.getElementById("current-artist")
            const currentAlbumArtEl = document.getElementById("current-album-art")

            if (currentTrackEl) currentTrackEl.textContent = track.title
            if (currentArtistEl) currentArtistEl.textContent = track.artist
            if (currentAlbumArtEl) currentAlbumArtEl.src = track.albumArt
          }
        })

      window.playAlbum(track)
    })

    // Add event listener to album card
    albumCard.addEventListener("click", () => {
      // Navigate to album page
      console.log(`Navigating to album: ${album.title}`)
    })

    artistAlbumsContainer.appendChild(albumCard)
  })
}

