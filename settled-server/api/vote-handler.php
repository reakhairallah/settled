<?php

include("../database/connection.php");
include("../db_helpers.php");
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
$slot_id = (int)($_POST["slot_id"] ?? 0);
$vote = trim($_POST["vote"] ?? "");

if($slot_id <= 0 || !in_array($vote, ["up", "down"])) {
    echo json_encode(["success" => false, "error" => "Trip not found."]);
    exit;
}

$sql = "SELECT trip_id, time_of_day, status, activity_id FROM itinerary_slots WHERE id = ?";
$query = $mysql->prepare($sql);
$query->bind_param("i", $slot_id);
$query->execute();
$array = $query->get_result();
$slot = $array->fetch_assoc();

if($slot == null) {
    echo json_encode(["success" => false, "error" => "Trip not found."]);
    exit;
}

$trip_id = $slot["trip_id"];

$sql = "SELECT id FROM trip_members WHERE trip_id = ? AND user_id = ?";
$query = $mysql->prepare($sql);
$query->bind_param("ii", $trip_id, $user_id);
$query->execute();
$array = $query->get_result();
$member = $array->fetch_assoc();

if($member == null) {
    echo json_encode(["success" => false, "error" => "Trip not found."]);
    exit;
}

$trip_member_id = $member["id"];

if($slot["status"] == "locked") {
    echo json_encode(["success" => false, "error" => "This slot has already been locked in."]);
    exit;
}

if($slot["status"] == "open") {
    echo json_encode(["success" => false, "error" => "This slot has no activity to vote on."]);
    exit;
}

$sql = "INSERT INTO votes(slot_id, trip_member_id, vote) VALUES(?, ?, ?)
        ON DUPLICATE KEY UPDATE vote = VALUES(vote)";
$query = $mysql->prepare($sql);
$query->bind_param("iis", $slot_id, $trip_member_id, $vote);
$query->execute();

$sql = "SELECT
            SUM(vote = 'up') AS up_count,
            SUM(vote = 'down') AS down_count
        FROM votes WHERE slot_id = ?";
$query = $mysql->prepare($sql);
$query->bind_param("i", $slot_id);
$query->execute();
$array = $query->get_result();
$row = $array->fetch_assoc();

$up_count = (int)$row["up_count"];
$down_count = (int)$row["down_count"];

$sql = "SELECT COUNT(*) AS total FROM trip_members WHERE trip_id = ?";
$query = $mysql->prepare($sql);
$query->bind_param("i", $trip_id);
$query->execute();
$array = $query->get_result();
$row = $array->fetch_assoc();
$total_members = (int)$row["total"];

$new_status = $slot["status"];
$votes_cleared = false;

if($total_members > 0 && $up_count / $total_members > 0.5) {
    $new_status = "locked";

    $sql = "UPDATE itinerary_slots SET status = ? WHERE id = ?";
    $query = $mysql->prepare($sql);
    $query->bind_param("si", $new_status, $slot_id);
    $query->execute();
} else if($total_members > 0 && $down_count / $total_members > 0.5) {
    $sql = "INSERT INTO slot_rejections(slot_id, activity_id) VALUES(?, ?)";
    $query = $mysql->prepare($sql);
    $query->bind_param("ii", $slot_id, $slot["activity_id"]);
    insert_or_duplicate_error($query);

    $sql = "SELECT activity_id FROM itinerary_slots WHERE trip_id = ? AND activity_id IS NOT NULL";
    $query = $mysql->prepare($sql);
    $query->bind_param("i", $trip_id);
    $query->execute();
    $array = $query->get_result();
    $excluded_activity_ids = [];
    while($used_row = $array->fetch_assoc()) {
        $excluded_activity_ids[] = $used_row["activity_id"];
    }

    $sql = "SELECT activity_id FROM slot_rejections WHERE slot_id = ?";
    $query = $mysql->prepare($sql);
    $query->bind_param("i", $slot_id);
    $query->execute();
    $array = $query->get_result();
    while($rejected_row = $array->fetch_assoc()) {
        $excluded_activity_ids[] = $rejected_row["activity_id"];
    }

    $next_activity = match_activity_for_slot($mysql, $trip_id, $slot["time_of_day"], $excluded_activity_ids);

    if($next_activity != null) {
        $new_activity_id = $next_activity["id"];
        $new_status = "proposed";
    } else {
        $new_activity_id = null;
        $new_status = "open";
    }

    $sql = "UPDATE itinerary_slots SET status = ?, activity_id = ? WHERE id = ?";
    $query = $mysql->prepare($sql);
    $query->bind_param("sii", $new_status, $new_activity_id, $slot_id);
    $query->execute();

    $sql = "DELETE FROM votes WHERE slot_id = ?";
    $query = $mysql->prepare($sql);
    $query->bind_param("i", $slot_id);
    $query->execute();

    $votes_cleared = true;
}

if($votes_cleared) {
    $up_count = 0;
    $down_count = 0;
    $your_vote = null;
} else {
    $your_vote = $vote;
}

$sql = "SELECT itinerary_slots.activity_id, activities.name, activities.category, activities.cost_tier
        FROM itinerary_slots
        LEFT JOIN activities ON activities.id = itinerary_slots.activity_id
        WHERE itinerary_slots.id = ?";
$query = $mysql->prepare($sql);
$query->bind_param("i", $slot_id);
$query->execute();
$array = $query->get_result();
$final_slot = $array->fetch_assoc();

$data = [];
$data["up_count"] = $up_count;
$data["down_count"] = $down_count;
$data["your_vote"] = $your_vote;
$data["status"] = $new_status;

if($final_slot["activity_id"] != null) {
    $activity = [];
    $activity["name"] = $final_slot["name"];
    $activity["category"] = $final_slot["category"];
    $activity["cost_tier"] = $final_slot["cost_tier"];
    $data["activity"] = $activity;
} else {
    $data["activity"] = null;
}

echo json_encode(["success" => true, "data" => $data]);

?>
