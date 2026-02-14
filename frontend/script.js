const API = "http://localhost:5000";

// REGISTER
async function register() {
    const name = document.getElementById("name")?.value;
    const email = document.getElementById("email")?.value;
    const password = document.getElementById("password")?.value;

    const res = await fetch(API + "/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
        window.location.href = "index.html";
    }
}

// LOGIN
async function login() {
    const email = document.getElementById("email")?.value;
    const password = document.getElementById("password")?.value;

    const res = await fetch(API + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "dashboard.html";
    } else {
        alert("Invalid credentials");
    }
}

// DASHBOARD
async function loadDashboard() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "index.html";
        return;
    }

    const res = await fetch(API + "/dashboard", {
        headers: { "Authorization": "Bearer " + token }
    });

    const data = await res.json();

    document.getElementById("welcome").innerText =
        `Welcome, ${data.name}`;
}

// LOGOUT
function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}
function openSite(url) {
    window.open(url, "_blank");
}

