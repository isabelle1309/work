import { db, auth } from "./firebase.js";
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    query,
    where,
    updateDoc,
    deleteDoc,
    doc,
    Timestamp,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const START_HOUR = 6;
const END_HOUR = 22;

const HOUR_HEIGHT = 60;

let currentMonday = getMonday(new Date());
let appointments = [];
let selectedAppointmentId = null;

async function ensureUserDoc(user) {

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        await setDoc(ref, {
            email: user.email,
            role: "viewer"
        });
    }
}

let isAdmin = false;

onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    await ensureUserDoc(user);

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    const data = snap.data();

    isAdmin = data.role === "admin";

    document.getElementById("saveAppointment").style.display =
        isAdmin ? "block" : "none";

    document.getElementById("deleteAppointment").style.display =
        isAdmin ? "block" : "none";

    await loadWeek();
});

document.getElementById("prevWeek").onclick = () => {
    currentMonday.setDate(currentMonday.getDate() - 7);
    loadWeek();
};

document.getElementById("nextWeek").onclick = () => {
    currentMonday.setDate(currentMonday.getDate() + 7);
    loadWeek();
};

async function loadWeek() {

    const user = auth.currentUser;
    if (!user) return;

    const start = new Date(currentMonday);
    const end = new Date(currentMonday);
    end.setDate(end.getDate() + 7);

    document.getElementById("weekTitle").innerText =
        `${formatDate(start)} - ${formatDate(end)}`;

    await loadAppointments(user.uid);

    renderCalendar(start);
}

async function loadAppointments(uid) {

    appointments = [];

    const q = query(
        collection(db, "calendar")
    );

    const snap = await getDocs(q);

    snap.forEach((docSnap) => {
        appointments.push({
            id: docSnap.id,
            ...docSnap.data()
        });
    });
}

function renderWeekHeader(weekDays) {
    const header = document.getElementById("calendarHeader");
    header.innerHTML = "";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    header.style.display = "grid";
    header.style.gridTemplateColumns = "80px repeat(7, 1fr)";
    header.style.border = "1px solid #dee2e6";
    header.style.background = "white";

    const empty = document.createElement("div");
    header.appendChild(empty);

    weekDays.forEach(day => {

        const cell = document.createElement("div");

        const isToday =
            day.toDateString() === today.toDateString();

        const name = day.toLocaleDateString("en-GB", {
            weekday: "short"
        });

        const date = day.getDate();

        cell.innerHTML = `
            <div style="font-weight:600">${name}</div>
            <div style="font-size:12px;opacity:0.7">${date}</div>
        `;

        cell.style.textAlign = "center";
        cell.style.padding = "8px 0";
        cell.style.borderLeft = "1px solid #eee";

        if (isToday) {
            cell.classList.add("today-column");
        }

        header.appendChild(cell);
    });
}

function renderCalendar(weekStart) {

    const container = document.getElementById("calendarGrid");
    container.innerHTML = "";

    container.style.display = "grid";
    container.style.gridTemplateColumns = "80px repeat(7, 1fr)";

    const weekDays = [];

    for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        weekDays.push(d);
    }

    const timeCol = document.createElement("div");
    timeCol.className = "timeColumn";
    timeCol.style.position = "relative";
    timeCol.style.height = "900px";

    for (let hour = START_HOUR; hour <= END_HOUR; hour++) {

        for (let m = 0; m < 60; m += 20) {

            if (hour === END_HOUR && m > 0) continue;

            const label = document.createElement("div");
            label.className = "time-label";

            const top = ((hour - START_HOUR) * 60) + m;

            label.style.position = "absolute";
            label.style.top = top + "px";

            label.innerText =
                `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

            timeCol.appendChild(label);
        }
    }

    container.appendChild(timeCol);

    weekDays.forEach(day => {

        const col = document.createElement("div");
        col.className = "dayColumn";

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const isToday =
            day.toDateString() === today.toDateString();

        if (isToday) {
            col.classList.add("today-column");
        }

        col.style.position = "relative";
        col.style.height = ((END_HOUR - START_HOUR) * HOUR_HEIGHT) + "px";

        col.onclick = (e) => {

            const rect = col.getBoundingClientRect();
            const y = e.clientY - rect.top;

            const minutesFromTop = Math.floor(y / 10) * 10;

            const date = new Date(day);
            date.setHours(START_HOUR, 0, 0, 0);
            date.setMinutes(date.getMinutes() + minutesFromTop);

            openNewAppointment(date);
        };

        col.addEventListener("mousemove", (e) => {

            const tooltip = document.getElementById("timeTooltip");

            const rect = col.getBoundingClientRect();

            const y = e.clientY - rect.top;

            const totalMinutes = START_HOUR * 60 + Math.floor(y / 10) * 10;

            const hour = Math.floor(totalMinutes / 60);
            const min = totalMinutes % 60;

            tooltip.style.display = "block";

            tooltip.style.left = (e.clientX + 12) + "px";
            tooltip.style.top = (e.clientY + 12) + "px";

            tooltip.innerText =
                `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
        });

        col.addEventListener("mouseleave", () => {
            document.getElementById("timeTooltip").style.display = "none";
        });

        renderEventsForDay(col, day);

        container.appendChild(col);

        renderWeekHeader(weekDays);
    });
}

