let lang = "en"; // default

const translations = {
    en: {
        home: "Home",
        buy: "Buy",
        calculator: "Calculator",
        closeCalculator: "Close Calc",
        history: "History",
        save: "Save",
        cancel: "Cancel",
        collectPayment: "Collect Payment",
        full: "Full",
        partial: "Partial",
        editEntry: "Edit Entry",
        update: "Update",
        installApp: "Install App",
        searchOrAddCustomer: "Search or Add Customer",
        phoneNumber: "Phone Number",
        enterAmount: "Enter Amount",
        customerName: "Customer Name",
        kgOrPackets: "Kg / Packets",
        lastEntries: "Last 5 Entries",
        noEntries: "No entries yet",
        lowStock: "Low Stock",
        customers: "Customers",
        stock: "Stock",
        sales: "Sales",
        expense: "Expense",
        pisai: "Pisai",
        udhaar: "Udhaar",
        received: "Received",
        profit: "Profit",
        outstandingExpense: "Outstanding Expense",
        addUdhaar: "Add Udhaar",
        bill: "Bill",
        deleteAll: "Delete All",
        searchCustomer: "Search Customer",
        newCustomer: "New Customer",
        phone: "Phone",
        packets: "Packets",
        rate: "Rate",
        instant: "Instant",
        addSale: "Add Sale",
        kg: "Kg",
        addPurchase: "Add Purchase",
        expenseType: "Expense Type",
        amount: "Amount",
        addExpense: "Add Expense",
        customer: "Customer",
        addPisai: "Add Pisai",
        selectCustomer: "Select Customer",
        viewLedger: "View Ledger",
        fullHistory: "Full History",
        back: "Back"
    },

    hi: {
        home: "होम",
        buy: "खरीद",
        calculator: "कैलकुलेटर",
        closeCalculator: "कैल्क बंद",
        history: "इतिहास",
        save: "सेव",
        cancel: "रद्द करें",
        collectPayment: "पेमेंट लें",
        full: "पूरा",
        partial: "आंशिक",
        editEntry: "एंट्री एडिट करें",
        update: "अपडेट",
        installApp: "ऐप इंस्टॉल करें",
        searchOrAddCustomer: "ग्राहक खोजें या जोड़ें",
        phoneNumber: "फोन नंबर",
        enterAmount: "राशि दर्ज करें",
        customerName: "ग्राहक नाम",
        kgOrPackets: "किलो / पैकेट",
        lastEntries: "पिछली 5 एंट्री",
        noEntries: "कोई एंट्री नहीं",
        lowStock: "स्टॉक कम है",
        customers: "ग्राहक",
        stock: "स्टॉक",
        sales: "बिक्री",
        expense: "खर्च",
        pisai: "पिसाई",
        udhaar: "उधार",
        received: "प्राप्त",
        profit: "लाभ",
        outstandingExpense: "बकाया खर्च",
        addUdhaar: "उधार जोड़ें",
        bill: "बिल",
        deleteAll: "सब हटाएं",
        searchCustomer: "ग्राहक खोजें",
        newCustomer: "नया ग्राहक",
        phone: "फोन",
        packets: "पैकेट",
        rate: "रेट",
        instant: "तुरंत",
        addSale: "बिक्री जोड़ें",
        kg: "किलो",
        addPurchase: "खरीद जोड़ें",
        expenseType: "खर्च प्रकार",
        amount: "राशि",
        addExpense: "खर्च जोड़ें",
        customer: "ग्राहक",
        addPisai: "पिसाई जोड़ें",
        selectCustomer: "ग्राहक चुनें",
        viewLedger: "खाता देखें",
        fullHistory: "पूरा इतिहास",
        back: "वापस"
    }
};

