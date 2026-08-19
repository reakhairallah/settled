<?php

include("../../settled-server/auth_check.php");

?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>My Trips — Settled</title>
</head>
<body>

<h1>My Trips</h1>
<p id="dashboard-error" style="color: red;"></p>

<div id="trips-container"></div>

<div id="empty-state" style="display: none;">
    <p>You haven't joined any trips yet</p>
    <a href="create-trip.php">Create a trip</a>
    <a href="join.php">Join a trip</a>
</div>

<script src="../scripts/axios.min.js"></script>
<script src="../scripts/helper.js"></script>
<script src="../scripts/dashboard.js"></script>
</body>
</html>
