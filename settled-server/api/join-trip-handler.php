<?php

include("../database/connection.php");
include("../trip_helpers.php");

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
$invite_code = trim($_POST["invite_code"] ?? "");

if($invite_code == "") {
    echo json_encode(["success" => false, "error" => "Please enter an invite code."]);
    exit;
}

$sql = "SELECT id, name FROM trips WHERE invite_code = ?";
$query = $mysql->prepare($sql);
$query->bind_param("s", $invite_code);
$query->execute();
$array = $query->get_result();
$trip = $array->fetch_assoc();

if($trip == null) {
    echo json_encode(["success" => false, "error" => "Invalid invite code."]);
    exit;
}

$trip_id = $trip["id"];

$trip_member = get_trip_member($mysql, $trip_id, $user_id);

if($trip_member != null) {
    echo json_encode(["success" => false, "error" => "You're already a member of this trip."]);
    exit;
}

$_SESSION["pending_trip_id"] = $trip_id;

$data = [];
$data["trip_id"] = $trip_id;
$data["name"] = $trip["name"];
echo json_encode(["success" => true, "data" => $data]);

?>
