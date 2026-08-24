<?php

include("../database/connection.php");
include("../trip_helpers.php");
include("../algorithms/matching.php");

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
$slot_id = (int)($_GET["slot_id"] ?? 0);

if($slot_id <= 0) {
    echo json_encode(["success" => false, "error" => "Slot not found."]);
    exit;
}

$sql = "SELECT trip_id, time_of_day, status FROM itinerary_slots WHERE id = ?";
$query = $mysql->prepare($sql);
$query->bind_param("i", $slot_id);
$query->execute();
$array = $query->get_result();
$slot = $array->fetch_assoc();

if($slot == null) {
    echo json_encode(["success" => false, "error" => "Slot not found."]);
    exit;
}

$trip_id = $slot["trip_id"];

$trip_member = get_trip_member($mysql, $trip_id, $user_id);

if($trip_member == null) {
    echo json_encode(["success" => false, "error" => "Trip not found."]);
    exit;
}

if($slot["status"] != "open") {
    echo json_encode(["success" => false, "error" => "This slot isn't open for assignment."]);
    exit;
}

$candidates = get_candidate_activities_for_slot($mysql, $trip_id, $slot["time_of_day"]);

$data = [];
$data["candidates"] = $candidates;
echo json_encode(["success" => true, "data" => $data]);

?>
