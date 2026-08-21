document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const tripId = params.get('id');

    const tripViewError = document.getElementById('trip-view-error');
    const tripName = document.getElementById('trip-name');
    const tripDates = document.getElementById('trip-dates');
    const inviteCode = document.getElementById('invite-code');
    const membersContainer = document.getElementById('members-container');
    const generateItineraryButton = document.getElementById('generate-itinerary-button');
    const itineraryMessage = document.getElementById('itinerary-message');
    const itineraryLink = document.getElementById('itinerary-link');
    const expensesLink = document.getElementById('expenses-link');
    const settleUpLink = document.getElementById('settle-up-link');
    const copyInviteCodeButton = document.getElementById('copy-invite-code-btn');
    const copyInviteLinkButton = document.getElementById('copy-invite-link-btn');
    let currentInviteCode = null;

    function copy_with_feedback(button, text) {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            setTimeout(() => {
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

    itineraryLink.href = 'itinerary.php?id=' + tripId;
    expensesLink.href = 'expenses.php?id=' + tripId;
    settleUpLink.href = 'settle-up.php?id=' + tripId;

    generateItineraryButton.addEventListener('click', () => {
        itineraryMessage.textContent = '';

        const formData = new FormData();
        formData.append('trip_id', tripId);

        axios.post('../../settled-server/api/generate-itinerary-handler.php', formData)
            .then((response) => {
                if (response.data.success) {
                    itineraryMessage.textContent = 'Itinerary generated: ' + response.data.data.slots_created + ' slots created.';
                } else {
                    itineraryMessage.textContent = response.data.error;
                }
            })
            .catch((error) => {
                itineraryMessage.textContent = extract_axios_error_message(error);
            });
    });

    axios.get('../../settled-server/api/trip-view-data-handler.php', { params: { trip_id: tripId } })
        .then((response) => {
            if (response.data.success) {
                render_trip(response.data.data.trip);
                render_members(response.data.data.members);
            } else {
                tripViewError.textContent = response.data.error;
            }
        })
        .catch((error) => {
            tripViewError.textContent = extract_axios_error_message(error);
        });

    function render_trip(trip) {
        tripName.textContent = trip.name;
        tripDates.textContent = trip.start_date + ' to ' + trip.end_date;
        inviteCode.textContent = 'Invite code: ' + trip.invite_code;
        currentInviteCode = trip.invite_code;
    }

    function render_members(members) {
        members.forEach((member) => {
            membersContainer.appendChild(build_member_card(member));
        });
    }

    function build_member_card(member) {
        const card = document.createElement('div');

        const username = document.createElement('strong');
        username.textContent = member.username;
        card.appendChild(username);

        const energy = document.createElement('p');
        energy.textContent = 'Energy level: ' + member.energy_level;
        card.appendChild(energy);

        const interests = document.createElement('p');
        interests.textContent = member.interests.length > 0 ? 'Interests: ' + member.interests.join(', ') : 'Interests: none';
        card.appendChild(interests);

        return card;
    }
});
