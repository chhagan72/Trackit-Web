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

//   const deviceId = "{{ device_id }}";
//   const userId = "{{ request.session.user_id }}";

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

function getLocation() {
  dbRef
    .once("value")
    .then((snapshot) => {
      const data = snapshot.val();
      if (data && data.latitude && data.longitude) {
        initMap(parseFloat(data.latitude), parseFloat(data.longitude));
      } else {
        alert("Location not available");
      }
    })
    .catch((error) => alert("Error fetching location: " + error.message));
}

let map, deviceMarker, userMarker, directionRenderer, directionService;

let userLocation = null;
let watchId = null;

let isMapInitialized = false;

function initMap(lat = 0, lng = 0) {
  if (isMapInitialized) return;

  map = L.map('map').setView([lat, lng], 16);
  isMapInitialized = true;

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © OpenStreetMap contributors',
  }).addTo(map);

  // deviceMarker = L.marker([18.5204, 73.8567]).addTo(map)
  //   .bindPopup("📍 Waiting for your location...").openPopup();


  deviceMarker = L.marker([lat, lng], { title: "Device Location" }).addTo(map);
  userMarker = L.marker([lat, lng], { title: "Your Location", opacity: 0.8 }).addTo(map);
}

function updateMarkers(deviceLat, deviceLng, userLat, userLng) {
  if (deviceMarker) {
    deviceMarker.setLatLng([deviceLat, deviceLng]);
  }
  if (userMarker) {
    userMarker.setLatLng([userLat, userLng]);
  }
  map.setView([deviceLat, deviceLng]);
}

function refreshDeviceDetails() {
  dbRef.once("value")
    .then((snapshot) => {
      const data = snapshot.val();
      if (data) {
        document.getElementById("deviceName").textContent = data.deviceName || "N/A";
        document.getElementById("deviceIdentifier").textContent = data.deviceIdentifier || "Unknown";
        document.getElementById("batteryStatus").textContent = data.batteryStatus || "N/A";
        document.getElementById("status").textContent = data.status || "Unknown";
      } else {
        alert("Device data not found.");
      }
    })
    .catch((error) => alert("Error fetching device details: " + error.message));
}


let deviceLocation = null;

function getUserLocation(callback = null) {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
    alert("Live location stopped.");
  } else {
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          userLocation = { lat, lng };

          dbRef.update({
            latitude: lat,
            longitude: lng,
            lastUpdated: new Date().toISOString(),
          });

          if (!map) {
            initMap(lat, lng);
          } else {
            updateMarkers(lat, lng, lat, lng);
          }

          // deviceMarker.setLatLng([lat, lng])
          //   .bindPopup("📍 You are here!")
          //   .openPopup();

          // map.setView([lat, lng], 16);

          showDistance();

          if (callback) callback(); 
        },
        (error) => {
          alert("Error getting location: " + error.message);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
      alert("Live location started.");
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  }
}


function getDirection() {
  getUserLocation(() => {
    dbRef.once("value").then((snapshot) => {
      const data = snapshot.val();
      if (data && data.latitude && data.longitude) {
        deviceLocation = {
          lat: parseFloat(data.latitude),
          lng: parseFloat(data.longitude)
        };
        drawRoute();
        showDistance();
      } else {
        alert("Device location not available.");
      }
    });
  });
}

let routeControl;

function drawRoute() {
  if (routeControl) {
    map.removeControl(routeControl);
  }

  routeControl = L.Routing.control({
    waypoints: [
      L.latLng(userLocation.lat, userLocation.lng),
      L.latLng(deviceLocation.lat, deviceLocation.lng)
    ],
    routeWhileDragging: false,
    createMarker: function (i, waypoint, n) {
      if (i === 0) {
        return L.marker(waypoint.latLng, { title: "Your Location" });
      } else {
        return L.marker(waypoint.latLng, { title: "Device Location" });
      }
    }
  }).addTo(map);
}

