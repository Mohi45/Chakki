let lang = "en"; // default

const translations = {
    en: {
        home: "Home",
        buy: "Buy",
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
        addUdhaar: "Add Udhaar",
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
        addUdhaar: "उधार जोड़ें",
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
    let names = [
        ...sales.map(x => x.name),
        ...pisai.map(x => x.name),
        ...udhaar.map(x => x.name)
    ];
    return [...new Set(names.filter(Boolean))];
}

function getCustomerPhone(name) {
    if (!name) return "";
    name = name.toLowerCase().trim();

    let all = [...sales, ...pisai, ...udhaar];

    let found = all.find(x =>
        x.name &&
        x.phone &&
        x.name.toLowerCase().trim() === name
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
    return normalized === "" || /^[6-9]\d{9}$/.test(normalized);
}

function validatePhoneOrAlert(phone) {
    if (isValidPhone(phone)) return true;

    alert(lang === "hi"
        ? "सही 10 अंकों का मोबाइल नंबर डालें"
        : "Enter a valid 10-digit mobile number");
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
        text: entry.text,
        time: entry.time
    });
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

    sales.forEach(s => {
        historyItems.push({
            type: "sale",
            date: s.date || "",
            name: s.name || "",
            text: `🔴 ${s.name || ""} ${Number(s.kg || 0)}kg × ${Number(s.pkt || 0)}pkt @ ₹${Number(s.rate || 0)} = ₹${Number(s.amount || 0)}`
        });
    });

    pisai.forEach(p => {
        historyItems.push({
            type: "pisai",
            date: p.date || "",
            name: p.name || "",
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
}

function toggleLang() {
    lang = (lang === "en") ? "hi" : "en";
    render();
}
