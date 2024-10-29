


// Evento para capturar o valor do data-id ao abrir o modal
$('#exampleModalCenter').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget); // Botão que acionou o modal
    var expenseId = button.data('id'); // Obtém o valor do data-id

    // Define o ID da despesa no botão de confirmação
    $('#confirmarExclusao').data('id', expenseId);
});

// Função de exclusão
$('#confirmarExclusao').click(function () {
    var expenseId = $(this).data('id'); // Recupera o ID da despesa do botão de confirmação
    deleteExpense(expenseId); // Chama a função de exclusão passando o ID
    $('#exampleModalCenter').modal('hide'); // Fecha o modal
});

function deleteExpense(id) {
    console.log("Deletar item com ID:", id); // Log para verificar o ID
    const expensesList = getExpensesFromLocalStorage().filter(exp => exp.id != id);
    localStorage.setItem('expenses', JSON.stringify(expensesList)); // Atualiza o localStorage
    document.getElementById(`card-${id}`).remove(); // Remove o card da interface
}


function getExpensesFromLocalStorage() {
    const expenses = localStorage.getItem("expenses");
    return expenses ? JSON.parse(expenses) : [];
}


function displayBudgets() {
    const budgetsUl = document.getElementById('budgets-ul');
    budgetsUl.innerHTML = '';

    const budgets = JSON.parse(localStorage.getItem('budgets')) || [];

    budgets.forEach(budget => {
        const li = document.createElement('li');
        li.classList.add('list-group-item');
        li.textContent = `${budget.descricao} - ${budget?.valor?.toFixed(2)} ${budget.moeda}`;
        budgetsUl.appendChild(li);
    });
}


async function createCardDetails(item) {
    // Calcula o valor total da despesa (quantidade * valor unitário)
    const totalAmount = item.quantidade * item.valor;

    // Converte o valor total para a moeda de destino
    const convertedTotal = await convertCurrency(totalAmount, item.moedaOrigem, item.moedaDestino);

    return `
      <label><strong>Valor:</strong> ${item?.valor?.toFixed(2).replace(".", ",")} ${item.moedaOrigem}</label>
      <label><strong>Categoria:</strong> ${item.categoria}</label>
      <label><strong>Data:</strong> ${item.data}</label>
      <label><strong>Quantidade:</strong> ${item.quantidade}</label>
      <div class="divider"></div>
      <div class="row">
        <div class="col-6">
          <div class="d-inline-flex align-items-center">
            <span class="me-2">${item.moedaOrigem}</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="20" height="20">
              <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/>
            </svg>
            <span class="ms-2">${item.moedaDestino}</span>
          </div>
        </div>
        <div class="col-6 d-flex justify-content-end">
          <strong>Total: </strong>${convertedTotal.toFixed(2)} ${item.moedaDestino}
        </div>
      </div>
    `;
}

// Atualização da função renderCards para lidar com a função assíncrona createCardDetails
async function renderCards() {
    const container = document.getElementById("cards-container");
    container.innerHTML = "";

    const expensesList = getExpenses();

    if (expensesList.length === 0) {
        container.innerHTML = '<p>Nenhuma despesa registrada.</p>';
        return;
    }

    for (const item of expensesList) {
        const cardDetails = await createCardDetails(item);
        const cardTemplate = `
          <div class="card show" id="card-${item.id}" style="width: 100%; max-width: 100%;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                  <label style="font-size: larger;"><strong>${item.descricao}</strong></label>
                  <div class="d-inline-flex align-items-top">
                      <button class="btn btn-primary" onclick="editExpense('${item.id}')" title="Editar item">Editar</button>
                        <button type="button" class="btn btn-danger" data-toggle="modal" data-target="#exampleModalCenter" data-id='${item.id}'>
                            Deletar
                        </button>
                  </div>
              </div>
              <div class="divider"></div>
              ${cardDetails}
          </div>
        `;
        container.innerHTML += cardTemplate;
    }
}

// Função para converter a moeda usando a API ExchangeRate-API
async function convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;

    const apiKey = 'edf7dd9bb7db93759e243c91';
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.result === "success") {
            const rate = data.conversion_rates[toCurrency];
            if (rate) {
                return amount * rate;
            } else {
                console.error(`A moeda de destino ${toCurrency} não foi encontrada nas taxas de câmbio.`);
                return amount; // Retorna o valor original se a moeda não for encontrada
            }
        } else {
            console.error("Erro na resposta da API ExchangeRate-API:", data);
            return amount; // Retorna o valor original em caso de erro
        }
    } catch (error) {
        console.error("Erro ao buscar as taxas de câmbio:", error);
        return amount; // Retorna o valor original em caso de erro
    }
}

export function showNotification(message) {
    const notification = document.getElementById("notification");
    notification.textContent = message;
    notification.classList.add("show");

    setTimeout(() => notification.classList.remove("show"), 3000);
}

renderCards()
displayBudgets()