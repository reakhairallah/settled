document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const tripId = params.get('id');

    const backLink = document.getElementById('back-link');
    const expensesError = document.getElementById('expenses-error');
    const addExpenseForm = document.getElementById('add-expense-form');
    const addExpenseError = document.getElementById('add-expense-error');
    const splitMembersContainer = document.getElementById('split-members-container');
    const tripExpensesContainer = document.getElementById('trip-expenses-container');
    const personalExpensesContainer = document.getElementById('personal-expenses-container');

    let members = [];

    backLink.href = 'trip-view.php?id=' + tripId;

    axios.get('../../settled-server/api/trip-view-data-handler.php', { params: { trip_id: tripId } })
        .then((response) => {
            if (response.data.success) {
                members = response.data.data.members;
                render_split_checklist();
            } else {
                expensesError.textContent = response.data.error;
            }
        })
        .catch((error) => {
            expensesError.textContent = extract_axios_error_message(error);
        });

    load_expenses();

    addExpenseForm.addEventListener('submit', (event) => {
        event.preventDefault();
        addExpenseError.textContent = '';

        const formData = new FormData(addExpenseForm);
        formData.append('trip_id', tripId);

        axios.post('../../settled-server/api/add-expense-handler.php', formData)
            .then((response) => {
                if (response.data.success) {
                    addExpenseForm.reset();
                    render_split_checklist();
                    load_expenses();
                } else {
                    addExpenseError.textContent = response.data.error;
                }
            })
            .catch((error) => {
                addExpenseError.textContent = extract_axios_error_message(error);
            });
    });

    function load_expenses() {
        axios.get('../../settled-server/api/expenses-data-handler.php', { params: { trip_id: tripId } })
            .then((response) => {
                if (response.data.success) {
                    render_trip_expenses(response.data.data.trip_expenses);
                    render_personal_expenses(response.data.data.personal_expenses);
                } else {
                    expensesError.textContent = response.data.error;
                }
            })
            .catch((error) => {
                expensesError.textContent = extract_axios_error_message(error);
            });
    }

    function render_split_checklist() {
        splitMembersContainer.textContent = '';

        members.forEach((member) => {
            const label = document.createElement('label');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = 'member_ids[]';
            checkbox.value = member.id;
            checkbox.checked = true;
            label.appendChild(checkbox);

            const usernameSpan = document.createElement('span');
            usernameSpan.textContent = ' ' + member.username;
            label.appendChild(usernameSpan);

            splitMembersContainer.appendChild(label);
        });
    }

    function render_trip_expenses(tripExpenses) {
        tripExpensesContainer.textContent = '';

        if (tripExpenses.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = 'No trip expenses yet.';
            tripExpensesContainer.appendChild(emptyMessage);
            return;
        }

        tripExpenses.forEach((expense) => {
            tripExpensesContainer.appendChild(build_trip_expense_card(expense));
        });
    }

    function build_trip_expense_card(expense) {
        const card = document.createElement('div');
        card.className = 'expense-card';

        const amountLine = document.createElement('p');
        amountLine.textContent = '$' + expense.amount + (expense.description ? ' - ' + expense.description : '');
        card.appendChild(amountLine);

        const payerLine = document.createElement('p');
        payerLine.textContent = 'Paid by ' + expense.payer_username;
        card.appendChild(payerLine);

        const splitLine = document.createElement('p');
        const splitText = expense.splits.map((split) => split.username + ' ($' + split.share_amount + ')').join(', ');
        splitLine.textContent = 'Split with: ' + splitText;
        card.appendChild(splitLine);

        return card;
    }

    function render_personal_expenses(personalExpenses) {
        personalExpensesContainer.textContent = '';

        if (personalExpenses.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = 'No personal expenses yet.';
            personalExpensesContainer.appendChild(emptyMessage);
            return;
        }

        personalExpenses.forEach((expense) => {
            personalExpensesContainer.appendChild(build_personal_expense_card(expense));
        });
    }

    function build_personal_expense_card(expense) {
        const card = document.createElement('div');
        card.className = 'expense-card';

        const amountLine = document.createElement('p');
        amountLine.textContent = '$' + expense.amount + (expense.description ? ' - ' + expense.description : '');
        card.appendChild(amountLine);

        return card;
    }
});
