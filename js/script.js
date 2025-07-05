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
