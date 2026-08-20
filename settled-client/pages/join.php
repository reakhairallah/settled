<?php

include("../../settled-server/auth_check.php");

?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Join Trip — Settled</title>
</head>
<body>

<a href="dashboard.php">&larr; Back to My Trips</a>

<h1>Join a trip</h1>
<p id="join-error" style="color: red;"></p>

<form id="join-form">
    <label for="invite_code">Invite Code</label><br>
    <input type="text" id="invite_code" name="invite_code" required><br>

    <button type="submit">Join Trip</button>
</form>

<form id="preferences-form" style="display: none;">
    <h1>Set your trip preferences</h1>
    <p id="trip-preview"></p>
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
<script src="../scripts/helper.js"></script>
<script src="../scripts/join.js"></script>
</body>
</html>
