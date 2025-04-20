var map = L.map('map').setView([18.5204, 73.8567], 13);

  // Step 3.2: Load OSM Tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Step 3.3: Add a marker to track location
  var marker = L.marker([18.5204, 73.8567]).addTo(map)
                .bindPopup("📍 Waiting for your location...").openPopup();

  // Step 3.4: Use browser geolocation
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      function (position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;

        // Update map and marker position
        marker.setLatLng([lat, lng])
              .bindPopup("📍 You are here!")
              .openPopup();

        map.setView([lat, lng], 16); // Zoom in on your location
      },
      function (error) {
        alert("❌ Error: " + error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  } else {
    alert("❌ Geolocation not supported in this browser.");
  }