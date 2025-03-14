// DOM Elements
const playerBar = document.getElementById("player-bar")
const playPauseBtn = document.getElementById("play-pause")
const prevTrackBtn = document.getElementById("prev-track")
const nextTrackBtn = document.getElementById("next-track")
const progressBar = document.getElementById("progress-bar")
const progressContainer = document.querySelector(".progress-container")
const currentTimeEl = document.getElementById("current-time")
const totalTimeEl = document.getElementById("total-time")
const volumeControl = document.getElementById("volume")
const currentTrackEl = document.getElementById("current-track")
const currentArtistEl = document.getElementById("current-artist")
const currentAlbumArtEl = document.getElementById("current-album-art")
const miniPlayerToggle = document.getElementById("mini-player-toggle")
const footer = document.querySelector("footer")

// Audio element
const audio = new Audio()

// Player state
let isPlaying = false
let currentTrackIndex = 0
let playlist = []
let playerVisible = false

// Sample tracks (in a real app, these would come from your backend)
const sampleTracks = [
  {
    id: 1,
    title: "Electronic Dreams",
    artist: "Luna Waves",
    album: "Midnight Echoes",
    albumArt: "/placeholder.svg?height=300&width=300&text=Midnight+Echoes",
    src: "https://example.com/audio/track1.mp3", // This is a placeholder URL
  },
  {
    id: 2,
    title: "Urban Beat",
    artist: "Street Pulse",
    album: "Urban Rhythms",
    albumArt: "/placeholder.svg?height=300&width=300&text=Urban+Rhythms",
    src: "https://example.com/audio/track2.mp3", // This is a placeholder URL
  },
  {
    id: 3,
    title: "Ambient Flow",
    artist: "Skyward",
    album: "Ethereal Dreams",
    albumArt: "/placeholder.svg?height=300&width=300&text=Ethereal+Dreams",
    src: "https://example.com/audio/track3.mp3", // This is a placeholder URL
  },
]

// Function to show the player
function showPlayer() {
  if (!playerVisible) {
    playerBar.classList.add("active")
    miniPlayerToggle.classList.add("active")
    footer.classList.add("player-active")
    playerVisible = true

    // Store player state in localStorage
    localStorage.setItem("playerVisible", "true")
  }
}

// Function to hide the player
function hidePlayer() {
  if (playerVisible) {
    playerBar.classList.remove("active")
    miniPlayerToggle.classList.remove("active")
    footer.classList.remove("player-active")
    playerVisible = false

    // Update localStorage
    localStorage.setItem("playerVisible", "false")

    // If music is playing, pause it
    if (isPlaying) {
      pauseTrack()
    }
  }
}

// Function to toggle player visibility
function togglePlayer() {
  if (playerVisible) {
    hidePlayer()
  } else {
    showPlayer()
  }
}

// Initialize the player
function initPlayer() {
  // Set up event listeners
  playPauseBtn.addEventListener("click", togglePlayPause)
  prevTrackBtn.addEventListener("click", playPreviousTrack)
  nextTrackBtn.addEventListener("click", playNextTrack)
  progressContainer.addEventListener("click", setProgress)
  volumeControl.addEventListener("input", setVolume)

  // Add event listener for mini player toggle
  if (miniPlayerToggle) {
    miniPlayerToggle.addEventListener("click", togglePlayer)
  }

  // Audio events
  audio.addEventListener("timeupdate", updateProgress)
  audio.addEventListener("ended", playNextTrack)
  audio.addEventListener("canplay", () => {
    updateTotalTime()
  })

  // Set initial volume
  setVolume()

  // Check if player was visible in previous session
  const wasPlayerVisible = localStorage.getItem("playerVisible") === "true"
  if (wasPlayerVisible) {
    showPlayer()
  }
}

