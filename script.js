// 🔐 PASSWORD
const ADMIN_PASSWORD = "Safachatt@1234";
const UPI_ID = "9758620961-2@ybl";

// 🔥 FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyAfcvm5ttT7iFFIIyuarxFRITsrSW4MxCQ",
    authDomain: "attachakki-da798.firebaseapp.com",
    projectId: "attachakki-da798"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 📦 DATA
let sales = [], expenses = [], purchase = [], udhaar = [], pisai = [], payments = [], stock = 0;
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
            pisai = d.pisai || [];
            payments = d.payments || [];
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
        sales, expenses, purchase, udhaar, pisai, payments, stock
    }, { merge: true });
}

// 👤 CUSTOMERS
function getCustomers() {
    let names = [
        ...sales.map(x => x.name),
        ...pisai.map(x => x.name),
        ...udhaar.map(x => x.name)
    ];
    return [...new Set(names.filter(Boolean))];
}

// 📱 AUTO PHONE
function getCustomerPhone(name) {
    let all = [...sales, ...pisai, ...udhaar];
    let found = all.find(x => x.name === name && x.phone);
    return found ? found.phone : "";
}

function autoFillPhone(inputId, phoneId) {
    let name = document.getElementById(inputId).value;
    let phone = getCustomerPhone(name);
    if (phone) document.getElementById(phoneId).value = phone;
}

// 📄 NAV
function setPage(p) {
    page = p;
    render();
}

