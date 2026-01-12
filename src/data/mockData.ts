export interface Film {
  id: number;
  title: string;
  originalTitle?: string;
  year: number;
  director: string;
  directorId: number;
  synopsis: string;
  genres: string[];
  runtime: number;
  posterUrl: string;
  backdropUrl: string;
  rating: number;
  cast: { name: string; character: string; photoUrl?: string }[];
}

export interface ContentItem {
  id: string;
  type: 'book' | 'documentary' | 'youtube' | 'podcast' | 'article' | 'interview';
  title: string;
  description: string;
  source: string;
  url: string;
  imageUrl?: string;
  author?: string;
  duration?: string;
  date?: string;
  channel?: string;
}

export const mockFilm: Film = {
  id: 1,
  title: "Blade Runner 2049",
  originalTitle: "Blade Runner 2049",
  year: 2017,
  director: "Denis Villeneuve",
  directorId: 1,
  synopsis: "Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who's been missing for thirty years.",
  genres: ["Science Fiction", "Drama", "Mystery"],
  runtime: 164,
  posterUrl: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
  backdropUrl: "https://image.tmdb.org/t/p/original/sAtoMqDVhNDQBc3QJL3RF6hlhGq.jpg",
  rating: 7.5,
  cast: [
    { name: "Ryan Gosling", character: "K", photoUrl: "https://image.tmdb.org/t/p/w185/lyUyVARQKhGxaxy0FbPJCQRpiaW.jpg" },
    { name: "Harrison Ford", character: "Rick Deckard", photoUrl: "https://image.tmdb.org/t/p/w185/5M7oN3sznp99hWYQ9sX0xheswWX.jpg" },
    { name: "Ana de Armas", character: "Joi", photoUrl: "https://image.tmdb.org/t/p/w185/3vxvsmYLTf4jnr163SUlBIw51ee.jpg" },
    { name: "Jared Leto", character: "Niander Wallace", photoUrl: "https://image.tmdb.org/t/p/w185/ca3x0OfIKIxNxoOvc3GMj8OGm0A.jpg" },
  ],
};

export const mockBooks: ContentItem[] = [
  {
    id: "book-1",
    type: "book",
    title: "The Art and Soul of Blade Runner 2049",
    description: "An in-depth exploration of the visual design, world-building, and artistic vision behind Denis Villeneuve's masterpiece.",
    source: "Titan Books",
    url: "#",
    imageUrl: "https://images-na.ssl-images-amazon.com/images/I/91JaO7RHELL.jpg",
    author: "Tanya Lapointe",
    date: "2017",
  },
  {
    id: "book-2",
    type: "book",
    title: "Do Androids Dream of Electric Sheep?",
    description: "Philip K. Dick's classic novel that inspired the Blade Runner films. A haunting exploration of what it means to be human.",
    source: "Del Rey",
    url: "#",
    imageUrl: "https://images-na.ssl-images-amazon.com/images/I/91gBpW0gZ3L.jpg",
    author: "Philip K. Dick",
    date: "1968",
  },
  {
    id: "book-3",
    type: "book",
    title: "Future Noir: The Making of Blade Runner",
    description: "The definitive account of the making of the original Blade Runner, essential context for understanding the sequel.",
    source: "Dey Street Books",
    url: "#",
    author: "Paul M. Sammon",
    date: "2017",
  },
];

export const mockDocumentaries: ContentItem[] = [
  {
    id: "doc-1",
    type: "documentary",
    title: "Blade Runner 2049: To Be Human",
    description: "A behind-the-scenes documentary exploring the themes of humanity and identity in Denis Villeneuve's vision.",
    source: "Warner Bros",
    url: "#",
    duration: "45 min",
  },
  {
    id: "doc-2",
    type: "documentary",
    title: "Designing the World of Blade Runner 2049",
    description: "Production designers discuss creating the dystopian Los Angeles and Las Vegas of 2049.",
    source: "Warner Bros",
    url: "#",
    duration: "32 min",
  },
];

export const mockYouTubeVideos: ContentItem[] = [
  {
    id: "yt-1",
    type: "youtube",
    title: "Blade Runner 2049 — Examining the Relationship Between K and Joi",
    description: "A deep analysis of one of the most complex relationships in modern science fiction cinema.",
    source: "YouTube",
    url: "#",
    imageUrl: "https://i.ytimg.com/vi/example1/maxresdefault.jpg",
    channel: "Like Stories of Old",
    duration: "24:15",
  },
  {
    id: "yt-2",
    type: "youtube",
    title: "The Cinematography of Blade Runner 2049",
    description: "How Roger Deakins created one of the most visually stunning films ever made, frame by frame.",
    source: "YouTube",
    url: "#",
    channel: "Every Frame a Painting",
    duration: "18:42",
  },
  {
    id: "yt-3",
    type: "youtube",
    title: "Blade Runner 2049: What Makes It A Masterpiece",
    description: "Exploring why Blade Runner 2049 succeeds as both a sequel and a standalone work of art.",
    source: "YouTube",
    url: "#",
    channel: "Nerdwriter1",
    duration: "12:08",
  },
  {
    id: "yt-4",
    type: "youtube",
    title: "The Philosophy of Blade Runner 2049",
    description: "Existentialism, memory, and the search for meaning in Villeneuve's sci-fi epic.",
    source: "YouTube",
    url: "#",
    channel: "Wisecrack",
    duration: "15:33",
  },
];

