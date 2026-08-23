<?php

include("../database/connection.php");
include("../trip_helpers.php");
include("../algorithms/settle-up.php");

if(session_status() == PHP_SESSION_NONE) {
    session_start();
}

header("Content-Type: application/json");

if(!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Not logged in."]);
    exit;
}

$user_id = $_SESSION["user_id"];
$trip_id = (int)($_GET["trip_id"] ?? 0);

if($trip_id <= 0) {
    echo json_encode(["success" => false, "error" => "Trip not found."]);
    exit;
}

$trip_member = get_trip_member($mysql, $trip_id, $user_id);

if($trip_member == null) {
    echo json_encode(["success" => false, "error" => "Trip not found."]);
    exit;
}

$settle_up = compute_settle_up($mysql, $trip_id);

$data = [];
$data["balances"] = $settle_up["balances"];
$data["transactions"] = $settle_up["transactions"];
echo json_encode(["success" => true, "data" => $data]);

?>

