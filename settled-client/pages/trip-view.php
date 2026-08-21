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
<button id="copy-invite-code-btn" type="button">Copy invite code</button>
<button id="copy-invite-link-btn" type="button">Copy invite link</button>

<a id="itinerary-link" href="placeholder.html">Itinerary</a>
<a id="expenses-link" href="placeholder.html">Expenses</a>
<a id="settle-up-link" href="placeholder.html">Settle Up</a>

<button id="generate-itinerary-button">Generate Itinerary</button>
<p id="itinerary-message"></p>

<h2>Members</h2>
<div id="members-container"></div>

<script src="../scripts/axios.min.js"></script>
<script src="../scripts/helper.js"></script>
<script src="../scripts/trip-view.js"></script>
</body>
</html>
