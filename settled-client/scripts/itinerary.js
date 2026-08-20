document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const tripId = params.get('id');

    const itineraryError = document.getElementById('itinerary-error');
    const daysContainer = document.getElementById('days-container');
    const backLink = document.getElementById('back-link');
    const blurbCache = {};

    backLink.href = 'trip-view.php?id=' + tripId;

    axios.get('../../settled-server/api/itinerary-data-handler.php', { params: { trip_id: tripId } })
        .then((response) => {
            if (response.data.success) {
                render_slots(response.data.data.slots);
            } else {
                itineraryError.textContent = response.data.error;
            }
        })
        .catch((error) => {
            itineraryError.textContent = extract_axios_error_message(error);
        });

    function render_slots(slots) {
        const days = {};
        slots.forEach((slot) => {
            if (!days[slot.day_number]) {
                days[slot.day_number] = [];
            }
            days[slot.day_number].push(slot);
        });

        Object.keys(days).sort((a, b) => a - b).forEach((dayNumber) => {
            daysContainer.appendChild(build_day_section(dayNumber, days[dayNumber]));
        });
    }

    function build_day_section(dayNumber, slotsForDay) {
        const section = document.createElement('div');
        section.className = 'day-section';

        const heading = document.createElement('h2');
        heading.textContent = 'Day ' + dayNumber;
        section.appendChild(heading);

        slotsForDay.forEach((slot) => {
            section.appendChild(build_slot_card(slot));
        });

        return section;
    }

    function build_slot_card(slot) {
        const card = document.createElement('div');
        card.className = 'slot-card';

        const timeOfDay = document.createElement('h3');
        timeOfDay.textContent = slot.time_of_day;
        card.appendChild(timeOfDay);

        const status = document.createElement('span');
        status.className = 'slot-status';
        status.textContent = slot.status;
        card.appendChild(status);

        const activityLine = document.createElement('p');
        if (slot.activity) {
            activityLine.textContent = slot.activity.name + ' (' + slot.activity.category + ', cost tier ' + slot.activity.cost_tier + ')';
        } else {
            activityLine.className = 'assign-slot';
            activityLine.textContent = 'Empty slot — click to assign';
        }
        card.appendChild(activityLine);

        const voteUp = document.createElement('button');
        voteUp.className = 'vote-up';
        voteUp.textContent = '👍';
        card.appendChild(voteUp);

        const voteDown = document.createElement('button');
        voteDown.className = 'vote-down';
        voteDown.textContent = '👎';
        card.appendChild(voteDown);

        const whyThisPick = document.createElement('button');
        whyThisPick.className = 'why-this-pick';
        whyThisPick.textContent = '💡 Why This Pick';
        card.appendChild(whyThisPick);

        const blurbPopover = document.createElement('p');
        blurbPopover.className = 'why-this-pick-blurb';
        blurbPopover.style.display = 'none';
        card.appendChild(blurbPopover);

        whyThisPick.addEventListener('click', () => {
            if (blurbCache[slot.id]) {
                blurbPopover.textContent = blurbCache[slot.id];
                blurbPopover.style.display = 'block';
                return;
            }

            axios.get('../../settled-server/api/why-this-pick-handler.php', { params: { slot_id: slot.id } })
                .then((response) => {
                    if (response.data.success) {
                        blurbCache[slot.id] = response.data.data.blurb;
                        blurbPopover.textContent = response.data.data.blurb;
                    } else {
                        blurbPopover.textContent = response.data.error;
                    }
                    blurbPopover.style.display = 'block';
                })
                .catch((error) => {
                    blurbPopover.textContent = extract_axios_error_message(error);
                    blurbPopover.style.display = 'block';
                });
        });

        return card;
    }
});
