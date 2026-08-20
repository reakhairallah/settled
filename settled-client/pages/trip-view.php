<?php

include("../../settled-server/auth_check.php");

?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Trip — Settled</title>
</head>
<body>

<a href="dashboard.php">&larr; Back to My Trips</a>

<p id="trip-view-error" style="color: red;"></p>

<h1 id="trip-name"></h1>
<p id="trip-dates"></p>
<p id="invite-code"></p>

<a href="placeholder.html">Itinerary</a>
<a href="placeholder.html">Expenses</a>

<button id="generate-itinerary-button">Generate Itinerary</button>
<p id="itinerary-message"></p>

<h2>Members</h2>
<div id="members-container"></div>

<script src="../scripts/axios.min.js"></script>
<script src="../scripts/helper.js"></script>
<script src="../scripts/trip-view.js"></script>
</body>
</html>
