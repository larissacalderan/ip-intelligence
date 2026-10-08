const API_URL = "https://ipwho.is";

const ipInput = document.getElementById("ipInput");
const searchBtn = document.getElementById("searchBtn");
const myIpBtn = document.getElementById("myIpBtn");

const loading = document.getElementById("loading");
const error = document.getElementById("error");
const errorMessage = document.getElementById("errorMessage");
const results = document.getElementById("results");

const copyBtn = document.getElementById("copyBtn");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

const historyContainer = document.getElementById("history");

let currentData = null;

function mostrarLoading() {
    loading.classList.remove("hidden");
    results.classList.add("hidden");
    error.classList.add("hidden");
}

function esconderLoading() {
    loading.classList.add("hidden");
}

function mostrarErro(mensagem) {
    esconderLoading();

    errorMessage.textContent = mensagem;

    error.classList.remove("hidden");
    results.classList.add("hidden");
}

function esconderErro() {
    error.classList.add("hidden");
}

function valor(valor, fallback = "Não disponível") {
    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return fallback;
    }

    return valor;
}

function detectarVersaoIP(ip) {
    if (!ip) {
        return "IP";
    }

    return ip.includes(":") ? "IPv6" : "IPv4";
}

function escaparHTML(texto) {
    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatarData(data) {
    return new Date(data).toLocaleString("pt-BR");
}

async function consultarIP(ip = "") {

    mostrarLoading();
    esconderErro();

    try {

        const url = ip
            ? `${API_URL}/${encodeURIComponent(ip)}`
            : API_URL;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Erro na comunicação com a API.");
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(
                data.message || "IP inválido ou não encontrado."
            );
        }

        currentData = data;

        mostrarResultado(data);

        salvarHistorico(data);

        carregarHistorico();

    } catch (err) {

        console.error(err);

        mostrarErro(
            err.message ||
            "Não foi possível consultar este endereço IP."
        );
    }
}

