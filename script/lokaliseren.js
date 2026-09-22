const brakeDiscs = [
    {
        brand: "Ashuki",
        identifiers: [
            "0990-5206",
            "0990-4312",
            "M605-39",
			"S017-48",
			"S016-35",
			"0990-5107",
			"0993-4250",
			"Y089-68",
            "N014-29",
            "K016-55"
        ]
    },

    {
        brand: "Paladium",
        identifiers: [
            "P331-069",
            "P330-063",
            "P330-306",
			"P331-138",
			"P330-035",
            "PAL23-0010",
            "PAL9-0024"
        ]
    },

    {
        brand: "Zimmermann",
        identifiers: [
            "100.3375.75",
            "150.3482.20",
			"150.2905.20",
			"150.2963.20"
        ]
    },

    {
        brand: "Textar",
        identifiers: [
            "92034203",
            "92286103",
			"92300903",
			"92242203"
        ]
    },

    {
        brand: "Brembo",
        identifiers: [
            "09.C306.1X",
            "08.C647.17",
			"08.7165.11"
        ]
    },

    {
        brand: "Valeo",
        identifiers: [
            "826362",
            "828342",
			"836866",
			"835211"
        ]
    },

    {
        brand: "Blue Print",
        identifiers: [
            "ADW193048",
            "ADV183098",
            "ADR163006"
        ]
    },

    {
        brand: "Hella",
        identifiers: [
            "8LD 366 030-751"
        ]
    },

    {
        brand: "SKF",
        identifiers: [
			"VKJC 4591",
			"VKJC 8166",
			"VKM 38882",
			"VKJC 5204"
		]
    },

    {
        brand: "Schaeffler",
        identifiers: [
            "622 3336 00",
            "628 3585 00",
			"619 3191 00"
        ]
    },

    {
        brand: "Aisin",
        identifiers: [
            "KO-030A"
        ]
    },

    {
        brand: "Bosch",
        identifiers: [
            "0 986 479 A18"
        ]
    },

    {
        brand: "Topran",
        identifiers: [
            "302 346 001"
        ]
    },
	
	{
		brand: "Sachs",
		identifiers: [
            "3000 951 012",
			"3000 951 481"
        ]
	},
	
	{
		brand: "Meyle",
		identifiers: [
			"70-16 050 0039/HD"
        ]
	},
	
	{
        brand: "GSP",
        identifiers: [
            "202077OL",
			"203615"
        ]
    },
	
	{
        brand: "Monroe",
        identifiers: [
            "V4510"
        ]
    },
	
	{
        brand: "TYC",
        identifiers: [
            "20-1401-06-2"
        ]
    },

    {
        brand: "TRW",
        identifiers: [
            "DF4406",
            "DB4363MR"
        ]
    },
    document.getElementById("pattern1"),
    document.getElementById("pattern2"),
    document.getElementById("pattern3"),
    document.getElementById("pattern4")
];

const formatCard = document.getElementById("formatCard");
const formatDisplay = document.getElementById("formatDisplay");

const results = document.getElementById("results");
const scrollToAvailableBtn = document.getElementById("scrollToAvailableBtn");
const scrollToBottomBtn = document.getElementById("scrollToBottomBtn");

function normalize(value) {

    return value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");

}

function getSections(identifier) {

    return identifier
        .trim()
        .split(/[\s.-]+/)
        .filter(Boolean);

}

function getPattern(identifier) {

    const sections = getSections(identifier);

    return sections
        .map(section => section.length)
        .join("/");

}

function displayFormat(pattern) {

    if (!pattern) {

        formatCard.classList.add("d-none");
        formatDisplay.innerHTML = "";

        return;
    }


    formatCard.classList.remove("d-none");


    const parts = pattern.split("/");


    formatDisplay.innerHTML = parts
        .map(part => `
            <span class="badge text-bg-secondary fs-6 me-1">
                ${part}
            </span>
        `)
        .join("");

}

function getIdentifierPattern(identifier) {

    return getPattern(identifier);

}

