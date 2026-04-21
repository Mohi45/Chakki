function addPisai() {
    let name = document.getElementById("pisaiName").value;
    let phone = normalizePhone(document.getElementById("pisaiPhone").value);

    let kg = parseFloat(document.getElementById("pisaiKg").value) || 0;
    let pay = document.getElementById("pisaiPay").value;

    if (!name || !kg) {
        alert("⚠️ Enter customer & kg");
        return;
    }

    if (!validatePhoneOrAlert(phone)) {
        return;
    }

    let amount = (kg * 1.90).toFixed(2);
    let now = new Date().toISOString();

    if (pay === "udhaar" && !confirmUdhaarBeforeContinue(name)) {
        return;
    }

    pisai.push({
        name,
        phone,
        kg,
        amount,
        pay,
        date: now
    });

    if (pay === "instant") {
        payments.push({
            name,
            paid: amount,
            date: now
        });
    }

    addLastEntry({
        type: "pisai",
        ref: "pisai",
        index: pisai.length - 1,
        name,
        phone,
        kg,
        amount,
        pay,
        date: pisai[pisai.length - 1].date,
        text: `🌾 ${name} ${kg}kg ₹${amount}`,
        time: getDateTime()
    });

    if (pay === "udhaar") {
        udhaar.push({
            name,
            phone,
            amount,
            type: "pisai",
            kg,
            rate: 1.90,
            date: now
        });
    }

    saveData();

    document.getElementById("pisaiName").value = "";
    document.getElementById("pisaiPhone").value = "";
    document.getElementById("pisaiKg").value = "";
    document.getElementById("pisaiAmount").innerText = "₹0";

    render();
}