export const mockPodcasts: ContentItem[] = [
  {
    id: "pod-1",
    type: "podcast",
    title: "Denis Villeneuve on Creating Blade Runner 2049",
    description: "The director discusses his approach to continuing Ridley Scott's legacy while creating something new.",
    source: "The Director's Cut Podcast",
    url: "#",
    duration: "1h 12min",
    date: "Oct 2017",
  },
  {
    id: "pod-2",
    type: "podcast",
    title: "The Sound Design of Blade Runner 2049",
    description: "Hans Zimmer and Benjamin Wallfisch break down the film's iconic soundtrack and sound design.",
    source: "Song Exploder",
    url: "#",
    duration: "45 min",
    date: "Nov 2017",
  },
  {
    id: "pod-3",
    type: "podcast",
    title: "Roger Deakins on Shooting Blade Runner 2049",
    description: "The legendary cinematographer discusses his Oscar-winning work on the film.",
    source: "Team Deakins",
    url: "#",
    duration: "58 min",
    date: "Dec 2017",
  },
];

export const mockArticles: ContentItem[] = [
  {
    id: "art-1",
    type: "article",
    title: "Blade Runner 2049: A Worthy Successor",
    description: "How Denis Villeneuve managed to create a sequel that honors the original while standing on its own.",
    source: "Cahiers du Cinéma",
    url: "#",
    author: "Jean-Michel Frodon",
    date: "October 2017",
  },
  {
    id: "art-2",
    type: "article",
    title: "The Production Design of Blade Runner 2049",
    description: "An in-depth look at how the team created the film's stunning dystopian world.",
    source: "IndieWire",
    url: "#",
    author: "Bill Desowitz",
    date: "October 2017",
  },
  {
    id: "art-3",
    type: "article",
    title: "Why Blade Runner 2049 Failed at the Box Office",
    description: "Despite critical acclaim, the film underperformed commercially. Here's what happened.",
    source: "Variety",
    url: "#",
    author: "Brent Lang",
    date: "October 2017",
  },
];

export const mockInterviews: ContentItem[] = [
  {
    id: "int-1",
    type: "interview",
    title: "Ryan Gosling on Playing K",
    description: "The actor discusses his approach to portraying a character searching for identity and purpose.",
    source: "The Hollywood Reporter",
    url: "#",
    date: "October 2017",
  },
  {
    id: "int-2",
    type: "interview",
    title: "Harrison Ford Returns to Blade Runner",
    description: "Ford reflects on reprising his role as Deckard after 35 years.",
    source: "Empire Magazine",
    url: "#",
    date: "September 2017",
  },
  {
    id: "int-3",
    type: "interview",
    title: "Ana de Armas on the Challenges of Playing Joi",
    description: "The actress discusses bringing the holographic AI companion to life.",
    source: "Vanity Fair",
    url: "#",
    date: "October 2017",
  },
];

export const popularFilms: Film[] = [
  {
    id: 2,
    title: "Parasite",
    year: 2019,
    director: "Bong Joon-ho",
    directorId: 2,
    synopsis: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    genres: ["Thriller", "Drama", "Comedy"],
    runtime: 132,
    posterUrl: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg",
    rating: 8.5,
    cast: [],
  },
  {
    id: 3,
    title: "Dune",
    year: 2021,
    director: "Denis Villeneuve",
    directorId: 1,
    synopsis: "Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe.",
    genres: ["Science Fiction", "Adventure"],
    runtime: 155,
    posterUrl: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/jYEW5xZkZk2WTrdbMGAPFuBqbDc.jpg",
    rating: 8.0,
    cast: [],
  },
  {
    id: 4,
    title: "The Grand Budapest Hotel",
    year: 2014,
    director: "Wes Anderson",
    directorId: 3,
    synopsis: "A writer encounters the owner of an aging high-class hotel, who tells him of his early years serving as a lobby boy in the hotel's glorious years.",
    genres: ["Comedy", "Drama"],
    runtime: 99,
    posterUrl: "https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/nX5XotM9yprCKarRH4fzOq1VM1.jpg",
    rating: 8.1,
    cast: [],
  },
  {
    id: 5,
    title: "Mulholland Drive",
    year: 2001,
    director: "David Lynch",
    directorId: 4,
    synopsis: "After a car wreck on the winding Mulholland Drive renders a woman amnesiac, she and a perky Hollywood-hopeful search for clues and answers.",
    genres: ["Mystery", "Drama", "Thriller"],
    runtime: 147,
    posterUrl: "https://image.tmdb.org/t/p/w500/tVxGt7uffLVhIIcwuldXOMpFBPX.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/7q3n6HPDdBNPjKAuJo8CGpHxD3K.jpg",
    rating: 7.9,
    cast: [],
  },
];
