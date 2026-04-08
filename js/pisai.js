function addPisai() {
    let name = document.getElementById("pisaiName").value;
    let phone = document.getElementById("pisaiPhone").value;

    let kg = parseFloat(document.getElementById("pisaiKg").value) || 0;
    let pay = document.getElementById("pisaiPay").value;

    if (!name || !kg) {
        alert("⚠️ Enter customer & kg");
        return;
    }

    let amount = (kg * 1.90).toFixed(2);;

    // ✅ Save pisai
    pisai.push({
        name,
        phone,
        kg,
        amount,
        pay
    });
    if (pay === "instant") {
        payments.push({
            name,
            paid: amount,
            date: new Date().toISOString()
        });
    }
    // ✅ ALWAYS ADD PISAI ENTRY (FIXED)
    addLastEntry({
        type: "pisai",
        ref: "pisai",
        index: pisai.length - 1,
        name,
        phone,
        kg,
        amount,
        text: `🟡 ${name} ${kg}kg ₹${amount}`,
        time: getDateTime()
    });

    // 🔥 ONLY IF UDHAAR
    if (pay === "udhaar") {
        udhaar.push({
            name,
            phone,
            amount,
            type: "pisai",  // ✅ ADD THIS
            kg,
            rate: 1.90,
            date: new Date().toISOString()
        });

        addLastEntry({
            type: "pisai",
            ref: "pisai",
            index: pisai.length - 1,
            name,
            phone,
            kg,
            amount,
            text: `🟡 ${name} ${kg}kg ₹${amount}`,
            time: getDateTime()
        });
    }

    // ✅ SAVE
    saveData();

    // ✅ CLEAR INPUTS
    document.getElementById("pisaiName").value = "";
    document.getElementById("pisaiPhone").value = "";
    document.getElementById("pisaiKg").value = "";
    document.getElementById("pisaiAmount").innerText = "₹0";

    render();
}