document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const tripId = params.get('id');

    const tripViewError = document.getElementById('trip-view-error');
    const tripName = document.getElementById('trip-name');
    const tripDates = document.getElementById('trip-dates');
    const inviteCode = document.getElementById('invite-code');
    const membersContainer = document.getElementById('members-container');

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