function getEnteredPattern() {

    return patternInputs
        .map(input => input.value.trim())
        .filter(Boolean)
        .join("/");

}

function calculateScore(searchValue, identifier) {

    const normalizedSearch = normalize(searchValue);
    const normalizedIdentifier = normalize(identifier);

    if (normalizedSearch === normalizedIdentifier) {
        return 100;
    }

    if (!normalizedSearch) {
        return 0;
    }


    let score = 0;

    if (
        getIdentifierPattern(searchValue) ===
        getIdentifierPattern(identifier)
    ) {

        score += 40;
    }

    if (normalizedIdentifier.startsWith(normalizedSearch)) {

        score += 30;

    }

    else if (normalizedIdentifier.includes(normalizedSearch)) {

        score += 20;

    }

    let matchingCharacters = 0;


    for (
        let i = 0;
        i < Math.min(
            normalizedSearch.length,
            normalizedIdentifier.length
        );
        i++
    ) {

        if (
            normalizedSearch[i] ===
            normalizedIdentifier[i]
        ) {

            matchingCharacters++;

        } else {

            break;
        }

    }

    if (normalizedSearch.length > 0) {

        score +=
            (matchingCharacters / normalizedSearch.length) * 20;
    }

    return score;
}

function search() {

    const searchValue = input.value.trim();

    if (!searchValue) {
        if (getEnteredPattern()) {

            searchByPattern();
            return;
        }

        formatCard.classList.add("d-none");
        results.innerHTML = "";

        return;
    }

    const searchPattern = getPattern(searchValue);

    displayFormat(searchPattern);


    const matches = [];

    for (const item of brakeDiscs) {

        for (const identifier of item.identifiers) {

            const identifierPattern =
                getIdentifierPattern(identifier);


            const score =
                calculateScore(searchValue, identifier);


            const samePattern =
                identifierPattern === searchPattern;


            const normalizedSearch =
                normalize(searchValue);


            const normalizedIdentifier =
                normalize(identifier);


            const containsCharacters =
                normalizedIdentifier.includes(normalizedSearch);


            if (samePattern || containsCharacters) {

                matches.push({
                    brand: item.brand,
                    identifier,
                    pattern: identifierPattern,
                    score
                });
            }
        }
    }

    matches.sort((a, b) => b.score - a.score);


    displayResults(matches);
}

function searchByPattern() {

    const pattern = getEnteredPattern();

    if (!pattern) {
        displayPatternFallback();

        return;
    }

    displayFormat(pattern);

    const matches = [];

    for (const item of brakeDiscs) {

        for (const identifier of item.identifiers) {

            const identifierPattern =
                getIdentifierPattern(identifier);


            if (identifierPattern === pattern) {

                matches.push({
                    brand: item.brand,
                    identifier,
                    pattern: identifierPattern,
                    score: 100
                });
            }
        }
    }

    if (matches.length > 0) {

        displayResults(matches);

        return;
    }

    displayPatternFallback();
}

