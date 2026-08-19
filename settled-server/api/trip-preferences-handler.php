<?php

include("../database/connection.php");
include("../db_helpers.php");

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
$interests_list = ["Food & Dining", "Outdoors", "Nightlife", "Culture & Museums", "Shopping", "Relaxation"];

$trip_id = (int)($_POST["trip_id"] ?? 0);
$energy_level = trim($_POST["energy_level"] ?? "");
$selected_interests = $_POST["interests"] ?? [];

if($trip_id <= 0 || !in_array($energy_level, ["1", "2", "3"])) {
    echo json_encode(["success" => false, "error" => "Please select your energy level."]);
    exit;
}

$sql = "SELECT COUNT(*) AS total FROM trips WHERE id = ? AND created_by = ?";
$query = $mysql->prepare($sql);
$query->bind_param("ii", $trip_id, $user_id);
$query->execute();
$array = $query->get_result();
$row = $array->fetch_assoc();

if($row["total"] == 0) {
    echo json_encode(["success" => false, "error" => "Trip not found."]);
    exit;
}

$valid_interests = [];
foreach($selected_interests as $interest) {
    if(in_array($interest, $interests_list)) {
        $valid_interests[] = $interest;
    }
}

$interests_json = count($valid_interests) > 0 ? json_encode($valid_interests) : null;
$energy_level_int = (int)$energy_level;

$sql = "INSERT INTO trip_members(trip_id, user_id, energy_level, interests) VALUES(?, ?, ?, ?)";
$query = $mysql->prepare($sql);
$query->bind_param("iiis", $trip_id, $user_id, $energy_level_int, $interests_json);

$duplicate_message = insert_or_duplicate_error($query);
if($duplicate_message != null) {
    echo json_encode(["success" => false, "error" => "You've already submitted this."]);
    exit;
}

echo json_encode(["success" => true, "data" => new stdClass()]);

?>
