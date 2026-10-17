const valueInput = document.getElementById("barcodeValue");
const showValueInput = document.getElementById("showValue");
const barcodePreview = document.getElementById("barcodePreview");
const barcodeStatus = document.getElementById("barcodeStatus");

function renderBarcode() {
    const value = valueInput.value.trim();
    barcodePreview.replaceChildren();

    if (!value) {
        barcodeStatus.textContent = "Enter a value to generate a barcode.";
        return;
    }

    if (typeof window.JsBarcode !== "function") {
        barcodeStatus.textContent = "The barcode generator could not be loaded. Check your connection and refresh.";
        return;
    }

    try {
        window.JsBarcode(barcodePreview, value, {
            format: "CODE128",
            width: 2,
            height: 100,
            displayValue: showValueInput.checked,
            font: "monospace",
            fontSize: 16,
            margin: 12,
            lineColor: "#171717",
            background: "#ffffff"
        });

        barcodeStatus.textContent = `${value.length} character${value.length === 1 ? "" : "s"} encoded.`;
    } catch {
        barcodePreview.replaceChildren();
        barcodeStatus.textContent = "This value cannot be encoded as a Code 128 barcode.";
    }
}

valueInput.addEventListener("input", renderBarcode);
showValueInput.addEventListener("change", renderBarcode);

renderBarcode();