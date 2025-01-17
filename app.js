const m3uUrl = 'https://raw.githubusercontent.com/mhfzkobir/allinone-special-playlist.m3u/main/TataTv.m3u';
let channels = [];
const channelContainer = document.getElementById('channel-container');
const searchInput = document.getElementById('search');
const categorySelect = document.getElementById('category');

// Fetch and parse M3U
async function fetchChannels() {
  try {
    const response = await fetch(m3uUrl);
    if (!response.ok) throw new Error('Failed to fetch channels.');
    const text = await response.text();
    parseM3U(text);
  } catch (error) {
    displayErrorMessage(error.message);
  }
}

// Parse M3U
function parseM3U(m3uContent) {
  const lines = m3uContent.split('\n');
  let currentChannel = {};

  lines.forEach((line) => {
    if (line.startsWith('#EXTINF')) {
      const matchGroup = line.match(/group-title="([^"]+)"/);
      const matchLogo = line.match(/tvg-logo="([^"]+)"/);
      const channelName = line.split(',').pop();

      currentChannel = {
        name: channelName.trim(),
        url: null,
        category: matchGroup ? matchGroup[1] : 'Uncategorized',
        logo: matchLogo ? matchLogo[1] : null,
      };
    } else if (line.trim() && !line.startsWith('#')) {
      const url = line.trim();
      if (isPlayableUrl(url)) {
        currentChannel.url = url;
        channels.push(currentChannel);
      }
    }
  });

  displayChannels(channels);
  populateCategories();
}

// Helper: Valid URL
function isPlayableUrl(url) {
  return /(mpd|m3u|m3u8|php\?id=)/i.test(url);
}

// Display Channels
function displayChannels(channelList) {
  channelContainer.innerHTML = '';
  channelList.forEach((channel) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
      ${channel.logo ? `<img src="${channel.logo}" alt="${channel.name} Logo">` : ''}
      <h3>${channel.name}</h3>
    `;
    card.addEventListener('click', () => openPlayerPopup(channel.url));
    channelContainer.appendChild(card);
  });
}

// Categories Dropdown
function populateCategories() {
  const categories = [...new Set(channels.map((channel) => channel.category))];
  categorySelect.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

// Error Message
function displayErrorMessage(message) {
  channelContainer.innerHTML = `<div class="error-message">${message}</div>`;
}

// Player Popup
function openPlayerPopup(url) {
  const popup = window.open('', '_blank', 'width=1920,height=1080,resizable=yes');
  popup.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Player</title>
      <link rel="stylesheet" href="https://orcl.drmlive.au/jiocinema/player.css">
      <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
      <script src="https://cdn.dashjs.org/latest/dash.all.min.js"></script>
    </head>
    <body>
      <video id="video" controls></video>
      <script>
        const video = document.getElementById('video');
        if (url.endsWith('.m3u8')) {
          const hls = new Hls();
          hls.loadSource('${url}');
          hls.attachMedia(video);
        } else if (url.endsWith('.mpd')) {
          const player = dashjs.MediaPlayer().create();
          player.initialize(video, '${url}', true);
        }
      </script>
    </body>
    </html>
  `);
}

// Initialize
fetchChannels();
