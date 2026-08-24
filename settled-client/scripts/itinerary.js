document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const tripId = params.get('id');

    init_topbar('itinerary');
    init_modal_shell();

    const itineraryError = document.getElementById('itinerary-error');
    const itineraryEmpty = document.getElementById('itinerary-empty');
    const generateButton = document.getElementById('generate-itinerary-button');
    const generateMessage = document.getElementById('generate-itinerary-message');
    const itineraryTimeline = document.getElementById('itinerary-timeline');
    const progressCount = document.getElementById('progress-count');
    const progressFill = document.getElementById('progress-fill');
    const dayNav = document.getElementById('day-nav');
    const daysContainer = document.getElementById('days-container');
    const tripPill = document.getElementById('trip-pill');
    const tripPillName = document.getElementById('trip-pill-name');

    const assignModalContent = document.getElementById('assign-modal-content');
    const assignForm = document.getElementById('assign-form');
    const assignSearchInput = document.getElementById('assign-search-input');
    const assignFilters = document.getElementById('assign-filters');
    const assignList = document.getElementById('assign-list');
    const assignError = document.getElementById('assign-error');
    const assignCancelBtn = document.getElementById('assign-cancel-btn');

    tripPill.href = 'trip-view.php?id=' + tripId;

    const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const STATUS_LABELS = { proposed: 'Voting', locked: 'Locked', open: 'Open' };

    // decorative, approximate ranges tied to time_of_day, not real per-slot times
    const TIME_OF_DAY_RANGE = { morning: '7-11 AM', afternoon: '12-4 PM', evening: '6-10 PM' };

    // hardcoded icon constants only, never interpolated with any data, so
    // setting them via innerHTML on a dedicated icon element carries none of
    // the risk the "never innerHTML" rule exists to prevent
    const TIME_OF_DAY_ICON = {
        morning: '<line x1="2" y1="18" x2="22" y2="18"/><path d="M6 18a6 6 0 0 1 12 0"/><path d="M12 9V3"/><path d="M9 6l3-3 3 3"/><line x1="3.5" y1="13" x2="5.3" y2="11.6"/><line x1="20.5" y1="13" x2="18.7" y2="11.6"/>',
        afternoon: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>',
        evening: '<line x1="2" y1="18" x2="22" y2="18"/><path d="M6 18a6 6 0 0 1 12 0"/><path d="M12 3v6"/><path d="M9 6l3 3 3-3"/><line x1="3.5" y1="13" x2="5.3" y2="11.6"/><line x1="20.5" y1="13" x2="18.7" y2="11.6"/>'
    };
    const LOCK_ICON = '<rect x="4" y="10.5" width="16" height="10" rx="2.2"/><path d="M7.5 10.5V8a4.5 4.5 0 0 1 9 0v2.5"/>';
    const PLUS_ICON = '<path d="M12 5v14M5 12h14"/>';
    const INFO_ICON = '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>';
    const VOTE_UP_ICON = '<path d="M7 22V11M2 13v7a2 2 0 0 0 2 2h11.5a2 2 0 0 0 2-1.6l1.4-7A2 2 0 0 0 17 11h-4.7l.9-4.5a1.8 1.8 0 0 0-3.2-1.5L7 11"/>';
    const VOTE_DOWN_ICON = '<path d="M17 2v11M22 11V4a2 2 0 0 0-2-2H8.5a2 2 0 0 0-2 1.6L5 10.6A2 2 0 0 0 7 13h4.7l-.9 4.5a1.8 1.8 0 0 0 3.2 1.5L17 13"/>';
    const SPARKLE_PATHS = [
        'M10 3c.4 2.6.9 4.3 2 5.4C13.1 9.5 14.8 10 17.4 10.4c-2.6.4-4.3.9-5.4 2C10.9 13.5 10.4 15.2 10 17.8c-.4-2.6-.9-4.3-2-5.4C6.9 11.3 5.2 10.8 2.6 10.4c2.6-.4 4.3-.9 5.4-2C9.1 7.3 9.6 5.6 10 3z',
        'M18 3.2c.2 1.2.5 2 .9 2.4.4.4 1.2.7 2.4.9-1.2.2-2 .5-2.4.9-.4.4-.7 1.2-.9 2.4-.2-1.2-.5-2-.9-2.4-.4-.4-1.2-.7-2.4-.9 1.2-.2 2-.5 2.4-.9.4-.4.7-1.2.9-2.4z'
    ];

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

    function sparkle_svg(slotId) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '14');
        svg.setAttribute('height', '14');
        svg.setAttribute('viewBox', '0 0 24 24');

        const gradientId = 'sparkle-grad-' + slotId;
        svg.innerHTML = '<defs><linearGradient id="' + gradientId + '" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">'
            + '<stop offset="0" stop-color="var(--accent)"/><stop offset="1" stop-color="var(--accent-2)"/></linearGradient></defs>'
            + '<path fill="url(#' + gradientId + ')" d="' + SPARKLE_PATHS[0] + '"/>'
            + '<path fill="url(#' + gradientId + ')" d="' + SPARKLE_PATHS[1] + '"/>';
        return svg;
    }

    function el(tag, className) {
        const node = document.createElement(tag);
        if (className) {
            node.className = className;
        }
        return node;
    }

    function date_for_day(startDateStr, dayNumber) {
        const [y, m, d] = startDateStr.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        date.setDate(date.getDate() + (dayNumber - 1));
        return date;
    }

    let tripStartDate = null;
    let memberCount = 0;
    const slotsById = {};
    const blurbCache = {};
    let currentAssignSlotId = null;

    fetch_itinerary();

    generateButton.addEventListener('click', () => {
        generateMessage.textContent = '';
        generateButton.disabled = true;

        const formData = new FormData();
        formData.append('trip_id', tripId);

        axios.post('../../settled-server/api/generate-itinerary-handler.php', formData)
            .then((response) => {
                if (response.data.success) {
                    fetch_itinerary();
                } else {
                    generateMessage.textContent = response.data.error;
                    generateButton.disabled = false;
                }
            })
            .catch((error) => {
                generateMessage.textContent = extract_axios_error_message(error);
                generateButton.disabled = false;
            });
    });

    function fetch_itinerary() {
        axios.get('../../settled-server/api/itinerary-data-handler.php', { params: { trip_id: tripId } })
            .then((response) => {
                if (response.data.success) {
                    const data = response.data.data;
                    tripPillName.textContent = data.trip.name;
                    tripStartDate = data.trip.start_date;
                    memberCount = data.member_count;

                    if (data.slots.length === 0) {
                        itineraryEmpty.hidden = false;
                        itineraryTimeline.hidden = true;
                        daysContainer.textContent = '';
                    } else {
                        itineraryEmpty.hidden = true;
                        itineraryTimeline.hidden = false;
                        render_timeline(data.slots);
                    }
                } else {
                    itineraryError.textContent = response.data.error;
                }
            })
            .catch((error) => {
                itineraryError.textContent = extract_axios_error_message(error);
            });
    }

    function render_timeline(slots) {
        Object.keys(slotsById).forEach((key) => delete slotsById[key]);
        slots.forEach((slot) => { slotsById[slot.id] = slot; });

        const days = {};
        slots.forEach((slot) => {
            if (!days[slot.day_number]) {
                days[slot.day_number] = [];
            }
            days[slot.day_number].push(slot);
        });

        const dayNumbers = Object.keys(days).map(Number).sort((a, b) => a - b);

        dayNav.textContent = '';
        daysContainer.textContent = '';

        dayNumbers.forEach((dayNumber, index) => {
            const date = date_for_day(tripStartDate, dayNumber);
            dayNav.appendChild(build_day_nav_pill(dayNumber, date, index === 0));
            daysContainer.appendChild(build_day_block(dayNumber, date, days[dayNumber]));
        });

        update_progress();
    }

    function update_progress() {
        const all = Object.values(slotsById);
        const lockedCount = all.filter((slot) => slot.status === 'locked').length;
        progressCount.textContent = lockedCount + ' of ' + all.length + ' slots';
        progressFill.style.width = all.length > 0 ? (lockedCount / all.length * 100) + '%' : '0%';
    }

    function build_day_nav_pill(dayNumber, date, active) {
        const pill = document.createElement('a');
        pill.href = '#day-' + dayNumber;
        pill.className = active ? 'active' : '';

        const dow = el('span', 'dn-day');
        dow.textContent = WEEKDAY_NAMES[date.getDay()];
        const num = el('span', 'dn-num');
        num.textContent = String(date.getDate());
        const mon = el('span', 'dn-mon');
        mon.textContent = MONTH_NAMES[date.getMonth()];
        pill.append(dow, num, mon);

        pill.addEventListener('click', () => {
            dayNav.querySelectorAll('a').forEach((a) => a.classList.remove('active'));
            pill.classList.add('active');
        });

        return pill;
    }

    function build_day_block(dayNumber, date, slotsForDay) {
        const block = el('div', 'day-block');
        block.id = 'day-' + dayNumber;

        const marker = el('div', 'day-marker');
        const eyebrow = el('span', 'day-marker-eyebrow');
        eyebrow.textContent = 'DAY ' + dayNumber;
        const dateTile = el('div', 'day-marker-date');
        const dow = el('span', 'day-marker-dow');
        dow.textContent = WEEKDAY_NAMES[date.getDay()];
        const num = el('span', 'day-marker-num');
        num.textContent = String(date.getDate());
        const mon = el('span', 'day-marker-mon');
        mon.textContent = MONTH_NAMES[date.getMonth()];
        dateTile.append(dow, num, mon);
        marker.append(eyebrow, dateTile);

        const spine = el('div', 'day-spine');
        const spineLine = el('div', 'spine-line');
        spine.appendChild(spineLine);

        const order = { morning: 0, afternoon: 1, evening: 2 };
        slotsForDay.slice().sort((a, b) => order[a.time_of_day] - order[b.time_of_day]).forEach((slot) => {
            spine.appendChild(build_slot_row(slot));
        });

        block.append(marker, spine);
        return block;
    }

    function build_slot_row(slot) {
        const row = el('div', 'slot-row state-' + slot.status);
        row.dataset.slotId = slot.id;

        const node = el('div', 'time-node');
        const dot = el('div', 'time-node-dot');
        // must be a real <svg> element (not raw path/line tags dropped into a
        // plain div's innerHTML), since the browser only parses those tags as SVG
        // when the innerHTML target is itself in the SVG namespace
        dot.appendChild(icon_svg(TIME_OF_DAY_ICON[slot.time_of_day], 16, 16, '2.2'));
        node.appendChild(dot);
        row.appendChild(node);

        if (!slot.activity) {
            row.appendChild(build_assign_card(slot));
        } else {
            row.appendChild(build_activity_card(slot));
        }

        return row;
    }

    function build_status_pill(status) {
        const pill = el('span', 'status-pill ' + status);
        if (status === 'locked') {
            const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            icon.setAttribute('width', '11');
            icon.setAttribute('height', '11');
            icon.setAttribute('viewBox', '0 0 24 24');
            icon.setAttribute('fill', 'none');
            icon.setAttribute('stroke', 'currentColor');
            icon.setAttribute('stroke-width', '2.6');
            icon.setAttribute('stroke-linecap', 'round');
            icon.setAttribute('stroke-linejoin', 'round');
            icon.innerHTML = LOCK_ICON;
            pill.appendChild(icon);
        }
        const label = document.createTextNode(STATUS_LABELS[status] || status);
        pill.appendChild(label);
        return pill;
    }

    function build_assign_card(slot) {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'assign-card';

        const top = el('div', 'card-top');
        const title = el('span', 'card-title');
        title.style.color = 'var(--ink-faint)';
        title.style.fontWeight = '600';
        title.textContent = 'No activity assigned yet';
        top.append(title, build_status_pill('open'));

        const time = el('p', 'slot-time');
        time.style.display = 'block';
        time.style.marginBottom = '10px';
        time.textContent = TIME_OF_DAY_RANGE[slot.time_of_day];

        const note = el('p', 'open-note');
        note.textContent = 'The pool of matching activities ran dry here. Pick something yourselves.';

        const cta = el('div', 'assign-cta');
        cta.appendChild(icon_svg(PLUS_ICON, 14, 14));
        cta.appendChild(document.createTextNode('Assign an activity'));

        card.append(top, time, note, cta);
        card.addEventListener('click', () => open_assign_modal(slot, card));

        return card;
    }

    function build_activity_card(slot) {
        const card = el('div', 'slot-card');

        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.id = 'why-toggle-' + slot.id;
        toggle.className = 'why-toggle';
        card.appendChild(toggle);

        const top = el('div', 'card-top');
        const title = el('h3', 'card-title');
        title.textContent = slot.activity.name;
        top.append(title, build_status_pill(slot.status));

        const tagRow = el('div', 'tag-row');
        const time = el('span', 'slot-time');
        time.textContent = TIME_OF_DAY_RANGE[slot.time_of_day];
        const category = el('span', 'tag');
        category.textContent = slot.activity.category;
        const budget = el('span', 'budget-pill');
        budget.textContent = '$'.repeat(slot.activity.cost_tier);
        tagRow.append(time, category, budget);

        const foot = el('div', 'card-foot' + (slot.status === 'proposed' ? '' : ' foot-end'));

        if (slot.status === 'proposed') {
            foot.appendChild(build_vote_group(slot));
        }

        foot.appendChild(build_why_button(slot, toggle));

        const blurbWrap = el('div', 'why-blurb');
        const blurbInner = el('div', 'why-blurb-inner');
        const blurbText = document.createElement('p');
        blurbInner.appendChild(blurbText);
        blurbWrap.appendChild(blurbInner);

        toggle.addEventListener('change', () => {
            if (!toggle.checked) {
                return;
            }
            if (blurbCache[slot.id]) {
                blurbText.textContent = blurbCache[slot.id];
                blurbWrap.classList.add('loaded');
                return;
            }
            axios.get('../../settled-server/api/why-this-pick-handler.php', { params: { slot_id: slot.id } })
                .then((response) => {
                    if (response.data.success) {
                        blurbCache[slot.id] = response.data.data.blurb;
                        blurbText.textContent = response.data.data.blurb;
                    } else {
                        blurbText.textContent = response.data.error;
                    }
                    blurbWrap.classList.add('loaded');
                })
                .catch((error) => {
                    blurbText.textContent = extract_axios_error_message(error);
                    blurbWrap.classList.add('loaded');
                });
        });

        card.append(top, tagRow, foot, blurbWrap);
        return card;
    }

    function build_vote_group(slot) {
        const group = el('div', 'vote-group');
        const upCount = slot.up_count || 0;
        const downCount = slot.down_count || 0;

        const buttons = el('div', 'vote-buttons');
        const upBtn = document.createElement('button');
        upBtn.type = 'button';
        upBtn.className = 'vote-btn up' + (slot.your_vote === 'up' ? ' voted' : '');
        upBtn.appendChild(icon_svg(VOTE_UP_ICON, 12, 12));
        upBtn.appendChild(document.createTextNode(String(upCount)));
        const downBtn = document.createElement('button');
        downBtn.type = 'button';
        downBtn.className = 'vote-btn down' + (slot.your_vote === 'down' ? ' voted' : '');
        downBtn.appendChild(icon_svg(VOTE_DOWN_ICON, 12, 12));
        downBtn.appendChild(document.createTextNode(String(downCount)));
        buttons.append(upBtn, downBtn);

        const meta = el('span', 'vote-meta');
        const metaCount = document.createElement('strong');
        metaCount.textContent = String(upCount + downCount);
        meta.append(metaCount, document.createTextNode('/' + memberCount + ' voted'));

        group.append(buttons, meta);

        function cast_vote(vote) {
            upBtn.disabled = true;
            downBtn.disabled = true;

            const formData = new FormData();
            formData.append('slot_id', slot.id);
            formData.append('vote', vote);

            axios.post('../../settled-server/api/vote-handler.php', formData)
                .then((response) => {
                    if (response.data.success) {
                        apply_slot_update(slot.id, response.data.data);
                    } else {
                        upBtn.disabled = false;
                        downBtn.disabled = false;
                        itineraryError.textContent = response.data.error;
                    }
                })
                .catch((error) => {
                    upBtn.disabled = false;
                    downBtn.disabled = false;
                    itineraryError.textContent = extract_axios_error_message(error);
                });
        }

        upBtn.addEventListener('click', () => cast_vote('up'));
        downBtn.addEventListener('click', () => cast_vote('down'));

        return group;
    }

    function build_why_button(slot, toggle) {
        const label = document.createElement('label');
        label.htmlFor = toggle.id;
        label.className = 'why-btn';
        label.appendChild(sparkle_svg(slot.id));
        const text = el('span', 'why-btn-label');
        text.textContent = 'Why this pick';
        label.appendChild(text);
        return label;
    }

    // A vote or assignment response only ever carries the slot's current
    // status/activity, not its id/day_number/time_of_day, so this merges the
    // response into the locally-held slot record before rebuilding the row.
    // The blurb cache is only cleared when the activity itself changed (a
    // swap or an open-to-filled transition), not on a plain lock, since the
    // cached blurb still describes the same activity in that case.
    function apply_slot_update(slotId, update) {
        const previous = slotsById[slotId];
        const previousName = previous.activity ? previous.activity.name : null;
        const newName = update.activity ? update.activity.name : null;

        if (previousName !== newName) {
            delete blurbCache[slotId];
        }

        previous.status = update.status;
        previous.activity = update.activity;
        // the assign-slot response doesn't carry vote fields at all (a
        // freshly assigned slot has no votes yet), so default them rather
        // than leaving stale numbers from before the activity changed
        previous.up_count = update.up_count || 0;
        previous.down_count = update.down_count || 0;
        previous.your_vote = update.your_vote || null;

        const oldRow = daysContainer.querySelector('.slot-row[data-slot-id="' + slotId + '"]');
        const newRow = build_slot_row(previous);
        if (oldRow) {
            oldRow.replaceWith(newRow);
        }

        update_progress();
    }

    // ---- Assign-activity modal ----

    assignSearchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    });

    assignCancelBtn.addEventListener('click', close_modal);

    // wired once, here, rather than inside render_assign_candidates (which
    // rebuilds the chips/options on every open). 'change' bubbles up from
    // whichever chip is currently in assignFilters, so a single listener on
    // the stable parent keeps working across rebuilds without needing to be
    // re-attached each time, which would otherwise stack duplicate listeners
    function apply_assign_filters() {
        const activeInput = assignFilters.querySelector('input:checked');
        const activeCategory = activeInput ? activeInput.value : '';
        const search = assignSearchInput.value.trim().toLowerCase();

        assignList.querySelectorAll('.assign-option').forEach((option) => {
            const matchesCategory = activeCategory === '' || option.dataset.category === activeCategory;
            const matchesSearch = option.dataset.name.includes(search);
            option.hidden = !(matchesCategory && matchesSearch);
        });
    }
    assignFilters.addEventListener('change', apply_assign_filters);
    assignSearchInput.addEventListener('input', apply_assign_filters);

    function open_assign_modal(slot, triggerEl) {
        currentAssignSlotId = slot.id;
        assignError.textContent = '';
        assignSearchInput.value = '';
        assignFilters.textContent = '';
        assignList.textContent = '';

        const loading = el('p', 'assign-empty');
        loading.textContent = 'Loading activities…';
        assignList.appendChild(loading);

        open_modal(assignModalContent, triggerEl);

        axios.get('../../settled-server/api/assign-candidates-handler.php', { params: { slot_id: slot.id } })
            .then((response) => {
                if (response.data.success) {
                    render_assign_candidates(response.data.data.candidates);
                } else {
                    assignList.textContent = '';
                    assignError.textContent = response.data.error;
                }
            })
            .catch((error) => {
                assignList.textContent = '';
                assignError.textContent = extract_axios_error_message(error);
            });
    }

    function render_assign_candidates(candidates) {
        assignList.textContent = '';
        assignFilters.textContent = '';

        if (candidates.length === 0) {
            const empty = el('p', 'assign-empty');
            empty.textContent = 'No activities are left for this slot, in or out of budget.';
            assignList.appendChild(empty);
            return;
        }

        // the backend only widens past the trip's budget tier once nothing
        // in-budget is left, and it does so for every candidate at once, so
        // checking the first one tells us whether we're in that fallback
        if (candidates[0].over_budget) {
            const note = el('div', 'trip-preview-banner');
            note.appendChild(icon_svg(INFO_ICON, 16, 16, '2.2'));
            note.appendChild(document.createTextNode('Nothing left in this trip\'s budget for this slot. Showing options over budget instead.'));
            assignList.appendChild(note);
        }

        const categories = [];
        candidates.forEach((candidate) => {
            if (!categories.includes(candidate.category)) {
                categories.push(candidate.category);
            }
        });

        const allChip = build_filter_chip('All', '', true);
        assignFilters.appendChild(allChip);
        categories.forEach((category) => {
            assignFilters.appendChild(build_filter_chip(category, category, false));
        });

        candidates.forEach((candidate, index) => {
            assignList.appendChild(build_assign_option(candidate, index === 0));
        });
    }

    function build_filter_chip(label, value, checked) {
        const wrapper = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'assign-filter';
        input.value = value;
        input.checked = checked;
        const chip = el('span', 'filter-chip');
        chip.textContent = label;
        wrapper.append(input, chip);
        return wrapper;
    }

    function build_assign_option(candidate, checked) {
        const option = document.createElement('label');
        option.className = 'assign-option';
        option.dataset.category = candidate.category;
        option.dataset.name = candidate.name.toLowerCase();

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'assign-activity-choice';
        input.value = candidate.id;
        input.checked = checked;

        const main = el('div', 'assign-option-main');
        const nameRow = el('div', 'assign-option-name-row');
        const name = el('span', 'assign-option-name');
        name.textContent = candidate.name;
        nameRow.appendChild(name);
        if (candidate.interest_match_count > 0) {
            const badge = el('span', 'match-badge');
            badge.textContent = candidate.interest_match_count + ' into this';
            nameRow.appendChild(badge);
        }

        const tags = el('div', 'assign-option-tags');
        const category = el('span', 'tag');
        category.textContent = candidate.category;
        const budget = el('span', 'budget-pill');
        budget.textContent = '$'.repeat(candidate.cost_tier);
        tags.append(category, budget);
        if (candidate.over_budget) {
            const overBudgetTag = el('span', 'over-budget-tag');
            overBudgetTag.textContent = 'Over budget';
            tags.appendChild(overBudgetTag);
        }

        main.append(nameRow, tags);

        const dot = el('span', 'assign-radio-dot');

        option.append(input, main, dot);
        return option;
    }

    assignForm.addEventListener('submit', (event) => {
        event.preventDefault();
        assignError.textContent = '';

        const chosen = assignForm.querySelector('input[name="assign-activity-choice"]:checked');
        if (!chosen) {
            assignError.textContent = 'Please select an activity.';
            return;
        }

        const formData = new FormData();
        formData.append('slot_id', currentAssignSlotId);
        formData.append('activity_id', chosen.value);

        axios.post('../../settled-server/api/assign-slot-handler.php', formData)
            .then((response) => {
                if (response.data.success) {
                    apply_slot_update(currentAssignSlotId, response.data.data);
                    close_modal();
                } else {
                    assignError.textContent = response.data.error;
                }
            })
            .catch((error) => {
                assignError.textContent = extract_axios_error_message(error);
            });
    });
});
