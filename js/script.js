// Find our date picker inputs, button, and modal elements on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesBtn = document.getElementById('getImagesBtn');
const gallery = document.getElementById('gallery');
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modalImage');
const modalVideoContainer = document.getElementById('modalVideoContainer');
const modalVideo = document.getElementById('modalVideo');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
const closeBtn = document.querySelector('.close-btn');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// NASA's APOD API endpoint
const NASA_API_URL = 'https://api.nasa.gov/planetary/apod';
// NASA provides a demo key for learning purposes
const API_KEY = 'DEMO_KEY';

// Function to fetch space images from NASA's API
async function fetchSpaceImages(startDate, endDate) {
  try {
    // Show loading message while fetching data
    showLoading();
    
    // Build the API URL with our date range and API key
    const url = `${NASA_API_URL}?start_date=${startDate}&end_date=${endDate}&api_key=${API_KEY}`;
    
    // Fetch data from NASA's API
    const response = await fetch(url);
    
    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`Failed to fetch images: ${response.status}`);
    }
    
    // Convert the response to JSON format
    const data = await response.json();
    
    // Display the images in our gallery
    displayGallery(data);
    
  } catch (error) {
    // Show error message if something went wrong
    console.error('Error fetching space images:', error);
    showError('Failed to load space images. Please try again.');
  }
}

// Function to display loading message
function showLoading() {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">🌌</div>
      <p>Loading amazing space images...</p>
    </div>
  `;
}

// Function to display error message
function showError(message) {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">⚠️</div>
      <p>${message}</p>
    </div>
  `;
}

