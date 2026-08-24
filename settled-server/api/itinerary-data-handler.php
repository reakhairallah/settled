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

$sql = "SELECT name, start_date, budget_tier FROM trips WHERE id = ?";
$query = $mysql->prepare($sql);
$query->bind_param("i", $trip_id);
$query->execute();
$array = $query->get_result();
$trip = $array->fetch_assoc();

$sql = "SELECT COUNT(*) AS total FROM trip_members WHERE trip_id = ?";
$query = $mysql->prepare($sql);
$query->bind_param("i", $trip_id);
$query->execute();
$array = $query->get_result();
$row = $array->fetch_assoc();
$member_count = (int)$row["total"];

$sql = "SELECT itinerary_slots.id, itinerary_slots.day_number, itinerary_slots.time_of_day, itinerary_slots.status,
               activities.name, activities.category, activities.cost_tier
        FROM itinerary_slots
        LEFT JOIN activities ON activities.id = itinerary_slots.activity_id
        WHERE itinerary_slots.trip_id = ?
        ORDER BY itinerary_slots.day_number, FIELD(itinerary_slots.time_of_day, 'morning', 'afternoon', 'evening')";
$query = $mysql->prepare($sql);
$query->bind_param("i", $trip_id);
$query->execute();
$array = $query->get_result();

$slots = [];
while($row = $array->fetch_assoc()) {
    $slot = [];
    $slot["id"] = $row["id"];
    $slot["day_number"] = $row["day_number"];
    $slot["time_of_day"] = $row["time_of_day"];
    $slot["status"] = $row["status"];

    if($row["name"] != null) {
        $activity = [];
        $activity["name"] = $row["name"];
        $activity["category"] = $row["category"];
        $activity["cost_tier"] = $row["cost_tier"];
        $slot["activity"] = $activity;
    } else {
        $slot["activity"] = null;
    }

    $slots[] = $slot;
}

$data = [];
$data["trip"] = $trip;
$data["member_count"] = $member_count;
$data["slots"] = $slots;
echo json_encode(["success" => true, "data" => $data]);

?>