function mostrarResultado(data) {

    esconderLoading();

    results.classList.remove("hidden");

    const ip = valor(data.ip);

    const country = valor(data.country);
    const region = valor(data.region);
    const city = valor(data.city);

    const postal = valor(data.postal);

    const latitude = valor(data.latitude);
    const longitude = valor(data.longitude);

    const timezone = data.timezone
        ? valor(data.timezone.id)
        : "Não disponível";

    const isp = data.connection
        ? valor(data.connection.isp)
        : "Não disponível";

    const organization = data.connection
        ? valor(data.connection.org)
        : "Não disponível";

    const asn = data.connection
        ? valor(data.connection.asn)
        : "Não disponível";

    document.getElementById("ipAddress").textContent = ip;

    document.getElementById("ipVersion").textContent =
        detectarVersaoIP(ip);

    document.getElementById("country").textContent =
        country;

    document.getElementById("region").textContent =
        region;

    document.getElementById("city").textContent =
        city;

    document.getElementById("postal").textContent =
        postal;

    document.getElementById("isp").textContent =
        isp;

    document.getElementById("organization").textContent =
        organization;

    document.getElementById("asn").textContent =
        asn;

    document.getElementById("latitude").textContent =
        latitude;

    document.getElementById("longitude").textContent =
        longitude;

    document.getElementById("timezone").textContent =
        timezone;

    const mapsLink = document.getElementById("mapsLink");

    if (
        data.latitude !== null &&
        data.longitude !== null &&
        data.latitude !== undefined &&
        data.longitude !== undefined
    ) {

        mapsLink.href =
            `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;

        mapsLink.style.display = "block";

    } else {

        mapsLink.removeAttribute("href");

        mapsLink.style.display = "none";
    }

    results.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function salvarHistorico(data) {

    let historico =
        JSON.parse(
            localStorage.getItem("ipIntelligenceHistory")
        ) || [];

    const item = {
        ip: data.ip,
        country: data.country,
        region: data.region,
        city: data.city,
        date: new Date().toISOString()
    };

    historico = historico.filter(
        itemAnterior => itemAnterior.ip !== data.ip
    );

    historico.unshift(item);

    historico = historico.slice(0, 10);

    localStorage.setItem(
        "ipIntelligenceHistory",
        JSON.stringify(historico)
    );
}

function carregarHistorico() {

    const historico =
        JSON.parse(
            localStorage.getItem("ipIntelligenceHistory")
        ) || [];

    if (historico.length === 0) {

        historyContainer.innerHTML = `
            <div class="empty-history">
                Nenhuma consulta realizada.
            </div>
        `;

        return;
    }

    historyContainer.innerHTML = historico
        .map(item => {

            const localizacao = [
                item.city,
                item.region,
                item.country
            ]
                .filter(Boolean)
                .join(", ");

            return `
                <div
                    class="history-item"
                    data-ip="${escaparHTML(item.ip)}"
                >

                    <span class="history-ip">
                        ${escaparHTML(item.ip)}
                    </span>

                    <span class="history-location">
                        ${escaparHTML(
                            localizacao || "Localização não disponível"
                        )}
                    </span>

                    <span class="history-date">
                        ${formatarData(item.date)}
                    </span>

                </div>
            `;

        })
        .join("");

    document
        .querySelectorAll(".history-item")
        .forEach(item => {

            item.addEventListener("click", () => {

                const ip = item.dataset.ip;

                ipInput.value = ip;

                consultarIP(ip);
            });
        });
}

function gerarTextoParaCopiar() {

    if (!currentData) {
        return "";
    }

    const data = currentData;

    const timezone = data.timezone
        ? valor(data.timezone.id)
        : "Não disponível";

    const isp = data.connection
        ? valor(data.connection.isp)
        : "Não disponível";

    const organization = data.connection
        ? valor(data.connection.org)
        : "Não disponível";

    const asn = data.connection
        ? valor(data.connection.asn)
        : "Não disponível";

    return `
IP INTELLIGENCE

ENDEREÇO IP: ${valor(data.ip)}
VERSÃO: ${detectarVersaoIP(data.ip)}

PAÍS: ${valor(data.country)}
REGIÃO: ${valor(data.region)}
CIDADE: ${valor(data.city)}
CEP APROXIMADO: ${valor(data.postal)}

PROVEDOR: ${isp}
ORGANIZAÇÃO: ${organization}
ASN: ${asn}

LATITUDE: ${valor(data.latitude)}
LONGITUDE: ${valor(data.longitude)}

FUSO HORÁRIO: ${timezone}

Observação:
A localização obtida através de IP é aproximada e não representa necessariamente o endereço físico exato.
    `.trim();
}

async function copiarInformacoes() {

    const texto = gerarTextoParaCopiar();

    if (!texto) {
        return;
    }

    try {

        await navigator.clipboard.writeText(texto);

        const textoOriginal = copyBtn.textContent;

        copyBtn.textContent =
            "✓ INFORMAÇÕES COPIADAS";

        setTimeout(() => {

            copyBtn.textContent = textoOriginal;

        }, 2000);

    } catch (err) {

        console.error(
            "Erro ao copiar informações:",
            err
        );
    }
}

searchBtn.addEventListener("click", () => {

    const ip = ipInput.value.trim();

    consultarIP(ip);
});

myIpBtn.addEventListener("click", () => {

    ipInput.value = "";

    consultarIP();
});

ipInput.addEventListener("keydown", event => {

    if (event.key === "Enter") {

        const ip = ipInput.value.trim();

        consultarIP(ip);
    }
});

copyBtn.addEventListener(
    "click",
    copiarInformacoes
);

clearHistoryBtn.addEventListener("click", () => {

    localStorage.removeItem(
        "ipIntelligenceHistory"
    );

    carregarHistorico();
});

carregarHistorico();