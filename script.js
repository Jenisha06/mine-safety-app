// Login page logic
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if(loginForm){
        loginForm.addEventListener('submit', function(e){
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const role = document.getElementById('role').value;

            if(!username || !role){
                alert("Please enter your username and select a role.");
                return;
            }

            localStorage.setItem('username', username);
            localStorage.setItem('role', role);

            if(role === 'worker'){
                window.location.href = 'worker.html';
            } else if(role === 'supervisor'){
                window.location.href = 'supervisor.html';
            }
        });
    }
});

// Worker Dashboard Functions

// Submit Checklist
function submitChecklist() {
    const checkboxes = document.querySelectorAll("#checklist input[type='checkbox']");
    let completed = 0;
    checkboxes.forEach(cb => { if(cb.checked) completed++; });

    const pointsEarned = completed * 10;

    let leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
    leaderboard.push({ worker: localStorage.getItem('username'), points: pointsEarned, type: 'checklist' });
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

    alert(`Checklist submitted! You earned ${pointsEarned} points.`);

    document.querySelectorAll("#checklist input[type='checkbox']").forEach(cb => cb.checked = false);
}



// Submit Hazard Report - live sync via localStorage
function submitHazard() {
    const desc = document.getElementById("hazardDesc").value.trim();
    const file = document.getElementById("hazardFile").files[0];

    if (!desc) {
        alert("Please describe the hazard.");
        return;
    }

    const hazardReports = JSON.parse(localStorage.getItem("hazardReports") || "[]");

    hazardReports.push({
        worker: localStorage.getItem('username'),
        desc: desc,
        file: file ? file.name : "",
        timestamp: new Date().toLocaleString()
    });

    localStorage.setItem("hazardReports", JSON.stringify(hazardReports));

    alert(`Hazard reported: ${desc}${file ? " (File: " + file.name + ")" : ""}`);

    // Clear input fields
    document.getElementById('hazardDesc').value = '';
    document.getElementById('hazardFile').value = '';
}


// Logout
function logout(){
    localStorage.clear();
    window.location.href = 'index.html';
}

// Function to mark video as watched and reward points
function markVideoWatched() {
    const username = localStorage.getItem('username');
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");

    // Check if user already watched video today
    const today = new Date().toLocaleDateString();
    let videoRecords = JSON.parse(localStorage.getItem("videoRecords") || "[]");

    const alreadyWatched = videoRecords.find(v => v.worker === username && v.date === today);
    if(alreadyWatched){
        alert("You have already watched the video today!");
        return;
    }

    // Add points
    const pointsEarned = 10; // points for watching video
    leaderboard.push({ worker: username, points: pointsEarned, type: 'video' });
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

    // Record video watch
    videoRecords.push({ worker: username, date: today });
    localStorage.setItem("videoRecords", JSON.stringify(videoRecords));

    alert(`Video marked as watched! You earned ${pointsEarned} points.`);
}

// Update hazard report points
function submitHazard() {
    const desc = document.getElementById("hazardDesc").value.trim();
    const file = document.getElementById("hazardFile").files[0];

    if (!desc) {
        alert("Please describe the hazard.");
        return;
    }

    const username = localStorage.getItem('username');

    // Save hazard report
    const hazardReports = JSON.parse(localStorage.getItem("hazardReports") || "[]");
    hazardReports.push({
        worker: username,
        desc: desc,
        file: file ? file.name : "",
        timestamp: new Date().toLocaleString()
    });
    localStorage.setItem("hazardReports", JSON.stringify(hazardReports));

    // Reward points for reporting hazard
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
    const pointsEarned = 15; // points for hazard report
    leaderboard.push({ worker: username, points: pointsEarned, type: 'hazard' });
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

    alert(`Hazard reported! You earned ${pointsEarned} points.`);

    // Clear inputs
    document.getElementById('hazardDesc').value = '';
    document.getElementById('hazardFile').value = '';
}


const checklists = {
    drill: {
        en: ["Helmet on", "Gloves on", "Check drill machinery", "Area checked for hazards"],
        hi: ["हेलमेट पहनें", "दस्ताने पहनें", "ड्रिल मशीनरी जांचें", "क्षेत्र में खतरों की जांच करें"],
        te: ["హెల్మెట్ ధరించండి", "గ్లౌవ్స్ ధరించండి", "డ్రిల్ యంత్రాన్ని తనిఖీ చేయండి", "హాజర్డ్‌లను తనిఖీ చేయండి"]
    },
    blaster: {
        en: ["Helmet on", "Gloves on", "Check explosives", "Safe distance maintained"],
        hi: ["हेलमेट पहनें", "दस्ताने पहनें", "विस्फोटक जांचें", "सुरक्षित दूरी बनाए रखें"],
        te: ["హెల్మెట్ ధరించండి", "గ్లౌవ్స్ ధరించండి", "ఎక్స్‌ప్లోసివ్‌లను తనిఖీ చేయండి", "భద్రమైన దూరం పాటించండి"]
    },
    general: {
        en: ["Helmet on", "Gloves on", "Safety boots worn", "Area checked for hazards"],
        hi: ["हेलमेट पहनें", "दस्ताने पहनें", "सुरक्षा जूते पहनें", "क्षेत्र में खतरों की जांच करें"],
        te: ["హెల్మెట్ ధరించండి", "గ్లౌవ్స్ ధరించండి", "సేఫ్టీ బూట్లు ధరించండి", "హాజర్డ్‌లను తనిఖీ చేయండి"]
    }
};

