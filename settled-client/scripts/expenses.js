document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const tripId = params.get('id');

    init_topbar('expenses');

    const expensesError = document.getElementById('expenses-error');
    const tripPill = document.getElementById('trip-pill');
    const tripPillName = document.getElementById('trip-pill-name');
    const tripTotal = document.getElementById('trip-total');

    const addExpenseForm = document.getElementById('add-expense-form');
    const addExpenseError = document.getElementById('add-expense-error');
    const addExpenseButton = addExpenseForm.querySelector('.btn-add-expense');
    const amountInput = document.getElementById('amount');
    const descriptionInput = document.getElementById('description');
    const personalSwitch = document.getElementById('personal-switch');
    const splitFieldBlock = document.getElementById('split-field-block');
    const splitChips = document.getElementById('split-chips');
    const bulkToggle = document.getElementById('split-bulk-toggle');

    const tabTrip = document.getElementById('tab-trip');
    const tabPersonal = document.getElementById('tab-personal');
    const tripCount = document.getElementById('trip-count');
    const personalCount = document.getElementById('personal-count');
    const tabSub = document.getElementById('tab-sub');
    const panelTrip = document.getElementById('panel-trip');
    const panelPersonal = document.getElementById('panel-personal');

    tripPill.href = 'trip-view.php?id=' + tripId;

    const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const RECEIPT_ICON = '<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>';

    let members = [];
    let tripTotalAmount = 0;
    let personalTotalAmount = 0;

    function el(tag, className) {
        const node = document.createElement(tag);
        if (className) {
            node.className = className;
        }
        return node;
    }

    // must be a real <svg> element (not raw path/line tags dropped into a
    // plain div's innerHTML), since the browser only parses those tags as SVG
    // when the innerHTML target is itself in the SVG namespace
    function icon_svg(pathData, width, height, strokeWidth) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', strokeWidth || '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        svg.innerHTML = pathData;
        return svg;
    }

    // MySQL's TIMESTAMP comes back as "YYYY-MM-DD HH:MM:SS", which some
    // browsers won't parse reliably as a space-separated string -- swapping
    // in a "T" makes it a format every engine parses consistently
    function parse_created_at(str) {
        return new Date(str.replace(' ', 'T'));
    }

    function format_day_label(date) {
        return WEEKDAY_NAMES[date.getDay()] + ', ' + MONTH_NAMES[date.getMonth()] + ' ' + date.getDate();
    }

    function format_time(date) {
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        if (hours === 0) {
            hours = 12;
        }
        return hours + ':' + minutes + ' ' + ampm;
    }

    fetch_expenses();

    function checkboxes() {
        return [...splitChips.querySelectorAll('input[type="checkbox"]')];
    }

    function update_bulk_label() {
        const boxes = checkboxes();
        const allChecked = boxes.length > 0 && boxes.every((cb) => cb.checked);
        bulkToggle.textContent = allChecked ? 'Deselect all' : 'Select all';
    }

    // rebuilt from the real trip member list on every fetch (and reset after
    // a successful submit), rather than reusing whatever the user left
    // checked from a previous expense
    function render_split_chips() {
        splitChips.textContent = '';

        members.forEach((member) => {
            const chip = el('label', 'chip-option');

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.name = 'member_ids[]';
            input.value = member.id;
            input.checked = true;
            input.addEventListener('change', update_bulk_label);

            const avatar = el('span', 'mini-avatar');
            avatar.style.background = color_for_initials(member.initials);
            avatar.textContent = member.initials;

            const name = document.createElement('span');
            name.textContent = member.username;

            chip.append(input, avatar, name);
            splitChips.appendChild(chip);
        });

        update_bulk_label();
    }

    personalSwitch.addEventListener('change', () => {
        splitFieldBlock.classList.toggle('disabled', personalSwitch.checked);
        bulkToggle.disabled = personalSwitch.checked;
    });

    bulkToggle.addEventListener('click', () => {
        const boxes = checkboxes();
        const allChecked = boxes.length > 0 && boxes.every((cb) => cb.checked);
        boxes.forEach((cb) => { cb.checked = !allChecked; });
        update_bulk_label();
    });

    [tabTrip, tabPersonal].forEach((tab) => {
        tab.addEventListener('click', () => {
            [tabTrip, tabPersonal].forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');
            const which = tab.dataset.tab;
            panelTrip.hidden = which !== 'trip';
            panelPersonal.hidden = which !== 'personal';
            update_tab_sub();
        });
    });

    function update_tab_sub() {
        const activeTab = document.querySelector('.tab.active').dataset.tab;
        tabSub.textContent = '';

        const lead = document.createElement('span');
        const strong = document.createElement('strong');
        const tail = document.createElement('span');

        if (activeTab === 'trip') {
            lead.textContent = 'Shared costs, split across whoever you pick, visible to everyone on the trip. ';
            strong.textContent = format_money(tripTotalAmount);
        } else {
            lead.textContent = 'Not split with anyone. Only you can see these. ';
            strong.textContent = format_money(personalTotalAmount);
        }
        tail.textContent = ' total so far.';

        tabSub.append(lead, strong, tail);
    }

    addExpenseForm.addEventListener('submit', (event) => {
        event.preventDefault();
        addExpenseError.textContent = '';

        const amount = amountInput.value.trim();
        if (amount === '' || isNaN(amount) || Number(amount) <= 0) {
            addExpenseError.textContent = 'Please enter a valid amount.';
            return;
        }

        addExpenseButton.disabled = true;

        const formData = new FormData();
        formData.append('trip_id', tripId);
        formData.append('amount', amount);
        formData.append('description', descriptionInput.value.trim());

        if (!personalSwitch.checked) {
            checkboxes().forEach((cb) => {
                if (cb.checked) {
                    formData.append('member_ids[]', cb.value);
                }
            });
        }

        axios.post('../../settled-server/api/add-expense-handler.php', formData)
            .then((response) => {
                addExpenseButton.disabled = false;
                if (response.data.success) {
                    amountInput.value = '';
                    descriptionInput.value = '';
                    personalSwitch.checked = false;
                    splitFieldBlock.classList.remove('disabled');
                    bulkToggle.disabled = false;
                    render_split_chips();
                    amountInput.focus();
                    fetch_expenses();
                } else {
                    addExpenseError.textContent = response.data.error;
                }
            })
            .catch((error) => {
                addExpenseButton.disabled = false;
                addExpenseError.textContent = extract_axios_error_message(error);
            });
    });

    function fetch_expenses() {
        axios.get('../../settled-server/api/expenses-data-handler.php', { params: { trip_id: tripId } })
            .then((response) => {
                if (response.data.success) {
                    const data = response.data.data;
                    tripPillName.textContent = data.trip.name;
                    members = data.members;
                    render_split_chips();

                    tripTotalAmount = data.trip_expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
                    personalTotalAmount = data.personal_expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

                    tripTotal.textContent = format_money(tripTotalAmount);
                    tripCount.textContent = String(data.trip_expenses.length);
                    personalCount.textContent = String(data.personal_expenses.length);

                    render_tab_panel(panelTrip, data.trip_expenses, false);
                    render_tab_panel(panelPersonal, data.personal_expenses, true);

                    update_tab_sub();
                } else {
                    expensesError.textContent = response.data.error;
                }
            })
            .catch((error) => {
                expensesError.textContent = extract_axios_error_message(error);
            });
    }

    function render_tab_panel(container, expenses, isPersonal) {
        container.textContent = '';

        if (expenses.length === 0) {
            container.appendChild(build_empty_state(isPersonal));
            return;
        }

        render_day_groups(container, expenses, isPersonal);
    }

    function build_empty_state(isPersonal) {
        const wrap = el('div', 'expenses-empty');

        const iconWrap = el('div', 'expenses-empty-icon');
        iconWrap.appendChild(icon_svg(RECEIPT_ICON, 22, 22, '2'));

        const heading = document.createElement('h2');
        heading.textContent = isPersonal ? 'No personal expenses yet' : 'No trip expenses yet';

        const copy = document.createElement('p');
        copy.textContent = isPersonal
            ? 'Anything you log and keep personal will show up here.'
            : 'Log something above and split it with the trip to see it here.';

        wrap.append(iconWrap, heading, copy);
        return wrap;
    }

    // expenses.php always groups by day, oldest boundary detection relying on
    // the backend's own created_at DESC ordering rather than re-sorting here
    function group_by_day(expenses) {
        const groups = [];
        let currentKey = null;
        let currentGroup = null;

        expenses.forEach((expense) => {
            const date = parse_created_at(expense.created_at);
            const key = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();

            if (key !== currentKey) {
                currentGroup = { label: format_day_label(date), items: [] };
                groups.push(currentGroup);
                currentKey = key;
            }

            currentGroup.items.push({ expense, date });
        });

        return groups;
    }

    function render_day_groups(container, expenses, isPersonal) {
        const groups = group_by_day(expenses);

        // a plain rotating index across the whole list, same as the
        // trip-view widget's own .expense-row dots -- purely decorative,
        // not tied to who paid
        let dotIndex = 0;

        groups.forEach((group) => {
            const groupEl = el('div', 'day-group');

            const label = el('div', 'day-label');
            label.textContent = group.label;
            groupEl.appendChild(label);

            const list = el('div', 'expense-list');
            group.items.forEach((item) => {
                const dotColor = VIBE_COLORS[dotIndex % VIBE_COLORS.length];
                dotIndex++;
                list.appendChild(build_expense_card(item.expense, item.date, dotColor, isPersonal));
            });
            groupEl.appendChild(list);

            container.appendChild(groupEl);
        });
    }

    function build_expense_card(expense, date, dotColor, isPersonal) {
        const card = el('div', 'expense-card');
        const top = el('div', 'expense-top');

        const dot = el('span', 'expense-dot');
        dot.style.background = dotColor;
        top.appendChild(dot);

        const info = el('div', 'expense-info');

        const desc = document.createElement('p');
        desc.className = 'expense-desc';
        desc.textContent = expense.description || 'Untitled expense';
        info.appendChild(desc);

        const meta = el('div', 'expense-meta');
        if (!isPersonal) {
            const paidBy = document.createElement('span');
            paidBy.textContent = 'Paid by ' + expense.payer_username;
            const sep = document.createElement('span');
            sep.textContent = '·';
            meta.append(paidBy, sep);
        }
        const time = el('span', 'time');
        time.textContent = format_time(date);
        meta.appendChild(time);
        info.appendChild(meta);

        top.appendChild(info);

        const amount = el('div', 'expense-amount');
        amount.textContent = format_money(expense.amount);
        top.appendChild(amount);

        card.appendChild(top);

        if (!isPersonal && expense.splits.length > 0) {
            card.appendChild(build_split_row(expense.splits));
        }

        return card;
    }

    function build_split_row(splits) {
        const row = el('div', 'split-row');

        const who = el('div', 'split-who');
        const stack = el('div', 'split-stack');
        splits.forEach((split) => {
            const avatar = el('span', 'mini-avatar');
            const initials = split.username.slice(0, 2).toUpperCase();
            avatar.style.background = color_for_initials(initials);
            avatar.textContent = initials;
            stack.appendChild(avatar);
        });
        who.appendChild(stack);

        const label = el('span', 'split-label');
        if (splits.length === members.length && members.length > 0) {
            label.textContent = 'Split ' + splits.length + ' ways';
        } else {
            label.textContent = 'Split with ' + splits.map((split) => split.username).join(', ');
        }
        who.appendChild(label);

        row.append(who, build_split_shares(splits));
        return row;
    }

    function build_split_shares(splits) {
        const shares = el('div', 'split-shares');
        const amounts = splits.map((split) => Number(split.share_amount));
        const allEqual = amounts.every((amount) => amount === amounts[0]);

        if (allEqual) {
            const strong = document.createElement('strong');
            strong.textContent = format_money(amounts[0]);
            const tail = document.createElement('span');
            tail.textContent = ' each';
            shares.append(strong, tail);
        } else {
            amounts.forEach((amount, index) => {
                if (index > 0) {
                    const sep = document.createElement('span');
                    sep.textContent = '· ';
                    shares.appendChild(sep);
                }
                const strong = document.createElement('strong');
                strong.textContent = format_money(amount);
                shares.appendChild(strong);
            });
        }

        return shares;
    }
});
