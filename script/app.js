import { db, auth } from "./firebase.js";
import { collection, addDoc, getDocs, query, orderBy, updateDoc, doc, Timestamp, limit }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const shiftsRef = collection(db, "shifts");

async function getOpenShift() {
    const q = query(
        shiftsRef,
        orderBy("checkIn", "desc"),
        limit(20)
    );

    const snap = await getDocs(q);

    for (const d of snap.docs) {
        if (!d.data().checkOut) return d;
    }

    return null;
}

function formatTime(date) {
    return date.toLocaleTimeString("fi-FI", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);

    const weekday = date.toLocaleDateString("fi-FI", {
        weekday: "long"
    });

    const rest = date.toLocaleDateString("fi-FI", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    return `${weekday}, ${rest}`;
}

async function getLatestShift() {
    const q = query(
        shiftsRef,
        orderBy("checkIn", "desc"),
        limit(1)
    );

    const snap = await getDocs(q);

    return snap.empty ? null : snap.docs[0];
}

async function updateUIState() {
    const openShift = await getOpenShift();

    document.getElementById("startBtn").disabled = !!openShift;
    document.getElementById("endBtn").disabled = !openShift;
}

document.getElementById("startBtn").onclick = async () => {

    document.getElementById("startBtn").disabled = true;

    const openShift = await getOpenShift();

    if (openShift) {
        alert("You already have an active shift!");
        updateUIState();
        return;
    }

    const latestShift = await getLatestShift();

    const monthId = latestShift?.data().monthId ?? 1;

    const now = new Date();

    await addDoc(shiftsRef, {
        date: now.toISOString().split("T")[0],
        checkIn: Timestamp.fromDate(now),
        checkOut: null,
        payPercent: 100,
        monthId,
        hours: null
    });

    loadTable();
};

document.getElementById("endBtn").onclick = async () => {
    const openShift = await getOpenShift();

    if (!openShift) {
        alert("No active shift");
        return;
    }

    const data = openShift.data();

    const checkOut = new Date();
    const checkIn = data.checkIn.toDate();

    const hours = Number(
        ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2)
    );

    await updateDoc(doc(db, "shifts", openShift.id), {
        checkOut: Timestamp.fromDate(checkOut),
        hours
    });

    loadTable();
};

async function loadTable() {

    const q = query(shiftsRef, orderBy("checkIn", "desc"));
    const snap = await getDocs(q);

    let totalHours = 0;
    let totalEarnings = 0;

    const table = document.getElementById("tableBody");
    table.innerHTML = "";

    snap.docs.forEach((d, index) => {

        const data = d.data();

        const inTime = data.checkIn ? data.checkIn.toDate() : null;
        const outTime = data.checkOut ? data.checkOut.toDate() : null;

        const isOpen = !outTime;

        let hours = 0;
        if (inTime && outTime) {
            hours = (outTime - inTime) / 1000 / 60 / 60;
        }

        const payPercent = data.payPercent ?? 100;
        const weighted = hours * (payPercent / 100);

        const hourlyRate = 17.3;
        const earnings = weighted * hourlyRate;

        totalHours += hours;
        totalEarnings += earnings;

        const formattedDate = formatDate(data.date);

        const latestId = snap.docs[0]?.id;
        const isLatest = d.id === latestId;

        const row = `
        <tr class="${isOpen ? "table-warning" : ""}">
            <td>${formattedDate}</td>
            <td>${inTime ? formatTime(inTime) : "-"}</td>
            <td>${outTime ? formatTime(outTime) : "-"}</td>
            <td class="hours">${hours.toFixed(2)}</td>

            <td>
                <select class="pay-percent" data-id="${d.id}">
                    <option value="100" ${payPercent === 100 ? "selected" : ""}>100%</option>
                    <option value="125" ${payPercent === 125 ? "selected" : ""}>125%</option>
                    <option value="200" ${payPercent === 200 ? "selected" : ""}>200%</option>
                </select>
            </td>

            <td class="weighted">${weighted.toFixed(2)}</td>
            <td>
                ${isLatest
                    ? `<input
                        type="number"
                        class="form-control form-control-sm month-id"
                        data-id="${d.id}"
                        value="${data.monthId ?? 1}"
                    >`
                : data.monthId}
            </td>
            <td class="fw-bold text-success">€${earnings.toFixed(2)}</td>
        </tr>
        `;

        table.innerHTML += row;
    });

    document.getElementById("totalHours").innerText =
        totalHours.toFixed(2);

    document.getElementById("totalEarnings").innerText =
        totalEarnings.toFixed(2);

    updateUIState();
}

document.getElementById("tableBody").addEventListener("change", async (event) => {

    if (!event.target.classList.contains("month-id")) return;

    const id = event.target.dataset.id;
    const monthId = Number(event.target.value);

    await updateDoc(doc(db, "shifts", id), {
        monthId
    });

    loadTable();
});

loadTable();