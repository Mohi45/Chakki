// 🔐 PASSWORD
const ADMIN_PASSWORD = "Safachatt@1234";
const UPI_ID = "9758620961-2@ybl"; // 👈 replace with your real UPI
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
let sales = [], expenses = [], purchase = [], udhaar = [], pisai = [], payments = [], stock = 0;
let page = "dashboard";
const LOW_STOCK_LIMIT = 50;

const pageTitles = {
    dashboard: "🏠 Home",
    sales: "💰 Sales",
    pisai: "🌾 Pisai",
    purchase: "🛒 Purchase",
    expense: "💸 Expense",
    udhaar: "📒 Udhaar",
    ledger: "📊 Ledger"
};

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

// 📄 NAV
function setPage(p) {
    page = p;

    // ✅ Update title
    let title = document.getElementById("pageTitle");
    if (title) {
        title.innerText = "GhanShayam Bhog Atta Chakki - " + pageTitles[p] || "GhanShayam Bhog Atta Chakki";
    }

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
            <select id="name" onchange="handleCustomerSelect('name','newName')">
                <option value="">Select Customer</option>
                <option value="new">➕ Add New</option>
                ${customers}
            </select>
            <input id="newName" placeholder="New Customer" style="display:none;">
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
            <select id="pisaiName" onchange="handleCustomerSelect('pisaiName','newPisaiName')">
                <option value="">Select Customer</option>
                <option value="new">➕ Add New</option>
                ${customers}
            </select>
            <input id="newPisaiName" placeholder="New Customer" style="display:none;">
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

    // 📒 UDHAAR
    if (page === "udhaar") {
        let list = udhaar.map((u, i) => `
<div class="udhar-line">
    <span>${u.date}</span>
    <span>${u.name}</span>
    <span>${u.phone || "-"}</span>
    <span>₹${u.amount.toFixed(2)}</span>

    <button onclick="sendWhatsApp('${u.name}','${u.phone}',${u.amount})">📲</button>
    <button onclick="receivePayment('${u.name}',${i})">✔</button>
</div>
`).join("");

        app.innerHTML = `
        <div class="card"><h2>📒 Udhaar Khata Book</h2></div>
        ${list || "<p>No Udhaar</p>"}`;
        return;
    }

    // 💰 PAYMENTS
    if (page === "payments") {
        let list = payments.map(p => `
        <li class="card">
            ${p.name} - ₹${p.paid.toFixed(2)}<br>${p.date}
        </li>`).join("");

        app.innerHTML = `<div class="card"><h2>💰 Payments</h2></div>${list}`;
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
    if (page === "purchase") {
        app.innerHTML = `
    <div class="card">
        <input id="kg" placeholder="Kg">
        <input id="rate" placeholder="Rate">
        <button onclick="addPurchase()">Add Purchase</button>
    </div>`;
        return;
    }
    if (page === "expense") {
        app.innerHTML = `
    <div class="card">
        <input id="type" placeholder="Expense Type">
        <input id="amt" placeholder="Amount">
        <button onclick="addExpense()">Add Expense</button>
    </div>`;
        return;
    }
}

// ➕ FUNCTIONS

function addSale() {
    let sel = document.getElementById("name").value;
    let newName = document.getElementById("newName").value;
    let name = sel === "new" ? newName : sel;

    let phone = document.getElementById("phone").value;
    let pkt = +document.getElementById("pkt").value;
    let rate = +document.getElementById("rate").value;
    let type = +document.getElementById("type").value;
    let pay = document.getElementById("pay").value;

    let kg = pkt * type;
    let amount = pkt * rate;

    sales.push({ name, phone, kg, amount, date: new Date().toLocaleDateString() });

    if (pay === "udhaar") {
        udhaar.push({ name, phone, amount, date: new Date().toLocaleDateString() });
    }

    showSuccess();
    save();
    render();
}
//purchase function
function addPurchase() {
    let kg = +document.getElementById("kg").value;
    let rate = +document.getElementById("rate").value;

    if (!kg || !rate) return alert("Enter data");

    purchase.push({
        kg,
        amount: kg * rate,
        date: new Date().toLocaleDateString()
    });

    stock += kg;

    document.getElementById("kg").value = "";
    document.getElementById("rate").value = "";

    showSuccess("Purchase Added");
    save();
    render();
}
//expense function
function addExpense() {
    let type = document.getElementById("type").value;
    let amt = +document.getElementById("amt").value;

    if (!type || !amt) return alert("Enter data");

    expenses.push({
        type,
        amount: amt,
        date: new Date().toLocaleDateString()
    });

    document.getElementById("type").value = "";
    document.getElementById("amt").value = "";

    showSuccess("Expense Added");
    save();
    render();
}
function addPisai() {
    let sel = document.getElementById("pisaiName").value;
    let newName = document.getElementById("newPisaiName").value;
    let name = sel === "new" ? newName : sel;

    let phone = document.getElementById("pisaiPhone").value;
    let kg = +document.getElementById("pisaiKg").value;
    let pay = document.getElementById("pisaiPay").value;

    let amount = kg * 1.90;

    pisai.push({ name, phone, kg, amount, date: new Date().toLocaleDateString() });

    if (pay === "udhaar") {
        udhaar.push({ name, phone, amount, date: new Date().toLocaleDateString() });
    }

    showSuccess();
    save();
    render();
}

// 💰 RECEIVE PAYMENT
function receivePayment(name, index) {
    let pending = udhaar[index].amount;
    let paid = +prompt(`Enter amount (Pending ₹${pending})`);

    if (!paid || paid <= 0) return;

    payments.push({ name, paid, date: new Date().toLocaleDateString() });

    if (paid >= pending) {
        udhaar.splice(index, 1);
    } else {
        udhaar[index].amount = +(pending - paid).toFixed(2);
    }

    showSuccess("Payment Updated");
    save();
    render();
}

//Ledger Function
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
            amount: s.amount,
            date: s.date
        }));

    // PISAI
    pisai.filter(p => p.name === name)
        .forEach(p => entries.push({
            type: "Pisai",
            amount: p.amount,
            date: p.date
        }));

    // PAYMENTS
    payments.filter(p => p.name === name)
        .forEach(p => entries.push({
            type: "Payment",
            amount: -p.paid,
            date: p.date
        }));

    // SORT BY DATE
    entries.sort((a, b) => new Date(a.date) - new Date(b.date));

    let balance = 0;

    let html = entries.map(e => {
        balance += e.amount;

        return `
        <div class="card">
            <b>${e.date}</b><br>
            ${e.type}: ₹${e.amount.toFixed(2)}<br>
            Balance: ₹${balance.toFixed(2)}
        </div>`;
    }).join("");

    // ✅ IMPORTANT: REPLACE content (not append)
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

