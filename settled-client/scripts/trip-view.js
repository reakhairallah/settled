document.addEventListener('DOMContentLoaded', () => {
    init_topbar('trip-view');

    const params = new URLSearchParams(window.location.search);
    const tripId = params.get('id');

    const tripViewError = document.getElementById('trip-view-error');
    const tripPillName = document.getElementById('trip-pill-name');
    const tripViewTitle = document.getElementById('trip-view-title');
    const passTitle = document.getElementById('pass-title');
    const passDeparts = document.getElementById('pass-departs');
    const passReturns = document.getElementById('pass-returns');
    const budgetPips = document.getElementById('budget-pips');
    const inviteCodeValue = document.getElementById('invite-code-value');
    const manifestEyebrow = document.getElementById('manifest-eyebrow');
    const manifestContainer = document.getElementById('manifest-container');
    const copyInviteCodeButton = document.getElementById('copy-invite-code-btn');
    const copyInviteLinkButton = document.getElementById('copy-invite-link-btn');
    const itineraryWidgetBody = document.getElementById('itinerary-widget-body');
    const itineraryWidgetLink = document.getElementById('itinerary-widget-link');
    const expensesWidgetBody = document.getElementById('expenses-widget-body');
    const expensesWidgetLink = document.getElementById('expenses-widget-link');
    const settleWidgetBody = document.getElementById('settle-widget-body');
    const settleWidgetLink = document.getElementById('settle-widget-link');

    let currentInviteCode = null;

    itineraryWidgetLink.href = 'itinerary.php?id=' + tripId;
    expensesWidgetLink.href = 'expenses.php?id=' + tripId;
    settleWidgetLink.href = 'settle-up.php?id=' + tripId;

    function get_initials(username) {
        const parts = username.trim().split(/\s+/);
        if (parts.length > 1) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return username.slice(0, 2).toUpperCase();
    }

    function copy_with_feedback(button, text) {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = button.textContent;
            button.classList.add('copied');
            button.textContent = 'Copied!';
            setTimeout(() => {
                button.classList.remove('copied');
                button.textContent = originalText;
            }, 1500);
        });
    }

    copyInviteCodeButton.addEventListener('click', () => {
        if (currentInviteCode) {
            copy_with_feedback(copyInviteCodeButton, currentInviteCode);
        }
    });

    copyInviteLinkButton.addEventListener('click', () => {
        if (currentInviteCode) {
            copy_with_feedback(copyInviteLinkButton, build_invite_link(currentInviteCode));
        }
    });

    function fetch_trip_view() {
        axios.get('../../settled-server/api/trip-view-data-handler.php', { params: { trip_id: tripId } })
            .then((response) => {
                if (response.data.success) {
                    render_trip_view(response.data.data);
                } else {
                    tripViewError.textContent = response.data.error;
                }
            })
            .catch((error) => {
                tripViewError.textContent = extract_axios_error_message(error);
            });
    }

    function render_trip_view(data) {
        render_trip(data.trip);
        render_manifest(data.members, data.your_trip_member_id);
        render_itinerary_widget(data.itinerary_summary);
        render_expenses_widget(data.expenses_summary);
        render_settle_widget(data.settle_up_summary, data.members, data.your_trip_member_id);
    }

    function render_trip(trip) {
        document.title = trip.name + ' — Settled';
        tripPillName.textContent = trip.name;
        tripViewTitle.textContent = trip.name;
        passTitle.textContent = trip.name;

        const start = format_date(trip.start_date);
        const end = format_date(trip.end_date);
        passDeparts.textContent = start.month + ' ' + start.day;
        passReturns.textContent = end.month + ' ' + end.day + ', ' + end.year;

        budgetPips.innerHTML = '';
        for (let i = 1; i <= 3; i++) {
            const pip = document.createElement('div');
            pip.className = 'tier-pip' + (i <= trip.budget_tier ? ' filled' : '');
            budgetPips.appendChild(pip);
        }

        inviteCodeValue.textContent = trip.invite_code;
        currentInviteCode = trip.invite_code;
    }

    function build_tier_pips(value) {
        const wrap = document.createElement('div');
        wrap.className = 'tier-pips';
        for (let i = 1; i <= 3; i++) {
            const pip = document.createElement('div');
            pip.className = 'tier-pip' + (i <= value ? ' filled' : '');
            wrap.appendChild(pip);
        }
        return wrap;
    }

    function render_manifest(members, yourTripMemberId) {
        manifestEyebrow.textContent = 'Members · ' + members.length;
        manifestContainer.innerHTML = '';

        members.forEach((member) => {
            const row = document.createElement('div');
            row.className = 'manifest-row';

            const initials = get_initials(member.username);
            const avatar = document.createElement('div');
            avatar.className = 'manifest-avatar';
            avatar.style.background = color_for_initials(initials);
            avatar.textContent = initials;
            row.appendChild(avatar);

            const info = document.createElement('div');
            info.className = 'manifest-info';

            const nameRow = document.createElement('div');
            nameRow.className = 'manifest-name-row';

            const name = document.createElement('span');
            name.className = 'manifest-name';
            name.textContent = member.username;
            nameRow.appendChild(name);

            if (Number(member.id) === Number(yourTripMemberId)) {
                const youTag = document.createElement('span');
                youTag.className = 'manifest-you-tag';
                youTag.textContent = 'You';
                nameRow.appendChild(youTag);
            }

            const energyMeter = document.createElement('div');
            energyMeter.className = 'tier-meter';
            const energyCaption = document.createElement('span');
            energyCaption.className = 'tier-caption';
            energyCaption.textContent = 'Energy';
            energyMeter.appendChild(energyCaption);
            energyMeter.appendChild(build_tier_pips(member.energy_level));
            nameRow.appendChild(energyMeter);

            info.appendChild(nameRow);

            const interests = document.createElement('div');
            interests.className = 'manifest-interests';
            if (member.interests.length > 0) {
                member.interests.forEach((interest) => {
                    const chip = document.createElement('span');
                    chip.className = 'interest-chip';
                    chip.textContent = interest;
                    interests.appendChild(chip);
                });
            } else {
                const none = document.createElement('span');
                none.className = 'no-interests';
                none.textContent = 'No interests set';
                interests.appendChild(none);
            }
            info.appendChild(interests);

            row.appendChild(info);
            manifestContainer.appendChild(row);
        });
    }

    const TIME_OF_DAY_ICON = {
        morning: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
        afternoon: '<path d="M12 3a6 6 0 0 0-6 6c0 4 6 12 6 12s6-8 6-12a6 6 0 0 0-6-6Z"/><circle cx="12" cy="9" r="2"/>',
        evening: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>'
    };

    const STATUS_LABEL = { locked: 'Locked', proposed: 'Voting', open: 'Pick one' };

    // Same icon everywhere itinerary shows up (widget header + empty state), so it
    // doesn't look like two different features. Also used for settle up below.
    const ITINERARY_ICON = '<path d="M3 6h18M3 12h18M3 18h11"/>';
    const SETTLE_UP_ICON = '<path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>';

    function render_itinerary_widget(summary) {
        itineraryWidgetBody.innerHTML = '';

        if (!summary.generated) {
            itineraryWidgetBody.appendChild(build_widget_empty(
                ITINERARY_ICON,
                'No itinerary yet',
                'Click to generate one and start voting.'
            ));
            return;
        }

        const label = document.createElement('div');
        label.className = 'widget-progress-label';
        const day = summary.preview_slots.length > 0 ? summary.preview_slots[0].day_number : 1;
        label.innerHTML = 'Day ' + day + ' &middot; <strong>' + summary.locked_slots + ' of ' + summary.total_slots + '</strong> slots locked';
        itineraryWidgetBody.appendChild(label);

        const track = document.createElement('div');
        track.className = 'widget-progress-track';
        const fill = document.createElement('div');
        fill.className = 'widget-progress-fill';
        const percent = summary.total_slots > 0 ? Math.round((summary.locked_slots / summary.total_slots) * 100) : 0;
        fill.style.width = percent + '%';
        track.appendChild(fill);
        itineraryWidgetBody.appendChild(track);

        const list = document.createElement('div');
        summary.preview_slots.forEach((slot) => {
            const row = document.createElement('div');
            row.className = 'slot-row';

            const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            icon.setAttribute('width', '13');
            icon.setAttribute('height', '13');
            icon.setAttribute('viewBox', '0 0 24 24');
            icon.setAttribute('fill', 'none');
            icon.setAttribute('stroke', 'currentColor');
            icon.setAttribute('stroke-width', '2');
            icon.setAttribute('stroke-linecap', 'round');
            icon.setAttribute('stroke-linejoin', 'round');
            icon.innerHTML = TIME_OF_DAY_ICON[slot.time_of_day] || '';
            row.appendChild(icon);

            const name = document.createElement('span');
            name.className = 'slot-row-name';
            name.textContent = slot.activity_name || (slot.time_of_day + ', open');
            row.appendChild(name);

            const pill = document.createElement('span');
            pill.className = 'status-pill ' + slot.status;
            pill.textContent = STATUS_LABEL[slot.status] || slot.status;
            row.appendChild(pill);

            list.appendChild(row);
        });
        itineraryWidgetBody.appendChild(list);
    }

    function render_expenses_widget(summary) {
        expensesWidgetBody.innerHTML = '';

        if (!summary.has_expenses) {
            expensesWidgetBody.appendChild(build_widget_empty(
                '<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>',
                'No expenses yet',
                'Click to log the first one.'
            ));
            return;
        }

        const stat = document.createElement('div');
        stat.className = 'widget-stat';
        const num = document.createElement('span');
        num.className = 'widget-stat-num';
        num.textContent = format_money(summary.total_amount);
        const statLabel = document.createElement('span');
        statLabel.className = 'widget-stat-label';
        statLabel.textContent = 'logged so far';
        stat.appendChild(num);
        stat.appendChild(statLabel);
        expensesWidgetBody.appendChild(stat);

        const list = document.createElement('div');
        summary.recent.forEach((expense, index) => {
            const row = document.createElement('div');
            row.className = 'expense-row';

            const dot = document.createElement('span');
            dot.className = 'expense-dot';
            dot.style.background = VIBE_COLORS[index % VIBE_COLORS.length];
            row.appendChild(dot);

            const name = document.createElement('span');
            name.className = 'expense-name';
            name.textContent = expense.description;
            row.appendChild(name);

            const amount = document.createElement('span');
            amount.className = 'expense-amount';
            amount.textContent = format_money(expense.amount);
            row.appendChild(amount);

            list.appendChild(row);
        });
        expensesWidgetBody.appendChild(list);
    }

    function render_settle_widget(summary, members, yourTripMemberId) {
        settleWidgetBody.innerHTML = '';

        if (summary.settled) {
            const hasHistory = summary.preview_transactions.length > 0 || Number(summary.my_balance) !== 0;
            settleWidgetBody.appendChild(build_widget_empty(
                SETTLE_UP_ICON,
                'All settled up',
                hasHistory ? "Everyone's all paid up." : 'Nothing to settle until expenses come in.'
            ));
            return;
        }

        const balance = Number(summary.my_balance);
        const direction = balance >= 0 ? 'owed' : 'owe';

        const callout = document.createElement('div');
        callout.className = 'balance-callout ' + direction;

        const directionBadge = document.createElement('div');
        directionBadge.className = 'balance-direction ' + direction;
        directionBadge.appendChild(build_trend_icon(direction));
        callout.appendChild(directionBadge);

        const text = document.createElement('div');
        text.className = 'balance-callout-text';
        const label = document.createElement('span');
        label.className = 'balance-callout-label';
        label.textContent = direction === 'owed' ? "You're owed" : 'You owe';
        const amount = document.createElement('span');
        amount.className = 'balance-callout-amount ' + direction;
        amount.textContent = format_money(Math.abs(balance));
        text.appendChild(label);
        text.appendChild(amount);
        callout.appendChild(text);

        settleWidgetBody.appendChild(callout);

        const list = document.createElement('div');
        summary.preview_transactions.forEach((transaction) => {
            const row = document.createElement('div');
            row.className = 'flow-row';

            const youAreCreditor = Number(transaction.to_trip_member_id) === Number(yourTripMemberId);
            const youAreDebtor = Number(transaction.from_trip_member_id) === Number(yourTripMemberId);
            const otherUsername = youAreCreditor ? transaction.from_username : transaction.to_username;
            const otherInitials = get_initials(otherUsername);

            const avatar = document.createElement('div');
            avatar.className = 'flow-av';
            avatar.style.background = color_for_initials(otherInitials);
            avatar.textContent = otherInitials;
            row.appendChild(avatar);

            row.appendChild(build_svg_arrow());

            const label = document.createElement('span');
            label.className = 'flow-label';
            if (youAreCreditor) {
                label.textContent = transaction.from_username + ' owes you';
            } else if (youAreDebtor) {
                label.textContent = 'You owe ' + transaction.to_username;
            } else {
                label.textContent = transaction.from_username + ' owes ' + transaction.to_username;
            }
            row.appendChild(label);

            const amountEl = document.createElement('span');
            amountEl.className = 'flow-amount';
            if (youAreCreditor) {
                amountEl.style.color = 'var(--success)';
            }
            amountEl.textContent = format_money(transaction.amount);
            row.appendChild(amountEl);

            list.appendChild(row);
        });
        settleWidgetBody.appendChild(list);
    }

    const TREND_ICON = {
        owed: '<path d="M3 17l6-6 4 4 7-8"/><path d="M15 6h5v5"/>',
        owe: '<path d="M3 7l6 6 4-4 7 8"/><path d="M15 18h5v-5"/>'
    };

    function build_trend_icon(direction) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '16');
        svg.setAttribute('height', '16');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2.2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        svg.innerHTML = TREND_ICON[direction];
        return svg;
    }

    function build_svg_arrow() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'flow-arrow');
        svg.setAttribute('width', '13');
        svg.setAttribute('height', '13');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2.2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        svg.innerHTML = '<path d="M5 12h14M13 6l6 6-6 6"/>';
        return svg;
    }

    function build_widget_empty(iconPath, title, message) {
        const wrap = document.createElement('div');
        wrap.className = 'widget-empty';

        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        icon.setAttribute('width', '20');
        icon.setAttribute('height', '20');
        icon.setAttribute('viewBox', '0 0 24 24');
        icon.setAttribute('fill', 'none');
        icon.setAttribute('stroke', 'currentColor');
        icon.setAttribute('stroke-width', '2');
        icon.setAttribute('stroke-linecap', 'round');
        icon.setAttribute('stroke-linejoin', 'round');
        icon.innerHTML = iconPath;
        const iconWrap = document.createElement('div');
        iconWrap.className = 'widget-empty-icon';
        iconWrap.appendChild(icon);
        wrap.appendChild(iconWrap);

        const titleEl = document.createElement('p');
        titleEl.className = 'widget-empty-title';
        titleEl.textContent = title;
        wrap.appendChild(titleEl);

        const messageEl = document.createElement('p');
        messageEl.textContent = message;
        wrap.appendChild(messageEl);

        return wrap;
    }

    fetch_trip_view();
});
