const valueInput = document.getElementById("barcodeValue");
const showValueInput = document.getElementById("showValue");
const barcodePreview = document.getElementById("barcodePreview");
const barcodeStatus = document.getElementById("barcodeStatus");
const downloadSvgButton = document.getElementById("downloadSvg");
const downloadPngButton = document.getElementById("downloadPng");

function renderBarcode() {
    const value = valueInput.value.trim();
    barcodePreview.replaceChildren();

    if (!value) {
        barcodeStatus.textContent = "Enter a value to generate a barcode.";
        downloadSvgButton.disabled = true;
        downloadPngButton.disabled = true;
        return false;
    }

    if (typeof window.JsBarcode !== "function") {
        barcodeStatus.textContent = "The barcode generator could not be loaded. Check your connection and refresh.";
        downloadSvgButton.disabled = true;
        downloadPngButton.disabled = true;
        return false;
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
        downloadSvgButton.disabled = false;
        downloadPngButton.disabled = false;
        return true;
    } catch {
        barcodePreview.replaceChildren();
        barcodeStatus.textContent = "This value cannot be encoded as a Code 128 barcode.";
        downloadSvgButton.disabled = true;
        downloadPngButton.disabled = true;
        return false;
    }
}

function getSvgBlob() {
    const svg = barcodePreview.cloneNode(true);
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    return new Blob([new XMLSerializer().serializeToString(svg)], {
        type: "image/svg+xml;charset=utf-8"
    });
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

async function downloadPng() {
    if (!renderBarcode()) return;

    const imageUrl = URL.createObjectURL(getSvgBlob());
    const image = new Image();

    image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        const context = canvas.getContext("2d");
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0);
        URL.revokeObjectURL(imageUrl);

        canvas.toBlob((blob) => {
            if (blob) downloadBlob(blob, "barcode.png");
            else barcodeStatus.textContent = "Could not create the PNG download.";
        }, "image/png");
    };

    image.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        barcodeStatus.textContent = "Could not create the PNG download.";
    };

    image.src = imageUrl;
}

valueInput.addEventListener("input", renderBarcode);
showValueInput.addEventListener("change", renderBarcode);
downloadSvgButton.addEventListener("click", () => {
    if (renderBarcode()) downloadBlob(getSvgBlob(), "barcode.svg");
});
downloadPngButton.addEventListener("click", downloadPng);

renderBarcode();