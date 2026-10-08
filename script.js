const API_URL = "https://ipwho.is";

const ipInput = document.getElementById("ipInput");
const searchButton = document.getElementById("searchButton");
const myIpButton = document.getElementById("myIpButton");

const results = document.getElementById("results");
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");

const copyButton = document.getElementById("copyButton");

const historySection = document.getElementById("historySection");
const historyList = document.getElementById("historyList");
const clearHistoryButton = document.getElementById("clearHistory");

const resultIp = document.getElementById("resultIp");
const ipAddress = document.getElementById("ipAddress");
const ipVersion = document.getElementById("ipVersion");

const locationElement = document.getElementById("location");
const country = document.getElementById("country");

const isp = document.getElementById("isp");
const organization = document.getElementById("organization");
const asn = document.getElementById("asn");

const timezone = document.getElementById("timezone");
const utcOffset = document.getElementById("utcOffset");

const postal = document.getElementById("postal");

const latitude = document.getElementById("latitude");
const longitude = document.getElementById("longitude");

const mapLink = document.getElementById("mapLink");


/* ========================================
   VALIDAR IP
======================================== */

function isValidIP(ip) {

    const ipv4 =
        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    const ipv6 =
        /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4})$/;

    return ipv4.test(ip) || ipv6.test(ip);
}


/* ========================================
   CONSULTAR IP
======================================== */

async function searchIP(ip = "") {

    clearError();
    showLoading();

    try {

        const url = ip
            ? `${API_URL}/${encodeURIComponent(ip)}`
            : API_URL;

        console.log("Consultando:", url);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                `HTTP Error ${response.status}`
            );
        }

        const data = await response.json();

        console.log("Resposta da API:", data);

        if (!data.success) {
            throw new Error(
                data.message || "Unable to analyze this IP."
            );
        }

        const formattedData = {

            ip: data.ip,

            city: data.city || "Unknown",

            region: data.region || "Unknown",

            country_name:
                data.country || "Unknown",

            country_code:
                data.country_code || "",

            latitude:
                data.latitude,

            longitude:
                data.longitude,

            timezone:
                data.timezone?.id || "Unknown",

            utc_offset:
                data.timezone?.utc || "",

            postal:
                data.postal || "Unavailable",

            org:
                data.connection?.isp ||
                "Unknown",

            asn:
                data.connection?.asn
                    ? `AS${data.connection.asn}`
                    : "Unavailable"

        };

        displayResults(formattedData);

        saveToHistory(formattedData);

    } catch (error) {

        console.error(
            "IP Intelligence Error:",
            error
        );

        showError(
            error.message ||
            "Failed to fetch IP information."
        );

    } finally {

        hideLoading();

    }
}


/* ========================================
   MOSTRAR RESULTADOS
======================================== */

