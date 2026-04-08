function addSale() {

    let name = document.getElementById("name").value
        || document.getElementById("newName").value;

    let phone = document.getElementById("phone").value;

    let type = parseFloat(document.getElementById("type").value); // 9 or 50 kg per packet
    let pkt = parseFloat(document.getElementById("pkt").value) || 0;
    let rate = parseFloat(document.getElementById("rate").value) || 0; // ₹ per packet
    let pay = document.getElementById("pay").value;

    if (!name || !pkt || !rate) {
        alert("⚠️ Fill all fields");
        return;
    }

    // ✅ CALCULATIONS
    let kg = type * pkt;          // total kg
    let amount = pkt * rate;      // ✅ packet based pricing (FIXED)

    // ✅ SAVE SALE
    sales.push({
        name,
        phone,
        kg,
        pkt, // ✅ ADD THIS
        amount,
        payType: pay,
        date: new Date().toISOString()
    });

    // ✅ INSTANT PAYMENT
    if (pay === "instant") {
        payments.push({
            name,
            paid: amount,
            date: new Date().toISOString()
        });

        // 🔥 Add payment entry (for last 5 + received)
        addLastEntry({
            type: "sale",
            ref: "sales",
            index: sales.length - 1,
            name,
            phone,
            kg,
            pkt,
            amount,
            text: `💰 ${name} ${kg}kg ₹${amount}`,
            time: getDateTime()
        });
    }

    // ✅ STOCK UPDATE
    stock -= kg;

    // ✅ UDHAAR
    if (pay === "udhaar") {
        udhaar.push({
            name,
            phone,
            amount,
            type: "sale",   // ✅ ADD THIS
            pkt,
            kg,
            rate,
            date: new Date().toISOString()
        });

        addLastEntry({
            type: "sale",
            ref: "sales",
            index: sales.length - 1,
            name,
            phone,
            kg,
            pkt,
            amount,
            text: `💰 ${name} ${kg}kg ₹${amount}`,
            time: getDateTime()
        });
    }

    // ✅ SALE ENTRY (IMPORTANT)
    addLastEntry({
        type: "sale",
        ref: "sales",
        index: sales.length - 1,
        name,
        phone,
        kg,
        pkt,
        amount,
        text: `💰 ${name} ${kg}kg ₹${amount}`,
        time: getDateTime()
    });

    // ✅ SAVE DATA
    saveData();

    // ✅ CLEAR INPUTS
    document.getElementById("name").value = "";
    document.getElementById("newName").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("pkt").value = "";
    document.getElementById("rate").value = "";

    // ✅ REFRESH UI
    render();
}