// Generate checklist dynamically
function generateChecklist() {
    const role = document.getElementById("roleType").value;
    const lang = document.getElementById("language").value;

    const checklistContainer = document.querySelector("#checklist ul");
    checklistContainer.innerHTML = "";

    checklists[role][lang].forEach(item => {
        const li = document.createElement("li");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        li.appendChild(checkbox);
        li.appendChild(document.createTextNode(" " + item));
        checklistContainer.appendChild(li);
    });
}

// Call on page load
generateChecklist();

// Update checklist when language changes
function updateChecklistLanguage() {
    generateChecklist();
}

// Update checklist when role changes
function updateChecklistRole() {
    generateChecklist();
}


// Text-to-Speech for Checklist
function readChecklist() {
    const checkboxes = document.querySelectorAll("#checklist ul li");
    let text = "Today's safety checklist includes: ";
    checkboxes.forEach((li, i) => {
        text += `${i+1}. ${li.innerText}. `;
    });
    speakText(text);
}

// Text-to-Speech for Hazard Reporting Instructions
function readHazardInstructions() {
    const text = "Please describe the hazard in the text box and optionally upload a photo. Then press submit to report the hazard.";
    speakText(text);
}

// Generic speak function
function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9; // slower for clarity
        utterance.lang = document.getElementById("language").value === "hi" ? "hi-IN" :
                         document.getElementById("language").value === "te" ? "te-IN" : "en-US";
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Sorry, your browser does not support text-to-speech.");
    }
}

// Update submitChecklist & submitHazard to speak confirmation
function submitChecklist() {
    const checkboxes = document.querySelectorAll("#checklist input[type='checkbox']");
    let completed = 0;
    checkboxes.forEach(cb => { if(cb.checked) completed++; });

    const pointsEarned = completed * 10;

    let leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
    leaderboard.push({ worker: localStorage.getItem('username'), points: pointsEarned, type: 'checklist' });
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

    const message = `Checklist submitted! You earned ${pointsEarned} points.`;
    alert(message);
    speakText(message);

    checkboxes.forEach(cb => cb.checked = false);
}

function submitHazard() {
    const desc = document.getElementById("hazardDesc").value.trim();
    const file = document.getElementById("hazardFile").files[0];

    if (!desc) {
        speakText("Please describe the hazard before submitting.");
        alert("Please describe the hazard.");
        return;
    }

    const username = localStorage.getItem('username');

    // Save hazard report
    const hazardReports = JSON.parse(localStorage.getItem("hazardReports") || "[]");
    hazardReports.push({
        worker: username,
        desc: desc,
        file: file ? file.name : "",
        timestamp: new Date().toLocaleString()
    });
    localStorage.setItem("hazardReports", JSON.stringify(hazardReports));

    // Reward points for reporting hazard
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
    const pointsEarned = 15; // points for hazard report
    leaderboard.push({ worker: username, points: pointsEarned, type: 'hazard' });
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

    const message = `Hazard reported! You earned ${pointsEarned} points.`;
    alert(message);
    speakText(message);

    document.getElementById('hazardDesc').value = '';
    document.getElementById('hazardFile').value = '';
}

// Define demo hazard zones with lat/lon and radius (meters)
const hazardZones = [
    {name: "Zone A", lat: 19.123, lon: 84.123, radius: 100},
    {name: "Zone B", lat: 19.125, lon: 84.125, radius: 80},
    {name: "Zone C", lat: 19.127, lon: 84.128, radius: 120},
];

// Function to calculate distance between two lat/lon points (Haversine formula)
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2-lat1)*Math.PI/180;
    const dLon = (lon2-lon1)*Math.PI/180;
    const a = Math.sin(dLat/2)*Math.sin(dLat/2) +
              Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180) *
              Math.sin(dLon/2)*Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Check worker location against hazard zones
function checkWorkerZone() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            let alertMessage = "You are in a safe zone.";
            let inHazard = false;

            hazardZones.forEach(zone => {
                const distance = getDistanceFromLatLonInMeters(lat, lon, zone.lat, zone.lon);
                if(distance <= zone.radius){
                    alertMessage = `⚠️ You are entering ${zone.name}, a high-risk area!`;
                    inHazard = true;
                    speakText(alertMessage); // Voice alert
                }
            });

            document.getElementById("zoneAlert").innerText = alertMessage;

            if(!inHazard) speakText(alertMessage);

        }, error => {
            alert("Geolocation not available or permission denied.");
        });
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}


