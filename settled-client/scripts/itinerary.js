document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const tripId = params.get('id');

    const itineraryError = document.getElementById('itinerary-error');
    const daysContainer = document.getElementById('days-container');
    const backLink = document.getElementById('back-link');
    const generateButton = document.getElementById('generate-itinerary-button');
    const generateMessage = document.getElementById('generate-itinerary-message');
    const blurbCache = {};

    backLink.href = 'trip-view.php?id=' + tripId;

    generateButton.addEventListener('click', () => {
        generateMessage.textContent = '';
        generateButton.disabled = true;

        const formData = new FormData();
        formData.append('trip_id', tripId);

        axios.post('../../settled-server/api/generate-itinerary-handler.php', formData)
            .then((response) => {
                if (response.data.success) {
                    generateButton.hidden = true;
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
                    daysContainer.innerHTML = '';
                    if (response.data.data.slots.length === 0) {
                        generateButton.hidden = false;
                    } else {
                        generateButton.hidden = true;
                        render_slots(response.data.data.slots);
                    }
                } else {
                    itineraryError.textContent = response.data.error;
                }
            })
            .catch((error) => {
                itineraryError.textContent = extract_axios_error_message(error);
            });
    }

    fetch_itinerary();

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

        voteUp.disabled = slot.status !== 'proposed';
        voteDown.disabled = slot.status !== 'proposed';

        const voteTally = document.createElement('p');
        voteTally.className = 'vote-tally';
        card.appendChild(voteTally);

        const voteError = document.createElement('p');
        voteError.className = 'vote-error';
        voteError.style.color = 'red';
        card.appendChild(voteError);

        function cast_vote(voteValue) {
            voteError.textContent = '';

            const formData = new FormData();
            formData.append('slot_id', slot.id);
            formData.append('vote', voteValue);

            axios.post('../../settled-server/api/vote-handler.php', formData)
                .then((response) => {
                    if (response.data.success) {
                        const result = response.data.data;

                        voteTally.textContent = result.up_count + ' up / ' + result.down_count + ' down';
                        voteUp.classList.toggle('voted', result.your_vote === 'up');
                        voteDown.classList.toggle('voted', result.your_vote === 'down');

                        if (result.status !== slot.status || result.activity) {
                            delete blurbCache[slot.id];
                            blurbPopover.textContent = '';
                            blurbPopover.style.display = 'none';
                        }

                        slot.status = result.status;
                        slot.activity = result.activity;

                        status.textContent = slot.status;

                        if (slot.activity) {
                            activityLine.className = '';
                            activityLine.textContent = slot.activity.name + ' (' + slot.activity.category + ', cost tier ' + slot.activity.cost_tier + ')';
                        } else {
                            activityLine.className = 'assign-slot';
                            activityLine.textContent = 'Empty slot — click to assign';
                        }

                        const votable = slot.status === 'proposed';
                        voteUp.disabled = !votable;
                        voteDown.disabled = !votable;

                        if (!votable) {
                            voteUp.classList.remove('voted');
                            voteDown.classList.remove('voted');
                        }
                    } else {
                        voteError.textContent = response.data.error;
                    }
                })
                .catch((error) => {
                    voteError.textContent = extract_axios_error_message(error);
                });
        }

        voteUp.addEventListener('click', () => cast_vote('up'));
        voteDown.addEventListener('click', () => cast_vote('down'));

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
