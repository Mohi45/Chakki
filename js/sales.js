function addSale() {
    let name = document.getElementById("name").value
        || document.getElementById("newName").value;

    let phone = normalizePhone(document.getElementById("phone").value);

    let type = parseFloat(document.getElementById("type").value);
    let pkt = parseFloat(document.getElementById("pkt").value) || 0;
    let rate = parseFloat(document.getElementById("rate").value) || 0;
    let pay = document.getElementById("pay").value;

    if (!name || !pkt || !rate) {
        alert("⚠️ Fill all fields");
        return;
    }

    if (!validatePhoneOrAlert(phone)) {
        return;
    }

    let kg = type;
    let requiredKg = type * pkt;
    let amount = pkt * rate;

    if (pay === "udhaar" && !confirmUdhaarBeforeContinue(name)) {
        return;
    }

    if (requiredKg > stock) {
        alert(`❌ Not enough stock!\nAvailable: ${formatKg(stock)}\nRequired: ${formatKg(requiredKg)}`);
        return;
    }

    sales.push({
        name,
        phone,
        kg,
        pkt,
        amount,
        payType: pay,
        rate,
        date: new Date().toISOString()
    });

    stock -= requiredKg;

    if (pay === "instant") {
        payments.push({
            name,
            phone,
            paid: amount,
            date: new Date().toISOString()
        });

        addLastEntry({
            type: "payment",
            ref: "payments",
            index: payments.length - 1,
            name,
            phone,
            amount,
            text: `🟢 ${name} Paid ₹${amount}`,
            time: getDateTime()
        });
    }

    if (pay === "udhaar") {
        udhaar.push({
            name,
            phone,
            amount,
            type: "sale",
            pkt,
            kg,
            rate,
            date: new Date().toISOString()
        });
    }

    addLastEntry({
        type: "sale",
        ref: "sales",
        index: sales.length - 1,
        name,
        phone,
        kg,
        pkt,
        amount,
        text: `💰 ${formatSalePackSize(kg)} × ${pkt}pkt @ ₹${rate} = ₹${amount}`,
        time: getDateTime()
    });

    saveData();

    document.getElementById("name").value = "";
    document.getElementById("newName").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("pkt").value = "";
    document.getElementById("rate").value = "";

    render();
}
