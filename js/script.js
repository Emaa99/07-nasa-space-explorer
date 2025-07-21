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
  const format = date => date.toISOString().split('T')[0];
  endDateInput.value = format(end);
  endDateInput.max = endDateInput.value;
  // Optionally, close the date picker after selection (for better UX)
  endDateInput.blur();
});

// When the end date changes, update the start date to always be 8 days before
endDateInput.addEventListener('change', () => {
  const end = new Date(endDateInput.value);
  if (isNaN(end)) return;
  const start = new Date(end);
  start.setDate(end.getDate() - 8);
  const format = date => date.toISOString().split('T')[0];
  startDateInput.value = format(start);
  startDateInput.min = startDateInput.value;
  // Optionally, close the date picker after selection (for better UX)
  startDateInput.blur();
});

// Both date pickers are editable
endDateInput.readOnly = false;
startDateInput.readOnly = false;

// When user focuses or clicks the start date input, show the calendar dropdown
startDateInput.addEventListener('focus', () => {
  startDateInput.showPicker && startDateInput.showPicker();
});
startDateInput.addEventListener('click', () => {
  startDateInput.showPicker && startDateInput.showPicker();
});

// When user focuses or clicks the end date input, show the calendar dropdown
endDateInput.addEventListener('focus', () => {
  endDateInput.showPicker && endDateInput.showPicker();
});
endDateInput.addEventListener('click', () => {
  endDateInput.showPicker && endDateInput.showPicker();
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

// List of space facts
const spaceFacts = [
  "You could survive for about 90 seconds unprotected in space—but a chimpanzee can last up to three minutes.",
  "Neutron stars are so dense that a teaspoon of material from one would weigh around 10 million tons.",
  "Jupiter is the largest planet in our solar system. It could fit all the other planets inside it—using just 70% of its volume.",
  "Venus spins backwards compared to most planets; one Venusian ‘day’ lasts longer than its year.",
  "The Sun is 400 times larger than the Moon but also 400 times farther away, making both appear the same size in our sky.",
  "If you drove a car to the nearest star at 70 mph, the journey would take more than 356 billion years.",
  "Black holes have hypothetical opposites known as white holes, which would spit out matter instead of trapping it. These are still unproven by observation.",
  "Heat left from the Big Bang still surrounds us today, known as the cosmic microwave background, though it’s too faint to see with our eyes.",
  "NASA was founded in 1958 and currently employs over 17,000 people.",
  "NASA’s Apollo 11 mission achieved the first human Moon landing in July 1969; Neil Armstrong and Buzz Aldrin were the first to walk on the Moon.",
  "The Voyager 1 probe, launched in 1977, is the farthest human-made object from Earth, and still sends back data from interstellar space.",
  "NASA’s Hubble Space Telescope, launched in 1990, has transformed our understanding of the universe with its deep-space images.",
  "A Space Shuttle aboard its special crawler-transporter took around 6 hours to travel from the assembly building to the launch pad.",
  "The name of the Apollo 10 command module was ‘Charlie Brown’ and the lunar module was ‘Snoopy’. NASA’s mascot for astronaut safety is Snoopy from the Peanuts comic strip.",
  "Some NASA innovations have turned into everyday technology, such as memory foam, scratch-resistant lenses, and better water purification systems.",
  "NASA’s Mars rovers like Curiosity continue exploring and studying the Red Planet's surface, geology, and climate.",
  "Most visible stars in the night sky are actually binary stars—that is, two stars orbiting each other.",
  "Stars don’t actually twinkle in space—they only appear to twinkle when we see them from Earth due to our atmosphere.",
  "Neptune was discovered using math before it was ever seen through a telescope.",
  "Earth’s Moon is slowly moving away from Earth—by about 3.8 centimeters per year."
];

// Helper to get a random fact
function getRandomFact() {
  const idx = Math.floor(Math.random() * spaceFacts.length);
  return spaceFacts[idx];
}

function fetchSpaceImages(startDate, endDate) {
  // Show loading message with a random fact
  const fact = getRandomFact();
  gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">🚀</div><p>Loading space images...</p><div style='margin-top:1.5em;font-size:1.1em;color:#FC3D21;'><strong>Did You Know?</strong><br>${fact}</div></div>`;

  // Build API URL
  const url = `${API_URL}?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;

  // Fetch data from NASA API
  fetch(url)
    .then(response => response.json())
    .then(data => {
      // If only one image is returned, wrap it in an array
      const images = Array.isArray(data) ? data : [data];
      // Always show 9 cards, even if some are videos (show a placeholder for videos)
      displayNineEntries(images, startDate);
    })
    .catch(error => {
      gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">❌</div><p>Could not load images. Please try again later.</p></div>`;
    });
}

