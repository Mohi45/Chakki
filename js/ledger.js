function showLedger() {

    let name = document.getElementById("ledgerName").value;
    let normalizedName = normalizeCustomerName(name);

    if (!name) {
        alert("Select customer");
        return;
    }

    let entries = [];

    // ✅ SALES
    sales.filter(s => normalizeCustomerName(s.name) === normalizedName).forEach(s => {
        let date = s.date || null;

        if (s.pay === "instant") {
            entries.push({
                sale: Number(s.amount || 0),
                pisai: 0,
                payment: Number(s.amount || 0),
                date
            });
        } else {
            entries.push({
                sale: Number(s.amount || 0),
                pisai: 0,
                payment: 0,
                date
            });
        }
    });

    // ✅ PISAI
    pisai.filter(p => normalizeCustomerName(p.name) === normalizedName).forEach(p => {
        entries.push({
            sale: 0,
            pisai: Number(p.amount || 0),
            payment: 0,
            date: p.date || null
        });
    });

    // ✅ UDHAAR
    udhaar.filter(u => normalizeCustomerName(u.name) === normalizedName).forEach(u => {
        entries.push({
            sale: Number(u.amount || 0),
            pisai: 0,
            payment: 0,
            date: u.date || null
        });
    });

    // ✅ PAYMENTS
    payments.filter(p => normalizeCustomerName(p.name) === normalizedName).forEach(p => {
        entries.push({
            sale: 0,
            pisai: 0,
            payment: Number(p.paid || 0),
            date: p.date || null
        });
    });

    // ✅ SORT (SAFE)
    entries.sort((a, b) => {
        return new Date(a.date || 0) - new Date(b.date || 0);
    });

    // ✅ GROUP BY DATE
    let grouped = {};

    entries.forEach(e => {

        let d = e.date
            ? new Date(e.date).toLocaleDateString("en-GB")
            : "Old Data";

        if (!grouped[d]) {
            grouped[d] = { sale: 0, pisai: 0, payment: 0 };
        }

        grouped[d].sale += e.sale;
        grouped[d].pisai += e.pisai;
        grouped[d].payment += e.payment;
    });

    let balance = 0;

    let html = Object.keys(grouped).map(date => {

        let g = grouped[date];

        let daily = g.sale + g.pisai - g.payment;
        balance += daily;

        let statusClass = balance <= 0 ? "paid" : "pending";

        return `
        <div class="card">
            <b>${date}</b><br>

            ${g.sale ? `Sale: ₹${g.sale.toFixed(2)} | ` : ""}
            ${g.pisai ? `Pisai: ₹${g.pisai.toFixed(2)} | ` : ""}
            ${g.payment ? `Payment: ₹${g.payment.toFixed(2)}` : ""}

            <br>
            <span class="${statusClass}">
                Balance: ₹${balance.toFixed(2)}
            </span>
        </div>
        `;
    }).join("");

    document.getElementById("app").innerHTML = `
        <div class="card">
            <select id="ledgerName">
                <option value="${name}">${name}</option>
            </select>
            <button onclick="render()">⬅ Back</button>
        </div>

        <div class="card"><h3>Ledger - ${name}</h3></div>

        ${html || "<p>No Data</p>"}
    `;
}
