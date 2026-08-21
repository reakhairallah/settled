document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const tripId = params.get('id');

    const backLink = document.getElementById('back-link');
    const settleUpError = document.getElementById('settle-up-error');
    const balancesContainer = document.getElementById('balances-container');
    const transactionsContainer = document.getElementById('transactions-container');

    backLink.href = 'trip-view.php?id=' + tripId;

    axios.get('../../settled-server/api/settle-up-handler.php', { params: { trip_id: tripId } })
        .then((response) => {
            if (response.data.success) {
                render_balances(response.data.data.balances);
                render_transactions(response.data.data.transactions);
            } else {
                settleUpError.textContent = response.data.error;
            }
        })
        .catch((error) => {
            settleUpError.textContent = extract_axios_error_message(error);
        });

    function format_balance(amount) {
        if (amount.charAt(0) === '-') {
            return '-$' + amount.slice(1);
        }
        if (amount === '0.00') {
            return '$0.00';
        }
        return '+$' + amount;
    }

    function render_balances(balances) {
        balancesContainer.textContent = '';

        balances.forEach((balance) => {
            const line = document.createElement('p');
            line.textContent = balance.username + ': ' + format_balance(balance.amount);
            balancesContainer.appendChild(line);
        });
    }

    function render_transactions(transactions) {
        transactionsContainer.textContent = '';

        if (transactions.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = 'All settled up! No payments needed.';
            transactionsContainer.appendChild(emptyMessage);
            return;
        }

        transactions.forEach((transaction) => {
            const line = document.createElement('p');
            line.textContent = transaction.from_username + ' pays ' + transaction.to_username + ' $' + transaction.amount;
            transactionsContainer.appendChild(line);
        });
    }
});
