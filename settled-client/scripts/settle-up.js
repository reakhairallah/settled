document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const tripId = params.get('id');

    init_topbar('settle-up');

    const settleError = document.getElementById('settle-up-error');
    const tripPill = document.getElementById('trip-pill');
    const tripPillName = document.getElementById('trip-pill-name');

    const settleEmpty = document.getElementById('settle-empty');
    const settleEmptyMessage = document.getElementById('settle-empty-message');
    const settleContent = document.getElementById('settle-content');

    const balanceHero = document.getElementById('balance-hero');
    const heroBadge = document.getElementById('hero-badge');
    const heroLabel = document.getElementById('hero-label');
    const heroAmount = document.getElementById('hero-amount');

    const yourPaymentsSection = document.getElementById('your-payments-section');
    const yourPaymentsHint = document.getElementById('your-payments-hint');
    const yourPlanList = document.getElementById('your-plan-list');

    const everyoneLedger = document.getElementById('everyone-ledger');
    const restOfPlanBlock = document.getElementById('rest-of-plan-block');
    const restOfPlan = document.getElementById('rest-of-plan');

    tripPill.href = 'trip-view.php?id=' + tripId;

    const CHECK_ICON = '<path d="M20 6 9 17l-5-5"/>';
    const MINUS = '−';

    function el(tag, className) {
        const node = document.createElement(tag);
        if (className) {
            node.className = className;
        }
        return node;
    }

    // must be a real <svg> element (not raw path tags dropped into a plain
    // div's innerHTML), since the browser only parses those tags as SVG when
    // the innerHTML target is itself in the SVG namespace
    function icon_svg(pathData, width, height, strokeWidth) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', strokeWidth || '2.4');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        svg.innerHTML = pathData;
        return svg;
    }

    fetch_settle_up();

    function fetch_settle_up() {
        axios.get('../../settled-server/api/settle-up-handler.php', { params: { trip_id: tripId } })
            .then((response) => {
                if (response.data.success) {
                    render(response.data.data);
                } else {
                    settleError.textContent = response.data.error;
                }
            })
            .catch((error) => {
                settleError.textContent = extract_axios_error_message(error);
            });
    }

    function render(data) {
        tripPillName.textContent = data.trip.name;

        // the whole trip has nothing left to settle -- same "All settled up"
        // empty state the trip-view widget shows, hero and sections skipped
        // entirely rather than shown empty
        if (data.transactions.length === 0) {
            settleEmpty.hidden = false;
            settleContent.hidden = true;
            settleEmptyMessage.textContent = data.balances.length > 0
                ? "Everyone's all paid up."
                : 'Nothing to settle until expenses come in.';
            return;
        }

        settleEmpty.hidden = true;
        settleContent.hidden = false;

        const yourId = Number(data.your_trip_member_id);
        const yourBalance = data.balances.find((balance) => Number(balance.trip_member_id) === yourId);
        const yourAmount = yourBalance ? Number(yourBalance.amount) : 0;

        const yourTransactions = [];
        const otherTransactions = [];
        data.transactions.forEach((transaction) => {
            const youAreCreditor = Number(transaction.to_trip_member_id) === yourId;
            const youAreDebtor = Number(transaction.from_trip_member_id) === yourId;
            if (youAreCreditor || youAreDebtor) {
                yourTransactions.push(Object.assign({}, transaction, { youAreCreditor, youAreDebtor }));
            } else {
                otherTransactions.push(transaction);
            }
        });

        render_hero(yourAmount, yourTransactions.length);
        render_your_payments(yourTransactions);
        render_everyone_ledger(data.balances, yourId);
        render_rest_of_plan(otherTransactions);
    }

    function render_hero(yourAmount, yourTransactionCount) {
        // you personally have nothing pending, but the group isn't fully
        // settled (someone else's balances still need to move) -- quiet,
        // neutral hero instead of hiding the page, since the full breakdown
        // below is still real, useful information
        if (yourTransactionCount === 0) {
            balanceHero.className = 'balance-hero settled';
            heroBadge.className = 'hero-badge settled';
            heroBadge.textContent = '';
            heroBadge.appendChild(icon_svg(CHECK_ICON, 20, 20, '2.6'));
            heroLabel.textContent = "You're all settled up";
            heroAmount.hidden = true;
            heroAmount.textContent = '';
            return;
        }

        const direction = yourAmount >= 0 ? 'owed' : 'owe';
        balanceHero.className = 'balance-hero ' + direction;
        heroBadge.className = 'hero-badge ' + direction;
        heroBadge.textContent = direction === 'owed' ? '+' : MINUS;
        heroLabel.textContent = direction === 'owed' ? "You're owed" : 'You owe';
        heroAmount.hidden = false;
        heroAmount.className = 'hero-amount ' + direction;
        heroAmount.textContent = format_money(Math.abs(yourAmount));
    }

    function render_your_payments(transactions) {
        if (transactions.length === 0) {
            yourPaymentsSection.hidden = true;
            return;
        }

        yourPaymentsSection.hidden = false;
        yourPaymentsHint.textContent = transactions.length === 1
            ? '1 payment involves you'
            : transactions.length + ' payments involve you';

        yourPlanList.textContent = '';
        transactions.forEach((transaction) => {
            yourPlanList.appendChild(build_your_plan_row(transaction));
        });
    }

    function build_your_plan_row(transaction) {
        const row = el('div', 'your-plan-row');

        const otherUsername = transaction.youAreCreditor ? transaction.from_username : transaction.to_username;
        const otherInitials = get_initials(otherUsername);

        const avatar = el('div', 'your-plan-av');
        avatar.style.background = color_for_initials(otherInitials);
        avatar.textContent = otherInitials;
        row.appendChild(avatar);

        const text = el('span', 'your-plan-text');
        const strong = document.createElement('strong');
        strong.textContent = otherUsername;
        if (transaction.youAreCreditor) {
            text.append(strong, document.createTextNode(' owes you'));
        } else {
            text.append(document.createTextNode('You owe '), strong);
        }
        row.appendChild(text);

        const amount = el('span', 'your-plan-amount ' + (transaction.youAreCreditor ? 'in' : 'out'));
        amount.textContent = (transaction.youAreCreditor ? '+' : MINUS) + format_money(transaction.amount);
        row.appendChild(amount);

        return row;
    }

    function render_everyone_ledger(balances, yourId) {
        everyoneLedger.textContent = '';
        balances.slice()
            .sort((a, b) => Number(b.amount) - Number(a.amount))
            .forEach((balance) => {
                everyoneLedger.appendChild(build_ledger_row(balance, yourId));
            });
    }

    function build_ledger_row(balance, yourId) {
        const row = el('div', 'mini-ledger-row');

        const initials = get_initials(balance.username);
        const avatar = el('div', 'mini-ledger-av');
        avatar.style.background = color_for_initials(initials);
        avatar.textContent = initials;
        row.appendChild(avatar);

        const name = el('span', 'mini-ledger-name');
        name.textContent = balance.username + (Number(balance.trip_member_id) === yourId ? ' (you)' : '');
        row.appendChild(name);

        // rounds to cents before comparing to zero, so a balance that's
        // merely a fraction of a cent off from the split/rounding math
        // (never in practice more than a cent) still reads as settled
        // rather than showing a stray "+$0.00" in a colored direction
        const amountCents = Math.round(Number(balance.amount) * 100);
        const amount = el('span', 'mini-ledger-amount');
        if (amountCents === 0) {
            amount.classList.add('zero');
            amount.textContent = 'Settled';
        } else {
            const direction = amountCents > 0 ? 'owed' : 'owe';
            amount.classList.add(direction);
            const sign = el('span', 'sign');
            sign.textContent = amountCents > 0 ? '+' : MINUS;
            amount.append(sign, document.createTextNode(format_money(Math.abs(amountCents) / 100)));
        }
        row.appendChild(amount);

        return row;
    }

    function render_rest_of_plan(transactions) {
        if (transactions.length === 0) {
            restOfPlanBlock.hidden = true;
            return;
        }

        restOfPlanBlock.hidden = false;
        restOfPlan.textContent = '';
        transactions.forEach((transaction) => {
            restOfPlan.appendChild(build_rest_of_plan_row(transaction));
        });
    }

    function build_rest_of_plan_row(transaction) {
        const row = el('div', 'mini-plan-row');

        const initials = get_initials(transaction.from_username);
        const avatar = el('div', 'mini-plan-av');
        avatar.style.background = color_for_initials(initials);
        avatar.textContent = initials;
        row.appendChild(avatar);

        const text = document.createElement('span');
        text.textContent = transaction.from_username + ' owes ' + transaction.to_username;
        row.appendChild(text);

        const amount = el('span', 'mini-plan-amount');
        amount.textContent = format_money(transaction.amount);
        row.appendChild(amount);

        return row;
    }
});
