<?php

include("../../settled-server/auth_check.php");

?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Itinerary — Settled</title>
</head>
<body>

<a id="back-link" href="dashboard.php">&larr; Back to Trip</a>

<h1>Itinerary</h1>
<p id="itinerary-error" style="color: red;"></p>

<div id="days-container"></div>

<script src="../scripts/axios.min.js"></script>
<script src="../scripts/helper.js"></script>
<script src="../scripts/itinerary.js"></script>
</body>
</html>
