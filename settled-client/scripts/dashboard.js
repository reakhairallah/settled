document.addEventListener('DOMContentLoaded', () => {
    const tripsContainer = document.getElementById('trips-container');
    const emptyState = document.getElementById('empty-state');
    const dashboardError = document.getElementById('dashboard-error');

    axios.get('../../settled-server/api/dashboard-data-handler.php')
        .then((response) => {
            if (response.data.success) {
                render_trips(response.data.data.trips);
            } else {
                dashboardError.textContent = response.data.error;
            }
        })
        .catch((error) => {
            dashboardError.textContent = extract_axios_error_message(error);
        });

    function render_trips(trips) {
        if (trips.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        trips.forEach((trip) => {
            tripsContainer.appendChild(build_trip_card(trip));
        });
    }

    function build_trip_card(trip) {
        const card = document.createElement('div');

        const name = document.createElement('h3');
        name.textContent = trip.name;
        card.appendChild(name);

        const destination = document.createElement('p');
        destination.textContent = trip.destination;
        card.appendChild(destination);

        const dates = document.createElement('p');
        dates.textContent = trip.start_date + ' to ' + trip.end_date;
        card.appendChild(dates);

        const memberCount = document.createElement('p');
        memberCount.textContent = trip.member_count + (trip.member_count == 1 ? ' member' : ' members');
        card.appendChild(memberCount);

        card.appendChild(build_trip_menu(trip));

        return card;
    }

    function build_trip_menu(trip) {
        const menuWrapper = document.createElement('div');

        const menuButton = document.createElement('button');
        menuButton.textContent = '⋮';
        menuWrapper.appendChild(menuButton);

        const menu = document.createElement('div');
        menu.style.display = 'none';

        const copyItem = document.createElement('button');
        copyItem.textContent = 'Copy invite code';
        copyItem.addEventListener('click', () => {
            navigator.clipboard.writeText(trip.invite_code).then(() => {
                const originalText = copyItem.textContent;
                copyItem.textContent = 'Copied!';
                setTimeout(() => {
                    copyItem.textContent = originalText;
                }, 1500);
            });
        });
        menu.appendChild(copyItem);

        const deleteItem = document.createElement('button');
        deleteItem.textContent = 'Delete trip';
        deleteItem.addEventListener('click', () => {
            console.log('Delete trip clicked — not implemented yet.');
        });
        menu.appendChild(deleteItem);

        menuButton.addEventListener('click', () => {
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        });

        menuWrapper.appendChild(menu);

        return menuWrapper;
    }
});
