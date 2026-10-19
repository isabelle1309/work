const valueInput = document.getElementById("barcodeValue");
const showValueInput = document.getElementById("showValue");
const barcodePreview = document.getElementById("barcodePreview");
const barcodeStatus = document.getElementById("barcodeStatus");
const barcodePaper = document.querySelector(".barcode-paper");
const presetBarcodeButton = document.getElementById("presetBarcode");
const barcodeHistoryList = document.getElementById("barcodeHistory");
const barcodeHistoryEmpty = document.getElementById("barcodeHistoryEmpty");
const barcodeHistoryStatus = document.getElementById("barcodeHistoryStatus");
const barcodeMargin = 12;
const minimumBarWidth = 2;
const historyStorageKey = "barcodeInputHistory";
const maxHistoryEntries = 10;

function loadHistory() {
    try {
        const savedHistory = localStorage.getItem(historyStorageKey);
        if (!savedHistory) return [];

        const parsedHistory = JSON.parse(savedHistory);
        if (!Array.isArray(parsedHistory)) throw new TypeError("Saved barcode history is not a list.");

        return parsedHistory
            .filter((value) => typeof value === "string")
            .slice(0, maxHistoryEntries);
    } catch (error) {
        console.error("Could not load barcode input history.", error);
        barcodeHistoryStatus.textContent = "Could not load saved input history.";
        return [];
    }
}

let inputHistory = loadHistory();

function renderHistory() {
    barcodeHistoryList.replaceChildren();
    barcodeHistoryEmpty.hidden = inputHistory.length > 0;

    for (const value of inputHistory) {
        const item = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn btn-sm btn-outline-secondary";
        button.textContent = value;
        button.addEventListener("click", () => setBarcodeValue(value));
        item.append(button);
        barcodeHistoryList.append(item);
    }
}

function rememberInput(value) {
    inputHistory = [value, ...inputHistory.filter((entry) => entry !== value)]
        .slice(0, maxHistoryEntries);
    renderHistory();

    try {
        localStorage.setItem(historyStorageKey, JSON.stringify(inputHistory));
        barcodeHistoryStatus.textContent = "";
    } catch (error) {
        console.error("Could not save barcode input history.", error);
        barcodeHistoryStatus.textContent = "Could not save input history.";
    }
}

function setBarcodeValue(value) {
    valueInput.value = value;
    valueInput.dispatchEvent(new Event("input", { bubbles: true }));
    rememberInput(value);
}

function drawBarcode(value, width) {
    window.JsBarcode(barcodePreview, value, {
        format: "CODE128",
        width,
        height: 100,
        displayValue: showValueInput.checked,
        font: "monospace",
        fontSize: 16,
        margin: barcodeMargin,
        lineColor: "#171717",
        background: "#ffffff"
    });
}

function renderBarcode() {
    const value = valueInput.value.trim();
    barcodePreview.replaceChildren();

    if (!value) {
        barcodeStatus.textContent = "Enter a value to generate a barcode.";
        return false;
    }

    if (typeof window.JsBarcode !== "function") {
        barcodeStatus.textContent = "The barcode generator could not be loaded. Check your connection and refresh.";
        return false;
    }

    try {
        drawBarcode(value, minimumBarWidth);

        const paperStyle = window.getComputedStyle(barcodePaper);
        const horizontalPadding =
            Number.parseFloat(paperStyle.paddingLeft) + Number.parseFloat(paperStyle.paddingRight);
        const availableWidth = barcodePaper.clientWidth - horizontalPadding;
        const renderedWidth = Number(barcodePreview.getAttribute("width"));
        const barcodeContentWidth = renderedWidth - 2 * barcodeMargin;
        const targetContentWidth = availableWidth - 2 * barcodeMargin;

        if (barcodeContentWidth > 0 && targetContentWidth > barcodeContentWidth) {
            drawBarcode(
                value,
                minimumBarWidth * targetContentWidth / barcodeContentWidth
            );
        }

        barcodeStatus.textContent = `${value.length} character${value.length === 1 ? "" : "s"} encoded.`;
        return true;
    } catch {
        barcodePreview.replaceChildren();
        barcodeStatus.textContent = "This value cannot be encoded as a Code 128 barcode.";
        return false;
    }
}

valueInput.addEventListener("input", renderBarcode);
valueInput.addEventListener("change", () => {
    const value = valueInput.value.trim();
    if (value && renderBarcode()) rememberInput(value);
});
presetBarcodeButton.addEventListener("click", () => setBarcodeValue("IBT ZONE 0"));
showValueInput.addEventListener("change", renderBarcode);
new ResizeObserver(renderBarcode).observe(barcodePaper);

renderHistory();
renderBarcode();