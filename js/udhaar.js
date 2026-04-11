// ===================== GLOBAL =====================
let currentCollectName = "";
let currentCollectPhone = "";
let currentCollectAmount = 0;


// ===================== RENDER UDHAAR =====================
function renderUdhaarPage() {

    let grouped = {};

    udhaar.forEach(u => {

        let key = u.name;

        if (!grouped[key]) {
            grouped[key] = {
                name: u.name,
                phone: u.phone,
                sales: [],
                pisai: [],
                manual: []
            };
        }

        if (u.phone) grouped[key].phone = u.phone;

        if (u.type === "sale") {
            grouped[key].sales.push(u);
        }

        else if (u.type === "pisai") {
            grouped[key].pisai.push(u);
        }

        else {
            grouped[key].manual.push(u);
        }
    });

    let totalUdhaarAll = 0;

    let list = Object.values(grouped).map(g => {

        let total = 0;
        let details = [];

        // 🔴 SALES DETAILS
        g.sales.forEach(s => {
            let pkt = Number(s.pkt || 0);
            let kg = Number(s.kg || 0);
            let rate = Number(s.rate || 0);
            let amt = Number(s.amount || 0);

            total += amt;

            let perPktKg = pkt ? (kg / pkt) : kg;

            details.push(`🔴 ${perPktKg}kg × ${pkt}pkt @ ₹${rate} = ₹${amt}`);
        });

        // 🟡 PISAI DETAILS
        g.pisai.forEach(p => {
            let kg = Number(p.kg || 0);
            let rate = 1.90;
            let amt = Number(p.amount || 0);

            total += amt;

            details.push(`🟡 ${kg}kg × ₹${rate} = ₹${amt}`);
        });

        // 📒 MANUAL
        g.manual.forEach(m => {
            let amt = Number(m.amount || 0);
            total += amt;
            details.push(`📒 ₹${amt}`);
        });

        totalUdhaarAll += total;

        return `
        <div class="udhaar-card">

            <div class="row top">
                <span>${g.name}</span>
                <span class="amount">₹${total.toFixed(2)}</span>
            </div>

            <div class="row">
                <span>📞 ${g.phone || "-"}</span>
            </div>

            <div style="font-size:13px;color:#555; margin-top:6px;">
                ${details.join("<br>")}
            </div>

            <div class="actions">
                <button onclick="sendWhatsApp('${g.name}','${g.phone}')">📲</button>

                <button onclick="openCollectPopup('${g.name}','${g.phone}',${total})"
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
function sendWhatsApp(name, phone) {

    if (!phone) {
        alert("No phone number");
        return;
    }

    let customerData = udhaar.filter(u => u.name === name);

    let today = new Date();
    let dueDate = today.toLocaleDateString(); // 📅 current date

    let msg = `Hello ${name},\n\n📒 Your Udhaar Details:\n\n`;

    let total = 0;

    customerData.forEach(u => {

        if (u.type === "sale") {
            let pkt = Number(u.pkt || 0);
            let kg = Number(u.kg || 0);
            let rate = Number(u.rate || 0);
            let amt = Number(u.amount || 0);

            total += amt;

            let perPktKg = pkt ? (kg / pkt) : kg;

            msg += `🔴 ${perPktKg}kg × ${pkt}pkt @ ₹${rate} = ₹${amt}\n`;
        }

        else if (u.type === "pisai") {
            let kg = Number(u.kg || 0);
            let rate = 1.90;
            let amt = Number(u.amount || 0);

            total += amt;

            msg += `🟡 ${kg}kg × ₹${rate} = ₹${amt}\n`;
        }

        else {
            let amt = Number(u.amount || 0);
            total += amt;

            msg += `📒 ₹${amt}\n`;
        }
    });

    msg += `\n💰 Total Udhaar: ₹${total.toFixed(2)}\n`;
    msg += `📅 Due Date: ${dueDate}\n\n`;
    msg += `Please pay soon 🙏`;

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