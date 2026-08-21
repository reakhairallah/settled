document.addEventListener('DOMContentLoaded', () => {
    init_topbar('dashboard');
    init_modal_shell();

    const tripsContainer = document.getElementById('trips-container');
    const emptyState = document.getElementById('empty-state');
    const dashboardError = document.getElementById('dashboard-error');
    const tripCountEl = document.getElementById('trip-count');
    const nextUpChip = document.getElementById('next-up-chip');
    const nextUpName = document.getElementById('next-up-name');
    const nextUpDays = document.getElementById('next-up-days');

    const nextUpIconSvg = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4Z"/></svg>';

    let vibeBag = [];
    function nextVibe() {
        if (vibeBag.length === 0) {
            vibeBag = [...VIBE_COLORS];
            for (let i = vibeBag.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [vibeBag[i], vibeBag[j]] = [vibeBag[j], vibeBag[i]];
            }
        }
        return vibeBag.pop();
    }

    axios.get('../../settled-server/api/dashboard-data-handler.php')
        .then((response) => {
            if (response.data.success) {
                render_trips(response.data.data.trips, response.data.data.next_trip_id);
            } else {
                dashboardError.textContent = response.data.error;
            }
        })
        .catch((error) => {
            dashboardError.textContent = extract_axios_error_message(error);
        });

    function render_trips(trips, nextTripId) {
        tripCountEl.textContent = trips.length;

        if (trips.length === 0) {
            emptyState.classList.add('visible');
            return;
        }

        const nextTrip = trips.find((trip) => trip.id == nextTripId);
        if (nextTrip) {
            nextUpName.textContent = nextTrip.name;
            nextUpDays.textContent = days_until(nextTrip.start_date);
            nextUpChip.removeAttribute('hidden');
        }

        trips.forEach((trip, index) => {
            const card = build_trip_card(trip, trip.id == nextTripId);
            tripsContainer.appendChild(card);
            setTimeout(() => card.classList.add('in'), 20 + index * 70);
        });
    }

    function days_until(dateStr) {
        const [y, m, d] = dateStr.split('-').map(Number);
        const start = new Date(y, m - 1, d);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return Math.max(0, Math.round((start - today) / 86400000));
    }

    function format_date(dateStr) {
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const [y, m, d] = dateStr.split('-').map(Number);
        return { month: months[m - 1], day: String(d).padStart(2, '0'), year: String(y) };
    }

    function build_trip_card(trip, isNextUp) {
        const card = document.createElement('div');
        card.className = 'trip-card';
        card.style.setProperty('--vibe-solid', nextVibe());

        const top = document.createElement('div');
        top.className = 'trip-card-top';

        const badgeSlot = document.createElement('div');
        badgeSlot.className = 'badge-slot';
        if (isNextUp) {
            badgeSlot.appendChild(build_next_up_badge());
        }
        top.appendChild(badgeSlot);

        const nameEl = document.createElement('h3');
        nameEl.className = 'trip-name';
        const nameLink = document.createElement('a');
        nameLink.href = 'trip-view.php?id=' + trip.id;
        nameLink.textContent = trip.name;
        nameEl.appendChild(nameLink);
        top.appendChild(nameEl);
        card.appendChild(top);

        const body = document.createElement('div');
        body.className = 'trip-card-body';
        body.appendChild(build_dates_row(trip.start_date, trip.end_date));
        body.appendChild(build_meta_row(trip.member_initials, trip.member_count));
        card.appendChild(body);

        const seam = document.createElement('div');
        seam.className = 'ticket-seam';
        card.appendChild(seam);

        card.appendChild(build_code_stub(trip.invite_code));

        return card;
    }

    function build_next_up_badge() {
        const badge = document.createElement('span');
        badge.className = 'next-up-badge';
        badge.innerHTML = nextUpIconSvg;

        const label = document.createElement('span');
        label.textContent = 'Next up';
        badge.appendChild(label);

        return badge;
    }

    function build_dates_row(startDate, endDate) {
        const wrap = document.createElement('div');
        wrap.className = 'trip-dates';

        const start = format_date(startDate);
        const end = format_date(endDate);

        const startSpan = document.createElement('span');
        startSpan.textContent = start.month + ' ' + start.day;
        wrap.appendChild(startSpan);

        const arrow = document.createElement('span');
        arrow.className = 'arrow';
        arrow.textContent = '→';
        wrap.appendChild(arrow);

        const endSpan = document.createElement('span');
        endSpan.textContent = end.month + ' ' + end.day;
        wrap.appendChild(endSpan);

        const yearSpan = document.createElement('span');
        yearSpan.textContent = end.year;
        wrap.appendChild(yearSpan);

        return wrap;
    }

    function build_meta_row(memberInitials, memberCount) {
        const metaRow = document.createElement('div');
        metaRow.className = 'trip-meta-row';

        const stack = document.createElement('div');
        stack.className = 'avatar-stack';

        const shown = memberInitials.slice(0, 4);
        shown.forEach((initials) => {
            const av = document.createElement('div');
            av.className = 'av';
            av.style.background = color_for_initials(initials);
            av.textContent = initials;
            stack.appendChild(av);
        });

        if (memberInitials.length > 4) {
            const more = document.createElement('div');
            more.className = 'av av-more';
            more.textContent = '+' + (memberInitials.length - 4);
            stack.appendChild(more);
        }
        metaRow.appendChild(stack);

        const count = document.createElement('span');
        count.className = 'member-count';
        count.textContent = memberCount + (memberCount == 1 ? ' member' : ' members');
        metaRow.appendChild(count);

        return metaRow;
    }

    function build_copy_button(label, textToCopy) {
        const button = document.createElement('button');
        button.className = 'copy-btn';
        button.type = 'button';
        button.textContent = label;
        button.addEventListener('click', () => {
            navigator.clipboard.writeText(textToCopy).then(() => {
                button.textContent = 'Copied';
                button.classList.add('copied');
                setTimeout(() => {
                    button.textContent = label;
                    button.classList.remove('copied');
                }, 1400);
            });
        });
        return button;
    }

    function build_code_stub(inviteCode) {
        const stub = document.createElement('div');
        stub.className = 'trip-code-stub';

        const codeBlock = document.createElement('div');
        codeBlock.className = 'code-block';

        const codeLabel = document.createElement('div');
        codeLabel.className = 'code-label';
        codeLabel.textContent = 'Invite code';
        codeBlock.appendChild(codeLabel);

        const codeValue = document.createElement('div');
        codeValue.className = 'code-value';
        codeValue.textContent = inviteCode;
        codeBlock.appendChild(codeValue);

        stub.appendChild(codeBlock);

        const stubActions = document.createElement('div');
        stubActions.className = 'stub-actions';
        stubActions.appendChild(build_copy_button('Copy', inviteCode));
        stubActions.appendChild(build_copy_button('Copy link', build_invite_link(inviteCode)));
        stub.appendChild(stubActions);

        return stub;
    }
});
