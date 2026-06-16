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

document.getElementById("startBtn").onclick = async () => {
    const now = new Date();

    await addDoc(shiftsRef, {
        date: now.toISOString().split("T")[0],
        checkIn: Timestamp.fromDate(now),
        checkOut: null,
        payPercent: 100,
        monthId: `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
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

        const weighted = hours * (data.payPercent / 100);

        const hourlyRate = 20; // <-- change this
        const earnings = weighted * hourlyRate;

        totalHours += hours;
        totalEarnings += earnings;

        const row = `
        <tr>
            <td>${data.date}</td>
            <td>${inTime ? inTime.toLocaleTimeString() : "-"}</td>
            <td>${outTime ? outTime.toLocaleTimeString() : "-"}</td>
            <td>${hours.toFixed(2)}</td>
            <td>${data.payPercent}%</td>
            <td>${weighted.toFixed(2)}</td>
            <td>${data.monthId}</td>
            <td>${earnings.toFixed(2)}</td>
        </tr>
        `;

        table.innerHTML += row;
    });

    document.getElementById("totalHours").innerText =
        totalHours.toFixed(2);

    document.getElementById("totalEarnings").innerText =
        totalEarnings.toFixed(2);
}

loadTable();