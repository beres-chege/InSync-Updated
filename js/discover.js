// Discover page functionality for InSync

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const mainSearchInput = document.getElementById("main-search")
  const searchButton = document.getElementById("search-button")
  const discoverSearchInput = document.getElementById("discover-search")
  const discoverSearchBtn = document.getElementById("discover-search-btn")
  const filterButtons = document.querySelectorAll(".filter-btn")
  const searchStatus = document.getElementById("search-status")
  const resultsContainer = document.getElementById("results-container")
  const artistsGrid = document.getElementById("artists-grid")
  const albumsGrid = document.getElementById("albums-grid")
  const tracksList = document.getElementById("tracks-list")
  const moreArtistsBtn = document.getElementById("more-artists")
  const moreAlbumsBtn = document.getElementById("more-albums")
  const moreTracksBtn = document.getElementById("more-tracks")
  const genreTags = document.querySelectorAll(".genre-tag")
  const trendingAlbums = document.getElementById("trending-albums")

  // Current search state
  let currentSearchQuery = ""
  let currentFilter = "all"
  let currentPage = 1
  const resultsPerPage = 8

  // Initialize trending albums
  loadTrendingAlbums()

  // Event Listeners
  if (searchButton) {
    searchButton.addEventListener("click", () => {
      const query = mainSearchInput.value.trim()
      if (query) {
        performSearch(query)
      }
    })
  }

  if (mainSearchInput) {
    mainSearchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const query = mainSearchInput.value.trim()
        if (query) {
          performSearch(query)
        }
      }
    })
  }

  if (discoverSearchBtn) {
    discoverSearchBtn.addEventListener("click", () => {
      const query = discoverSearchInput.value.trim()
      if (query) {
        performSearch(query)
      }
    })
  }

  if (discoverSearchInput) {
    discoverSearchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const query = discoverSearchInput.value.trim()
        if (query) {
          performSearch(query)
        }
      }
    })
  }

  // Filter buttons
  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const filter = this.getAttribute("data-filter")

      // Update active filter button
      filterButtons.forEach((btn) => btn.classList.remove("active"))
      this.classList.add("active")

      // Update current filter
      currentFilter = filter

      // If there's a current search, perform it again with the new filter
      if (currentSearchQuery) {
        performSearch(currentSearchQuery)
      }
    })
  })

  // Genre tags
  genreTags.forEach((tag) => {
    tag.addEventListener("click", function (e) {
      e.preventDefault()
      const genre = this.getAttribute("data-genre")
      performGenreSearch(genre)
    })
  })

  // More buttons
  if (moreArtistsBtn) {
    moreArtistsBtn.addEventListener("click", () => {
      currentPage++
      loadMoreResults("artists")
    })
  }

  if (moreAlbumsBtn) {
    moreAlbumsBtn.addEventListener("click", () => {
      currentPage++
      loadMoreResults("albums")
    })
  }

  if (moreTracksBtn) {
    moreTracksBtn.addEventListener("click", () => {
      currentPage++
      loadMoreResults("tracks")
    })
  }

  // Check if there's a search query in the URL
  const urlParams = new URLSearchParams(window.location.search)
  const queryParam = urlParams.get("q")
  if (queryParam) {
    discoverSearchInput.value = queryParam
    performSearch(queryParam)
  }

  // Functions
  function performSearch(query) {
    // Update search inputs
    mainSearchInput.value = query
    discoverSearchInput.value = query

    // Update current search query
    currentSearchQuery = query

    // Reset pagination
    currentPage = 1

    // Show loading state
    searchStatus.innerHTML = "<p>Searching...</p>"
    searchStatus.classList.remove("hidden")
    resultsContainer.classList.add("hidden")

    // Perform search based on filter
    if (currentFilter === "all" || currentFilter === "artists") {
      searchArtists(query)
    }

    if (currentFilter === "all" || currentFilter === "albums") {
      searchAlbums(query)
    }

    if (currentFilter === "all" || currentFilter === "tracks") {
      searchTracks(query)
    }

    // Update URL with search query
    const newUrl = `${window.location.pathname}?q=${encodeURIComponent(query)}`
    window.history.pushState({ path: newUrl }, "", newUrl)
  }

  function performGenreSearch(genre) {
    // Update search inputs
    const genreQuery = `genre:${genre}`
    mainSearchInput.value = genreQuery
    discoverSearchInput.value = genreQuery

    // Update current search query
    currentSearchQuery = genreQuery

    // Reset pagination
    currentPage = 1

    // Show loading state
    searchStatus.innerHTML = `<p>Browsing ${genre} music...</p>`
    searchStatus.classList.remove("hidden")
    resultsContainer.classList.add("hidden")

    // Perform search for the genre
    searchByGenre(genre)

    // Update URL with search query
    const newUrl = `${window.location.pathname}?genre=${encodeURIComponent(genre)}`
    window.history.pushState({ path: newUrl }, "", newUrl)
  }

  function searchArtists(query) {
    // In a real app, this would be an API call to your backend
    // For demo purposes, we'll use sample data

    // Simulate API call delay
    setTimeout(() => {
      const artists = getSampleArtists().filter(
        (artist) =>
          artist.name.toLowerCase().includes(query.toLowerCase()) ||
          (artist.bio && artist.bio.toLowerCase().includes(query.toLowerCase())),
      )

      displayArtistResults(artists)
    }, 500)
  }

  function searchAlbums(query) {
    // In a real app, this would be an API call to your backend
    // For demo purposes, we'll use sample data

    // Simulate API call delay
    setTimeout(() => {
      const albums = getSampleAlbums().filter(
        (album) =>
          album.title.toLowerCase().includes(query.toLowerCase()) ||
          album.artist.toLowerCase().includes(query.toLowerCase()),
      )

      displayAlbumResults(albums)
    }, 700)
  }

  function searchTracks(query) {
    // In a real app, this would be an API call to your backend
    // For demo purposes, we'll use sample data

    // Simulate API call delay
    setTimeout(() => {
      const tracks = getSampleTracks().filter(
        (track) =>
          track.title.toLowerCase().includes(query.toLowerCase()) ||
          track.artist.toLowerCase().includes(query.toLowerCase()) ||
          track.album.toLowerCase().includes(query.toLowerCase()),
      )

      displayTrackResults(tracks)
    }, 900)
  }

  function searchByGenre(genre) {
    // In a real app, this would be an API call to your backend
    // For demo purposes, we'll use sample data

    // Simulate API call delay
    setTimeout(() => {
      const artists = getSampleArtists().filter((artist) => artist.genres && artist.genres.includes(genre))

      const albums = getSampleAlbums().filter(
        (album) => album.genre && album.genre.toLowerCase() === genre.toLowerCase(),
      )

      const tracks = getSampleTracks().filter(
        (track) => track.genre && track.genre.toLowerCase() === genre.toLowerCase(),
      )

      displayArtistResults(artists)
      displayAlbumResults(albums)
      displayTrackResults(tracks)
    }, 500)
  }

  function displayArtistResults(artists) {
    if (!artistsGrid) return

    // Clear previous results
    artistsGrid.innerHTML = ""

    // Hide more button by default
    if (moreArtistsBtn) moreArtistsBtn.classList.add("hidden")

    // If no artists found
    if (artists.length === 0) {
      artistsGrid.innerHTML = '<p class="no-results">No artists found</p>'
      document.getElementById("artists-results").classList.remove("hidden")
      resultsContainer.classList.remove("hidden")
      searchStatus.classList.add("hidden")
      return
    }

    // Get paginated results
    const paginatedArtists = artists.slice(0, resultsPerPage)

    // Create artist cards
    paginatedArtists.forEach((artist) => {
      const artistCard = document.createElement("div")
      artistCard.className = "artist-card"

      artistCard.innerHTML = `
                <div class="artist-image">
                    <img src="${artist.image || "/placeholder.svg?height=200&width=200"}" alt="${artist.name}">
                </div>
                <div class="artist-info">
                    <h3>${artist.name}</h3>
                    <p>${artist.followers} followers</p>
                </div>
            `

      // Add click event to navigate to artist page
      artistCard.addEventListener("click", () => {
        window.location.href = `artist.html?username=${artist.username}`
      })

      artistsGrid.appendChild(artistCard)
    })

    // Show more button if there are more results
    if (artists.length > resultsPerPage && moreArtistsBtn) {
      moreArtistsBtn.classList.remove("hidden")
    }

    // Show results container
    document.getElementById("artists-results").classList.remove("hidden")
    resultsContainer.classList.remove("hidden")
    searchStatus.classList.add("hidden")
  }

  function displayAlbumResults(albums) {
    if (!albumsGrid) return

    // Clear previous results
    albumsGrid.innerHTML = ""

    // Hide more button by default
    if (moreAlbumsBtn) moreAlbumsBtn.classList.add("hidden")

    // If no albums found
    if (albums.length === 0) {
      albumsGrid.innerHTML = '<p class="no-results">No albums found</p>'
      document.getElementById("albums-results").classList.remove("hidden")
      resultsContainer.classList.remove("hidden")
      searchStatus.classList.add("hidden")
      return
    }

    // Get paginated results
    const paginatedAlbums = albums.slice(0, resultsPerPage)

    // Create album cards
    paginatedAlbums.forEach((album) => {
      const albumCard = document.createElement("div")
      albumCard.className = "album-card"

      albumCard.innerHTML = `
                <div class="album-cover">
                    <img src="${album.cover || "/placeholder.svg?height=200&width=200"}" alt="${album.title}">
                    <div class="play-overlay">
                        <div class="play-button">
                            <i class="fas fa-play"></i>
                        </div>
                    </div>
                </div>
                <div class="album-info">
                    <div class="album-title">${album.title}</div>
                    <div class="album-artist">${album.artist}</div>
                </div>
            `

      // Add click event to navigate to album page
      albumCard.addEventListener("click", () => {
        window.location.href = `album.html?id=${album.id}`
      })

      // Add click event to play button
      const playButton = albumCard.querySelector(".play-button")
      playButton.addEventListener("click", (e) => {
        e.stopPropagation()

        // Create a track object for the player
        const track = {
          id: album.id,
          title: album.title,
          artist: album.artist,
          album: album.title,
          albumArt: album.cover || "/placeholder.svg?height=200&width=200",
          src: album.preview || "https://example.com/audio/track1.mp3", // Placeholder URL
        }

        // Call the global playAlbum function from player.js
        if (typeof window.playAlbum === "function") {
          window.playAlbum(track)
        }
      })

      albumsGrid.appendChild(albumCard)
    })

    // Show more button if there are more results
    if (albums.length > resultsPerPage && moreAlbumsBtn) {
      moreAlbumsBtn.classList.remove("hidden")
    }

    // Show results container
    document.getElementById("albums-results").classList.remove("hidden")
    resultsContainer.classList.remove("hidden")
    searchStatus.classList.add("hidden")
  }

  function displayTrackResults(tracks) {
    if (!tracksList) return

    // Clear previous results
    tracksList.innerHTML = ""

    // Hide more button by default
    if (moreTracksBtn) moreTracksBtn.classList.add("hidden")

    // If no tracks found
    if (tracks.length === 0) {
      tracksList.innerHTML = '<p class="no-results">No tracks found</p>'
      document.getElementById("tracks-results").classList.remove("hidden")
      resultsContainer.classList.remove("hidden")
      searchStatus.classList.add("hidden")
      return
    }

    // Get paginated results
    const paginatedTracks = tracks.slice(0, resultsPerPage)

    // Create track items
    paginatedTracks.forEach((track) => {
      const trackItem = document.createElement("div")
      trackItem.className = "track-item"

      trackItem.innerHTML = `
                <div class="track-image">
                    <img src="${track.albumArt || "/placeholder.svg?height=60&width=60"}" alt="${track.album}">
                    <div class="track-play-button">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
                <div class="track-details">
                    <div class="track-title">${track.title}</div>
                    <div class="track-artist">${track.artist}</div>
                </div>
                <div class="track-album">${track.album}</div>
                <div class="track-duration">${track.duration}</div>
            `

      // Add click event to play button
      const playButton = trackItem.querySelector(".track-play-button")
      playButton.addEventListener("click", () => {
        // Call the global playTrack function from player.js
        if (typeof window.playTrack === "function") {
          window.playTrack(track)
        } else {
          // Fallback if playTrack is not available
          console.log(`Playing: ${track.title} by ${track.artist}`)

          const playerBar = document.getElementById("player-bar")
          if (playerBar) {
            playerBar.classList.add("active")

            const miniPlayerToggle = document.getElementById("mini-player-toggle")
            if (miniPlayerToggle) {
              miniPlayerToggle.classList.add("active")
            }

            // Update player info
            const currentTrackEl = document.getElementById("current-track")
            const currentArtistEl = document.getElementById("current-artist")
            const currentAlbumArtEl = document.getElementById("current-album-art")

            if (currentTrackEl) currentTrackEl.textContent = track.title
            if (currentArtistEl) currentArtistEl.textContent = track.artist
            if (currentAlbumArtEl) currentAlbumArtEl.src = track.albumArt || "/placeholder.svg?height=50&width=50"
          }
        }
      })

      tracksList.appendChild(trackItem)
    })

    // Show more button if there are more results
    if (tracks.length > resultsPerPage && moreTracksBtn) {
      moreTracksBtn.classList.remove("hidden")
    }

    // Show results container
    document.getElementById("tracks-results").classList.remove("hidden")
    resultsContainer.classList.remove("hidden")
    searchStatus.classList.add("hidden")
  }

  function loadMoreResults(type) {
    // In a real app, this would fetch more results from the API
    // For demo purposes, we'll use the existing sample data

    switch (type) {
      case "artists":
        const artists = getSampleArtists().filter(
          (artist) =>
            artist.name.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
            (artist.bio && artist.bio.toLowerCase().includes(currentSearchQuery.toLowerCase())),
        )

        const startArtistIndex = currentPage * resultsPerPage - resultsPerPage
        const endArtistIndex = currentPage * resultsPerPage
        const moreArtists = artists.slice(startArtistIndex, endArtistIndex)

        // Append more artists
        moreArtists.forEach((artist) => {
          const artistCard = document.createElement("div")
          artistCard.className = "artist-card"

          artistCard.innerHTML = `
                        <div class="artist-image">
                            <img src="${artist.image || "/placeholder.svg?height=200&width=200"}" alt="${artist.name}">
                        </div>
                        <div class="artist-info">
                            <h3>${artist.name}</h3>
                            <p>${artist.followers} followers</p>
                        </div>
                    `

          // Add click event to navigate to artist page
          artistCard.addEventListener("click", () => {
            window.location.href = `artist.html?username=${artist.username}`
          })

          artistsGrid.appendChild(artistCard)
        })

        // Hide more button if no more results
        if (endArtistIndex >= artists.length) {
          moreArtistsBtn.classList.add("hidden")
        }
        break

      case "albums":
        const albums = getSampleAlbums().filter(
          (album) =>
            album.title.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
            album.artist.toLowerCase().includes(currentSearchQuery.toLowerCase()),
        )

        const startAlbumIndex = currentPage * resultsPerPage - resultsPerPage
        const endAlbumIndex = currentPage * resultsPerPage
        const moreAlbums = albums.slice(startAlbumIndex, endAlbumIndex)

        // Append more albums
        moreAlbums.forEach((album) => {
          const albumCard = document.createElement("div")
          albumCard.className = "album-card"

          albumCard.innerHTML = `
                        <div class="album-cover">
                            <img src="${album.cover || "/placeholder.svg?height=200&width=200"}" alt="${album.title}">
                            <div class="play-overlay">
                                <div class="play-button">
                                    <i class="fas fa-play"></i>
                                </div>
                            </div>
                        </div>
                        <div class="album-info">
                            <div class="album-title">${album.title}</div>
                            <div class="album-artist">${album.artist}</div>
                        </div>
                    `

          // Add click event to navigate to album page
          albumCard.addEventListener("click", () => {
            window.location.href = `album.html?id=${album.id}`
          })

          // Add click event to play button
          const playButton = albumCard.querySelector(".play-button")
          playButton.addEventListener("click", (e) => {
            e.stopPropagation()

            // Create a track object for the player
            const track = {
              id: album.id,
              title: album.title,
              artist: album.artist,
              album: album.title,
              albumArt: album.cover || "/placeholder.svg?height=200&width=200",
              src: album.preview || "https://example.com/audio/track1.mp3", // Placeholder URL
            }

            // Call the global playAlbum function from player.js
            if (typeof window.playAlbum === "function") {
              window.playAlbum(track)
            }
          })

          albumsGrid.appendChild(albumCard)
        })

        // Hide more button if no more results
        if (endAlbumIndex >= albums.length) {
          moreAlbumsBtn.classList.add("hidden")
        }
        break

      case "tracks":
        const tracks = getSampleTracks().filter(
          (track) =>
            track.title.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
            track.artist.toLowerCase().includes ||
            track.artist.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
            track.album.toLowerCase().includes(currentSearchQuery.toLowerCase()),
        )

        const startTrackIndex = currentPage * resultsPerPage - resultsPerPage
        const endTrackIndex = currentPage * resultsPerPage
        const moreTracks = tracks.slice(startTrackIndex, endTrackIndex)

        // Append more tracks
        moreTracks.forEach((track) => {
          const trackItem = document.createElement("div")
          trackItem.className = "track-item"

          trackItem.innerHTML = `
                        <div class="track-image">
                            <img src="${track.albumArt || "/placeholder.svg?height=60&width=60"}" alt="${track.album}">
                            <div class="track-play-button">
                                <i class="fas fa-play"></i>
                            </div>
                        </div>
                        <div class="track-details">
                            <div class="track-title">${track.title}</div>
                            <div class="track-artist">${track.artist}</div>
                        </div>
                        <div class="track-album">${track.album}</div>
                        <div class="track-duration">${track.duration}</div>
                    `

          // Add click event to play button
          const playButton = trackItem.querySelector(".track-play-button")
          playButton.addEventListener("click", () => {
            // Call the global playTrack function from player.js
            if (typeof window.playTrack === "function") {
              window.playTrack(track)
            } else {
              // Fallback if playTrack is not available
              console.log(`Playing: ${track.title} by ${track.artist}`)

              const playerBar = document.getElementById("player-bar")
              if (playerBar) {
                playerBar.classList.add("active")

                const miniPlayerToggle = document.getElementById("mini-player-toggle")
                if (miniPlayerToggle) {
                  miniPlayerToggle.classList.add("active")
                }

                // Update player info
                const currentTrackEl = document.getElementById("current-track")
                const currentArtistEl = document.getElementById("current-artist")
                const currentAlbumArtEl = document.getElementById("current-album-art")

                if (currentTrackEl) currentTrackEl.textContent = track.title
                if (currentArtistEl) currentArtistEl.textContent = track.artist
                if (currentAlbumArtEl) currentAlbumArtEl.src = track.albumArt || "/placeholder.svg?height=50&width=50"
              }
            }
          })

          tracksList.appendChild(trackItem)
        })

        // Hide more button if no more results
        if (endTrackIndex >= tracks.length) {
          moreTracksBtn.classList.add("hidden")
        }
        break
    }
  }

  function loadTrendingAlbums() {
    if (!trendingAlbums) return

    // In a real app, this would be an API call to get trending albums
    // For demo purposes, we'll use sample data
    const albums = getSampleAlbums().slice(0, 8)

    // Clear container
    trendingAlbums.innerHTML = ""

    // Create album cards
    albums.forEach((album) => {
      const albumCard = document.createElement("div")
      albumCard.className = "album-card"

      albumCard.innerHTML = `
                <div class="album-cover">
                    <img src="${album.cover || "/placeholder.svg?height=200&width=200"}" alt="${album.title}">
                    <div class="play-overlay">
                        <div class="play-button">
                            <i class="fas fa-play"></i>
                        </div>
                    </div>
                </div>
                <div class="album-info">
                    <div class="album-title">${album.title}</div>
                    <div class="album-artist">${album.artist}</div>
                </div>
            `

      // Add click event to navigate to album page
      albumCard.addEventListener("click", () => {
        window.location.href = `album.html?id=${album.id}`
      })

      // Add click event to play button
      const playButton = albumCard.querySelector(".play-button")
      playButton.addEventListener("click", (e) => {
        e.stopPropagation()

        // Create a track object for the player
        const track = {
          id: album.id,
          title: album.title,
          artist: album.artist,
          album: album.title,
          albumArt: album.cover || "/placeholder.svg?height=200&width=200",
          src: album.preview || "https://example.com/audio/track1.mp3", // Placeholder URL
        }

        // Call the global playAlbum function from player.js
        if (typeof window.playAlbum === "function") {
          window.playAlbum(track)
        }
      })

      trendingAlbums.appendChild(albumCard)
    })
  }

  // Sample data functions
  function getSampleArtists() {
    return [
      {
        id: 1,
        username: "lunar_eclipse",
        name: "Lunar Eclipse",
        image: "/placeholder.svg?height=200&width=200&text=Lunar+Eclipse",
        followers: 15234,
        genres: ["electronic", "ambient", "techno"],
        bio: "Electronic music producer crafting atmospheric soundscapes and deep rhythms.",
      },
      {
        id: 2,
        username: "urban_pulse",
        name: "Urban Pulse",
        image: "/placeholder.svg?height=200&width=200&text=Urban+Pulse",
        followers: 8756,
        genres: ["hip-hop", "electronic", "beat"],
        bio: "Hip-hop producer mixing classic beats with modern electronic elements.",
      },
      {
        id: 3,
        username: "crystal_echoes",
        name: "Crystal Echoes",
        image: "/placeholder.svg?height=200&width=200&text=Crystal+Echoes",
        followers: 12543,
        genres: ["ambient", "electronic", "experimental"],
        bio: "Ambient music composer creating ethereal soundscapes and peaceful atmospheres.",
      },
      {
        id: 4,
        username: "rock_rebels",
        name: "Rock Rebels",
        image: "/placeholder.svg?height=200&width=200&text=Rock+Rebels",
        followers: 9876,
        genres: ["rock", "alternative", "indie"],
        bio: "High-energy rock band with a modern twist on classic sounds.",
      },
      {
        id: 5,
        username: "jazz_journey",
        name: "Jazz Journey",
        image: "/placeholder.svg?height=200&width=200&text=Jazz+Journey",
        followers: 7654,
        genres: ["jazz", "fusion", "experimental"],
        bio: "Innovative jazz ensemble exploring the boundaries of the genre.",
      },
      {
        id: 6,
        username: "folk_tales",
        name: "Folk Tales",
        image: "/placeholder.svg?height=200&width=200&text=Folk+Tales",
        followers: 6543,
        genres: ["folk", "acoustic", "indie"],
        bio: "Storytelling through folk music with a modern sensibility.",
      },
      {
        id: 7,
        username: "classical_waves",
        name: "Classical Waves",
        image: "/placeholder.svg?height=200&width=200&text=Classical+Waves",
        followers: 5432,
        genres: ["classical", "contemporary", "instrumental"],
        bio: "Reimagining classical music for the modern era.",
      },
      {
        id: 8,
        username: "hip_hop_heroes",
        name: "Hip Hop Heroes",
        image: "/placeholder.svg?height=200&width=200&text=Hip+Hop+Heroes",
        followers: 11234,
        genres: ["hip-hop", "rap", "urban"],
        bio: "Authentic hip-hop collective keeping the true spirit of the genre alive.",
      },
      {
        id: 9,
        username: "electronic_dreams",
        name: "Electronic Dreams",
        image: "/placeholder.svg?height=200&width=200&text=Electronic+Dreams",
        followers: 9876,
        genres: ["electronic", "edm", "dance"],
        bio: "Creating electronic soundscapes that transport listeners to other worlds.",
      },
      {
        id: 10,
        username: "indie_innovators",
        name: "Indie Innovators",
        image: "/placeholder.svg?height=200&width=200&text=Indie+Innovators",
        followers: 7654,
        genres: ["indie", "alternative", "experimental"],
        bio: "Independent artists pushing the boundaries of music.",
      },
    ]
  }

  function getSampleAlbums() {
    return [
      {
        id: 101,
        title: "Midnight Synthesis",
        artist: "Lunar Eclipse",
        cover: "/placeholder.svg?height=300&width=300&text=Midnight+Synthesis",
        year: 2024,
        genre: "electronic",
        tracks: 12,
      },
      {
        id: 102,
        title: "Solar Winds",
        artist: "Lunar Eclipse",
        cover: "/placeholder.svg?height=300&width=300&text=Solar+Winds",
        year: 2023,
        genre: "ambient",
        tracks: 8,
      },
      {
        id: 201,
        title: "City Lights",
        artist: "Urban Pulse",
        cover: "/placeholder.svg?height=300&width=300&text=City+Lights",
        year: 2024,
        genre: "hip-hop",
        tracks: 10,
      },
      {
        id: 301,
        title: "Ethereal Dreams",
        artist: "Crystal Echoes",
        cover: "/placeholder.svg?height=300&width=300&text=Ethereal+Dreams",
        year: 2024,
        genre: "ambient",
        tracks: 9,
      },
      {
        id: 401,
        title: "Rock Revolution",
        artist: "Rock Rebels",
        cover: "/placeholder.svg?height=300&width=300&text=Rock+Revolution",
        year: 2023,
        genre: "rock",
        tracks: 11,
      },
      {
        id: 501,
        title: "Jazz Explorations",
        artist: "Jazz Journey",
        cover: "/placeholder.svg?height=300&width=300&text=Jazz+Explorations",
        year: 2024,
        genre: "jazz",
        tracks: 8,
      },
      {
        id: 601,
        title: "Stories Untold",
        artist: "Folk Tales",
        cover: "/placeholder.svg?height=300&width=300&text=Stories+Untold",
        year: 2023,
        genre: "folk",
        tracks: 12,
      },
      {
        id: 701,
        title: "Modern Classics",
        artist: "Classical Waves",
        cover: "/placeholder.svg?height=300&width=300&text=Modern+Classics",
        year: 2024,
        genre: "classical",
        tracks: 10,
      },
      {
        id: 801,
        title: "Urban Chronicles",
        artist: "Hip Hop Heroes",
        cover: "/placeholder.svg?height=300&width=300&text=Urban+Chronicles",
        year: 2023,
        genre: "hip-hop",
        tracks: 14,
      },
      {
        id: 901,
        title: "Digital Horizons",
        artist: "Electronic Dreams",
        cover: "/placeholder.svg?height=300&width=300&text=Digital+Horizons",
        year: 2024,
        genre: "electronic",
        tracks: 10,
      },
      {
        id: 1001,
        title: "Independent Thoughts",
        artist: "Indie Innovators",
        cover: "/placeholder.svg?height=300&width=300&text=Independent+Thoughts",
        year: 2023,
        genre: "indie",
        tracks: 9,
      },
    ]
  }

  function getSampleTracks() {
    return [
      {
        id: 1001,
        title: "Lunar Phase",
        artist: "Lunar Eclipse",
        album: "Midnight Synthesis",
        albumArt: "/placeholder.svg?height=60&width=60&text=Midnight+Synthesis",
        duration: "5:23",
        genre: "electronic",
      },
      {
        id: 1002,
        title: "Deep Space",
        artist: "Lunar Eclipse",
        album: "Midnight Synthesis",
        albumArt: "/placeholder.svg?height=60&width=60&text=Midnight+Synthesis",
        duration: "6:45",
        genre: "electronic",
      },
      {
        id: 1003,
        title: "Eclipse",
        artist: "Lunar Eclipse",
        album: "Midnight Synthesis",
        albumArt: "/placeholder.svg?height=60&width=60&text=Midnight+Synthesis",
        duration: "7:12",
        genre: "ambient",
      },
      {
        id: 1004,
        title: "Dawn",
        artist: "Lunar Eclipse",
        album: "Solar Winds",
        albumArt: "/placeholder.svg?height=60&width=60&text=Solar+Winds",
        duration: "4:56",
        genre: "ambient",
      },
      {
        id: 1005,
        title: "Horizon",
        artist: "Lunar Eclipse",
        album: "Solar Winds",
        albumArt: "/placeholder.svg?height=60&width=60&text=Solar+Winds",
        duration: "5:34",
        genre: "ambient",
      },
      {
        id: 2001,
        title: "Neon Streets",
        artist: "Urban Pulse",
        album: "City Lights",
        albumArt: "/placeholder.svg?height=60&width=60&text=City+Lights",
        duration: "3:45",
        genre: "hip-hop",
      },
      {
        id: 2002,
        title: "Midnight Drive",
        artist: "Urban Pulse",
        album: "City Lights",
        albumArt: "/placeholder.svg?height=60&width=60&text=City+Lights",
        duration: "4:12",
        genre: "hip-hop",
      },
      {
        id: 2003,
        title: "Urban Flow",
        artist: "Urban Pulse",
        album: "City Lights",
        albumArt: "/placeholder.svg?height=60&width=60&text=City+Lights",
        duration: "3:56",
        genre: "hip-hop",
      },
      {
        id: 3001,
        title: "Crystal Cave",
        artist: "Crystal Echoes",
        album: "Ethereal Dreams",
        albumArt: "/placeholder.svg?height=60&width=60&text=Ethereal+Dreams",
        duration: "6:23",
        genre: "ambient",
      },
      {
        id: 3002,
        title: "Echo Chamber",
        artist: "Crystal Echoes",
        album: "Ethereal Dreams",
        albumArt: "/placeholder.svg?height=60&width=60&text=Ethereal+Dreams",
        duration: "7:15",
        genre: "ambient",
      },
      {
        id: 3003,
        title: "Peaceful Mind",
        artist: "Crystal Echoes",
        album: "Ethereal Dreams",
        albumArt: "/placeholder.svg?height=60&width=60&text=Ethereal+Dreams",
        duration: "8:34",
        genre: "ambient",
      },
      {
        id: 4001,
        title: "Rock Anthem",
        artist: "Rock Rebels",
        album: "Rock Revolution",
        albumArt: "/placeholder.svg?height=60&width=60&text=Rock+Revolution",
        duration: "4:15",
        genre: "rock",
      },
      {
        id: 5001,
        title: "Jazz Improv",
        artist: "Jazz Journey",
        album: "Jazz Explorations",
        albumArt: "/placeholder.svg?height=60&width=60&text=Jazz+Explorations",
        duration: "7:45",
        genre: "jazz",
      },
      {
        id: 6001,
        title: "Folk Tale",
        artist: "Folk Tales",
        album: "Stories Untold",
        albumArt: "/placeholder.svg?height=60&width=60&text=Stories+Untold",
        duration: "5:12",
        genre: "folk",
      },
      {
        id: 7001,
        title: "Classical Reimagined",
        artist: "Classical Waves",
        album: "Modern Classics",
        albumArt: "/placeholder.svg?height=60&width=60&text=Modern+Classics",
        duration: "6:30",
        genre: "classical",
      },
    ]
  }
})

