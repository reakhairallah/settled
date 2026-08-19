<?php

include("../../settled-server/auth_check.php");

?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Create Trip — Settled</title>
</head>
<body>

<h1>Create a trip</h1>
<p id="trip-error" style="color: red;"></p>

<form id="create-trip-form">
    <label for="name">Trip Name</label><br>
    <input type="text" id="name" name="name" required><br>

    <label for="destination">Destination</label><br>
    <input type="text" id="destination" name="destination" required><br>

    <label for="start_date">Start Date</label><br>
    <input type="date" id="start_date" name="start_date" required><br>

    <label for="end_date">End Date</label><br>
    <input type="date" id="end_date" name="end_date" required><br>

    <label for="budget_tier">Budget</label><br>
    <select id="budget_tier" name="budget_tier" required>
        <option value="">Select...</option>
        <option value="1">$</option>
        <option value="2">$$</option>
        <option value="3">$$$</option>
    </select><br>

    <button type="submit">Create Trip</button>
</form>

<form id="preferences-form" style="display: none;">
    <h1>Set your trip preferences</h1>
    <p id="preferences-error" style="color: red;"></p>

    <label for="energy_level">Energy Level</label><br>
    <select id="energy_level" name="energy_level" required>
        <option value="">Select...</option>
        <option value="1">1 - Low</option>
        <option value="2">2 - Medium</option>
        <option value="3">3 - High</option>
    </select><br>

    <p>Interests (optional)</p>
    <label><input type="checkbox" name="interests[]" value="Food & Dining"> Food & Dining</label><br>
    <label><input type="checkbox" name="interests[]" value="Outdoors"> Outdoors</label><br>
    <label><input type="checkbox" name="interests[]" value="Nightlife"> Nightlife</label><br>
    <label><input type="checkbox" name="interests[]" value="Culture & Museums"> Culture & Museums</label><br>
    <label><input type="checkbox" name="interests[]" value="Shopping"> Shopping</label><br>
    <label><input type="checkbox" name="interests[]" value="Relaxation"> Relaxation</label><br>

    <button type="submit">Save Preferences</button>
</form>

<script src="../scripts/axios.min.js"></script>
<script src="../scripts/create-trip.js"></script>
</body>
</html>