// 🎨 RENDER
function render() {
    const app = document.getElementById("app");

    let customers = getCustomers()
        .map(c => `<option value="${c}">${c}</option>`)
        .join("");

    let totalCustomers = getCustomers().length;

    // 📊 CALCULATIONS
    let totalKg = purchase.reduce((a, b) => a + b.kg, 0);
    let totalCost = purchase.reduce((a, b) => a + b.amount, 0);
    let totalExp = expenses.reduce((a, b) => a + b.amount, 0);

    let avgCost = totalKg ? totalCost / totalKg : 0;
    let expPerKg = totalKg ? totalExp / totalKg : 0;
    let finalCost = avgCost + expPerKg;

    let soldKg = sales.reduce((a, b) => a + b.kg, 0);
    let totalSales = sales.reduce((a, b) => a + b.amount, 0);
    let sellRate = soldKg ? totalSales / soldKg : 0;

    let profit = (sellRate - finalCost) * soldKg;

    let totalPisaiKg = pisai.reduce((a, b) => a + b.kg, 0);
    let pisaiIncome = totalPisaiKg * 1.90;

    let totalUdhaar = udhaar.reduce((a, b) => a + b.amount, 0);
    let receivedUdhaar = payments.reduce((a, b) => a + b.paid, 0);

    let alertBox = stock < LOW_STOCK_LIMIT ? `<div class='alert'>⚠️ Low Stock ${stock}kg</div>` : "";

    // 🏠 DASHBOARD
    if (page === "dashboard") {
        app.innerHTML = `
        ${alertBox}
        <div class="dashboard">
            <div class="card stat">Customers<h3>${totalCustomers}</h3></div>
            <div class="card stat">Stock<h3>${stock}kg</h3></div>
            <div class="card stat">Sales<h3>₹${totalSales.toFixed(2)}</h3></div>
            <div class="card stat">Expense<h3>₹${totalExp.toFixed(2)}</h3></div>
            <div class="card stat">Profit<h3>₹${profit.toFixed(2)}</h3></div>
            <div class="card stat">Pisai<h3>₹${pisaiIncome.toFixed(2)}</h3></div>
            <div class="card stat">Udhaar<h3>₹${totalUdhaar.toFixed(2)}</h3></div>
            <div class="card stat">Received<h3>₹${receivedUdhaar.toFixed(2)}</h3></div>
        </div>

        <div class="card">
            <button onclick="openPopup()">📒 Add Udhaar</button>
        </div>

        <div class="card">
            <button onclick="deleteAllData()" style="background:red;">🗑 Delete All</button>
        </div>`;
        return;
    }

    // 💰 SALES
    if (page === "sales") {
        app.innerHTML = `
        <div class="card">
            <input list="customerList" id="name" placeholder="Search Customer"
            oninput="autoFillPhone('name','phone')">
            <datalist id="customerList">${customers}</datalist>

            <input id="newName" placeholder="New Customer (if not found)">
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

    // 🌾 PISAI
    if (page === "pisai") {
        app.innerHTML = `
        <div class="card">
            <input list="customerList" id="pisaiName" placeholder="Search Customer"
            oninput="autoFillPhone('pisaiName','pisaiPhone')">
            <datalist id="customerList">${customers}</datalist>

            <input id="pisaiPhone" placeholder="Phone">
            <input id="pisaiKg" placeholder="Kg" oninput="calcPisai()">
            <h3 id="pisaiAmount">₹0</h3>

            <select id="pisaiPay">
                <option value="instant">Instant</option>
                <option value="udhaar">Udhaar</option>
            </select>

            <button onclick="addPisai()">Add Pisai</button>
        </div>`;
        return;
    }

    // 🛒 PURCHASE
    if (page === "purchase") {
        app.innerHTML = `
        <div class="card">
            <input id="kg" placeholder="Kg">
            <input id="rate" placeholder="Rate">
            <button onclick="addPurchase()">Add Purchase</button>
        </div>`;
        return;
    }

    // 💸 EXPENSE
    if (page === "expense") {
        app.innerHTML = `
        <div class="card">
            <input id="type" placeholder="Expense Type">
            <input id="amt" placeholder="Amount">
            <button onclick="addExpense()">Add Expense</button>
        </div>`;
        return;
    }

    // 📒 UDHAAR
    if (page === "udhaar") {

        let list = udhaar.map((u, i) => `
    <div class="udhaar-card">
        
        <div class="row top">
            <span class="name">${u.name}</span>
            <span class="amount">₹${u.amount.toFixed(2)}</span>
        </div>

        <div class="row">
            <span>📅 ${u.date}</span>
            <span>📞 ${u.phone || "-"}</span>
        </div>

        <div class="actions">
            <button onclick="sendWhatsApp('${u.name}','${u.phone}',${u.amount})">📲</button>
            <button onclick="receivePayment('${u.name}',${i})">✔</button>
        </div>

    </div>
    `).join("");

        app.innerHTML = `
    <div class="card">
        <h2>📒 Udhaar Khata Book</h2>
    </div>

    ${list || "<p style='text-align:center'>No Udhaar</p>"}
    `;

        return;
    }

    // 📊 LEDGER
    if (page === "ledger") {
        app.innerHTML = `
        <div class="card">
            <select id="ledgerName">
                <option value="">Select Customer</option>
                ${customers}
            </select>
            <button onclick="showLedger()">View Ledger</button>
        </div>`;
        return;
    }
}

// ➕ FUNCTIONS

function addSale() {
    let name = document.getElementById("name").value || document.getElementById("newName").value;
    let phone = document.getElementById("phone").value;
    let pkt = +document.getElementById("pkt").value;
    let rate = +document.getElementById("rate").value;
    let type = +document.getElementById("type").value;
    let pay = document.getElementById("pay").value;

    let kg = pkt * type;
    let amount = pkt * rate;

    if (kg > stock) return alert("❌ Not enough stock!");

    stock -= kg;

    sales.push({ name, phone, kg, amount, date: new Date().toLocaleDateString() });

    if (pay === "udhaar") {
        udhaar.push({ name, phone, amount, date: new Date().toLocaleDateString() });
    }

    save(); render();
}

function addPurchase() {
    let kg = +document.getElementById("kg").value;
    let rate = +document.getElementById("rate").value;

    if (!kg || !rate) return alert("Enter data");

    purchase.push({ kg, amount: kg * rate, date: new Date().toLocaleDateString() });
    stock += kg;

    save(); render();
}

function addExpense() {
    let type = document.getElementById("type").value;
    let amt = +document.getElementById("amt").value;

    if (!type || !amt) return alert("Enter data");

    expenses.push({ type, amount: amt, date: new Date().toLocaleDateString() });

    save(); render();
}

function addPisai() {
    let name = document.getElementById("pisaiName").value;
    let phone = document.getElementById("pisaiPhone").value;
    let kg = +document.getElementById("pisaiKg").value;
    let pay = document.getElementById("pisaiPay").value;

    let amount = kg * 1.90;

    pisai.push({ name, phone, kg, amount, date: new Date().toLocaleDateString() });

    if (pay === "udhaar") {
        udhaar.push({ name, phone, amount, date: new Date().toLocaleDateString() });
    }

    save(); render();
}

function closePopup() {
    document.getElementById("udharPopup").style.display = "none";
}

function savePopupUdhaar() {
    let name = document.getElementById("newCustomerName").value.trim();
    let phone = document.getElementById("newCustomerPhone").value.trim();
    let amount = +document.getElementById("popupAmount").value;

    if (!name || !amount) {
        alert("Enter details");
        return;
    }

    // ✅ Save udhaar
    udhaar.push({
        name,
        phone,
        amount,
        date: new Date().toLocaleDateString()
    });

    // ✅ OPTIONAL: Save customer permanently (smart)
    if (phone) {
        sales.push({
            name,
            phone,
            kg: 0,
            amount: 0,
            date: new Date().toLocaleDateString()
        });
    }

    // ✅ Clear fields
    document.getElementById("newCustomerName").value = "";
    document.getElementById("newCustomerPhone").value = "";
    document.getElementById("popupAmount").value = "";

    closePopup();
    save();
    render();

    alert("✅ Udhaar Added");
}

// 💰 RECEIVE
function receivePayment(name, index) {
    let pending = udhaar[index].amount;
    let paid = +prompt(`Enter amount (Pending ₹${pending})`);

    if (!paid) return;

    payments.push({ name, paid, date: new Date().toLocaleDateString() });

    if (paid >= pending) udhaar.splice(index, 1);
    else udhaar[index].amount -= paid;

    save(); render();
}

// 📊 LEDGER
function showLedger() {
    let name = document.getElementById("ledgerName").value;

    if (!name) {
        alert("Select customer");
        return;
    }

    let entries = [];

    // SALES
    sales.filter(s => s.name === name)
        .forEach(s => entries.push({
            type: "Sale",
            amount: +(+s.amount).toFixed(2),
            date: s.date
        }));

    // PISAI
    pisai.filter(p => p.name === name)
        .forEach(p => entries.push({
            type: "Pisai",
            amount: +(+p.amount).toFixed(2),
            date: p.date
        }));

    // PAYMENTS
    payments.filter(p => p.name === name)
        .forEach(p => entries.push({
            type: "Payment",
            amount: -(+p.paid).toFixed(2),
            date: p.date
        }));

    // SORT
    entries.sort((a, b) => new Date(a.date) - new Date(b.date));

    let balance = 0;

    let html = entries.map(e => {
        balance += Number(e.amount);

        return `
        <div class="card">
            <b>${e.date}</b><br>
            ${e.type}: ₹${Number(e.amount).toFixed(2)}<br>
            Balance: ₹${balance.toFixed(2)}
        </div>`;
    }).join("");

    document.getElementById("app").innerHTML = `
        <div class="card">
            <select id="ledgerName">
                <option value="${name}">${name}</option>
            </select>
            <button onclick="render()">⬅ Back</button>
        </div>

        <div class="card"><h3>Ledger - ${name}</h3></div>

        ${html || "<p>No Data</p>"}
    `;
}

function sendWhatsApp(name, phone, amount) {

    if (!phone || phone === "-" || phone.length < 10) {
        alert("❌ Invalid phone number");
        return;
    }

    // ✅ Clean phone (remove spaces, +91 etc)
    phone = phone.replace(/\D/g, "");

    // ✅ Ensure Indian format
    if (phone.length === 10) {
        phone = "91" + phone;
    }

    let msg =
        `Hello ${name} ji,

Aapka ₹${amount.toFixed(2)} udhaar baki hai.

Pay here:
${UPI_ID}

Kripya payment kar dein.

- GhanShayam Bhog Atta Chakki`;

    let url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

    window.open(url, "_blank");
}
function loadPopupCustomers() {
    let customers = getCustomers()
        .map(c => `<option value="${c}">`)
        .join("");

    document.getElementById("popupCustomerList").innerHTML = customers;
}
function openPopup() {
    loadPopupCustomers();
    document.getElementById("udharPopup").style.display = "flex";
}
// 🚀 START
window.onload = function () {
    startLiveSync();
};
// 🔄 REGISTER SERVICE WORKER
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").then(reg => {

        reg.onupdatefound = () => {
            const newWorker = reg.installing;

            newWorker.onstatechange = () => {
                if (newWorker.state === "installed") {
                    if (navigator.serviceWorker.controller) {
                        showUpdatePopup();
                    }
                }
            };
        };
    });
}

// 🔔 SHOW UPDATE POPUP
function showUpdatePopup() {
    let box = document.createElement("div");
    box.id = "updateBox";

    box.innerHTML = `
        🔄 New update available
        <button onclick="updateApp()">Update</button>
    `;

    document.body.appendChild(box);
}

// 🔁 UPDATE APP
function updateApp() {
    navigator.serviceWorker.getRegistration().then(reg => {
        if (reg.waiting) {
            reg.waiting.postMessage({ action: "skipWaiting" });
        }
        location.reload();
    });
}