<?php

if(session_status() == PHP_SESSION_NONE) {
    session_start();
}

header("Content-Type: application/json");

$data = [];
$data["logged_in"] = isset($_SESSION["user_id"]);
echo json_encode(["success" => true, "data" => $data]);

?>
