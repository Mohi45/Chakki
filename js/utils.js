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
    lastEntries.unshift(entry); // newest on top
    if (lastEntries.length > 5) {
        lastEntries.pop(); // keep only 5
    }
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


function deleteEntry(i) {

    let e = lastEntries[i];
    if (!e) return;

    if (e.ref === "sales") {
        let item = sales[e.index];
        if (item) {
            stock += item.kg; // restore
            sales.splice(e.index, 1);
        }
    }

    if (e.ref === "purchase") {
        let item = purchase[e.index];
        if (item) {
            stock -= item.kg;
            purchase.splice(e.index, 1);
        }
    }

    if (e.ref === "udhaar") {
        udhaar.splice(e.index, 1);
    }

    if (e.ref === "expenses") {
        expenses.splice(e.index, 1);
    }

    if (e.ref === "payments") {
        payments.splice(e.index, 1);
    }

    if (e.ref === "pisai") {
        pisai.splice(e.index, 1);
    }

    lastEntries.splice(i, 1);

    saveData();
    render();
}