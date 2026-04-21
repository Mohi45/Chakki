function addPurchase() {

    let kgInput = document.getElementById("kg");
    let rateInput = document.getElementById("rate");

    let kg = parseFloat(kgInput.value) || 0;
    let rate = parseFloat(rateInput.value) || 0;

    if (!kg || !rate) {
        alert("⚠️ Enter kg & rate");
        return;
    }

    let amount = kg * rate;

    purchase.push({
        kg,
        rate,
        amount,
        date: new Date().toISOString()
    });

    // ✅ ADD STOCK
    stock += kg;

    addLastEntry({
        type: "purchase",
        ref: "purchase",
        index: purchase.length - 1,
        kg,
        amount,
        rate,
        date: purchase[purchase.length - 1].date,
        text: `🛒 ${formatKg(kg)} @ ₹${rate} = ₹${amount}`,
        time: getDateTime()
    });

    saveData();

    // ✅ CLEAR INPUT
    kgInput.value = "";
    rateInput.value = "";
}
