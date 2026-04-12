function render() {
    updateStaticTranslations();

    let lastEntryBox = `
<div class="card" style="background:#f9f9f9; padding:12px;">
    <b style="font-size:16px; display:block; text-align:center;">📊 ${t("lastEntries")}</b>

    <div style="margin-top:10px; display:flex; flex-direction:column; gap:10px;">
    ${lastEntries.length
            ? lastEntries.map((e, i) => {
                let color = "#333";
                let icon = "•";

                if (e.type === "sale") color = "#e53935";
                if (e.type === "pisai") color = "#fb8c00";
                if (e.type === "payment") color = "#43a047";
                if (e.type === "expense") color = "#8e24aa";
                if (e.type === "purchase") color = "#1e88e5";
                if (e.type === "udhaar") color = "#6d4c41";

                return `
<div style="
    background:white;
    border-radius:12px;
    padding:12px;
    box-shadow:0 2px 6px rgba(0,0,0,0.08);
    display:flex;
    flex-direction:column;
    gap:10px;
">

    <!-- TEXT -->
    <div style="text-align:left;">
        <div style="
            font-size:14px;
            font-weight:600;
            color:${color};
            line-height:1.4;
            word-break:break-word;
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

    <!-- BUTTONS -->
    <div style="
        display:flex;
        justify-content:flex-end;
        gap:8px;
    ">
        ${canGenerateBill(e.type) ? `
        <button onclick="sendLastEntryBill(${i})"
            style="
                background:#ff9800;
                border:none;
                color:white;
                padding:6px 12px;
                border-radius:16px;
                font-size:13px;
                font-weight:600;
            ">
            ${t("bill")}
        </button>
        ` : ""}

        <button onclick="openEditPopup(${i})"
            style="
                background:#ff3b30;
                border:none;
                color:white;
                width:32px;
                height:32px;
                border-radius:50%;
                display:flex;
                align-items:center;
                justify-content:center;
            ">
            ✏️
        </button>
    </div>

</div>
`;
            }).join("")
            : `<p style="color:#888;">${t("noEntries")}</p>`
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
    let totalUdhaar = udhaar.reduce((a, b) => a + Number(b.amount || 0), 0);
    let received = payments.reduce((a, b) => a + Number(b.paid || 0), 0);

    let alertBox = stock < LOW_STOCK_LIMIT
        ? `<div class="alert blink">⚠️ ${t("lowStock")} ${stock}kg</div>`
        : "";

    let totalKg = purchase.reduce((a, b) => a + Number(b.kg || 0), 0);
    let totalCost = purchase.reduce((a, b) => a + Number(b.amount || 0), 0);
    let totalExp = expenses.reduce((a, b) => a + Number(b.amount || 0), 0);

    let avgPurchasePerKg = totalKg ? (totalCost / totalKg) : 0;
    let expensePerKg = totalKg ? (totalExp / totalKg) : 0;
    let finalCostPerKg = avgPurchasePerKg + expensePerKg;

    let soldKg = sales.reduce((a, b) => a + (Number(b.kg || 0) * Number(b.pkt || 0)), 0);
    let totalSales = sales.reduce((a, b) => a + Number(b.amount || 0), 0);
    let salesPerKg = soldKg ? (totalSales / soldKg) : 0;
    let profitPerKg = salesPerKg - finalCostPerKg;
    let profit = profitPerKg * soldKg;

    if (page === "dashboard") {
        app.innerHTML = `
    ${alertBox}

    <div class="dashboard">
        <div class="card stat">${t("customers")}<h3>${totalCustomers}</h3></div>

        <div class="card stat">
            ${t("stock")}
            <h3>${formatKg(stock)}</h3>
            <small>(${stock} kg)</small>
        </div>

        <div class="card stat">${t("sales")}<h3>₹${totalSales.toFixed(2)}</h3></div>
        <div class="card stat">${t("expense")}<h3>₹${totalExp.toFixed(2)}</h3></div>
        <div class="card stat">${t("pisai")}<h3>₹${pisaiIncome.toFixed(2)}</h3></div>
        <div class="card stat">${t("udhaar")}<h3>₹${totalUdhaar.toFixed(2)}</h3></div>
        <div class="card stat">${t("received")}<h3>₹${received.toFixed(2)}</h3></div>
        <div class="card stat">${t("profit")}<h3>₹${profit.toFixed(2)}</h3></div>
    </div>

    <div class="card">
        <button onclick="openPopup()">📒 ${t("addUdhaar")}</button>
    </div>

    <div class="card">
        <button onclick="deleteAllData()" style="background:red;">🗑 ${t("deleteAll")}</button>
    </div>

    ${lastEntryBox}
    `;
        return;
    }

    if (page === "sales") {
        app.innerHTML = `
        <div class="card">
            <input list="customerList" id="name" placeholder="${t("searchCustomer")}"
            oninput="autoFillPhone('name','phone')">
            <datalist id="customerList">${customers}</datalist>

            <input id="newName" placeholder="${t("newCustomer")}">
            <input id="phone" placeholder="${t("phone")} *" maxlength="10" inputmode="numeric" required>

            <select id="type">
                <option value="9">9kg</option>
                <option value="50">50kg</option>
            </select>

            <input id="pkt" placeholder="${t("packets")}">
            <input id="rate" placeholder="${t("rate")}">

            <select id="pay">
                <option value="instant">${t("instant")}</option>
                <option value="udhaar">${t("udhaar")}</option>
            </select>

            <button onclick="addSale()">${t("addSale")}</button>
        </div>`;
        return;
    }

    if (page === "purchase") {
        app.innerHTML = `
        <div class="card">
            <input id="kg" placeholder="${t("kg")}">
            <input id="rate" placeholder="${t("rate")}">
            <button onclick="addPurchase()">${t("addPurchase")}</button>
        </div>`;
        return;
    }

    if (page === "expense") {
        app.innerHTML = `
        <div class="card">
            <input id="type" placeholder="${t("expenseType")}">
            <input id="amt" placeholder="${t("amount")}">
            <button onclick="addExpense()">${t("addExpense")}</button>
        </div>`;
        return;
    }

    if (page === "pisai") {
        app.innerHTML = `
        <div class="card">
            <input list="customerList" id="pisaiName" placeholder="${t("customer")}"
            oninput="autoFillPhone('pisaiName','pisaiPhone')">
            <datalist id="customerList">${customers}</datalist>

            <input id="pisaiPhone" placeholder="${t("phone")} *" maxlength="10" inputmode="numeric" required>
            <input id="pisaiKg" placeholder="${t("kg")}" oninput="calcPisai()">
            <h3 id="pisaiAmount">₹0</h3>

            <select id="pisaiPay">
                <option value="instant">${t("instant")}</option>
                <option value="udhaar">${t("udhaar")}</option>
            </select>

            <button onclick="addPisai()">${t("addPisai")}</button>
        </div>`;
        return;
    }

    if (page === "udhaar") {
        app.innerHTML = renderUdhaarPage();
        return;
    }

    if (page === "ledger") {
        app.innerHTML = `
        <div class="card">
            <select id="ledgerName">
                <option value="">${t("selectCustomer")}</option>
                ${customers}
            </select>
            <button onclick="showLedger()">${t("viewLedger")}</button>
        </div>`;
        return;
    }

    if (page === "history") {
        app.innerHTML = `
<div class="card">
    <h3>📜 ${t("fullHistory")}</h3>

    <input id="historySearch" placeholder="${t("searchCustomer")}"
        oninput="renderHistory()"
        style="margin-top:10px;">

    <button onclick="setPage('dashboard')">⬅ ${t("back")}</button>
</div>

<div id="historyList"></div>
`;
        renderHistory();
    }
}
