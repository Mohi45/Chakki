// ===================== GLOBAL =====================
let currentCollectName = "";
let currentCollectPhone = "";
let currentCollectAmount = 0;


// ===================== RENDER UDHAAR =====================
function renderUdhaarPage() {

    let grouped = {};

    udhaar.forEach(u => {

        let date = u.date ? new Date(u.date).toLocaleDateString() : "No Date";
        let key = u.name + "_" + date;

        if (!grouped[key]) {
            grouped[key] = {
                name: u.name,
                phone: u.phone,
                date,
                total: 0
            };
        }

        grouped[key].total += Number(u.amount || 0);
    });

    let totalUdhaarAll = 0;

    Object.values(grouped).forEach(g => {
        totalUdhaarAll += g.total;
    });

    let list = Object.values(grouped).map(g => {

        return `
        <div class="udhaar-card">

            <div class="row top">
                <span>${g.name}</span>
                <span class="amount">₹${g.total.toFixed(2)}</span>
            </div>

            <div class="row">
                <span>📅 ${g.date}</span>
                <span>📞 ${g.phone || "-"}</span>
            </div>

            <div class="actions">

                <button onclick="sendWhatsApp('${g.name}','${g.phone}',${g.total})">
                    📲
                </button>

                <button onclick="openCollectPopup('${g.name}','${g.phone}',${g.total})"
                    style="background:#16a34a;color:white;">
                    💰
                </button>

            </div>

        </div>
        `;
    }).join("");

    return `
        <div class="card">
            <h2>📒 Udhaar Khata</h2>
            <h3 style="color:#ff6600;">₹${totalUdhaarAll.toFixed(2)}</h3>
        </div>

        ${list || "<p>No Udhaar</p>"}
    `;
}


// ===================== SAVE UDHAAR =====================
function savePopupUdhaar() {

    let name = document.getElementById("newCustomerName").value;
    let phone = document.getElementById("newCustomerPhone").value;
    let amount = parseFloat(document.getElementById("popupAmount").value) || 0;

    if (!name || !amount) {
        alert("⚠️ Fill details");
        return;
    }

    udhaar.push({
        name,
        phone,
        amount,
        type: "manual",
        date: new Date().toISOString()
    });

    addLastEntry({
        type: "udhaar",
        ref: "udhaar",
        index: udhaar.length - 1,
        text: `📒 ${name} Udhaar ₹${amount}`,
        time: getDateTime()
    });

    saveData();
    closePopup();
    render();
}


// ===================== UDHAAR POPUP =====================
function openPopup() {
    document.getElementById("udharPopup").style.display = "flex";
}

function closePopup() {
    document.getElementById("udharPopup").style.display = "none";
}


// ===================== WHATSAPP =====================
function sendWhatsApp(name, phone, amount) {

    if (!phone) {
        alert("No phone number");
        return;
    }

    let msg = `Hello ${name},\nYour pending udhaar is ₹${amount}.\nPlease pay soon 🙏`;

    let url = `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
}


// ===================== OPEN COLLECT POPUP =====================
function openCollectPopup(name, phone, amount) {

    currentCollectName = name;
    currentCollectPhone = phone;
    currentCollectAmount = amount;

    document.getElementById("collectName").value = name;
    document.getElementById("collectPhone").value = phone;
    document.getElementById("collectAmount").value = amount;

    document.getElementById("collectPopup").style.display = "flex";
}


// ===================== CLOSE COLLECT POPUP =====================
function closeCollectPopup() {
    document.getElementById("collectPopup").style.display = "none";
}


// ===================== FULL PAYMENT =====================
function collectFull() {

    let name = currentCollectName;
    let phone = currentCollectPhone;
    let amount = currentCollectAmount;

    // ✅ ADD PAYMENT
    payments.push({
        name,
        phone,
        paid: amount,
        mode: "full",
        date: new Date().toISOString()
    });

    // ❌ REMOVE ALL UDHAAR
    udhaar = udhaar.filter(u => u.name !== name);

    addLastEntry({
        type: "payment",
        ref: "payments",
        index: payments.length - 1,
        text: `🟢 ${name} Full Paid ₹${amount}`,
        time: getDateTime()
    });

    saveData();
    closeCollectPopup();
    render();
}


// ===================== PARTIAL PAYMENT =====================
function collectPartial() {

    let name = currentCollectName;
    let phone = currentCollectPhone;
    let payAmount = parseFloat(document.getElementById("collectAmount").value) || 0;

    if (!payAmount) {
        alert("Enter amount");
        return;
    }

    let remaining = payAmount;

    for (let i = 0; i < udhaar.length; i++) {

        let u = udhaar[i];

        if (u.name === name && remaining > 0) {

            if (u.amount <= remaining) {
                remaining -= u.amount;
                udhaar.splice(i, 1);
                i--;
            } else {
                u.amount -= remaining;
                remaining = 0;
            }
        }
    }

    // ✅ ADD PAYMENT
    payments.push({
        name,
        phone,
        paid: payAmount,
        mode: "partial",
        date: new Date().toISOString()
    });

    addLastEntry({
        type: "payment",
        ref: "payments",
        index: payments.length - 1,
        text: `🟢 ${name} Paid ₹${payAmount}`,
        time: getDateTime()
    });

    saveData();
    closeCollectPopup();
    render();
}