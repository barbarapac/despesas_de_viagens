function saveExpensesToLocalStorage(expenses) {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

function removeExpenseFromLocalStorage(id) {
    const expenses = getExpensesFromLocalStorage();
    const updatedExpenses = expenses.filter(expense => expense.id !== id);
    saveExpensesToLocalStorage(updatedExpenses);
}


function getExpensesFromLocalStorage() {
    const expenses = localStorage.getItem("expenses");
    return expenses ? JSON.parse(expenses) : [];
}

function renderCards() {
    const container = document.getElementById("cards-container");
    container.innerHTML = "";

    const expensesList = getExpensesFromLocalStorage();

    if (expensesList.length === 0) {
        container.innerHTML = '<p>Nenhuma despesa registrada.</p>';
        return;
    }

    expensesList.forEach(item => {
        const card = createCardTemplate(item);
        container.innerHTML += card;
    });

    addCardInteractions();
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

function createCardTemplate(item) {

    console.log(item)
    return `
        <div class="card show" id="card-${item.id}" style="width: 100%; max-width: 100%;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <label style="font-size: larger;"><strong>${item.descricao}</strong></label>
                <div class="d-inline-flex align-items-top">
                    <button class="btn btn-primary" onclick="editExpense('${item.id}')" title="Editar item">Editar</button>
                    <button class="btn btn-danger" onclick="deleteExpense('${item.id}')" title="Deletar item">Deletar</button>
                </div>
            </div>
            <div class="divider"></div>
            ${createCardDetails(item)}
        </div>
    `;
}

// Função para editar a despesa

// Função para deletar a despesa



function createCardDetails(item) {
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
          <strong>Total: </strong>${item.quantidade * item.valor} ${item.moedaDestino}
        </div>
      </div>
    `;
}



function addCardInteractions() {
    document.querySelectorAll("lottie-player").forEach(player => {
        player.addEventListener("click", (event) => {
            const dataId = event.target.getAttribute("data-id");
            const action = dataId.split('-')[0];
            const id = dataId.split('-')[1];
            
            if (action === 'delete') {
                animateRemoval(id);
            } else if (action === 'edit') {
                window.location.href = 'new-expense.html';
                const expensesList = getExpensesFromLocalStorage();
                const expense = expensesList.find(exp => exp.id == id);
                
                if (expense) {
                    localStorage.setItem('edit', JSON.stringify(expense));
                    document.getElementById('submit').innerText = "Editar Despesa";
                }
            }
        });
    });
}

function animateRemoval(id) {
    const card = document.getElementById(`card-${id}`);
    if (confirm("Você tem certeza que deseja remover esta despesa?")) {
        if (card) {
            card.classList.add("hide");
            card.ontransitionend = () => removeExpenseFromLocalStorage(id);
            card.remove();
            showNotification(`Despesa removida com sucesso!`);
        }
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