function showDistance() {
  if (!userLocation || !deviceLocation) return;

  const R = 6371; // Radius of the Earth in km
  const dLat = (deviceLocation.lat - userLocation.lat) * Math.PI / 180;
  const dLng = (deviceLocation.lng - userLocation.lng) * Math.PI / 180;

  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(userLocation.lat * Math.PI / 180) *
    Math.cos(deviceLocation.lat * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = (R * c).toFixed(2);

  const distanceDiv = document.getElementById("distanceInfo");
  distanceDiv.style.display = "block";
  distanceDiv.innerHTML = `<div class="alert alert-info mt-2">Distance to device: <strong>${distance} km</strong></div>`;
}




function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

setInterval(() => {
  if (userLocation && deviceLocation) {
    showDistance();
  }
}, 5000); // every 5 seconds

// Live update direction
dbRef.on("value", (snapshot) => {
  const data = snapshot.val();
  if (data && data.latitude && data.longitude) {
    const deviceLat = parseFloat(data.latitude);
    const deviceLng = parseFloat(data.longitude);

    if (!map) {
      initMap(deviceLat, deviceLng);
    }

    if (userLocation) {
      updateMarkers(deviceLat, deviceLng, userLocation.lat, userLocation.lng);
      showDistance();
    }
  }
});

function getLiveLocation() {
  getUserLocation();
}

function getLastLocation() {
  getLocation(); // existing function
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

window.onload = function () {
  refreshDeviceDetails();
  getLocation(); // Initializes map with current device location
};






// function getDirection() {
//   if (!navigator.geolocation) {
//     alert("Geolocation is not supported by your browser");
//     return;
//   }

//   navigator.geolocation.getCurrentPosition(
//     (position) => {
//       const userLat = position.coords.latitude;
//       const userLng = position.coords.longitude;
//       userLocation = [userLat, userLng];

//       dbRef.child("location").once("value", (snapshot) => {
//         const data = snapshot.val();
//         if (data && data.latitude && data.longitude) {
//           const deviceLat = data.latitude;
//           const deviceLng = data.longitude;

//           if (userMarker) {
//             userMarker.setLatLng(userLocation);
//           } else {
//             userMarker = L.marker(userLocation, { color: "blue" }).addTo(map).bindPopup("Your Location");
//           }

//           if (deviceMarker) {
//             deviceMarker.setLatLng([deviceLat, deviceLng]);
//           } else {
//             deviceMarker = L.marker([deviceLat, deviceLng]).addTo(map).bindPopup("Device Location");
//           }

//           map.setView([deviceLat, deviceLng], 13);

//           L.Routing.control({
//             waypoints: [
//               L.latLng(userLat, userLng),
//               L.latLng(deviceLat, deviceLng)
//             ],
//             routeWhileDragging: false
//           }).addTo(map);
//           drawRoute();

//           // Calculate distance using Leaflet geometry
//           const distanceInMeters = map.distance([userLat, userLng], [deviceLat, deviceLng]);
//           const distanceText =
//             distanceInMeters >= 1000
//               ? (distanceInMeters / 1000).toFixed(2) + " km"
//               : Math.round(distanceInMeters) + " meters";

//           const distanceDiv = document.getElementById("distanceInfo");
//           distanceDiv.innerHTML = `<div class="alert alert-info m-2">Distance to device: <strong>${distanceText}</strong></div>`;
//           distanceDiv.style.display = "block";
//         } else {
//           alert("Device location not available.");
//         }
//       });
//     },
//     (error) => {
//       alert("Error getting user location: " + error.message);
//     }
//   );
// }

// let routeControl;

// function drawRoute() {
//   if (routeControl) {
//     map.removeControl(routeControl);
//   }

//   routeControl = L.Routing.control({
//     waypoints: [
//       L.latLng(userLocation.lat, userLocation.lng),
//       L.latLng(deviceLocation.lat, deviceLocation.lng)
//     ],
//     routeWhileDragging: false,
//     createMarker: function (i, waypoint, n) {
//       if (i === 0) {
//         return L.marker(waypoint.latLng, { title: "Your Location" });
//       } else {
//         return L.marker(waypoint.latLng, { title: "Device Location" });
//       }
//     }
//   }).addTo(map);
// }