const firebaseConfig = {
  apiKey: "AIzaSyDpbVFgPlPgcGXQttylQK_HQfhD6b0VElc",
  authDomain: "trackits-ea795.firebaseapp.com",
  databaseURL: "https://trackits-ea795-default-rtdb.firebaseio.com",
  projectId: "trackits-ea795",
  storageBucket: "trackits-ea795.appspot.com",
  messagingSenderId: "19130318782",
  appId: "1:19130318782:web:b21be85d894b8ba428c3ef",
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// const deviceId = "{{ device_id }}";
// const userId = "{{ request.session.user_id }}";

const dbRef = database.ref(`users/${userId}/devices/${deviceId}`);
let ringStatus = false;

function toggleRing() {
  ringStatus = !ringStatus;
  updateCommand("ring", ringStatus);
  document.getElementById("ringButton").textContent = ringStatus ? "Stop Sound" : "Play Sound";
}

function sendCommand(command) {
  updateCommand(command, true);
}

function updateCommand(command, value) {
  const commandPath = `users/${userId}/devices/${deviceId}/commands/${command}`;
  database
    .ref(commandPath)
    .set(value)
    .then(() => alert(`${command} command ${value ? "sent" : "stopped"} successfully`))
    .catch((error) => alert(`Failed to send command: ${error.message}`));
}

function confirmReset() {
  if (confirm("Are you sure you want to factory reset this device?")) {
    updateCommand("erase", true);
  }
}


function sendMessageToDevice() {
  const messageText = document.getElementById("messageInput").value.trim();
  if (!messageText) return alert("Please enter a message");

  // Send message and trigger the command
  database.ref(`users/${userId}/devices/${deviceId}/commands`).update({
    show_message: true
  });

  database.ref(`users/${userId}/devices/${deviceId}/commands`).update({
    message: messageText
  });

  // Optional: Close modal and clear input
  document.getElementById("messageInput").value = "";
  const modal = bootstrap.Modal.getInstance(document.getElementById("messageModal"));
  modal.hide();
}

function refreshDeviceDetails() {
  dbRef.once("value")
    .then((snapshot) => {
      const data = snapshot.val();
      if (data) {
        document.getElementById("deviceName").textContent = data.deviceName || "N/A";
        document.getElementById("imei").textContent = data.imei || "Unknown";
        document.getElementById("batteryStatus").textContent = data.batteryStatus || "N/A";
        document.getElementById("status").textContent = data.status || "Unknown";
      } else {
        alert("Device data not found.");
      }
    })
    .catch((error) => alert("Error fetching device details: " + error.message));
}

let map;
let userMarker = null;
let deviceMarker = null;
let userLocation = null;
let deviceLocation = null;
let routeControl = null;
let watchId = null;
let isMapInitialized = false;

function initMap(lat = 0, lng = 0){
  if (isMapInitialized) return;

  map = L.map('map').setView([lat, lng], 13);
  // isMapInitialized = true;

  // map = new google.maps.Map(document.getElementById("map"), {
  //   center: { lat: 20.5937, lng: 78.9629 },
  //   zoom: 5
  // });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © OpenStreetMap contributors',
  }).addTo(map);

  deviceMarker = L.marker([lat, lng]).addTo(map).bindPopup("Device Location").openPopup();

  // Optionally: fetch location from Firebase if available
  dbRef.child('location').once('value').then(snapshot => {
    const location = snapshot.val();
    if (location && location.latitude && location.longitude) {
      updateDeviceMarker(location.latitude, location.longitude);
    }
  });
}

function updateDeviceMarker(lat, lng) {
  if (deviceMarker) {
    deviceMarker.setLatLng([lat, lng]);
  } else {
    deviceMarker = L.marker([lat, lng]).addTo(map).bindPopup("Device Location");
  }
  map.setView([lat, lng], 16);
}

function getLiveLocation() {
  database.ref(`users/${userId}/devices/${deviceId}/location`).on("value", (snapshot) => {
    const location = snapshot.val();
    if (location && location.latitude && location.longitude) {
      const latLng = [location.latitude, location.longitude];

      if (!map) {
        initMap(location.latitude, location.longitude);
      }

      if (deviceMarker) {
        deviceMarker.setLatLng(latLng);
      } else {
        deviceMarker = L.marker(latLng).addTo(map).bindPopup("Live Device Location").openPopup();
      }

      map.setView(latLng, 16);
    }
  });
}

// Get Last Location (one-time fetch)
function getLastLocation() {
  dbRef.child("location").once("value", (snapshot) => {
    const data = snapshot.val();
    if (data && data.latitude && data.longitude) {
      const lat = data.latitude;
      const lng = data.longitude;

      if (!deviceMarker) {
        deviceMarker = L.marker([lat, lng]).addTo(map).bindPopup("Last Known Location");
      } else {
        deviceMarker.setLatLng([lat, lng]);
      }

      map.setView([lat, lng], 16);
    } else {
      alert("Last location not available.");
    }
  });
}

// Get Direction from user to device
function getDirection() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      const userLocation = { lat: userLat, lng: userLng };

      const deviceRef = database.ref(`users/${userId}/devices/${deviceId}/location`);
      deviceRef.once("value").then((snapshot) => {
        const data = snapshot.val();

        if (!data || !data.latitude || !data.longitude) {
          alert("Device location not available.");
          return;
        }

        const deviceLat = data.latitude;
        const deviceLng = data.longitude;
        const deviceLocation = { lat: deviceLat, lng: deviceLng };

        // Update markers
        if (!userMarker) {
          userMarker = L.marker(userLocation).addTo(map).bindPopup("Your Location").openPopup();
        } else {
          userMarker.setLatLng(userLocation);
        }

        if (!deviceMarker) {
          deviceMarker = L.marker(deviceLocation).addTo(map).bindPopup("Device Location").openPopup();
        } else {
          deviceMarker.setLatLng(deviceLocation);
        }

        map.setView(deviceLocation, 13);

        // Remove old route if exists
        if (routeControl) {
          map.removeControl(routeControl);
        }

        // ✅ Draw new route
        routeControl = L.Routing.control({
          waypoints: [
            L.latLng(userLat, userLng),
            L.latLng(deviceLat, deviceLng)
          ],
          lineOptions: {
            styles: [{ color: 'blue', weight: 4 }]
          },
          routeWhileDragging: false,
          createMarker: function(i, waypoint) {
            const title = i === 0 ? "Your Location" : "Device Location";
            return L.marker(waypoint.latLng).bindPopup(title);
          }
        }).addTo(map);

        // ✅ Distance calculation
        const distanceInMeters = map.distance(
          [userLat, userLng],
          [deviceLat, deviceLng]
        );
        const distanceText =
          distanceInMeters >= 1000
            ? (distanceInMeters / 1000).toFixed(2) + " km"
            : Math.round(distanceInMeters) + " meters";

        const distanceDiv = document.getElementById("distanceInfo");
        distanceDiv.innerHTML = `📍 Distance to device: <strong>${distanceText}</strong>`;
        distanceDiv.style.display = "block";
      }).catch((err) => {
        console.error("Firebase error:", err.message);
        alert("Error getting device location from Firebase.");
      });
    },
    (error) => {
      console.error("Geolocation error:", error.message);
      alert("Error getting your location: " + error.message);
    }
  );
}


// Initialize map on page load
window.onload = initMap;

window.onload = function () {
  refreshDeviceDetails();
};