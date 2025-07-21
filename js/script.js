// NASA API key and endpoint
const API_KEY = '06oMktZqkRQjriq1h9lSPTu28qgN4gF5jqTvrmDS';
const API_URL = 'https://api.nasa.gov/planetary/apod';

// Get DOM elements
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const getImagesBtn = document.getElementById('getImagesBtn');
const gallery = document.getElementById('gallery');

// Set default dates (last 9 days)
function setDefaultDates() {
  // Get today's date
  const today = new Date();
  // Get the date 8 days ago (for a total of 9 days including today)
  const nineDaysAgo = new Date();
  nineDaysAgo.setDate(today.getDate() - 8);

  // Format dates as YYYY-MM-DD
  const format = date => date.toISOString().split('T')[0];
  startDateInput.value = format(nineDaysAgo);
  endDateInput.value = format(today);
  startDateInput.max = format(today);
  endDateInput.max = format(today);
}
setDefaultDates();

// When the start date changes, update the end date to always be 8 days after
startDateInput.addEventListener('change', () => {
  const start = new Date(startDateInput.value);
  if (isNaN(start)) return;
  const end = new Date(start);
  end.setDate(start.getDate() + 8);
  // Format as YYYY-MM-DD
  const format = date => date.toISOString().split('T')[0];
  endDateInput.value = format(end);
  // Prevent selecting an end date not matching the 9-day range
  endDateInput.value = format(end);
});

// Listen for button click
getImagesBtn.addEventListener('click', () => {
  // Get selected dates
  const startDate = startDateInput.value;
  const endDate = endDateInput.value;

  // Validate dates
  if (!startDate || !endDate) {
    alert('Please select both start and end dates.');
    return;
  }
  if (startDate > endDate) {
    alert('Start date must be before end date.');
    return;
  }

  // Make sure the range is exactly 9 days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
  if (diffDays !== 9) {
    alert('Please select a date range of exactly 9 days.');
    return;
  }

  // Fetch and display images
  fetchSpaceImages(startDate, endDate);
});

// Fetch images from NASA API
function fetchSpaceImages(startDate, endDate) {
  // Show loading message
  gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">🚀</div><p>Loading space images...</p></div>`;

  // Build API URL
  const url = `${API_URL}?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;

  // Fetch data from NASA API
  fetch(url)
    .then(response => response.json())
    .then(data => {
      // If only one image is returned, wrap it in an array
      const images = Array.isArray(data) ? data : [data];
      // Always show 9 cards, even if some are videos (show a placeholder for videos)
      displayNineImages(images, startDate);
    })
    .catch(error => {
      gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">❌</div><p>Could not load images. Please try again later.</p></div>`;
    });
}

// Display exactly 9 images (show placeholder if not an image)
function displayNineImages(images, startDate) {
  // Helper to format date as YYYY-MM-DD
  const format = date => date.toISOString().split('T')[0];
  // Build an array of 9 consecutive dates starting from startDate
  const days = [];
  let current = new Date(startDate);
  for (let i = 0; i < 9; i++) {
    days.push(format(current));
    current.setDate(current.getDate() + 1);
  }

  // For each day, find the image or show a placeholder
  const cards = days.map(day => {
    const item = images.find(img => img.date === day);
    if (item && item.media_type === 'image') {
      // Show the image card
      return `
        <div class="card">
          <img src="${item.url}" alt="${item.title}" />
          <div class="card-content">
            <div class="card-title">${item.title}</div>
            <div class="card-date">${item.date}</div>
          </div>
        </div>
      `;
    } else if (item && item.media_type !== 'image') {
      // Show a placeholder for videos
      return `
        <div class="card">
          <div class="card-content" style="height:200px;display:flex;align-items:center;justify-content:center;background:#222b44;">
            <span style="font-size:2rem;">🎬</span>
          </div>
          <div class="card-content">
            <div class="card-title">${item.title || 'Video Content'}</div>
            <div class="card-date">${item.date}</div>
          </div>
        </div>
      `;
    } else {
      // No data for this day
      return `
        <div class="card">
          <div class="card-content" style="height:200px;display:flex;align-items:center;justify-content:center;background:#222b44;">
            <span style="font-size:2rem;">❓</span>
          </div>
          <div class="card-content">
            <div class="card-title">No Image Available</div>
            <div class="card-date">${day}</div>
          </div>
        </div>
      `;
    }
  });

  // Show the cards in the gallery
  gallery.innerHTML = cards.join('');
}

// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);
