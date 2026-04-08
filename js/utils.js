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
function clearInputs(ids) {
    ids.forEach(id => {
        let el = document.getElementById(id);
        if (el) el.value = "";
    });
}

function addLastEntry(entry) {

    // keep only last 5
    if (lastEntries.length >= 5) {
        lastEntries.shift();
    }

    lastEntries.push({
        type: entry.type,
        ref: entry.ref,     // 🔥 important (sales, purchase, etc)
        index: entry.index, // 🔥 important
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

    let date = now.toLocaleDateString("en-GB"); // 07/04/2026
    let time = now.toLocaleTimeString();       // 2:45:30 PM

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
    let phone = document.getElementById("editPhone").value;
    let kg = parseFloat(document.getElementById("editKg").value) || 0;
    let amount = parseFloat(document.getElementById("editAmount").value) || 0;

    // 🔁 UPDATE MAIN DATA
    let dataArray = window[entry.ref]; // sales / purchase / udhaar / etc

    if (dataArray && dataArray[entry.index]) {

        let item = dataArray[entry.index];

        item.name = name;
        item.phone = phone;
        item.amount = amount;

        if ("kg" in item) item.kg = kg;
        if ("pkt" in item) item.pkt = kg;

        // ✅ update date (optional)
        item.date = new Date().toISOString();
    }

    // 🔁 UPDATE LAST ENTRY TEXT
    entry.text = `✏️ ${name} ₹${amount}`;
    entry.time = getDateTime();

    saveData();
    closeEditPopup();
    render();
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
