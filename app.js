const m3uUrl = 'https://raw.githubusercontent.com/mhfzkobir/allinone-special-playlist.m3u/main/TataTv.m3u';
let channels = [];
const channelContainer = document.getElementById('channel-container');
const searchInput = document.getElementById('search');
const categorySelect = document.getElementById('category');
const playbackStats = {};

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
      if (url.endsWith('.m3u8')) {
        currentChannel.url = url;
        channels.push(currentChannel);
      }
    }
  });

  displayChannels(channels);
  populateCategories();
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
    card.addEventListener('click', () => openPlayerPopup(channel.url, channel.name));
    channelContainer.appendChild(card);
  });
}

// Open Player Popup
function openPlayerPopup(url, channelName) {
  trackPlayback(channelName);
  const popup = window.open('', '_blank', 'width=1920,height=1080,resizable=yes');
  popup.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Player</title>
      <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
    </head>
    <body>
      <video id="video" controls autoplay></video>
      <script>
        const video = document.getElementById('video');
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource('${url}');
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = '${url}';
        }
      </script>
    </body>
    </html>
  `);
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

  categorySelect.addEventListener('change', () => {
    const selectedCategory = categorySelect.value;
    const filteredChannels = selectedCategory === 'all'
      ? channels
      : channels.filter((channel) => channel.category === selectedCategory);
    displayChannels(filteredChannels);
  });
}

// Advanced Search
function advancedSearch() {
  const searchTerm = searchInput.value.toLowerCase();
  const countryTerm = document.getElementById('country').value.toLowerCase();
  const qualityTerm = document.getElementById('quality').value.toLowerCase();

  const filteredChannels = channels.filter((channel) => {
    const matchesSearch = channel.name.toLowerCase().includes(searchTerm);
    const matchesCountry = channel.category.toLowerCase().includes(countryTerm);
    const matchesQuality = channel.name.toLowerCase().includes(qualityTerm);
    return matchesSearch && matchesCountry && matchesQuality;
  });

  displayChannels(filteredChannels);
}

searchInput.addEventListener('input', advancedSearch);
document.getElementById('country').addEventListener('input', advancedSearch);
document.getElementById('quality').addEventListener('input', advancedSearch);

// Playback Analytics
function trackPlayback(channelName) {
  playbackStats[channelName] = (playbackStats[channelName] || 0) + 1;
  console.log(`${channelName} played ${playbackStats[channelName]} times.`);
}

fetchChannels();
