const artistProfiles = [
  {
    id: 1,
    name: "Lunar Eclipse",
    username: "lunar_eclipse",
    location: "Berlin, Germany",
    bio: "Electronic music producer crafting atmospheric soundscapes and deep rhythms.",
    headerImage: "/placeholder.svg?height=350&width=1200&text=Lunar+Eclipse+Header",
    profileImage: "/placeholder.svg?height=300&width=300&text=Lunar",
    followers: 15234,
    genres: ["Electronic", "Ambient", "Techno"],
    socialLinks: {
      website: "https://lunareclipse.com",
      soundcloud: "https://soundcloud.com/lunareclipse",
      instagram: "https://instagram.com/lunareclipse",
    },
    albums: [
      {
        id: 101,
        title: "Midnight Synthesis",
        year: 2024,
        type: "Album",
        cover: "/placeholder.svg?height=300&width=300&text=Midnight+Synthesis",
        tracks: [
          { title: "Lunar Phase", duration: "5:23" },
          { title: "Deep Space", duration: "6:45" },
          { title: "Eclipse", duration: "7:12" },
        ],
      },
      {
        id: 102,
        title: "Solar Winds",
        year: 2023,
        type: "EP",
        cover: "/placeholder.svg?height=300&width=300&text=Solar+Winds",
        tracks: [
          { title: "Dawn", duration: "4:56" },
          { title: "Horizon", duration: "5:34" },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "Urban Pulse",
    username: "urban_pulse",
    location: "London, UK",
    bio: "Hip-hop producer mixing classic beats with modern electronic elements.",
    headerImage: "/placeholder.svg?height=350&width=1200&text=Urban+Pulse+Header",
    profileImage: "/placeholder.svg?height=300&width=300&text=Urban",
    followers: 8756,
    genres: ["Hip-Hop", "Electronic", "Beat"],
    socialLinks: {
      website: "https://urbanpulse.com",
      soundcloud: "https://soundcloud.com/urbanpulse",
      instagram: "https://instagram.com/urbanpulse",
    },
    albums: [
      {
        id: 201,
        title: "City Lights",
        year: 2024,
        type: "Album",
        cover: "/placeholder.svg?height=300&width=300&text=City+Lights",
        tracks: [
          { title: "Neon Streets", duration: "3:45" },
          { title: "Midnight Drive", duration: "4:12" },
          { title: "Urban Flow", duration: "3:56" },
        ],
      },
    ],
  },
  {
    id: 3,
    name: "Crystal Echoes",
    username: "crystal_echoes",
    location: "Tokyo, Japan",
    bio: "Ambient music composer creating ethereal soundscapes and peaceful atmospheres.",
    headerImage: "/placeholder.svg?height=350&width=1200&text=Crystal+Echoes+Header",
    profileImage: "/placeholder.svg?height=300&width=300&text=Crystal",
    followers: 12543,
    genres: ["Ambient", "Electronic", "Experimental"],
    socialLinks: {
      website: "https://crystalechoes.com",
      soundcloud: "https://soundcloud.com/crystalechoes",
      instagram: "https://instagram.com/crystalechoes",
    },
    albums: [
      {
        id: 301,
        title: "Ethereal Dreams",
        year: 2024,
        type: "Album",
        cover: "/placeholder.svg?height=300&width=300&text=Ethereal+Dreams",
        tracks: [
          { title: "Crystal Cave", duration: "6:23" },
          { title: "Echo Chamber", duration: "7:15" },
          { title: "Peaceful Mind", duration: "8:34" },
        ],
      },
    ],
  },
]

export default artistProfiles

