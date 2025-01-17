document.addEventListener("DOMContentLoaded", function() {
  // Sample M3U data URL (replace with your actual M3U URL or path)
  const m3uUrl = "path_to_your_m3u_file.m3u";

  // Function to fetch and parse M3U data
  async function fetchM3UData() {
    try {
      const response = await fetch(m3uUrl);
      const m3uData = await response.text();
      const categories = parseM3UData(m3uData);
      displayCategories(categories);
    } catch (error) {
      console.error("Error fetching M3U data:", error);
    }
  }

  // Function to parse M3U data and extract categories
  function parseM3UData(m3uData) {
    const categories = [];
    const lines = m3uData.split("\n");

    let currentCategory = null;
    
    // Loop through M3U lines
    lines.forEach(line => {
      // Check if line contains a category
      if (line.startsWith("#EXTINF:")) {
        const categoryName = line.split(",")[1].trim();
        const groupLogo = line.match(/group-logo="([^"]+)"/);
        
        if (categoryName) {
          // Add category details to the list
          categories.push({
            name: categoryName,
            logo: groupLogo ? groupLogo[1] : null
          });
        }
      }
    });

    return categories;
  }

  // Function to display categories in the category container
  function displayCategories(categories) {
    const categoryContainer = document.getElementById("category-container");

    // Clear any existing categories
    categoryContainer.innerHTML = "";

    categories.forEach(category => {
      const categoryCard = document.createElement("div");
      categoryCard.classList.add("category-card");

      // Add category logo
      if (category.logo) {
        const img = document.createElement("img");
        img.src = category.logo; // Assuming group-logo is a valid URL
        img.alt = `${category.name} logo`;
        categoryCard.appendChild(img);
      }

      // Add category name
      const categoryName = document.createElement("span");
      categoryName.classList.add("category-name");
      categoryName.textContent = category.name;
      categoryCard.appendChild(categoryName);

      // Add event listener for category selection (optional)
      categoryCard.addEventListener("click", function() {
        filterChannelsByCategory(category.name);
      });

      categoryContainer.appendChild(categoryCard);
    });
  }

  // Function to filter channels by category (based on selected category)
  function filterChannelsByCategory(categoryName) {
    const channelContainer = document.getElementById("channel-container");
    // This function can filter and display channels based on the selected category
    // You will need to implement channel filtering logic based on your M3U data
    console.log(`Filtering channels for category: ${categoryName}`);
  }

  // Fetch and display categories when page is loaded
  fetchM3UData();
});
