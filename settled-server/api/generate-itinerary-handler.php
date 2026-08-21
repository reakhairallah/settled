<?php

include("../database/connection.php");
include("../db_helpers.php");
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
$trip_id = (int)($_POST["trip_id"] ?? 0);

if($trip_id <= 0) {
    echo json_encode(["success" => false, "error" => "Trip not found."]);
    exit;
}

$trip_member = get_trip_member($mysql, $trip_id, $user_id);

if($trip_member == null) {
    echo json_encode(["success" => false, "error" => "Trip not found."]);
    exit;
}

$sql = "SELECT COUNT(*) AS total FROM itinerary_slots WHERE trip_id = ?";
$query = $mysql->prepare($sql);
$query->bind_param("i", $trip_id);
$query->execute();
$array = $query->get_result();
$row = $array->fetch_assoc();

if($row["total"] > 0) {
    echo json_encode(["success" => false, "error" => "This trip's itinerary has already been generated."]);
    exit;
}

$sql = "SELECT start_date, end_date FROM trips WHERE id = ?";
$query = $mysql->prepare($sql);
$query->bind_param("i", $trip_id);
$query->execute();
$array = $query->get_result();
$trip = $array->fetch_assoc();

$start = new DateTime($trip["start_date"]);
$end = new DateTime($trip["end_date"]);
$day_count = $start->diff($end)->days + 1;

$times_of_day = ["morning", "afternoon", "evening"];
$used_activity_ids = [];
$slots_created = 0;

for($day_number = 1; $day_number <= $day_count; $day_number++) {
    foreach($times_of_day as $time_of_day) {
        $activity = match_activity_for_slot($mysql, $trip_id, $time_of_day, $used_activity_ids);

        if($activity == null) {
            $activity_id = null;
            $status = "open";
        } else {
            $activity_id = $activity["id"];
            $status = "proposed";
            $used_activity_ids[] = $activity_id;
        }

        $sql = "INSERT INTO itinerary_slots(trip_id, day_number, time_of_day, activity_id, status) VALUES(?, ?, ?, ?, ?)";
        $query = $mysql->prepare($sql);
        $query->bind_param("iisis", $trip_id, $day_number, $time_of_day, $activity_id, $status);

        $duplicate_message = insert_or_duplicate_error($query);
        if($duplicate_message != null) {
            echo json_encode(["success" => false, "error" => "This trip's itinerary has already been generated."]);
            exit;
        }

        $slots_created++;
    }
}

$data = [];
$data["slots_created"] = $slots_created;
echo json_encode(["success" => true, "data" => $data]);

?>