// Function to display the gallery of space images
function displayGallery(images) {
  // Clear the gallery first
  gallery.innerHTML = '';
  
  // Check if we have any images to display
  if (!images || images.length === 0) {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">🔭</div>
        <p>No content found for the selected date range.</p>
      </div>
    `;
    return;
  }
  
  // Create a gallery item for each image and video
  images.forEach(item => {
    // Show both images and videos
    if (item.media_type === 'image' || item.media_type === 'video') {
      const galleryItem = createGalleryItem(item);
      gallery.appendChild(galleryItem);
    }
  });
}

// Function to create a single gallery item
function createGalleryItem(item) {
  // Create the main container for this gallery item
  const galleryItem = document.createElement('div');
  galleryItem.className = 'gallery-item';
  
  // Add special class for video items
  if (item.media_type === 'video') {
    galleryItem.classList.add('video-item');
  }
  
  // Format the date to be more readable
  const date = new Date(item.date);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Create the HTML content for this gallery item based on media type
  if (item.media_type === 'image') {
    galleryItem.innerHTML = `
      <div class="image-container">
        <img src="${item.url}" alt="${item.title}" loading="lazy" />
      </div>
      <div class="image-info">
        <h3 class="image-title">${item.title}</h3>
        <p class="image-date">${formattedDate}</p>
        <p class="image-description">${item.explanation}</p>
      </div>
    `;
  } else if (item.media_type === 'video') {
    // Extract video ID from YouTube URL for thumbnail
    const videoId = extractYouTubeVideoId(item.url);
    const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : 'https://via.placeholder.com/400x300?text=Video';
    
    galleryItem.innerHTML = `
      <div class="image-container video-container">
        <img src="${thumbnailUrl}" alt="${item.title}" loading="lazy" />
        <div class="video-overlay">
          <div class="play-button">▶</div>
          <span class="video-label">VIDEO</span>
        </div>
      </div>
      <div class="image-info">
        <h3 class="image-title">${item.title}</h3>
        <p class="image-date">${formattedDate}</p>
        <p class="image-description">${item.explanation}</p>
      </div>
    `;
  }
  
  // Add click event listener to open modal
  galleryItem.addEventListener('click', () => {
    openModal(item);
  });
  
  return galleryItem;
}

// Function to open the modal with image or video details
function openModal(item) {
  // Format the date for the modal
  const date = new Date(item.date);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Set the modal content based on media type
  if (item.media_type === 'image') {
    // Show image, hide video
    modalImage.src = item.url;
    modalImage.alt = item.title;
    modalImage.style.display = 'block';
    modalVideoContainer.style.display = 'none';
  } else if (item.media_type === 'video') {
    // Show video, hide image
    const videoId = extractYouTubeVideoId(item.url);
    if (videoId) {
      modalVideo.src = createYouTubeEmbedUrl(videoId);
      modalVideoContainer.style.display = 'block';
      modalImage.style.display = 'none';
    } else {
      // If we can't extract video ID, show a link instead
      modalImage.style.display = 'none';
      modalVideoContainer.innerHTML = `
        <div class="video-link-container">
          <div class="video-link-icon">🎬</div>
          <p>Watch this video on YouTube:</p>
          <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="video-link">
            ${item.title}
          </a>
        </div>
      `;
      modalVideoContainer.style.display = 'block';
    }
  }
  
  // Set common modal content
  modalTitle.textContent = item.title;
  modalDate.textContent = formattedDate;
  modalExplanation.textContent = item.explanation;
  
  // Show the modal
  modal.style.display = 'block';
  
  // Prevent background scrolling when modal is open
  document.body.style.overflow = 'hidden';
}

// Function to close the modal
function closeModal() {
  modal.style.display = 'none';
  
  // Stop video playback by clearing the src
  if (modalVideo.src) {
    modalVideo.src = '';
  }
  
  // Restore background scrolling
  document.body.style.overflow = 'auto';
}

// Add event listener to the "Get Space Images" button
getImagesBtn.addEventListener('click', () => {
  // Get the selected date range
  const startDate = startInput.value;
  const endDate = endInput.value;
  
  // Make sure both dates are selected
  if (!startDate || !endDate) {
    alert('Please select both start and end dates.');
    return;
  }
  
  // Make sure start date is not after end date
  if (new Date(startDate) > new Date(endDate)) {
    alert('Start date cannot be after end date.');
    return;
  }
  
  // Fetch and display the space images
  fetchSpaceImages(startDate, endDate);
});

// Load images automatically when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Display a random space fact
  displayRandomSpaceFact();
  
  // Use the default date range to load initial images
  const startDate = startInput.value;
  const endDate = endInput.value;
  
  if (startDate && endDate) {
    fetchSpaceImages(startDate, endDate);
  }
});

// Event listeners for closing the modal
closeBtn.addEventListener('click', closeModal);

// Close modal when clicking outside the modal content
modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

// Close modal when pressing Escape key
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal.style.display === 'block') {
    closeModal();
  }
});

// Function to extract YouTube video ID from URL
function extractYouTubeVideoId(url) {
  // Handle different YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

// Function to create a YouTube embed URL
function createYouTubeEmbedUrl(videoId) {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
}

// Array of amazing space facts
const spaceFacts = [
  "A day on Venus is longer than its year! Venus rotates so slowly that one day (243 Earth days) is longer than one year (225 Earth days).",
  
  "The International Space Station travels at 17,500 miles per hour and orbits Earth every 90 minutes.",
  
  "One teaspoon of neutron star material would weigh about 6 billion tons on Earth - that's as much as Mount Everest!",
  
  "Jupiter's moon Europa has twice as much water as all of Earth's oceans combined, hidden beneath its icy surface.",
  
  "The largest known star, UY Scuti, is so big that if it replaced our Sun, it would extend beyond the orbit of Jupiter.",
  
  "A single day on Mercury experiences temperatures ranging from 800°F (427°C) during the day to -300°F (-184°C) at night.",
  
  "The Milky Way galaxy is on a collision course with the Andromeda galaxy, but don't worry - it won't happen for another 4.5 billion years!",
  
  "Saturn's moon Titan has lakes and rivers made of liquid methane and ethane instead of water.",
  
  "The footprints left by Apollo astronauts on the Moon will remain there for millions of years because there's no wind or water to erode them.",
  
  "A single bolt of lightning is five times hotter than the surface of the Sun, reaching temperatures of 30,000 Kelvin (53,540°F).",
  
  "The largest volcano in our solar system is Olympus Mons on Mars, which is about 13.6 miles (22 km) high - nearly three times taller than Mount Everest.",
  
  "If you could drive a car to the Moon at highway speeds (60 mph), it would take you about 160 days of non-stop driving.",
  
  "The Sun converts 4 million tons of matter into energy every second through nuclear fusion.",
  
  "Astronauts can grow up to 2 inches taller in space due to the lack of gravity compressing their spine.",
  
  "The coldest place in the known universe is the Boomerang Nebula, where temperatures drop to -458°F (-272°C).",
  
  "A year on Neptune lasts 165 Earth years, meaning it has only completed one orbit around the Sun since it was discovered in 1846.",
  
  "The Great Red Spot on Jupiter is a storm that has been raging for at least 350 years and is larger than Earth.",
  
  "Betelgeuse, the red supergiant star in Orion, is so large that if it were placed at the center of our solar system, it would engulf the orbits of Mercury, Venus, Earth, and Mars.",
  
  "The space between galaxies is not empty - it contains a thin gas with about one atom per cubic meter.",
  
  "A single day on the Sun lasts about 25 Earth days at the equator, but 35 Earth days at the poles because the Sun rotates faster at its equator.",
  
  "The Voyager 1 spacecraft, launched in 1977, is now over 14 billion miles from Earth and is the most distant human-made object in space.",
  
  "Uranus rotates on its side, likely due to a massive collision early in its formation, causing it to have the most extreme seasons in the solar system.",
  
  "The magnetic field of magnetar (a type of neutron star) is a trillion times stronger than Earth's magnetic field.",
  
  "It would take 9 years to walk to the Moon if you could walk in a straight line at a normal walking pace.",
  
  "The center of the Milky Way smells like raspberries and tastes like rum due to a chemical called ethyl formate found in space dust."
];

// Function to get a random space fact
function getRandomSpaceFact() {
  const randomIndex = Math.floor(Math.random() * spaceFacts.length);
  return spaceFacts[randomIndex];
}

// Function to display a random space fact
function displayRandomSpaceFact() {
  const factElement = document.getElementById('randomSpaceFact');
  if (factElement) {
    const randomFact = getRandomSpaceFact();
    factElement.textContent = randomFact;
    
    // Add a fade-in animation
    factElement.style.opacity = '0';
    setTimeout(() => {
      factElement.style.opacity = '1';
    }, 100);
  }
}