// Display exactly 9 entries (image or video or placeholder)
function displayNineEntries(entries, startDate) {
  // Helper to format date as YYYY-MM-DD
  const format = date => date.toISOString().split('T')[0];
  // Build an array of 9 consecutive dates starting from startDate
  const days = [];
  let current = new Date(startDate);
  for (let i = 0; i < 9; i++) {
    days.push(format(current));
    current.setDate(current.getDate() + 1);
  }

  // For each day, find the entry or show a placeholder
  const cards = days.map(day => {
    const item = entries.find(entry => entry.date === day);
    if (item && item.media_type === 'image') {
      // Show the image card with Details button
      return `
        <div class="card">
          <button class="details-btn" data-date="${item.date}" aria-label="Show details for ${item.title}">Details</button>
          <img src="${item.url}" alt="${item.title}" />
          <div class="card-content">
            <div class="card-title">${item.title}</div>
            <div class="card-date">${item.date}</div>
          </div>
        </div>
      `;
    } else if (item && item.media_type === 'video') {
      // Show a video card with embed if YouTube/Vimeo, otherwise a link
      let videoEmbed = '';
      if (item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
        // Embed YouTube video
        const videoId = item.url.split('embed/')[1] || item.url.split('v=')[1] || '';
        const id = videoId.split(/[?&]/)[0];
        videoEmbed = `<iframe width="100%" height="200" src="https://www.youtube.com/embed/${id}" title="APOD Video" frameborder="0" allowfullscreen style="background:#222b44;"></iframe>`;
      } else if (item.url.includes('vimeo.com')) {
        // Embed Vimeo video
        const vimeoId = item.url.split('/').pop();
        videoEmbed = `<iframe width="100%" height="200" src="https://player.vimeo.com/video/${vimeoId}" title="APOD Video" frameborder="0" allowfullscreen style="background:#222b44;"></iframe>`;
      } else {
        // Fallback: show a link to the video
        videoEmbed = `
          <div class="card-content" style="height:200px;display:flex;align-items:center;justify-content:center;background:#222b44;">
            <a href="${item.url}" target="_blank" rel="noopener" style="color:#FC3D21;font-weight:bold;text-decoration:underline;">Watch Video</a>
          </div>
        `;
      }
      return `
        <div class="card">
          ${videoEmbed}
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

  // Add event listeners for Details buttons
  document.querySelectorAll('.details-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const date = this.getAttribute('data-date');
      const item = entries.find(entry => entry.date === date);
      if (item) {
        showDetailsModal(item);
      }
    });
  });
}

// Show modal with image details
function showDetailsModal(item) {
  // Get modal elements or create if not present
  let modal = document.getElementById('detailsModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'detailsModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <button class="close-modal" aria-label="Close details">&times;</button>
        <div class="modal-body"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  // Fill modal body
  const modalBody = modal.querySelector('.modal-body');
  modalBody.innerHTML = `
    <img src="${item.url}" alt="${item.title}" style="max-width:100%;max-height:300px;display:block;margin:0 auto 1em auto;border-radius:8px;" />
    <h2 style="color:#FC3D21;">${item.title}</h2>
    <p style="color:#e0e6ed;"><strong>Date:</strong> ${item.date}</p>
    <p style="color:#fff;"><strong>Explanation:</strong><br>${item.explanation}</p>
  `;
  // Show modal
  modal.style.display = 'block';
  // Close modal on button click or outside click
  modal.querySelector('.close-modal').onclick = () => { modal.style.display = 'none'; };
  window.onclick = function(event) {
    if (event.target === modal) modal.style.display = 'none';
  };
}

// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);
