// Find our date picker inputs, button, and modal elements on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesBtn = document.getElementById('getImagesBtn');
const gallery = document.getElementById('gallery');
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modalImage');
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
        <p>No images found for the selected date range.</p>
      </div>
    `;
    return;
  }
  
  // Create a gallery item for each image
  images.forEach(item => {
    // Only show items that have images (not videos)
    if (item.media_type === 'image') {
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
  
  // Format the date to be more readable
  const date = new Date(item.date);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Create the HTML content for this gallery item
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
  
  // Add click event listener to open modal
  galleryItem.addEventListener('click', () => {
    openModal(item);
  });
  
  return galleryItem;
}

// Function to open the modal with image details
function openModal(item) {
  // Format the date for the modal
  const date = new Date(item.date);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Set the modal content
  modalImage.src = item.url;
  modalImage.alt = item.title;
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
