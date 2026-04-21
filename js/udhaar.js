let currentCollectName = "";
let currentCollectPhone = "";
let currentCollectAmount = 0;

function groupUdhaarByCustomer() {
    let grouped = {};

    udhaar.forEach(u => {
        let key = normalizeCustomerName(u.name);
        if (!key) return;

        if (!grouped[key]) {
            grouped[key] = {
                name: formatCustomerName(u.name),
                phone: u.phone || "",
                sales: [],
                pisai: [],
                manual: [],
                total: 0
            };
        }

        if (u.phone) grouped[key].phone = u.phone;

        if (u.type === "sale") {
            grouped[key].sales.push(u);
        } else if (u.type === "pisai") {
            grouped[key].pisai.push(u);
        } else {
            grouped[key].manual.push(u);
        }

        grouped[key].total += Number(u.amount || 0);
    });

    return Object.values(grouped);
}

function renderUdhaarPage() {
    let grouped = groupUdhaarByCustomer();

    let totalUdhaarAll = 0;

    let list = Object.values(grouped).map(g => {
        let total = 0;
        let details = [];

        g.sales.forEach(s => {
            let pkt = Number(s.pkt || 0);
            let kg = Number(s.kg || 0);
            let rate = Number(s.rate || 0);
            let amt = Number(s.amount || 0);

            total += amt;
            details.push(`🔴 ${formatSalePackSize(kg)} × ${pkt}pkt @ ₹${rate} = ₹${amt}`);
        });

        g.pisai.forEach(p => {
            let kg = Number(p.kg || 0);
            let rate = 1.90;
            let amt = Number(p.amount || 0);

            total += amt;
            details.push(`🟡 ${kg}kg × ₹${rate} = ₹${amt}`);
        });

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

function savePopupUdhaar() {
    let name = getCustomerDisplayName(document.getElementById("newCustomerName").value);
    let phone = normalizePhone(document.getElementById("newCustomerPhone").value);
    let amount = parseFloat(document.getElementById("popupAmount").value) || 0;

    if (!name || !amount) {
        alert("⚠️ Fill details");
        return;
    }

    if (!validatePhoneOrAlert(phone)) {
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
    // ✅ CLEAR INPUT
    document.getElementById("newCustomerName").value = "";
    document.getElementById("newCustomerPhone").value = "";
    document.getElementById("popupAmount").value = "";
    closePopup();
    render();
}

function openPopup() {
    let popupCustomerList = document.getElementById("popupCustomerList");
    if (popupCustomerList) {
        popupCustomerList.innerHTML = getCustomers()
            .map(name => `<option value="${name}">${name}</option>`)
            .join("");
    }

    renderUdhaarPopupCustomers();
    document.getElementById("udharPopup").style.display = "flex";
}

function closePopup() {
    document.getElementById("udharPopup").style.display = "none";
    document.getElementById("newCustomerName").value = "";
    document.getElementById("newCustomerPhone").value = "";
    document.getElementById("popupAmount").value = "";
}

function selectPopupCustomer(name, phone) {
    document.getElementById("newCustomerName").value = name || "";
    document.getElementById("newCustomerPhone").value = phone || "";
    renderUdhaarPopupCustomers();
}

function renderUdhaarPopupCustomers() {
    let container = document.getElementById("udhaarPopupCustomerCards");
    if (!container) return;

    let search = (document.getElementById("newCustomerName")?.value || "").toLowerCase().trim();
    let grouped = groupUdhaarByCustomer()
        .filter(g => !search || g.name.toLowerCase().includes(search))
        .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));

    if (!grouped.length) {
        container.innerHTML = "";
        return;
    }

    container.innerHTML = grouped.map(g => {
        let parts = [];
        if (g.sales.length) parts.push(`${g.sales.length} sale`);
        if (g.pisai.length) parts.push(`${g.pisai.length} pisai`);
        if (g.manual.length) parts.push(`${g.manual.length} manual`);

        return `
            <div class="card" style="margin:0 0 10px 0; padding:10px; text-align:left;">
                <div style="display:flex; justify-content:space-between; gap:12px; align-items:center;">
                    <div>
                        <div style="font-weight:700; color:#333;">${g.name}</div>
                        <div style="font-size:12px; color:#777; margin-top:4px;">${g.phone || "-"}</div>
                        <div style="font-size:12px; color:#555; margin-top:4px;">${parts.join(" • ")}</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-weight:700; color:#ff6600;">₹${g.total.toFixed(2)}</div>
                        <button onclick='selectPopupCustomer(${JSON.stringify(g.name)}, ${JSON.stringify(g.phone || "")})'
                            style="margin-top:6px; padding:6px 10px; font-size:12px;">
                            Use
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

async function shareQrWithMessage(message) {
    if (!navigator.share || !navigator.canShare) return false;

    try {
        const response = await fetch(PAYMENT_QR_PATH);
        const blob = await response.blob();
        const file = new File([blob], "payment-qr.jpeg", { type: blob.type || "image/jpeg" });

        if (!navigator.canShare({ files: [file] })) {
            return false;
        }

        await navigator.share({
            title: "Payment QR",
            text: message,
            files: [file]
        });

        return true;
    } catch (error) {
        console.error("QR share failed:", error);
        return false;
    }
}

async function sendWhatsApp(name, phone) {
    if (!phone) {
        alert("No phone number");
        return;
    }

    let normalizedName = normalizeCustomerName(name);
    let customerData = udhaar.filter(u => normalizeCustomerName(u.name) === normalizedName);
    let today = new Date();
    let dueDate = today.toLocaleDateString();
    let msg = `Hello ${name},\n\n📒 Your Udhaar Details:\n\n`;
    let total = 0;

    customerData.forEach(u => {
        if (u.type === "sale") {
            let pkt = Number(u.pkt || 0);
            let kg = Number(u.kg || 0);
            let rate = Number(u.rate || 0);
            let amt = Number(u.amount || 0);

            total += amt;
            msg += `📒 ${formatSalePackSize(kg)} × ${pkt}pkt @ ₹${rate} = ₹${amt}\n`;
        } else if (u.type === "pisai") {
            let kg = Number(u.kg || 0);
            let rate = 1.90;
            let amt = Number(u.amount || 0);

            total += amt;
            msg += `🌾 ${kg + 1}kg × ₹${rate} = ₹${amt}\n`;
        } else {
            let amt = Number(u.amount || 0);
            total += amt;
            msg += `📒 ₹${amt}\n`;
        }
    });

    msg += `\n💰 Total Udhaar: ₹${total.toFixed(2)}\n`;
    msg += `📅 Due Date: ${dueDate}\n\n`;
    msg += `Please pay soon 🙏 \n`;
    msg += 'उधार लेने वाले भूल जाते हैं, देने वाले याद रखते हैं!💸 \n'
    msg += "पेमेंट के बाद, कृपया स्क्रीनशॉट शेयर करें। \n \n"
    msg += 'Managed by Safachatt Group since 2022 \n'

    msg += `\nUPI ID: ${UPI_ID}`;

    const qrShared = await shareQrWithMessage(msg);
    if (qrShared) return;

    let url = `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
}

function openCollectPopup(name, phone, amount) {
    currentCollectName = name;
    currentCollectPhone = phone;
    currentCollectAmount = amount;

    document.getElementById("collectName").value = name;
    document.getElementById("collectPhone").value = phone;
    document.getElementById("collectAmount").value = amount;
    document.getElementById("collectPopup").style.display = "flex";
}

function closeCollectPopup() {
    document.getElementById("collectPopup").style.display = "none";
}

function collectFull() {
    let name = currentCollectName;
    let phone = currentCollectPhone;
    let amount = currentCollectAmount;

    payments.push({
        name,
        phone,
        paid: amount,
        mode: "full",
        date: new Date().toISOString()
    });

    let normalizedName = normalizeCustomerName(name);
    udhaar = udhaar.filter(u => normalizeCustomerName(u.name) !== normalizedName);

    addLastEntry({
        type: "payment",
        ref: "payments",
        index: payments.length - 1,
        text: `💸${name} Full Paid ₹${amount}`,
        time: getDateTime()
    });

    saveData();
    closeCollectPopup();
    render();
}

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

        if (normalizeCustomerName(u.name) === normalizeCustomerName(name) && remaining > 0) {
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
        text: `💸 ${name} Paid ₹${payAmount}`,
        time: getDateTime()
    });

    saveData();
    closeCollectPopup();
    render();
}
