
/* =====================================
   NEXT00N - APOIE A NEXT00N
   Integração com Mercado Pago
   ===================================== */


/* CONFIGURAÇÕES */

const CONFIG = {

    // URL pública do backend Python no Render.
    // Exemplo: https://apoie-nextoon.onrender.com

    BACKEND_URL: "https://SEU-BACKEND.onrender.com",

    MIN_AMOUNT: 1,
    MAX_AMOUNT: 10000

};


/* ELEMENTOS */

const amountButtons = document.querySelectorAll(".amount");

const customButton = document.getElementById("customButton");

const customContainer = document.getElementById("customContainer");

const customInput = document.getElementById("customAmount");

const displayAmount = document.getElementById("displayAmount");

const donateButton = document.getElementById("donateButton");

const paymentMessage = document.getElementById("paymentMessage");


/* ESTADO */

let selectedValue = 5;

let customMode = false;

let paymentProcessing = false;


/* FORMATAR MOEDA */

function formatCurrency(value) {

    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(value);

}


/* ATUALIZAR VALOR */

function updateAmount(value) {

    selectedValue = Number(value);

    displayAmount.textContent = formatCurrency(
        Number.isFinite(selectedValue) ? selectedValue : 0
    );

}


/* SELEÇÃO DE VALORES */

amountButtons.forEach(button => {

    button.addEventListener("click", () => {

        if (paymentProcessing) return;

        amountButtons.forEach(item => {
            item.classList.remove("selected");
        });

        button.classList.add("selected");

        if (button === customButton) {

            customMode = true;

            customContainer.hidden = false;

            customInput.focus();

            updateAmount(Number(customInput.value) || 0);

            return;

        }

        customMode = false;

        customContainer.hidden = true;

        customInput.value = "";

        updateAmount(button.dataset.value);

    });

});


/* VALOR PERSONALIZADO */

customInput.addEventListener("input", () => {

    if (paymentProcessing) return;

    const value = Number(customInput.value);

    updateAmount(value > 0 ? value : 0);

});


/* MENSAGENS */

function showMessage(message, type = "info") {

    paymentMessage.textContent = message;

    paymentMessage.style.color =
        type === "error" ? "#FF7777" : "#C084FF";

}


/* ESTADO DO BOTÃO */

function setButtonLoading(loading) {

    donateButton.disabled = loading;

    if (loading) {

        donateButton.innerHTML = `
            Preparando pagamento...
            <i class="fa-solid fa-spinner fa-spin"></i>
        `;

    } else {

        donateButton.innerHTML = `
            Contribuir agora
            <i class="fa-solid fa-arrow-right"></i>
        `;

    }

}


/* CRIAR PAGAMENTO */

async function createPayment(amount) {

    if (!CONFIG.BACKEND_URL) {

        throw new Error(
            "O endereço do servidor não foi configurado."
        );

    }

    const response = await fetch(
        `${CONFIG.BACKEND_URL.replace(/\/+$/, "")}/criar-pagamento`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                amount: amount
            })
        }
    );

    let data;

    try {

        data = await response.json();

    } catch {

        throw new Error(
            "O servidor retornou uma resposta inválida."
        );

    }

    if (!response.ok) {

        throw new Error(
            data.erro || "Não foi possível iniciar o pagamento."
        );

    }

    if (
        data.status !== "success" ||
        typeof data.init_point !== "string" ||
        !data.init_point.startsWith("https://")
    ) {

        throw new Error(
            "O servidor não retornou um link de pagamento válido."
        );

    }

    return data.init_point;

}


/* INICIAR CONTRIBUIÇÃO */

async function startDonation() {

    if (paymentProcessing) return;

    const amount = customMode
        ? Number(customInput.value)
        : selectedValue;


    // Validar valor

    if (
        !Number.isFinite(amount) ||
        amount < CONFIG.MIN_AMOUNT ||
        amount > CONFIG.MAX_AMOUNT
    ) {

        showMessage(
            "Digite um valor válido entre R$ 1 e R$ 10.000.",
            "error"
        );

        return;

    }


    // Validar casas decimais

    if (Math.round(amount * 100) !== amount * 100) {

        showMessage(
            "Utilize no máximo duas casas decimais.",
            "error"
        );

        return;

    }


    // Bloquear novos cliques

    paymentProcessing = true;

    setButtonLoading(true);

    showMessage("Preparando sua contribuição...");


    try {

        const checkoutURL = await createPayment(amount);

        showMessage("Redirecionando para o Mercado Pago...");

        window.location.assign(checkoutURL);

    } catch (error) {

        console.error("Erro ao criar pagamento:", error);

        showMessage(
            error.message || "Ocorreu um erro. Tente novamente.",
            "error"
        );

        paymentProcessing = false;

        setButtonLoading(false);

    }

}


/* EVENTO DO BOTÃO */

donateButton.addEventListener("click", startDonation);


/* INICIALIZAÇÃO */

updateAmount(5);