// Play an album
function playAlbum(album) {
  // In a real app, you would fetch the tracks for this album
  // For demo purposes, we'll use our sample tracks
  playlist = sampleTracks
  currentTrackIndex = 0
  loadTrack(currentTrackIndex)
  playTrack()

  // Show the player
  showPlayer()
}

// Load a track
function loadTrack(index) {
  if (playlist.length === 0 || index < 0 || index >= playlist.length) {
    return
  }

  const track = playlist[index]

  // Update track info
  currentTrackEl.textContent = track.title
  currentArtistEl.textContent = track.artist
  currentAlbumArtEl.src = track.albumArt

  // Set audio source
  audio.src = track.src
  audio.load()
}

// Play track
function playTrack() {
  playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>'
  isPlaying = true

  // Show the player if it's not visible
  showPlayer()

  // In a real app, you would handle the case where the audio source is not available
  // For demo purposes, we'll just simulate playback
  audio.play().catch((error) => {
    console.log("Audio playback error (expected in demo):", error)
    // Simulate playback for demo
    updatePlayerUI()
  })
}

// Pause track
function pauseTrack() {
  playPauseBtn.innerHTML = '<i class="fas fa-play"></i>'
  isPlaying = false
  audio.pause()
}

// Toggle play/pause
function togglePlayPause() {
  if (playlist.length === 0) {
    // If no playlist is loaded, load sample tracks
    playlist = sampleTracks
    currentTrackIndex = 0
    loadTrack(currentTrackIndex)
  }

  if (isPlaying) {
    pauseTrack()
  } else {
    playTrack()
  }
}

// Play previous track
function playPreviousTrack() {
  if (playlist.length === 0) return

  currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length
  loadTrack(currentTrackIndex)
  playTrack()
}

// Play next track
function playNextTrack() {
  if (playlist.length === 0) return

  currentTrackIndex = (currentTrackIndex + 1) % playlist.length
  loadTrack(currentTrackIndex)
  playTrack()
}

// Update progress bar
function updateProgress() {
  const { currentTime, duration } = audio
  if (isNaN(duration)) return

  // Update progress bar
  const progressPercent = (currentTime / duration) * 100
  progressBar.style.width = `${progressPercent}%`

  // Update current time display
  currentTimeEl.textContent = formatTime(currentTime)
}

// Set progress when clicking on progress bar
function setProgress(e) {
  const width = this.clientWidth
  const clickX = e.offsetX
  const duration = audio.duration

  if (isNaN(duration)) return

  audio.currentTime = (clickX / width) * duration
}

// Set volume
function setVolume() {
  audio.volume = volumeControl.value / 100
}

// Update total time display
function updateTotalTime() {
  const duration = audio.duration
  if (isNaN(duration)) {
    totalTimeEl.textContent = "0:00"
  } else {
    totalTimeEl.textContent = formatTime(duration)
  }
}

// Format time in minutes and seconds
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`
}

// Simulate player UI updates for demo purposes
function updatePlayerUI() {
  // This function simulates progress updates when actual audio can't be played
  let simulatedTime = 0
  const simulatedDuration = 180 // 3 minutes

  // Update total time display
  totalTimeEl.textContent = formatTime(simulatedDuration)

  // Clear any existing interval
  if (window.playerInterval) {
    clearInterval(window.playerInterval)
  }

  // Set up interval to update UI
  if (isPlaying) {
    window.playerInterval = setInterval(() => {
      simulatedTime += 1

      // Update progress bar
      const progressPercent = (simulatedTime / simulatedDuration) * 100
      progressBar.style.width = `${progressPercent}%`

      // Update current time display
      currentTimeEl.textContent = formatTime(simulatedTime)

      // If "track" ends, play next track
      if (simulatedTime >= simulatedDuration) {
        clearInterval(window.playerInterval)
        playNextTrack()
      }
    }, 1000)
  } else {
    clearInterval(window.playerInterval)
  }
}

// Initialize player when DOM is loaded
document.addEventListener("DOMContentLoaded", initPlayer)

