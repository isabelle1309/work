const dateText = document.getElementById("date");
const timeText = document.getElementById("time");

const greetings = [
    "miau :3",
    "rinnat :3",
    "hei :3",
    "rakastan todellakin elämää! :3",
    "valtava peppu :3",
    "tissit ovat siistejä"
];

const greetText = document.getElementById("greet");
function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

greetText.innerText = greetings[randomRange(0, greetings.length - 1)];

const weekdays = [
    "sunnuntai",
    "maanantai",
    "tiistai",
    "keskiviikko",
    "torstai",
    "perjantai",
    "lauantai"
];

function updateDateTime() {
    const now = new Date();

    const weekday = weekdays[now.getDay()];
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    dateText.textContent = `${weekday} ${day}.${month}.${year}`;

    timeText.textContent = new Intl.DateTimeFormat("fi-FI", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    }).format(now);
}

updateDateTime();
setInterval(updateDateTime, 500);