// 🔐 PASSWORD
const ADMIN_PASSWORD = "1234";

function checkPassword() {
    let pass = prompt("Enter password");
    return pass === ADMIN_PASSWORD;
}

// 🔥 FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyAfcvm5ttT7iFFIIyuarxFRITsrSW4MxCQ",
    authDomain: "attachakki-da798.firebaseapp.com",
    projectId: "attachakki-da798"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 📦 DATA
let sales = [], expenses = [], purchase = [], udhaar = [], stock = 0;
let page = "dashboard";
const LOW_STOCK_LIMIT = 50;

// 🔄 LIVE SYNC
function startLiveSync() {
    db.collection("data").doc("main").onSnapshot(doc => {
        if (doc.exists) {
            let d = doc.data();
            sales = d.sales || [];
            expenses = d.expenses || [];
            purchase = d.purchase || [];
            udhaar = d.udhaar || [];
            stock = d.stock || 0;
        } else {
            save();
        }
        render();
    });
}

// 💾 SAVE
function save() {
    db.collection("data").doc("main").set({
        sales, expenses, purchase, udhaar, stock
    }, { merge: true });
}

// 📄 NAV
function setPage(p) {
    page = p;
    render();
}

// 🎨 RENDER
function render() {
    const app = document.getElementById("app");

    let totalSales = sales.reduce((a, b) => a + b.amount, 0);
    let totalExp = expenses.reduce((a, b) => a + b.amount, 0);
    let totalKg = purchase.reduce((a, b) => a + b.kg, 0);
    let totalCost = purchase.reduce((a, b) => a + b.amount, 0);

    let avgCost = totalKg ? totalCost / totalKg : 0;
    let expPerKg = totalKg ? totalExp / totalKg : 0;
    let finalCost = avgCost + expPerKg;

    let soldKg = sales.reduce((a, b) => a + b.kg, 0);
    let sellRate = soldKg ? totalSales / soldKg : 0;

    let profitPerKg = sellRate - finalCost;
    let profit = profitPerKg * soldKg;

    let totalUdhaar = udhaar.filter(u => !u.received).reduce((a, b) => a + b.amount, 0);
    let receivedUdhaar = udhaar.filter(u => u.received).reduce((a, b) => a + b.amount, 0);

    let cash = udhaar.filter(u => u.method === "cash").reduce((a, b) => a + b.amount, 0);
    let upi = udhaar.filter(u => u.method === "upi").reduce((a, b) => a + b.amount, 0);

    let alertBox = stock < LOW_STOCK_LIMIT ? `<div class='alert'>⚠️ Low Stock ${stock}kg</div>` : "";

    // 🏠 DASHBOARD
    if (page === "dashboard") {
        app.innerHTML = `
        ${alertBox}
        <div class="dashboard">
            <div class="card stat">Stock<h3>${stock}kg</h3></div>
            <div class="card stat">Profit<h3>₹${profit.toFixed(2)}</h3></div>
            <div class="card stat">Expense<h3>₹${totalExp}</h3></div>
            <div class="card stat">Udhaar<h3>₹${totalUdhaar}</h3></div>
            <div class="card stat">Received<h3>₹${receivedUdhaar}</h3></div>
            <div class="card stat">Cash<h3>₹${cash}</h3></div>
            <div class="card stat">UPI<h3>₹${upi}</h3></div>
        </div>

        <div class="card">
            <button onclick="deleteAllData()" style="background:red;">🗑 Delete All</button>
        </div>
        `;
        return;
    }

    // 💰 SALES
    if (page === "sales") {
        app.innerHTML = `
        <div class="card">
            <input id="name" placeholder="Customer Name">
            <input id="phone" placeholder="Phone">
            <select id="type">
                <option value="9">9kg</option>
                <option value="50">50kg</option>
            </select>
            <input id="pkt" placeholder="Packets">
            <input id="rate" placeholder="Rate">
            <select id="pay">
                <option value="instant">Instant</option>
                <option value="udhaar">Udhaar</option>
            </select>
            <button onclick="addSale()">Add Sale</button>
        </div>`;
        return;
    }

    // 🛒 PURCHASE
    if (page === "purchase") {
        app.innerHTML = `
        <div class="card">
            <input id="kg" placeholder="Kg">
            <input id="rate" placeholder="Rate">
            <button onclick="addPurchase()">Add</button>
        </div>`;
        return;
    }

    // 💸 EXPENSE
    if (page === "expense") {
        app.innerHTML = `
        <div class="card">
            <input id="type" placeholder="Type">
            <input id="amt" placeholder="Amount">
            <button onclick="addExpense()">Add</button>
        </div>`;
        return;
    }

    // 📒 UDHAAR
    if (page === "udhaar") {
        let list = udhaar.map((u, i) => `
        <li class="card udhar-row">
            <span>${u.date || "-"}</span>
            <span>${u.name}</span>
            <span>${u.phone || "-"}</span>
            <span>₹${u.amount}</span>
            <span>
                <button onclick="toggleReceived('${u.name}',${i})">
                    ${u.received ? "✅" : "✔"}
                </button>
            </span>
        </li>
        `).join("");

        app.innerHTML = `
        <div class="card" style="text-align:center;">
            <h2>📒 Udhar Khata</h2>
        </div>

        <div class="udhar-row header">
            <b>Date</b>
            <b>Name</b>
            <b>Mobile</b>
            <b>Amount</b>
            <b>✔</b>
        </div>

        <ul style="list-style:none;padding:0;">
            ${list || "<p style='text-align:center;'>No Udhaar Data</p>"}
        </ul>
        `;
        return;
    }
}

