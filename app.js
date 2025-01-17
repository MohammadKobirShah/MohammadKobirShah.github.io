document.addEventListener("DOMContentLoaded", function () {
  const player = new Plyr('#player'); // Initialize Plyr.js
  const video = document.getElementById('player');
  const channelContainer = document.getElementById('channel-container');

  const m3uUrl = "https://raw.githubusercontent.com/mhfzkobir/allinone-special-playlist.m3u/refs/heads/main/TataTv.m3u";

  // Function to fetch and parse M3U playlist
  async function fetchAndParseM3U(url) {
    try {
      const response = await fetch(url);
      const m3uData = await response.text();
      const channels = parseM3UData(m3uData);
      displayChannels(channels);
    } catch (error) {
      console.error("Failed to fetch M3U file:", error);
    }
  }

  // Function to parse M3U data into channel objects
  function parseM3UData(data) {
    const lines = data.split("\n");
    const channels = [];

    let currentChannel = {};
    lines.forEach((line) => {
      if (line.startsWith("#EXTINF")) {
        const info = line.split(",")[1];
        currentChannel.name = info ? info.trim() : "Unknown Channel";
      } else if (line.startsWith("http")) {
        currentChannel.url = line.trim();
        if (currentChannel.name && currentChannel.url) {
          channels.push(currentChannel);
          currentChannel = {}; // Reset for the next channel
        }
      }
    });

    return channels;
  }

  // Function to display channels on the UI
  function displayChannels(channels) {
    channelContainer.innerHTML = ""; // Clear previous content
    channels.forEach((channel) => {
      const channelCard = document.createElement("div");
      channelCard.classList.add("channel-card");

      // Optional: Placeholder image or fetch from external source
      const channelLogo = `https://via.placeholder.com/200x100?text=${encodeURIComponent(channel.name)}`;

      channelCard.innerHTML = `
        <img src="${channelLogo}" alt="${channel.name}" />
        <div class="channel-name">${channel.name}</div>
      `;

      channelCard.addEventListener("click", () => playChannel(channel.url));
      channelContainer.appendChild(channelCard);
    });
  }

  // Function to play the selected channel
  function playChannel(url) {
    if (url.endsWith('.m3u') || url.endsWith('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play();
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.play();
      } else {
        console.error("HLS not supported in this browser.");
      }
    } else {
      video.src = url;
      video.play();
    }
  }

  // Fetch and display channels
  fetchAndParseM3U(m3uUrl);
});
