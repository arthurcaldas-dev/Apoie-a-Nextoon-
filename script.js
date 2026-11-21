
/* =====================================
   NEXT00N - APOIE A NEXT00N
   Integração Pix - PicPay
   ===================================== */


/* CONFIGURAÇÕES */

const CONFIG = {

    // Cole aqui o Pix Copia e Cola do PicPay.
    PIX_CODE: "COLE_SEU_CODIGO_PIX_AQUI",

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

    const value = Number(customInput.value);

    updateAmount(value > 0 ? value : 0);

});


/* MENSAGENS */

function showMessage(message, type = "info") {

    paymentMessage.textContent = message;

    paymentMessage.style.color =
        type === "error" ? "#FF7777" : "#C084FF";

}


/* COPIAR PIX */

async function copyPixCode() {

    const amount = customMode
        ? Number(customInput.value)
        : selectedValue;

    if (
        !Number.isFinite(amount) ||
        amount < CONFIG.MIN_AMOUNT ||
        amount > CONFIG.MAX_AMOUNT
    ) {

        showMessage(
            "Escolha um valor entre R$ 1 e R$ 10.000.",
            "error"
        );

        return;

    }

    if (
        !CONFIG.PIX_CODE ||
        CONFIG.PIX_CODE === "COLE_SEU_CODIGO_PIX_AQUI"
    ) {

        showMessage(
            "O código Pix ainda não foi configurado.",
            "error"
        );

        return;

    }

    try {

        await navigator.clipboard.writeText(CONFIG.PIX_CODE);

        showMessage(
            `Código Pix copiado! Abra seu banco, cole o código e informe ${formatCurrency(amount)}.`
        );

        donateButton.innerHTML = `
            Pix copiado!
            <i class="fa-solid fa-check"></i>
        `;

        setTimeout(() => {

            donateButton.innerHTML = `
                Copiar código Pix
                <i class="fa-solid fa-copy"></i>
            `;

        }, 3000);

    } catch (error) {

        console.error("Erro ao copiar Pix:", error);

        showMessage(
            "Não foi possível copiar automaticamente. Tente novamente ou use outro navegador.",
            "error"
        );

    }

}


/* EVENTO DO BOTÃO */

donateButton.addEventListener("click", copyPixCode);


/* INICIALIZAÇÃO */

updateAmount(5);