function getCustomers() {
    let all = [...sales, ...pisai, ...udhaar];
    let seen = new Set();

    return all
        .map(x => formatCustomerName(x.name))
        .filter(name => {
            let key = normalizeCustomerName(name);
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
}

function normalizeCustomerName(name) {
    return String(name || "")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();
}

function formatCustomerName(name) {
    return String(name || "").trim().replace(/\s+/g, " ");
}

function getCustomerDisplayName(name) {
    let formatted = formatCustomerName(name);
    let normalized = normalizeCustomerName(formatted);
    if (!normalized) return "";

    let all = [...sales, ...pisai, ...udhaar, ...payments];
    let found = all.find(x => normalizeCustomerName(x.name) === normalized);

    return found ? formatCustomerName(found.name) : formatted;
}

function getCustomerPhone(name) {
    if (!name) return "";
    let normalizedName = normalizeCustomerName(name);

    let all = [...sales, ...pisai, ...udhaar, ...payments];

    let found = all.find(x =>
        x.name &&
        x.phone &&
        normalizeCustomerName(x.name) === normalizedName
    );

    return found ? found.phone : "";
}

function autoFillPhone(inputId, phoneId) {
    let name = document.getElementById(inputId).value;
    let phone = getCustomerPhone(name);
    if (phone) document.getElementById(phoneId).value = phone;
}

function normalizePhone(phone) {
    return String(phone || "").replace(/\D/g, "");
}

function isValidPhone(phone) {
    const normalized = normalizePhone(phone);
    return /^[6-9]\d{9}$/.test(normalized);
}

function validatePhoneOrAlert(phone) {
    if (isValidPhone(phone)) return true;

    const normalized = normalizePhone(phone);

    alert(lang === "hi"
        ? (normalized
            ? "सही 10 अंकों का मोबाइल नंबर डालें"
            : "फोन नंबर जरूरी है")
        : (normalized
            ? "Enter a valid 10-digit mobile number"
            : "Phone number is required"));
    return false;
}

function clearInputs(ids) {
    ids.forEach(id => {
        let el = document.getElementById(id);
        if (el) el.value = "";
    });
}

function addLastEntry(entry) {
    if (lastEntries.length >= 5) {
        lastEntries.shift();
    }

    lastEntries.push({
        type: entry.type,
        ref: entry.ref,
        index: entry.index,
        name: entry.name || "",
        phone: entry.phone || "",
        kg: entry.kg || 0,
        pkt: entry.pkt || 0,
        amount: entry.amount || 0,
        rate: entry.rate || 0,
        pay: entry.pay || "",
        payType: entry.payType || "",
        mode: entry.mode || "",
        date: entry.date || "",
        text: entry.text,
        time: entry.time
    });
}

function formatSalePackSize(kg) {
    let numericKg = Number(kg || 0);
    if (numericKg === 9) return "10kg";
    if (numericKg === 49) return "50kg";
    return `${numericKg}kg`;
}

function getLastEntryText(entry) {
    if (!entry) return "";

    if (entry.type === "sale") {
        let record = getTransactionRecord(entry.ref, entry.index, entry, entry.type) || entry;
        return `💰 ${formatSalePackSize(record.kg)} × ${Number(record.pkt || 0)}pkt @ ₹${Number(record.rate || 0)} = ₹${Number(record.amount || 0)}`;
    }

    return entry.text || "";
}

window.calcPisai = function () {
    let kgInput = document.getElementById("pisaiKg");
    let amountBox = document.getElementById("pisaiAmount");

    if (!kgInput || !amountBox) return;

    let kg = parseFloat(kgInput.value) || 0;
    let amount = kg * 1.90;

    amountBox.innerText = "₹" + amount.toFixed(2);
};

function playSound() {
    let audio = new Audio("https://www.soundjay.com/buttons/sounds/button-3.mp3");
    audio.play();
}

function getDateTime() {
    let now = new Date();
    let date = now.toLocaleDateString("en-GB");
    let time = now.toLocaleTimeString();
    return `${date} | ${time}`;
}

let editIndex = null;

function openEditPopup(index) {
    let e = lastEntries[index];
    editIndex = index;

    document.getElementById("editName").value = e.name || "";
    document.getElementById("editPhone").value = e.phone || "";
    document.getElementById("editKg").value = e.kg || e.pkt || "";
    document.getElementById("editAmount").value = e.amount || 0;
    document.getElementById("editPopup").style.display = "flex";
}

function closeEditPopup() {
    document.getElementById("editPopup").style.display = "none";
}

function updateEntry() {
    if (editIndex === null) return;

    let entry = lastEntries[editIndex];
    let name = document.getElementById("editName").value;
    let phone = normalizePhone(document.getElementById("editPhone").value);
    let kg = parseFloat(document.getElementById("editKg").value) || 0;
    let amount = parseFloat(document.getElementById("editAmount").value) || 0;

    if (!validatePhoneOrAlert(phone)) return;

    let dataArray = window[entry.ref];

    if (dataArray && dataArray[entry.index]) {
        let item = dataArray[entry.index];
        item.name = name;
        item.phone = phone;
        item.amount = amount;

        if ("kg" in item) item.kg = kg;
        if ("pkt" in item) item.pkt = kg;

        item.date = new Date().toISOString();
    }

    entry.text = `✏️ ${name} ₹${amount}`;
    entry.time = getDateTime();

    saveData();
    closeEditPopup();
    render();
}

function adjustLastEntryIndexes(ref, removedIndex) {
    lastEntries.forEach(entry => {
        if (entry.ref === ref && entry.index > removedIndex) {
            entry.index -= 1;
        }
    });
}

function removeLastEntryAt(index) {
    lastEntries.splice(index, 1);
}

function removeLinkedLastEntry(ref, matcher) {
    let linkedIndex = lastEntries.findIndex(entry =>
        entry.ref === ref && matcher(entry)
    );

    if (linkedIndex !== -1) {
        removeLastEntryAt(linkedIndex);
    }
}

function deleteLinkedPayment(name, phone, amount, mode) {
    let paymentIndex = payments.findIndex(payment =>
        normalizeCustomerName(payment.name) === normalizeCustomerName(name) &&
        normalizePhone(payment.phone || "") === normalizePhone(phone || "") &&
        Number(payment.paid || 0) === Number(amount || 0) &&
        (mode ? (payment.mode || "") === mode : true)
    );

    if (paymentIndex === -1 && !phone) {
        paymentIndex = payments.findIndex(payment =>
            normalizeCustomerName(payment.name) === normalizeCustomerName(name) &&
            Number(payment.paid || 0) === Number(amount || 0) &&
            (mode ? (payment.mode || "") === mode : true)
        );
    }

    if (paymentIndex === -1) return;

    payments.splice(paymentIndex, 1);
    adjustLastEntryIndexes("payments", paymentIndex);
    removeLinkedLastEntry("payments", entry =>
        normalizeCustomerName(entry.name) === normalizeCustomerName(name) &&
        Number(entry.amount || 0) === Number(amount || 0)
    );
}

function deleteLinkedUdhaar(name, phone, amount, type, extraMatcher) {
    let udhaarIndex = udhaar.findIndex(item =>
        normalizeCustomerName(item.name) === normalizeCustomerName(name) &&
        normalizePhone(item.phone || "") === normalizePhone(phone || "") &&
        Number(item.amount || 0) === Number(amount || 0) &&
        item.type === type &&
        (!extraMatcher || extraMatcher(item))
    );

    if (udhaarIndex === -1) return;

    udhaar.splice(udhaarIndex, 1);
    adjustLastEntryIndexes("udhaar", udhaarIndex);
    removeLinkedLastEntry("udhaar", entry =>
        normalizeCustomerName(entry.name) === normalizeCustomerName(name) &&
        Number(entry.amount || 0) === Number(amount || 0)
    );
}

function deleteLastEntry(index) {
    let entry = lastEntries[index];
    if (!entry) return;

    let confirmed = confirm(lang === "hi"
        ? "क्या आप इस एंट्री को डिलीट करना चाहते हैं?"
        : "Do you want to delete this entry?");

    if (!confirmed) return;

    if (entry.type === "sale") {
        let record = getTransactionRecord(entry.ref, entry.index, entry, entry.type);
        if (!record) return;

        let saleIndex = sales.indexOf(record);
        if (saleIndex === -1) return;

        stock += Number(record.kg || 0) * Number(record.pkt || 0);

        if ((record.payType || "") === "instant") {
            deleteLinkedPayment(record.name, record.phone, record.amount);
        }

        if ((record.payType || "") === "udhaar") {
            deleteLinkedUdhaar(record.name, record.phone, record.amount, "sale", item =>
                Number(item.kg || 0) === Number(record.kg || 0) &&
                Number(item.pkt || 0) === Number(record.pkt || 0)
            );
        }

        sales.splice(saleIndex, 1);
        adjustLastEntryIndexes("sales", saleIndex);
        removeLastEntryAt(index);
    } else if (entry.type === "pisai") {
        let record = getTransactionRecord(entry.ref, entry.index, entry, entry.type);
        if (!record) return;

        let pisaiIndex = pisai.indexOf(record);
        if (pisaiIndex === -1) return;

        if ((record.pay || "") === "instant") {
            deleteLinkedPayment(record.name, record.phone, record.amount);
        }

        if ((record.pay || "") === "udhaar") {
            deleteLinkedUdhaar(record.name, record.phone, record.amount, "pisai", item =>
                Number(item.kg || 0) === Number(record.kg || 0)
            );
        }

        pisai.splice(pisaiIndex, 1);
        adjustLastEntryIndexes("pisai", pisaiIndex);
        removeLastEntryAt(index);
    } else if (entry.type === "purchase") {
        let record = purchase[entry.index];
        if (!record) return;

        stock -= Number(record.kg || 0);
        purchase.splice(entry.index, 1);
        adjustLastEntryIndexes("purchase", entry.index);
        removeLastEntryAt(index);
    } else if (entry.type === "expense") {
        if (!expenses[entry.index]) return;

        expenses.splice(entry.index, 1);
        adjustLastEntryIndexes("expenses", entry.index);
        removeLastEntryAt(index);
    } else if (entry.type === "udhaar") {
        if (!udhaar[entry.index]) return;

        udhaar.splice(entry.index, 1);
        adjustLastEntryIndexes("udhaar", entry.index);
        removeLastEntryAt(index);
    } else if (entry.type === "payment") {
        let record = payments[entry.index];
        if (!record) return;

        if ((record.mode || "") === "full" || (record.mode || "") === "partial") {
            udhaar.push({
                name: record.name,
                phone: record.phone || "",
                amount: Number(record.paid || 0),
                type: "manual",
                date: new Date().toISOString()
            });
        }

        payments.splice(entry.index, 1);
        adjustLastEntryIndexes("payments", entry.index);
        removeLastEntryAt(index);
    }

    saveData();
    render();
}

function deleteAllData() {
    const confirmed = confirm(
        lang === "hi"
            ? "क्या आप सारा डेटा डिलीट करना चाहते हैं?"
            : "Do you want to delete all data?"
    );

    if (!confirmed) return;

    const password = prompt(
        lang === "hi"
            ? "Delete All के लिए password डालें"
            : "Enter password for Delete All"
    );

    if (password !== "Safachatt@1234") {
        alert(
            lang === "hi"
                ? "गलत password"
                : "Wrong password"
        );
        return;
    }

    sales = [];
    expenses = [];
    purchase = [];
    udhaar = [];
    pisai = [];
    payments = [];
    lastEntries = [];
    stock = 0;

    saveData();
    render();
}

function renderHistory() {
    const searchBox = document.getElementById("historySearch");
    const historyList = document.getElementById("historyList");

    if (!historyList) return;

    const search = (searchBox?.value || "").toLowerCase().trim();
    const historyItems = [];

    sales.forEach((s, index) => {
        historyItems.push({
            type: "sale",
            ref: "sales",
            index,
            date: s.date || "",
            name: s.name || "",
            phone: s.phone || "",
            text: `🔴 ${s.name || ""} ${formatSalePackSize(s.kg)} × ${Number(s.pkt || 0)}pkt @ ₹${Number(s.rate || 0)} = ₹${Number(s.amount || 0)}`
        });
    });

    pisai.forEach((p, index) => {
        historyItems.push({
            type: "pisai",
            ref: "pisai",
            index,
            date: p.date || "",
            name: p.name || "",
            phone: p.phone || "",
            text: `🟡 ${p.name || ""} ${Number(p.kg || 0)}kg ₹${Number(p.amount || 0)}`
        });
    });

    purchase.forEach(p => {
        historyItems.push({
            type: "purchase",
            date: p.date || "",
            name: "",
            text: `🔵 Purchase ${formatKg(Number(p.kg || 0))} @ ₹${Number(p.rate || 0)} = ₹${Number(p.amount || 0)}`
        });
    });

    expenses.forEach(e => {
        historyItems.push({
            type: "expense",
            date: e.date || "",
            name: e.type || "",
            text: `💸 ${e.type || "Expense"} ₹${Number(e.amount || 0)}`
        });
    });

    udhaar
        .filter(u => u.type === "manual")
        .forEach(u => {
            historyItems.push({
                type: "udhaar",
                date: u.date || "",
                name: u.name || "",
                text: `📒 ${u.name || ""} Udhaar ₹${Number(u.amount || 0)}`
            });
        });

    payments.forEach(p => {
        historyItems.push({
            type: "payment",
            date: p.date || "",
            name: p.name || "",
            text: `🟢 ${p.name || ""} Paid ₹${Number(p.paid || 0)}`
        });
    });

    const filteredItems = historyItems
        .filter(item => !search || item.text.toLowerCase().includes(search) || item.name.toLowerCase().includes(search))
        .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    historyList.innerHTML = filteredItems.length
        ? filteredItems.map(item => `
            <div class="card" style="text-align:left;">
                <div style="font-size:14px;font-weight:600;color:#333;">${item.text}</div>
                <div style="font-size:12px;color:#777;margin-top:6px;">
                    ${item.date ? new Date(item.date).toLocaleString("en-GB") : "Old Data"}
                </div>
                ${canGenerateBill(item.type) ? `
                <button onclick="sendHistoryBill('${item.ref}', ${item.index}, '${item.type}')"
                    style="margin-top:10px;">
                    ${t("bill")}
                </button>
                ` : ""}
            </div>
        `).join("")
        : `<div class="card"><p style="color:#888;">${search ? "No matching history" : "No history yet"}</p></div>`;
}

function sendWhatsApp(name, phone, amount) {
    if (!phone) {
        alert("No phone number");
        return;
    }

    let msg = `Hello ${name},\nYour pending udhaar is ₹${amount}.\nPlease pay soon 🙏`;
    let url = `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
}

function getCustomerPendingUdhaarAmount(name) {
    let normalizedName = normalizeCustomerName(name);
    if (!normalizedName) return 0;

    return udhaar
        .filter(u => normalizeCustomerName(u.name) === normalizedName)
        .reduce((total, u) => total + Number(u.amount || 0), 0);
}

function confirmUdhaarBeforeContinue(name) {
    let pendingAmount = getCustomerPendingUdhaarAmount(name);
    if (!pendingAmount) return true;

    let customerName = getCustomerDisplayName(name) || formatCustomerName(name) || "Customer";
    let message = lang === "hi"
        ? `${customerName} का पहले से उधार ₹${pendingAmount.toFixed(2)} है.\n\nकृपया पहले उधार चुकाएं.\n\nजारी रखने के लिए OK दबाएं, रुकने के लिए Cancel दबाएं।`
        : `${customerName} already has pending udhaar of ₹${pendingAmount.toFixed(2)}.\n\nPlease pay first udhaar.\n\nPress OK to continue or Cancel to stop.`;

    return confirm(message);
}

function canGenerateBill(type) {
    return type === "sale" || type === "pisai";
}

function getDataArrayByRef(ref) {
    if (ref === "sales") return sales;
    if (ref === "pisai") return pisai;
    if (ref === "payments") return payments;
    if (ref === "purchase") return purchase;
    if (ref === "expenses") return expenses;
    if (ref === "udhaar") return udhaar;

    let dataArray = window[ref];
    return Array.isArray(dataArray) ? dataArray : null;
}

function isSameTransaction(entry, record, type) {
    if (!entry || !record) return false;

    let sameName = normalizeCustomerName(entry.name) === normalizeCustomerName(record.name);
    let samePhone = normalizePhone(entry.phone) === normalizePhone(record.phone);
    let sameAmount = Number(entry.amount || 0) === Number(record.amount || 0);
    let sameDate = Boolean(entry.date && record.date && entry.date === record.date);

    if (type === "sale") {
        return sameName &&
            sameAmount &&
            Number(entry.kg || 0) === Number(record.kg || 0) &&
            Number(entry.pkt || 0) === Number(record.pkt || 0) &&
            (sameDate || samePhone);
    }

    if (type === "pisai") {
        return sameName &&
            sameAmount &&
            Number(entry.kg || 0) === Number(record.kg || 0) &&
            (sameDate || samePhone);
    }

    return false;
}

function getTransactionRecord(ref, index, entry, type) {
    let dataArray = getDataArrayByRef(ref);
    if (!Array.isArray(dataArray)) return null;

    let directRecord = dataArray[index];
    if (directRecord) {
        if (!entry || !type || isSameTransaction(entry, directRecord, type)) {
            return directRecord;
        }
    }

    if (!entry || !type) return directRecord || null;

    return dataArray.find(record => isSameTransaction(entry, record, type)) || null;
}

function buildTransactionBill(entry) {
    if (!entry || !canGenerateBill(entry.type)) return null;

    let name = formatCustomerName(entry.name || "");
    let phone = normalizePhone(entry.phone || "");
    let amount = Number(entry.amount || 0);
    let dateText = entry.date
        ? new Date(entry.date).toLocaleString("en-GB")
        : getDateTime();
    let payType = entry.payType || entry.pay || "";
    let paymentText = payType
        ? payType.charAt(0).toUpperCase() + payType.slice(1)
        : "-";
    let lines = [
        `Hello ${name},`,
        "",
        "GhanShayam Bhog Atta Chakki",
        "Transaction Bill",
        `Date: ${dateText}`,
        ""
    ];

    if (entry.type === "sale") {
        lines.push(`Customer: ${name}`);
        lines.push("Type: Sale");
        lines.push(`Pack Size: ${formatSalePackSize(entry.kg)}`);
        lines.push(`Packets: ${Number(entry.pkt || 0)}`);
        lines.push(`Rate: ₹${Number(entry.rate || 0).toFixed(2)}`);
        lines.push(`Total: ₹${amount.toFixed(2)}`);
        lines.push(`Payment: ${paymentText}`);
    } else {
        lines.push(`Customer: ${name}`);
        lines.push("Type: Pisai");
        lines.push(`Weight: ${Number(entry.kg || 0)}kg`);
        lines.push(`Rate: ₹${Number(entry.rate || 1.9).toFixed(2)}/kg`);
        lines.push(`Total: ₹${amount.toFixed(2)}`);
        lines.push(`Payment: ${paymentText}`);
    }

    lines.push("");
    lines.push("Thank you.");
    lines.push("Managed by Safachatt Group since 2022");

    return {
        name,
        phone,
        message: lines.join("\n")
    };
}

function sendTransactionBill(entry) {
    let bill = buildTransactionBill(entry);

    if (!bill) {
        alert("Bill is available only for Sale and Pisai");
        return;
    }

    if (!bill.phone) {
        alert("Add customer phone number to send bill");
        return;
    }

    let url = `https://wa.me/91${bill.phone}?text=${encodeURIComponent(bill.message)}`;
    window.open(url, "_blank");
}

function sendLastEntryBill(index) {
    let entry = lastEntries[index];
    if (!entry) return;

    let record = getTransactionRecord(entry.ref, entry.index, entry, entry.type);
    if (!record) {
        alert("Transaction not found");
        return;
    }

    sendTransactionBill({
        ...record,
        type: entry.type
    });
}

function sendHistoryBill(ref, index, type) {
    let dataArray = getDataArrayByRef(ref);
    let fallbackEntry = Array.isArray(dataArray) ? dataArray[index] : null;
    let record = getTransactionRecord(ref, index, fallbackEntry, type);
    if (!record) {
        alert("Transaction not found");
        return;
    }

    sendTransactionBill({
        ...record,
        type
    });
}

function formatKg(kg) {
    kg = Number(kg || 0);

    let quintal = Math.floor(kg / 100);
    let remainingKg = kg % 100;
    let result = "";

    if (quintal) result += `${quintal} quintal `;
    if (remainingKg) result += `${remainingKg} kg`;

    return result || "0 kg";
}

function t(key) {
    return translations[lang][key] || key;
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function setHtml(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = value;
}

function setPlaceholder(id, value) {
    const el = document.getElementById(id);
    if (el) el.placeholder = value;
}

function updateStaticTranslations() {
    setText("langToggle", lang === "en" ? "हिंदी" : "English");
    setHtml("navDashboard", `🏠<br>${t("home")}`);
    setHtml("navSales", `💰<br>${t("sales")}`);
    setHtml("navPisai", `🌾<br>${t("pisai")}`);
    setHtml("navPurchase", `🛒<br>${t("buy")}`);
    setHtml("navExpense", `💸<br>${t("expense")}`);
    setHtml("navUdhaar", `📒<br>${t("udhaar")}`);
    setHtml("navHistory", `📜<br>${t("history")}`);
    setText("calculatorToggle", isCalculatorOpen ? t("closeCalculator") : t("calculator"));

    setText("installBtn", `📲 ${t("installApp")}`);
    setText("addUdhaarTitle", `📒 ${t("addUdhaar")}`);
    setText("saveUdhaarBtn", t("save"));
    setText("cancelUdhaarBtn", t("cancel"));
    setText("collectPaymentTitle", `💰 ${t("collectPayment")}`);
    setText("collectFullBtn", `✅ ${t("full")}`);
    setText("collectPartialBtn", `➖ ${t("partial")}`);
    setText("cancelCollectBtn", `❌ ${t("cancel")}`);
    setText("editEntryTitle", `✏️ ${t("editEntry")}`);
    setText("updateEntryBtn", t("update"));
    setText("cancelEditBtn", t("cancel"));

    setPlaceholder("newCustomerName", t("searchOrAddCustomer"));
    setPlaceholder("newCustomerPhone", t("phoneNumber"));
    setPlaceholder("popupAmount", t("amount"));
    setPlaceholder("collectAmount", t("enterAmount"));
    setPlaceholder("editName", t("customerName"));
    setPlaceholder("editPhone", t("phoneNumber"));
    setPlaceholder("editKg", t("kgOrPackets"));
    setPlaceholder("editAmount", t("amount"));
    setText("logoutBtn", "Logout");
    setText("loginBtn", "Login");
    setText("loginTitle", "Secure Login");
    setText("loginSubtitle", "Sign in to access Atta Chakki data");
    setPlaceholder("loginUsername", "Username");
    setPlaceholder("loginPassword", "Password");
}

function toggleLang() {
    lang = (lang === "en") ? "hi" : "en";
    render();
}
