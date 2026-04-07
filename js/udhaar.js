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

                saleAmount: 0,
                salePkt: 0,
                saleKg: 0,
                saleRate: 0,

                pisaiAmount: 0,
                pisaiKg: 0,
                pisaiRate: 1.90,

                puranaAmount: 0
            };
        }

        if (u.type === "sale") {
            grouped[key].saleAmount += Number(u.amount);
            grouped[key].salePkt += Number(u.pkt || 0);
            grouped[key].saleKg += Number(u.kg || 0);
            grouped[key].saleRate = u.rate || 0;
        }

        else if (u.type === "pisai") {
            grouped[key].pisaiAmount += Number(u.amount);
            grouped[key].pisaiKg += Number(u.kg || 0);
        }

        else if (u.type === "manual") { // ✅ FIX
            grouped[key].puranaAmount += Number(u.amount);
        }
    });

    let totalUdhaarAll = 0;

    Object.values(grouped).forEach(g => {
        totalUdhaarAll += (g.saleAmount + g.pisaiAmount + g.puranaAmount);
    });

    let list = Object.values(grouped).map(g => {

        let total = g.saleAmount + g.pisaiAmount + g.puranaAmount;

        let details = [];

        if (g.puranaAmount) {
            details.push(`₹${g.puranaAmount}`);
        }

        if (g.saleAmount) {
            details.push(`Sale ₹${g.saleAmount}`);
        }

        if (g.pisaiAmount) {
            details.push(`Pisai ₹${g.pisaiAmount}`);
        }

        return `
        <div class="udhaar-card">
            
            <div class="row top">
                <span>${g.name}</span>
                <span class="amount">₹${total.toFixed(2)}</span>
            </div>

            <div class="row">
                <span>📅 ${g.date}</span>
                <span>📞 ${g.phone || "-"}</span>
            </div>

            <div style="font-size:13px;color:#555;">
                ${details.join(" + ")}
            </div>

            <div class="actions">
                <button onclick="sendWhatsApp('${g.name}','${g.phone}',${total})">📲</button>
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
        type: "manual", // ✅ VERY IMPORTANT
        date: new Date().toISOString()
    });

    addLastEntry({
        type: "udhaar",
        ref: "udhaar",
        index: udhaar.length - 1,
        amount,
        text: `📒 ${name} ₹${amount}`,
        time: getDateTime()
    });

    saveData();
    closePopup();
    render();
}
function openPopup() {
    document.getElementById("udharPopup").style.display = "flex";
}

function closePopup() {
    document.getElementById("udharPopup").style.display = "none";
}