// 🌾 CALC
function calcPisai() {
    let kg = +document.getElementById("pisaiKg").value || 0;
    document.getElementById("pisaiAmount").innerText = "₹" + (kg * 1.90).toFixed(2);
}

// 👤 NEW CUSTOMER TOGGLE
function handleCustomerSelect(selectId, inputId) {
    let select = document.getElementById(selectId);
    let input = document.getElementById(inputId);

    input.style.display = select.value === "new" ? "block" : "none";
}

// 📒 POPUP
function openPopup() {
    document.getElementById("udharPopup").style.display = "flex";
}
function closePopup() {
    document.getElementById("udharPopup").style.display = "none";
}
function savePopupUdhaar() {
    let name = document.getElementById("newCustomerName").value;
    let phone = document.getElementById("newCustomerPhone").value;
    let amount = +document.getElementById("popupAmount").value;

    if (!name || !amount) return alert("Enter details");

    udhaar.push({ name, phone, amount, date: new Date().toLocaleDateString() });

    closePopup();
    showSuccess("Udhaar Added");
    save();
    render();
}

// 🗑 DELETE
function deleteAllData() {
    if (!checkPassword()) return alert("Wrong password");
    if (!confirm("Delete all data?")) return;

    sales = []; expenses = []; purchase = [];
    udhaar = []; pisai = []; payments = []; stock = 0;

    save();
    render();
}

// ✅ SUCCESS
function showSuccess(msg = "✅ Done") {
    alert(msg);
}
//send whatsaap Reminder
function sendWhatsApp(name, phone, amount) {

    if (!phone || phone === "-") {
        alert("Phone number not available");
        return;
    }

    // ✅ Correct UPI deep link (WORKING)
    let upiLink = UPI_ID;

    let msg =
        `Hello ${name} ji,

Aapka Rs ${amount.toFixed(2)} udhaar baki hai.

Pay here:
${upiLink}

Kripya payment kar dein.

- GhanShayam Bhog Atta Chakki`;

    let url = `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;

    window.open(url, "_blank");
}

// 🚀 START
window.onload = function () {
    startLiveSync();
};