function renderEventsForDay(col, day) {

    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    appointments.forEach(appt => {

        const start = appt.start.toDate();
        const end = appt.end.toDate();

        if (start >= dayStart && start <= dayEnd) {

            const event = document.createElement("div");
            event.className = "event";

            const pad = n => n.toString().padStart(2, "0");

            const timeRange =
                `${pad(start.getHours())}:${pad(start.getMinutes())} - ` +
                `${pad(end.getHours())}:${pad(end.getMinutes())}`;

            event.innerHTML = `
                <div class="event-title">${appt.title}</div>
                <div class="event-time">${timeRange}</div>
                ${appt.description
                    ? `<div class="event-desc">${appt.description}</div>`
                    : ""
                }
            `;

            const startMinutes = (start.getHours() * 60) + start.getMinutes();
            const endMinutes = (end.getHours() * 60) + end.getMinutes();

            const top = startMinutes - (START_HOUR * 60);
            const height = Math.max(endMinutes - startMinutes, 10);

            event.style.position = "absolute";
            event.style.top = Math.floor(top / 10) * 10 + "px";
            event.style.height = Math.floor(height / 10) * 10 + "px";

            event.style.left = "4px";
            event.style.right = "4px";

            event.style.background = appt.color || "#ff006e";

            event.onclick = (e) => {
                e.stopPropagation();
                openEditAppointment(appt);
            };

            col.appendChild(event);
        }
    });
}

const modal = new bootstrap.Modal(
    document.getElementById("appointmentModal")
);

function openNewAppointment(date) {

    selectedAppointmentId = null;

    document.getElementById("appointmentTitle").value = "";
    document.getElementById("appointmentDescription").value = "";
    document.getElementById("appointmentColor").value = "#ff006e";

    document.getElementById("appointmentStart").value = toLocalInput(date);
    document.getElementById("appointmentEnd").value = toLocalInput(
        new Date(date.getTime() + 60 * 60 * 1000)
    );

    modal.show();
}

function openEditAppointment(appt) {

    selectedAppointmentId = appt.id;

    document.getElementById("appointmentTitle").value = appt.title;
    document.getElementById("appointmentDescription").value = appt.description || "";
    document.getElementById("appointmentColor").value = appt.color || "#ff006e";

    document.getElementById("appointmentStart").value =
        toLocalInput(appt.start.toDate());

    document.getElementById("appointmentEnd").value =
        toLocalInput(appt.end.toDate());

    modal.show();
}

document.getElementById("saveAppointment").onclick = async () => {

    const user = auth.currentUser;
    if (!user) return;

    const data = {
        uid: user.uid,
        title: document.getElementById("appointmentTitle").value,
        description: document.getElementById("appointmentDescription").value,
        color: document.getElementById("appointmentColor").value,
        start: Timestamp.fromDate(
            new Date(document.getElementById("appointmentStart").value)
        ),
        end: Timestamp.fromDate(
            new Date(document.getElementById("appointmentEnd").value)
        )
    };

    if (selectedAppointmentId) {
        await updateDoc(doc(db, "calendar", selectedAppointmentId), data);
    } else {
        await addDoc(collection(db, "calendar"), data);
    }

    modal.hide();
    loadWeek();
};

document.getElementById("deleteAppointment").onclick = async () => {

    if (!selectedAppointmentId) return;

    await deleteDoc(doc(db, "calendar", selectedAppointmentId));

    modal.hide();
    loadWeek();
};

function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

function formatDate(date) {
    return date.toLocaleDateString("en-GB");
}

function toLocalInput(date) {

    const pad = n => n.toString().padStart(2, "0");

    return (
        date.getFullYear() + "-" +
        pad(date.getMonth() + 1) + "-" +
        pad(date.getDate()) + "T" +
        pad(date.getHours()) + ":" +
        pad(date.getMinutes())
    );
}

function pad(n) {
    return n.toString().padStart(2, "0");
}