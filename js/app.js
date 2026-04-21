let isDataLoaded = false;
window.onload = function () {
    initializeApp();
};

function initializeApp() {
    if (isLoggedIn) {
        startLiveSync();
    }

    render();
}

function login() {
    const usernameInput = document.getElementById("loginUsername");
    const passwordInput = document.getElementById("loginPassword");
    const errorBox = document.getElementById("loginError");

    const username = String(usernameInput ? usernameInput.value : "").trim();
    const password = String(passwordInput ? passwordInput.value : "");

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
        if (errorBox) {
            errorBox.textContent = "Invalid username or password";
        }
        return;
    }

    isLoggedIn = true;
    localStorage.setItem("chakkiLoggedIn", "true");

    if (errorBox) errorBox.textContent = "";

    if (!isDataLoaded) {
        startLiveSync();
    }

    render();
}

function logout() {
    isLoggedIn = false;
    localStorage.removeItem("chakkiLoggedIn");
    page = "dashboard";

    if (liveSyncUnsubscribe) {
        liveSyncUnsubscribe();
        liveSyncUnsubscribe = null;
        isDataLoaded = false;
    }

    render();
}

function setPage(p) {
    if (!isLoggedIn) return;
    page = p;
    render();
}
