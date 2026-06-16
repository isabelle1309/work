import { db, auth } from "./firebase.js";
import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    updateDoc,
    doc,
    Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const shiftsRef = collection(db, "shifts");

function formatTime(date) {
    return date.toLocaleTimeString("fi-FI", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    });
}

document.getElementById("startBtn").onclick = async () => {
    const now = new Date();

    await addDoc(shiftsRef, {
        date: now.toISOString().split("T")[0],
        checkIn: Timestamp.fromDate(now),
        checkOut: null,
        payPercent: 100,
        monthId: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    });

    loadTable();
};

document.getElementById("endBtn").onclick = async () => {
    const q = query(shiftsRef, orderBy("checkIn", "desc"));
    const snap = await getDocs(q);

    const openShift = snap.docs.find(d => !d.data().checkOut);

    if (!openShift) {
        alert("No active shift");
        return;
    }

    await updateDoc(doc(db, "shifts", openShift.id), {
        checkOut: Timestamp.fromDate(new Date())
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

    snap.forEach(d => {
        const data = d.data();

        const inTime = data.checkIn?.toDate();
        const outTime = data.checkOut?.toDate();

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

        const formattedDate = new Date(data.date).toLocaleDateString(
            "fi-FI",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

        const row = `
        <tr>
            <td>${formattedDate}</td>
            <td>${inTime ? formatTime(inTime) : "-"}</td>
            <td>${outTime ? formatTime(outTime) : "-"}</td>
            <td>${hours.toFixed(2)}</td>

            <td>
                <select class="pay-percent" data-id="${d.id}">
                    <option value="100" ${payPercent === 100 ? "selected" : ""}>100%</option>
                    <option value="125" ${payPercent === 125 ? "selected" : ""}>125%</option>
                    <option value="200" ${payPercent === 200 ? "selected" : ""}>200%</option>
                </select>
            </td>

            <td>${weighted.toFixed(2)}</td>
            <td>${data.monthId}</td>
            <td>€${earnings.toFixed(2)}</td>
        </tr>
        `;

        table.innerHTML += row;
    });

    document.getElementById("totalHours").innerText =
        totalHours.toFixed(2);

    document.getElementById("totalEarnings").innerText =
        totalEarnings.toFixed(2);

    document.querySelectorAll(".pay-percent").forEach(select => {
        select.addEventListener("change", async (event) => {
            const id = event.target.dataset.id;
            const payPercent = Number(event.target.value);

            await updateDoc(doc(db, "shifts", id), {
                payPercent
            });

            loadTable();
        });
    });
}

loadTable();