function displayResults(data) {

    results.classList.remove("hidden");

    resultIp.textContent =
        data.ip || "Unknown";

    ipAddress.textContent =
        data.ip || "Unknown";

    ipVersion.textContent =
        detectIPVersion(data.ip);

    locationElement.textContent =
        `${data.city || "Unknown"}, ${data.region || "Unknown"}`;

    country.textContent =
        `${data.country_name || "Unknown"}${
            data.country_code
                ? ` • ${data.country_code}`
                : ""
        }`;

    isp.textContent =
        data.org || "Unknown";

    organization.textContent =
        data.org || "Unknown";

    asn.textContent =
        data.asn || "Unavailable";

    timezone.textContent =
        data.timezone || "Unknown";

    utcOffset.textContent =
        data.utc_offset
            ? `UTC ${data.utc_offset}`
            : "UTC unavailable";

    postal.textContent =
        data.postal || "Unavailable";

    latitude.textContent =
        data.latitude ?? "Unavailable";

    longitude.textContent =
        data.longitude ?? "Unavailable";


    if (
        data.latitude !== undefined &&
        data.longitude !== undefined
    ) {

        mapLink.href =
            `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;

    } else {

        mapLink.href = "#";

    }

    results.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* ========================================
   DETECTAR IPV4 / IPV6
======================================== */

function detectIPVersion(ip) {

    if (!ip) {
        return "Unknown";
    }

    return ip.includes(":")
        ? "IPv6"
        : "IPv4";
}


/* ========================================
   BOTÃO FIND MY IP
======================================== */

myIpButton.addEventListener(
    "click",
    function () {

        console.log("FIND MY IP clicado");

        searchIP();

    }
);


/* ========================================
   BOTÃO SEARCH
======================================== */

searchButton.addEventListener(
    "click",
    handleSearch
);


/* ========================================
   ENTER NO INPUT
======================================== */

ipInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            handleSearch();

        }

    }
);


/* ========================================
   PESQUISA MANUAL
======================================== */

function handleSearch() {

    const ip =
        ipInput.value.trim();

    clearError();

    if (!ip) {

        showError(
            "Enter an IP address to continue."
        );

        return;
    }

    if (!isValidIP(ip)) {

        showError(
            "Invalid IP address."
        );

        return;
    }

    searchIP(ip);
}


/* ========================================
   LOADING
======================================== */

function showLoading() {

    loading.classList.remove("hidden");

    results.classList.add("hidden");

    searchButton.disabled = true;

    myIpButton.disabled = true;
}


function hideLoading() {

    loading.classList.add("hidden");

    searchButton.disabled = false;

    myIpButton.disabled = false;
}


/* ========================================
   ERRO
======================================== */

function showError(message) {

    errorMessage.textContent =
        `> ERROR: ${message}`;
}


function clearError() {

    errorMessage.textContent = "";

}


/* ========================================
   COPIAR DADOS
======================================== */

copyButton.addEventListener(
    "click",
    async function () {

        const text = `
IP Address: ${ipAddress.textContent}
IP Version: ${ipVersion.textContent}
Location: ${locationElement.textContent}
Country: ${country.textContent}
ISP: ${isp.textContent}
Organization: ${organization.textContent}
ASN: ${asn.textContent}
Timezone: ${timezone.textContent}
UTC Offset: ${utcOffset.textContent}
Postal Code: ${postal.textContent}
Latitude: ${latitude.textContent}
Longitude: ${longitude.textContent}
        `.trim();

        try {

            await navigator.clipboard.writeText(text);

            copyButton.textContent =
                "COPIED ✓";

            setTimeout(
                () => {
                    copyButton.textContent =
                        "COPY DATA";
                },
                1500
            );

        } catch {

            showError(
                "Could not copy the information."
            );

        }

    }
);


/* ========================================
   SALVAR HISTÓRICO
======================================== */

function saveToHistory(data) {

    const history =
        JSON.parse(
            localStorage.getItem(
                "ipHistory"
            ) || "[]"
        );

    const item = {

        ip: data.ip,

        location:
            `${data.city || "Unknown"}, ${
                data.country_code || ""
            }`,

        timestamp:
            new Date().toISOString()

    };

    const filtered =
        history.filter(
            entry =>
                entry.ip !== item.ip
        );

    filtered.unshift(item);

    const limited =
        filtered.slice(0, 10);

    localStorage.setItem(
        "ipHistory",
        JSON.stringify(limited)
    );

    renderHistory();
}


/* ========================================
   MOSTRAR HISTÓRICO
======================================== */

function renderHistory() {

    const history =
        JSON.parse(
            localStorage.getItem(
                "ipHistory"
            ) || "[]"
        );

    if (!history.length) {

        historySection.classList.add(
            "hidden"
        );

        return;
    }

    historySection.classList.remove(
        "hidden"
    );

    historyList.innerHTML = "";

    history.forEach(
        function (item) {

            const element =
                document.createElement(
                    "div"
                );

            element.className =
                "history-item";

            element.innerHTML = `
                <span class="history-ip">
                    ${escapeHTML(item.ip)}
                </span>

                <span class="history-location">
                    ${escapeHTML(item.location)}
                </span>
            `;

            element.addEventListener(
                "click",
                function () {

                    ipInput.value =
                        item.ip;

                    searchIP(item.ip);

                }
            );

            historyList.appendChild(
                element
            );

        }
    );
}


/* ========================================
   LIMPAR HISTÓRICO
======================================== */

clearHistoryButton.addEventListener(
    "click",
    function () {

        localStorage.removeItem(
            "ipHistory"
        );

        renderHistory();

    }
);


/* ========================================
   SEGURANÇA
======================================== */

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent = value;

    return div.innerHTML;
}


/* ========================================
   INICIALIZAÇÃO
======================================== */

renderHistory();