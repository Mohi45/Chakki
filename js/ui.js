function render() {

    // 📊 LAST ENTRIES BOX
    let lastEntryBox = `
<div class="card" style="background:#f9f9f9; padding:12px;">
    <b style="font-size:16px;">📊 Last 5 Entries</b>

    <div style="margin-top:10px;">
    ${lastEntries.length
            ? lastEntries.map((e, i) => {

                let color = "#333";
                let icon = "•";

                if (e.type === "sale") { color = "#e53935"; }
                if (e.type === "pisai") { color = "#fb8c00"; }
                if (e.type === "payment") { color = "#43a047"; }
                if (e.type === "expense") { color = "#8e24aa"; }
                if (e.type === "purchase") { color = "#1e88e5"; }
                if (e.type === "udhaar") { color = "#6d4c41"; }

                return `
            <div style="
                background:white;
                border-radius:12px;
                padding:10px;
                margin-bottom:10px;
                box-shadow:0 2px 6px rgba(0,0,0,0.08);
                display:flex;
                justify-content:space-between;
                align-items:center;
            ">

                <!-- LEFT -->
                <div style="flex:1;">
                    <div style="
                        font-size:14px;
                        font-weight:600;
                        color:${color};
                    ">
                        ${icon} ${e.text}
                    </div>

                    <div style="
                        font-size:11px;
                        color:#888;
                        margin-top:4px;
                    ">
                        ${e.time}
                    </div>
                </div>

                <!-- Edit BUTTON -->
                <button onclick="openEditPopup(${i})"
    style="
        background:#ff3b30;
        border:none;
        color:white;

        width:36px;
        height:36px;

        min-width:36px;
        max-width:36px;

        border-radius:50%;
        font-size:14px;

        display:flex;
        align-items:center;
        justify-content:center;

        cursor:pointer;
        flex-shrink:0; /* 🔥 IMPORTANT */
    ">
    ✏️
</button>

            </div>
            `;
            }).join("")
            : "<p style='color:#888;'>No entries yet</p>"
        }
    </div>
</div>
`;

    const app = document.getElementById("app");

    let customers = getCustomers()
        .map(c => `<option value="${c}">${c}</option>`)
        .join("");

    let totalCustomers = getCustomers().length;
    let totalPisaiKg = pisai.reduce((a, b) => a + (b.kg || 0), 0);
    let pisaiIncome = totalPisaiKg * 1.90;
    let totalUdhaar = udhaar.reduce((a, b) => {
        return a + Number(b.amount || 0);
    }, 0);
    let received = payments.reduce((a, b) => {
        return a + Number(b.paid || 0);
    }, 0);

    let alertBox = stock < LOW_STOCK_LIMIT
        ? `<div class='alert blink'>⚠️ Low Stock ${stock}kg</div>`
        : "";


    // TOTAL PURCHASE
    let totalKg = purchase.reduce((a, b) => a + (b.kg || 0), 0);
    let totalCost = purchase.reduce((a, b) => a + (b.amount || 0), 0);

    // EXPENSE
    let totalExp = expenses.reduce((a, b) => a + (b.amount || 0), 0);

    // COST PER KG
    let avgCost = totalKg ? totalCost / totalKg : 0;
    let expPerKg = totalKg ? totalExp / totalKg : 0;

    let costPerKg = avgCost + expPerKg;

    // SOLD DATA
    let soldKg = sales.reduce((a, b) => a + (b.kg || 0), 0);
    let totalSales = sales.reduce((a, b) => {
        return a + Number(b.amount || 0);
    }, 0);

    // ✅ REAL COST OF SOLD STOCK
    let costOfSold = costPerKg * soldKg;

    // ✅ FINAL PROFIT
    let profit = totalSales - costOfSold;
    // ================= DASHBOARD =================
    if (page === "dashboard") {
        app.innerHTML = `
        ${alertBox}

        <div class="dashboard">
            <div class="card stat">Customers<h3>${totalCustomers}</h3></div>
        <div class="card stat">
    Stock
    <h3>${formatKg(stock)}</h3>
    <small>(${stock} kg)</small>
</div>
            <div class="card stat">Sales<h3>₹${totalSales.toFixed(2)}</h3></div>
            <div class="card stat">Expense<h3>₹${totalExp.toFixed(2)}</h3></div>
            <div class="card stat">Pisai<h3>₹${pisaiIncome.toFixed(2)}</h3></div>
            <div class="card stat">Udhaar<h3>₹${totalUdhaar.toFixed(2)}</h3></div>
            <div class="card stat">Received<h3>₹${received.toFixed(2)}</h3></div>
            <div class="card stat">Profit<h3>₹${profit.toFixed(2)}</h3></div>
        </div>

        <div class="card">
            <button onclick="openPopup()">📒 Add Udhaar</button>
        </div>

        <div class="card">
            <button onclick="deleteAllData()" style="background:red;">🗑 Delete All</button>
        </div>

        ${lastEntryBox} <!-- ✅ only once at bottom -->
        `;
        return;
    }

    // ================= SALES =================
    if (page === "sales") {
        app.innerHTML = `
        <div class="card">
            <input list="customerList" id="name" placeholder="Search Customer"
            oninput="autoFillPhone('name','phone')">
            <datalist id="customerList">${customers}</datalist>

            <input id="newName" placeholder="New Customer">
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

    // ================= PURCHASE =================
    if (page === "purchase") {
        app.innerHTML = `
        <div class="card">
            <input id="kg" placeholder="Kg">
            <input id="rate" placeholder="Rate">
            <button onclick="addPurchase()">Add Purchase</button>
        </div>`;
        return;
    }

    // ================= EXPENSE =================
    if (page === "expense") {
        app.innerHTML = `
        <div class="card">
            <input id="type" placeholder="Expense Type">
            <input id="amt" placeholder="Amount">
            <button onclick="addExpense()">Add Expense</button>
        </div>`;
        return;
    }

    // ================= PISAI =================
    if (page === "pisai") {
        app.innerHTML = `
        <div class="card">
            <input list="customerList" id="pisaiName" placeholder="Customer"
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

    // ================= UDHAAR =================
    if (page === "udhaar") {
        app.innerHTML = renderUdhaarPage();
        return;
    }

    // ================= LEDGER =================
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

    //-------------HISTORY
    function safeDate(d) {
        let dt = new Date(d);
        return isNaN(dt.getTime()) ? null : dt;
    }

    if (page === "history") {

        let all = [];

        // SALES
        sales.forEach(s => {
            all.push({
                type: "sale",
                text: `💰 ${s.name} ${s.pkt ? s.pkt + "pkt" : s.kg + "kg"} ₹${s.amount}`,
                date: s.date || null
            });
        });

        // PISAI
        pisai.forEach(p => {
            all.push({
                type: "pisai",
                text: `🟡 ${p.name} ${p.kg}kg ₹${p.amount}`,
                date: new Date().toISOString()
            });
        });

        // PURCHASE
        purchase.forEach(p => {
            all.push({
                type: "purchase",
                text: `🔵 Purchase ${p.kg}kg @ ₹${p.rate}`,
                date: new Date().toISOString()
            });
        });

        // EXPENSE
        expenses.forEach(e => {
            all.push({
                type: "expense",
                text: `🟣 ${e.type} ₹${e.amount}`,
                date: new Date().toISOString()
            });
        });

        // UDHAAR
        udhaar.forEach(u => {
            all.push({
                type: "udhaar",
                text: `📒 ${u.name} ₹${u.amount}`,
                date: new Date().toISOString()
            });
        });

        // PAYMENTS
        payments.forEach(p => {
            all.push({
                type: "payment",
                text: `🟢 ${p.name} Paid ₹${p.paid}`,
                date: new Date().toISOString()
            });
        });

        // ✅ SAFE SORT
        all.sort((a, b) => {
            let da = safeDate(a.date);
            let db = safeDate(b.date);
            return (db ? db.getTime() : 0) - (da ? da.getTime() : 0);
        });

        let html = all.map(e => {

            let color = "#000";

            if (e.type === "sale") color = "#e53935";
            if (e.type === "pisai") color = "#fb8c00";
            if (e.type === "payment") color = "#43a047";
            if (e.type === "expense") color = "#8e24aa";
            if (e.type === "purchase") color = "#1e88e5";
            if (e.type === "udhaar") color = "#6d4c41";

            let dt = safeDate(e.date);

            return `
        <div class="card" style="color:${color}; font-size:14px;">
            ${e.text}<br>
            <span style="color:#888; font-size:12px;">
                ${dt ? dt.toLocaleString() : "Old Data"}
            </span>
        </div>
        `;
        }).join("");

        app.innerHTML = `
<div class="card">
    <h3>📜 Full History</h3>

    <input id="historySearch" placeholder="🔍 Search customer..."
        oninput="renderHistory()"
        style="margin-top:10px;">

    <button onclick="setPage('dashboard')">⬅ Back</button>
</div>

${html}
`;

        return;
    }
}


// ✅ FIXED PISAI CALCULATION
function calcPisai() {
    let kg = parseFloat(document.getElementById("pisaiKg").value) || 0;
    let amount = kg * 1.90;
    document.getElementById("pisaiAmount").innerText = "₹" + amount.toFixed(2);
}


// ================= DELETE ALL =================
window.deleteAllData = function () {

    let confirmDelete = confirm("⚠️ Delete ALL data?");
    if (!confirmDelete) return;

    let enteredPassword = prompt("🔐 Enter Admin Password:");
    if (!enteredPassword) return;

    if (enteredPassword !== ADMIN_PASSWORD) {
        alert("❌ Wrong password!");
        return;
    }

    let emptyData = {
        sales: [],
        expenses: [],
        purchase: [],
        udhaar: [],
        pisai: [],
        payments: [],
        stock: 0
    };

    db.collection("data").doc("main").set(emptyData)
        .then(() => {
            alert("✅ All data deleted");

            sales = [];
            expenses = [];
            purchase = [];
            udhaar = [];
            pisai = [];
            payments = [];
            stock = 0;

            render();
        })
        .catch(err => {
            console.error(err);
            alert("❌ Error deleting data");
        });
};


//Seach on History Page

let allDataCache = [];

// ================= HISTORY MAIN =================
function renderHistory() {

    let app = document.getElementById("app");

    function safeDate(d) {
        let dt = new Date(d);
        return isNaN(dt.getTime()) ? null : dt;
    }

    let all = [];

    // ===== DATA =====
    sales.forEach(s => {
        all.push({
            type: "sale",
            name: s.name || "",
            text: `💰 ${s.name} ${s.pkt ? s.pkt + "pkt" : s.kg + "kg"} ₹${s.amount}`,
            date: s.date
        });
    });

    pisai.forEach(p => {
        all.push({
            type: "pisai",
            name: p.name || "",
            text: `🟡 ${p.name} ${p.kg}kg ₹${p.amount}`,
            date: p.date
        });
    });

    udhaar.forEach(u => {
        all.push({
            type: "udhaar",
            name: u.name || "",
            text: `📒 ${u.name} ₹${u.amount}`,
            date: u.date
        });
    });

    payments.forEach(p => {
        all.push({
            type: "payment",
            name: p.name || "",
            text: `🟢 ${p.name} Paid ₹${p.paid}`,
            date: p.date
        });
    });

    expenses.forEach(e => {
        all.push({
            type: "expense",
            name: e.type || "",
            text: `🟣 ${e.type} ₹${e.amount}`,
            date: e.date
        });
    });

    purchase.forEach(p => {
        all.push({
            type: "purchase",
            name: "purchase",
            text: `🔵 Purchase ${p.kg}kg @ ₹${p.rate}`,
            date: p.date
        });
    });

    // ✅ SAVE CACHE
    allDataCache = all;

    // ✅ SORT
    allDataCache.sort((a, b) => {
        let da = safeDate(a.date);
        let db = safeDate(b.date);
        return (db ? db.getTime() : 0) - (da ? da.getTime() : 0);
    });

    // ✅ UI FIRST
    app.innerHTML = `
        <div class="card">
            <h3>📜 Full History</h3>

            <div style="display:flex; gap:8px; margin-top:10px;">

                <input id="historySearch"
                    placeholder="Search customer..."
                    style="flex:1; padding:10px; border-radius:10px; border:1px solid #ccc;">

                <button onclick="searchHistory()" 
                    style="
                        width:40px;
                        height:40px;
                        border-radius:10px;
                        border:none;
                        background:#ff6b00;
                        color:white;
                        font-size:16px;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        cursor:pointer;
                    ">
                    🔍
                </button>

            </div>

            <button onclick="setPage('dashboard')" style="margin-top:10px;">
                ⬅ Back
            </button>
        </div>

        <div id="historyList"></div>
    `;

    // ✅ NOW render list
    renderHistoryList(allDataCache);
}


// ================= SEARCH BUTTON =================
function searchHistory() {

    let search = document.getElementById("historySearch").value.toLowerCase();

    let filtered = allDataCache.filter(e =>
        e.name.toLowerCase().includes(search) ||
        e.text.toLowerCase().includes(search)
    );

    renderHistoryList(filtered);
}


// ================= RENDER LIST =================
function renderHistoryList(data) {

    function safeDate(d) {
        let dt = new Date(d);
        return isNaN(dt.getTime()) ? null : dt;
    }

    let html = data.map(e => {

        let color = "#000";

        if (e.type === "sale") color = "#e53935";
        if (e.type === "pisai") color = "#fb8c00";
        if (e.type === "payment") color = "#43a047";
        if (e.type === "expense") color = "#8e24aa";
        if (e.type === "purchase") color = "#1e88e5";
        if (e.type === "udhaar") color = "#6d4c41";

        let dt = safeDate(e.date);

        return `
        <div class="card" style="color:${color}; font-size:14px;">
            ${e.text}<br>
            <span style="color:#888; font-size:12px;">
                ${dt ? dt.toLocaleString() : "Old Data"}
            </span>
        </div>
        `;
    }).join("");

    document.getElementById("historyList").innerHTML =
        html || "<p style='padding:10px;'>No results</p>";
}