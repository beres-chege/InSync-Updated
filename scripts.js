// Update the createAlbumCard function to use the global playAlbum function
function createAlbumCard(album, artist) {
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
      <div class="album-artist">${artist.name}</div>
    </div>
  `

  // Add click handler for artist navigation
  const artistName = albumCard.querySelector(".album-artist")

  // Declare navigateToArtist (assuming it's defined elsewhere or needs to be)
  // For example, if it's a global function:
  // window.navigateToArtist = window.navigateToArtist || function(artistUsername) { console.log(`Navigating to artist: ${artistUsername}`); };
  // Or, if it's imported from another module:
  // import { navigateToArtist } from './navigation'; // Assuming it's in navigation.js
  // If it's defined within the same file (but outside this function):
  function navigateToArtist(artistUsername) {
    console.log(`Navigating to artist: ${artistUsername}`)
  }

  artistName.addEventListener("click", (e) => {
    e.stopPropagation()
    navigateToArtist(artist.username)
  })

  // Add event listener to play button
  const playButton = albumCard.querySelector(".play-button")
  playButton.addEventListener("click", (e) => {
    e.stopPropagation()

    // Create a track object for the player
    const track = {
      id: album.id,
      title: album.title,
      artist: artist.name,
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

  return albumCard
}

