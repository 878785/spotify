const playlists = [
  {
    title: "🎧 Daily Mix 1",
    tracks: [
      "4bHsxqR3GMrXTxEPLuK5ue",
      "6rqhFgbbKwnb9MLmUQDhG6",
      "2kh8cFMzvVtU5zJkw6zEzE",
      "1QhcBKt0schkJBhiZx6lxn",
      "7eNSk0grNnO7MqjLZzs6MM",
      "6Gk3mU3np8miLUtZjoIVCu",
      "0FMend2Dt9IUVDDtAPnLxO",
      "4Zzw8CESa97fNrmrvEdIuL",
      "5G7pZ8G8NFvS1MQ9H4L7dC",
      "7iLA6PQeQWRjLDHOJgGpj5",
      "3HiobOOpSpMsi95WBKPBYk",
      "0iXLwnLmLwn9y54JtBTNxY",
      "2LcXJP95e4HKydTZ2mYfrx"
    ]
  },
  {
    title: "🧘 AI Chill Beats",
    tracks: [
      "1lDWb6b6ieDQ2xT7ewTC3G",
      "3dYD57lRAUcMHufyqn9GcI",
      "2zZfljLOdd7zPbwVG1MXJP",
      "6CpC8qSInlDnEYcCzJFtXV",
      "208TLLdXoBOyhOr4zknvRX",
      "7gjaJ3UDCITdzclyDd30gC",
      "3Sfn0HdR4VEaAWZ97ipbHn",
      "4rmiJ39A6d9OIRrL3xGmaD",
      "5VgAvXQ7Btr4mRroJQtI8E",
      "2cPUB8EOT6AfJ8oxhyoNXL",
      "4UMIv5jd9gK98a39BQRD9X",
      "48Ix6ReYdJf2H4mKb3TIpj",
      "1EjxJHY9A6LMOlvyZdwDly"
    ]
  },
  {
    title: "🇮🇳 Top Hits India",
    tracks: [
      "5AnWrUzsrFgBvhn6dUElnr",
      "4vHRQnzGcKEtqsLH70tAms",
      "67u2VDnIGjc9wYxSaUaUvt",
      "3vCzLB6kS2lGcIpm1OOUsy",
      "0M0ANKNzmM4Odd7FNKghzW",
      "5VUGcMfS9El8R39tSmBNxo",
      "4ulroyDK6rNrmrvEdIuL",
      "2ceeTJAzKy295Fm0VsaXtE",
      "2oJxsbdvHuzkQ44hoyMsis",
      "32U1XMh3DKlm45uvpofhvY",
      "517bz7zkWELmyL4eZzJ5R9",
      "043SPVu75TXbs94ZfM9dfn"
    ]
  }
];

const container = document.getElementById('playlist-container');
const searchBar = document.getElementById('search-bar');
const clearButton = document.getElementById('clear-search');
const playerBar = document.getElementById('player-bar');
const currentSongTitle = document.getElementById('current-song-title');
const currentPlaylistTitle = document.getElementById('current-playlist-title');
const playPauseBtn = document.getElementById('play-pause-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');

let currentPlaylistIndex = -1;
let currentTrackIndex = -1;
let currentIframe = null;
let isPlaying = false;
let progressInterval;
const ASSUMED_SONG_DURATION = 180; // 3 minutes in seconds

// Simulated song titles (since Spotify API isn't integrated)
const songTitles = {
  "4bHsxqR3GMrXTxEPLuK5ue": "Song 1 - Daily Mix",
  "6rqhFgbbKwnb9MLmUQDhG6": "Song 2 - Daily Mix",
  // Add more mappings as needed
};