function displayPatternFallback() {

    const enteredPattern =
        getEnteredPattern();


    let html = "";
    if (enteredPattern) {

        html += `
            <div class="alert alert-warning text-center mb-4">

                <i class="bi bi-exclamation-circle"></i>

                Geen remschijven gevonden met patroon
                <strong>${enteredPattern}</strong>.

            </div>
        `;

    } else {

        html += `
            <h5 class="mb-3">
                <i class="bi bi-list-check"></i>
                Beschikbare remschijven
            </h5>
        `;

    }

    html += `<div class="brand-overview">`;

    const sortedBrakeDiscs = [...brakeDiscs]
        .filter(item => item.identifiers.length > 0)
        .sort((a, b) => a.brand.localeCompare(b.brand));

    for (const item of sortedBrakeDiscs) {

        const patterns = [];

        for (const identifier of item.identifiers) {

            const pattern =
                getIdentifierPattern(identifier);

            if (
                !patterns.some(
                    existing => existing.pattern === pattern
                )
            ) {

                patterns.push({
                    pattern,
                    identifier
                });

            }

        }

        html += `
            <div class="card brand-card">

                <div class="card-body p-2">

                    <div class="fw-bold mb-2">
                        <i class="bi bi-building"></i>
                        ${item.brand}
                    </div>

                    <div class="d-flex flex-column gap-1">
        `;

        for (const itemPattern of patterns) {

            html += `
                <div class="border rounded p-1">

                    <code class="brand-identifier">
                        ${itemPattern.identifier}
                    </code>

                    <span class="badge text-bg-secondary ms-1">
                        ${itemPattern.pattern.replaceAll("/", " / ")}
                    </span>

                </div>
            `;

        }

        html += `
                    </div>

                </div>

            </div>
        `;

    }

    const missingSlots =
        (3 - (sortedBrakeDiscs.length % 3)) % 3;

    for (let index = 0; index < missingSlots; index++) {
        html += `<div class="brand-placeholder" aria-hidden="true"></div>`;
    }

    html += `</div>`;

    results.innerHTML = html;
}

function displayResults(matches) {

    if (matches.length === 0) {

        results.innerHTML = `
            <div class="alert alert-secondary text-center">
                <i class="bi bi-question-circle"></i>
                Geen overeenkomende remschijven gevonden.
            </div>
        `;

        return;

    }

    const limitedMatches = matches.slice(0, 10);

    let html = `
            <h5 id="availableBrakesHeading" class="mb-3">
            <i class="bi bi-list-check"></i>
            Mogelijke resultaten
        </h5>
    `;

    for (const match of limitedMatches) {

        const exact =
            match.score >= 100;


        const samePattern =
            match.pattern === getPattern(input.value);

        html += `
            <div class="card mb-2">

                <div class="card-body">

                    <div class="d-flex justify-content-between align-items-start">

                        <div>

                            <div class="fw-bold fs-5">
                                <i class="bi bi-building"></i>
                                ${match.brand}
                            </div>

                            <code class="fs-6">
                                ${match.identifier}
                            </code>

                        </div>

                        <div class="text-end">
        `;

        if (exact) {

            html += `
                <span class="badge text-bg-success">
                    Exact
                </span>
            `;

        } else if (samePattern) {

            html += `
                <span class="badge text-bg-primary">
                    Zelfde formaat
                </span>
            `;

        }

        html += `
                        </div>

                    </div>

                </div>

            </div>
        `;

    }

    results.innerHTML = html;
}

clearBtn.addEventListener("click", () => {

    input.value = "";

    patternInputs.forEach(input => {
        input.value = "";
    });

    formatCard.classList.add("d-none");

    formatDisplay.innerHTML = "";

    results.innerHTML = "";

    input.focus();

    displayPatternFallback();
});

input.addEventListener("input", search);


input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        search();
    }
});

patternInputs.forEach((patternInput, index) => {

    patternInput.addEventListener("input", () => {

        if (patternInput.value.length > 2) {

            patternInput.value =
                patternInput.value.slice(0, 2);
        }

        if (patternInput.value && index < patternInputs.length - 1) {
            patternInputs[index + 1].focus();
            patternInputs[index + 1].select();
        }
        searchByPattern();

    });

    patternInput.addEventListener("keydown", (event) => {

        if (
            event.key === "Backspace" &&
            !patternInput.value &&
            index > 0
        ) {
            patternInputs[index - 1].focus();
        }

        if (
            event.key === "ArrowRight" &&
            index < patternInputs.length - 1
        ) {
            patternInputs[index + 1].focus();
        }

        if (
            event.key === "ArrowLeft" &&
            index > 0
        ) {
            patternInputs[index - 1].focus();
        }
    });
});

scrollToAvailableBtn.addEventListener("click", () => {
    const availableBrakesHeading =
        document.getElementById("availableBrakesHeading");

    (availableBrakesHeading || results).scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

scrollToBottomBtn.addEventListener("click", () => {
    window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth"
    });
});

displayPatternFallback();