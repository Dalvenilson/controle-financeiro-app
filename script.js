// Elementos DOM
const balanceEl = document.getElementById('balance');
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const form = document.getElementById('transaction-form');
const list = document.getElementById('transaction-list');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeInput = document.getElementById('type');
const categoryInput = document.getElementById('category');
const filterButtons = document.querySelectorAll('.btn-filter');

// Carregar transações do Local Storage ou iniciar um array vazio
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let currentFilter = 'all'; // Estado inicial do filtro

// --- FUNÇÕES DE LÓGICA ---

// Função para atualizar o saldo, receitas e despesas
function updateBalance() {
    // 1. Cálculos
    const incomeAmounts = transactions
        .filter(t => t.type === 'income')
        .map(t => t.amount);

    const expenseAmounts = transactions
        .filter(t => t.type === 'expense')
        .map(t => t.amount);

    const totalIncome = incomeAmounts.reduce((acc, item) => (acc += item), 0);
    const totalExpense = expenseAmounts.reduce((acc, item) => (acc += item), 0);
    const totalBalance = totalIncome - totalExpense;

    // 2. Formatação e Exibição
    const formatBRL = (value) => `R$ ${Math.abs(value).toFixed(2).replace('.', ',')}`;

    balanceEl.textContent = formatBRL(totalBalance);
    totalIncomeEl.textContent = formatBRL(totalIncome);
    totalExpenseEl.textContent = formatBRL(totalExpense);

    // 3. Cor do Saldo Geral
    if (totalBalance >= 0) {
        balanceEl.style.color = totalBalance > 0 ? 'var(--success-color)' : 'var(--primary-color)';
    } else {
        balanceEl.style.color = 'var(--danger-color)';
    }
}

// Função para renderizar uma transação na lista
function addTransactionDOM(transaction) {
    const item = document.createElement('li');
    
    // Define a classe para cor (expense ou income)
    item.classList.add('transaction-item', transaction.type);

    // Formata o valor
    const sign = transaction.type === 'expense' ? '-' : '+';
    const formattedAmount = `${sign} ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(transaction.amount)}`;

    item.innerHTML = `
        <div class="transaction-details">
            <p><strong>${transaction.description}</strong></p>
            <p><small>Categoria: ${transaction.category}</small></p>
        </div>
        <span class="transaction-amount">${formattedAmount}</span>
        <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">X</button>
    `;

    list.appendChild(item);
}

// Função para salvar as transações no Local Storage
function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Função para deletar transação (chamada pelo botão)
function deleteTransaction(id) {
    // Filtra a transação com o ID correspondente
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions(); // Salva o novo array
    init(currentFilter); // Re-renderiza e atualiza o saldo
}

// --- CONTROLE DE FLUXO E INICIALIZAÇÃO ---

// Função principal de inicialização e filtragem
function init(filter = 'all') {
    currentFilter = filter;
    list.innerHTML = ''; // Limpa a lista antes de renderizar

    // Aplica o filtro
    const filteredTransactions = transactions.filter(t => {
        if (filter === 'all') return true;
        return t.type === filter;
    });

    // Renderiza as transações filtradas
    filteredTransactions.forEach(addTransactionDOM);
    
    updateBalance(); // Atualiza os painéis de saldo/receita/despesa

    // Atualiza a classe 'active' nos botões de filtro
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === filter) {
            btn.classList.add('active');
        }
    });
}

// --- EVENT LISTENERS ---

// Evento de submissão do formulário (Adicionar Transação)
form.addEventListener('submit', (e) => {
    e.preventDefault(); 

    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const type = typeInput.value;
    const category = categoryInput.value;

    if (description === '' || isNaN(amount) || amount <= 0) {
        alert('Por favor, insira uma descrição válida e um valor positivo.');
        return;
    }

    const newTransaction = {
        id: Date.now(), // ID único baseado no timestamp
        description,
        amount,
        type,
        category
    };

    transactions.push(newTransaction);
    saveTransactions(); // Salva a transação
    init(currentFilter); // Re-renderiza e recalcula

    // Limpa o formulário
    descriptionInput.value = '';
    amountInput.value = '';
});

// Event listeners para os botões de filtro
filterButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const filterType = e.target.getAttribute('data-filter');
        init(filterType);
    });
});

// A função deleteTransaction é global e não precisa de um event listener aqui, pois é chamada via atributo onclick no HTML.

// Inicia o aplicativo ao carregar a página
init();