// Build playlist cards
playlists.forEach((playlist, index) => {
  const card = document.createElement('div');
  card.className = 'playlist-card';

  const title = document.createElement('div');
  title.className = 'playlist-title';
  title.textContent = playlist.title;
  card.appendChild(title);

  const mainTrack = document.createElement('iframe');
  mainTrack.className = 'song-frame';
  mainTrack.src = `https://open.spotify.com/embed/track/${playlist.tracks[0]}?utm_source=generator`;
  mainTrack.height = "80";
  mainTrack.dataset.playlistIndex = index;
  mainTrack.dataset.trackIndex = 0;
  mainTrack.addEventListener('click', () => playTrack(index, 0, mainTrack));
  card.appendChild(mainTrack);

  const extraSongs = document.createElement('div');
  extraSongs.className = 'extra-songs';
  extraSongs.id = `playlist${index}`;
  extraSongs.style.display = 'none';

  playlist.tracks.slice(1).forEach((trackId, trackIndex) => {
    const iframe = document.createElement('iframe');
    iframe.className = 'song-frame';
    iframe.src = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator`;
    iframe.height = "80";
    iframe.dataset.playlistIndex = index;
    iframe.dataset.trackIndex = trackIndex + 1;
    iframe.addEventListener('click', () => playTrack(index, trackIndex + 1, iframe));
    extraSongs.appendChild(iframe);
  });

  card.appendChild(extraSongs);

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'toggle-btn';
  toggleBtn.textContent = 'Show More Songs';
  toggleBtn.onclick = () => {
    const isVisible = extraSongs.style.display === 'block';
    extraSongs.style.display = isVisible ? 'none' : 'block';
    toggleBtn.textContent = isVisible ? 'Show More Songs' : 'Hide Songs';
  };

  card.appendChild(toggleBtn);
  container.appendChild(card);
});

// Search functionality
searchBar.addEventListener("input", (e) => {
  clearButton.style.display = e.target.value ? "block" : "none";
  filterPlaylists(e.target.value);
});

clearButton.addEventListener("click", () => {
  searchBar.value = "";
  clearButton.style.display = "none";
  displayPlaylists(playlists);
});

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

searchBar.addEventListener("input", debounce((e) => {
  filterPlaylists(e.target.value);
}, 300));

function filterPlaylists(query) {
  const filtered = playlists.filter(playlist => 
    playlist.title.toLowerCase().includes(query.toLowerCase())
  );
  displayPlaylists(filtered);
}

function displayPlaylists(playlistsToShow) {
  // Stop current song when re-rendering playlists
  stopCurrentTrack();
  container.innerHTML = '';
  playlistsToShow.forEach((playlist, index) => {
    const card = document.createElement('div');
    card.className = 'playlist-card';

    const title = document.createElement('div');
    title.className = 'playlist-title';
    title.textContent = playlist.title;
    card.appendChild(title);

    const mainTrack = document.createElement('iframe');
    mainTrack.className = 'song-frame';
    mainTrack.src = `https://open.spotify.com/embed/track/${playlist.tracks[0]}?utm_source=generator`;
    mainTrack.height = "80";
    mainTrack.dataset.playlistIndex = index;
    mainTrack.dataset.trackIndex = 0;
    mainTrack.addEventListener('click', () => playTrack(index, 0, mainTrack));
    card.appendChild(mainTrack);

    const extraSongs = document.createElement('div');
    extraSongs.className = 'extra-songs';
    extraSongs.id = `playlist${index}`;
    extraSongs.style.display = 'none';

    playlist.tracks.slice(1).forEach((trackId, trackIndex) => {
      const iframe = document.createElement('iframe');
      iframe.className = 'song-frame';
      iframe.src = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator`;
      iframe.height = "80";
      iframe.dataset.playlistIndex = index;
      iframe.dataset.trackIndex = trackIndex + 1;
      iframe.addEventListener('click', () => playTrack(index, trackIndex + 1, iframe));
      extraSongs.appendChild(iframe);
    });

    card.appendChild(extraSongs);

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggle-btn';
    toggleBtn.textContent = 'Show More Songs';
    toggleBtn.onclick = () => {
      const isVisible = extraSongs.style.display === 'block';
      extraSongs.style.display = isVisible ? 'none' : 'block';
      toggleBtn.textContent = isVisible ? 'Show More Songs' : 'Hide Songs';
    };

    card.appendChild(toggleBtn);
    container.appendChild(card);
  });
}

// Player controls
function playTrack(playlistIndex, trackIndex, iframe) {
  // Stop the current track if playing
  stopCurrentTrack();

  currentPlaylistIndex = playlistIndex;
  currentTrackIndex = trackIndex;
  currentIframe = iframe;
  isPlaying = true;

  const trackId = playlists[playlistIndex].tracks[trackIndex];
  currentSongTitle.textContent = songTitles[trackId] || `Track ${trackIndex + 1}`;
  currentPlaylistTitle.textContent = playlists[playlistIndex].title;
  playerBar.style.display = 'flex';
  playPauseBtn.textContent = '❚❚';

  // Reset progress
  progressBar.value = 0;
  currentTimeEl.textContent = '0:00';
  startProgress();
}

function stopCurrentTrack() {
  if (currentIframe) {
    // Reset the src to stop playback
    const src = currentIframe.src;
    currentIframe.src = ''; // Unload iframe
    currentIframe.src = src; // Restore src to allow replay
  }
  clearInterval(progressInterval);
  isPlaying = false;
  currentIframe = null;
  playPauseBtn.textContent = '▶';
}

function startProgress() {
  clearInterval(progressInterval);
  let currentTime = 0;
  progressInterval = setInterval(() => {
    if (!isPlaying) return;
    currentTime += 1;
    const progressPercent = (currentTime / ASSUMED_SONG_DURATION) * 100;
    progressBar.value = progressPercent;
    currentTimeEl.textContent = formatTime(currentTime);
    if (currentTime >= ASSUMED_SONG_DURATION) {
      nextTrack();
    }
  }, 1000);
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

playPauseBtn.addEventListener('click', () => {
  if (currentIframe) {
    isPlaying = !isPlaying;
    playPauseBtn.textContent = isPlaying ? '❚❚' : '▶';
    if (isPlaying) {
      currentIframe.src = currentIframe.src; // Reload iframe to resume
      startProgress();
    } else {
      stopCurrentTrack();
    }
  }
});

nextBtn.addEventListener('click', nextTrack);
prevBtn.addEventListener('click', prevTrack);

function nextTrack() {
  if (currentPlaylistIndex === -1) return;
  stopCurrentTrack();
  currentTrackIndex = (currentTrackIndex + 1) % playlists[currentPlaylistIndex].tracks.length;
  const newIframe = document.querySelector(`.song-frame[data-playlist-index="${currentPlaylistIndex}"][data-track-index="${currentTrackIndex}"]`);
  if (newIframe) {
    playTrack(currentPlaylistIndex, currentTrackIndex, newIframe);
  }
}

function prevTrack() {
  if (currentPlaylistIndex === -1) return;
  stopCurrentTrack();
  currentTrackIndex = (currentTrackIndex - 1 + playlists[currentPlaylistIndex].tracks.length) % playlists[currentPlaylistIndex].tracks.length;
  const newIframe = document.querySelector(`.song-frame[data-playlist-index="${currentPlaylistIndex}"][data-track-index="${currentTrackIndex}"]`);
  if (newIframe) {
    playTrack(currentPlaylistIndex, currentTrackIndex, newIframe);
  }
}

progressBar.addEventListener('input', (e) => {
  const progressPercent = e.target.value;
  const currentTime = (progressPercent / 100) * ASSUMED_SONG_DURATION;
  currentTimeEl.textContent = formatTime(currentTime);
});