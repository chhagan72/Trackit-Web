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
window.onload = function () {
  refreshDeviceDetails();
};






    
    // function initMap(lat = 0, lng = 0) {
    //   if (isMapInitialized) return;

    //   map = L.map('map').setView([lat, lng], 16);
    //   isMapInitialized = true;

    //   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //     attribution: 'Map data © OpenStreetMap contributors',
    //   }).addTo(map);

    //   // deviceMarker = L.marker([18.5204, 73.8567]).addTo(map)
    //   //   .bindPopup("📍 Waiting for your location...").openPopup();


    //   deviceMarker = L.marker([lat, lng], { title: "Device Location" }).addTo(map);
    //   userMarker = L.marker([lat, lng], { title: "Your Location", opacity: 0.8 }).addTo(map);
    // }