// ➕ FUNCTIONS

function addSale() {
    let name = document.getElementById("name").value;
    let phone = document.getElementById("phone").value;
    let pkt = +document.getElementById("pkt").value;
    let rate = +document.getElementById("rate").value;
    let type = +document.getElementById("type").value;
    let pay = document.getElementById("pay").value;

    if (!pkt || !rate) return alert("Enter data");

    let kg = pkt * type;
    let amount = pkt * rate;

    if (stock < kg) return alert("Low stock");

    sales.push({ kg, amount });
    stock -= kg;

    if (pay === "udhaar") {
        udhaar.push({
            name, phone, amount,
            date: new Date().toLocaleDateString(),
            received: false,
            method: ""
        });
    }

    save(); render();
}

function addPurchase() {
    let kg = +document.getElementById("kg").value;
    let rate = +document.getElementById("rate").value;

    if (!kg || !rate) return;

    purchase.push({ kg, amount: kg * rate });
    stock += kg;

    save(); render();
}

function addExpense() {
    let t = document.getElementById("type").value;
    let a = +document.getElementById("amt").value;

    if (!t || !a) return;

    expenses.push({ type: t, amount: a });
    save(); render();
}

// 📒 UDHAAR FUNCTIONS
function openPopup() {
    // Load existing customers
    let select = document.getElementById("existingCustomer");
    let customers = [...new Set(udhaar.map(u => u.name))];
    select.innerHTML = `<option value="">Select Existing Customer</option>` +
        customers.map(c => `<option value="${c}">${c}</option>`).join("");

    // Show popup
    document.getElementById("udharPopup").style.display = "flex";
}

function closePopup() {
    document.getElementById("udharPopup").style.display = "none";
}

function savePopupUdhaar() {
    let existing = document.getElementById("existingCustomer").value;
    let newCustomerName = document.getElementById("newCustomerName").value.trim();
    let newCustomerPhone = document.getElementById("newCustomerPhone").value.trim();
    let amount = +document.getElementById("popupAmount").value;

    if (!amount || amount <= 0) {
        alert("Enter a valid amount");
        return;
    }

    let customerName = "";
    let phone = "";

    // New customer logic
    if (newCustomerName !== "") {
        customerName = newCustomerName;

        // Validate phone: must be exactly 10 digits
        if (!/^\d{10}$/.test(newCustomerPhone)) {
            alert("Enter a valid 10-digit phone number");
            return;
        }
        phone = newCustomerPhone;

    } else if (existing !== "") {
        customerName = existing;
        phone = "-"; // or store phone if available
    } else {
        alert("Select or enter customer name");
        return;
    }

    // Add udhaar entry
    udhaar.push({
        name: customerName,
        phone: phone,
        amount: amount,
        date: new Date().toLocaleDateString(),
        received: false,
        method: ""
    });

    save();
    render();

    // Clear popup fields
    document.getElementById("newCustomerName").value = "";
    document.getElementById("newCustomerPhone").value = "";
    document.getElementById("popupAmount").value = "";
    document.getElementById("existingCustomer").value = "";

    closePopup();
}

function toggleReceived(name, index) {
    let c = -1;
    for (let i = 0; i < udhaar.length; i++) {
        if (udhaar[i].name === name) {
            c++;
            if (c === index) {
                udhaar[i].received = !udhaar[i].received;
                break;
            }
        }
    }
    save(); render();
}

// 🗑 DELETE ALL
function deleteAllData() {
    if (!checkPassword()) return alert("Wrong password");
    if (!confirm("Delete all?")) return;

    sales = []; expenses = []; purchase = []; udhaar = []; stock = 0;
    save(); render();
}

// 🌙 THEME
function toggleTheme() {
    document.body.classList.toggle("dark");
}

// 🚀 START
window.onload = function () {
    startLiveSync();
};

let deferredPrompt;
window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById("installBtn").style.display = "block";
});

document.getElementById("installBtn").onclick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt = null;
};

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js")
            .then(() => console.log("PWA Ready ✅"))
            .catch(err => console.log("Error:", err));
    });
}