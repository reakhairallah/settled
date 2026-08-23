<?php

include("../../settled-server/auth_check.php");

?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Itinerary — Settled</title>
</head>
<body>

<a id="back-link" href="dashboard.php">&larr; Back to Trip</a>

<h1>Itinerary</h1>
<p id="itinerary-error" style="color: red;"></p>

<button id="generate-itinerary-button" type="button" hidden>Generate Itinerary</button>
<p id="generate-itinerary-message"></p>

<div id="days-container"></div>

<script src="../scripts/axios.min.js"></script>
<script src="../scripts/helper.js"></script>
<script src="../scripts/itinerary.js"></script>
</body>
</html>
