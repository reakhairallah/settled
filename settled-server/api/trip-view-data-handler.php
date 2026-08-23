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

$trip_member_id = $trip_member["id"];

$sql = "SELECT name, start_date, end_date, invite_code, budget_tier FROM trips WHERE id = ?";
$query = $mysql->prepare($sql);
$query->bind_param("i", $trip_id);
$query->execute();
$array = $query->get_result();
$trip = $array->fetch_assoc();

$sql = "SELECT trip_members.id, users.username, trip_members.energy_level, trip_members.interests
        FROM trip_members
        INNER JOIN users ON users.id = trip_members.user_id
        WHERE trip_members.trip_id = ?";
$query = $mysql->prepare($sql);
$query->bind_param("i", $trip_id);
$query->execute();
$array = $query->get_result();

$members = [];
while($row = $array->fetch_assoc()) {
    $row["interests"] = $row["interests"] != null ? json_decode($row["interests"]) : [];
    $members[] = $row;
}

$sql = "SELECT COUNT(*) AS total FROM itinerary_slots WHERE trip_id = ?";
$query = $mysql->prepare($sql);
$query->bind_param("i", $trip_id);
$query->execute();
$row = $query->get_result()->fetch_assoc();
$total_slots = (int)$row["total"];

$sql = "SELECT COUNT(*) AS total FROM itinerary_slots WHERE trip_id = ? AND status = 'locked'";
$query = $mysql->prepare($sql);
$query->bind_param("i", $trip_id);
$query->execute();
$row = $query->get_result()->fetch_assoc();
$locked_slots = (int)$row["total"];

$sql = "SELECT itinerary_slots.day_number, itinerary_slots.time_of_day, itinerary_slots.status, activities.name
        FROM itinerary_slots
        LEFT JOIN activities ON activities.id = itinerary_slots.activity_id
        WHERE itinerary_slots.trip_id = ?
        ORDER BY itinerary_slots.day_number, FIELD(itinerary_slots.time_of_day, 'morning', 'afternoon', 'evening')
        LIMIT 3";
$query = $mysql->prepare($sql);
$query->bind_param("i", $trip_id);
$query->execute();
$array = $query->get_result();

$preview_slots = [];
while($row = $array->fetch_assoc()) {
    $slot = [];
    $slot["day_number"] = $row["day_number"];
    $slot["time_of_day"] = $row["time_of_day"];
    $slot["status"] = $row["status"];
    $slot["activity_name"] = $row["name"];
    $preview_slots[] = $slot;
}

$itinerary_summary = [];
$itinerary_summary["generated"] = $total_slots > 0;
$itinerary_summary["total_slots"] = $total_slots;
$itinerary_summary["locked_slots"] = $locked_slots;
$itinerary_summary["preview_slots"] = $preview_slots;

$sql = "SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS total_count FROM expenses WHERE trip_id = ?";
$query = $mysql->prepare($sql);
$query->bind_param("i", $trip_id);
$query->execute();
$row = $query->get_result()->fetch_assoc();

$sql = "SELECT description, amount FROM expenses WHERE trip_id = ? ORDER BY created_at DESC, id DESC LIMIT 3";
$query = $mysql->prepare($sql);
$query->bind_param("i", $trip_id);
$query->execute();
$array = $query->get_result();

$recent_expenses = [];
while($expense_row = $array->fetch_assoc()) {
    $recent_expenses[] = $expense_row;
}

$expenses_summary = [];
$expenses_summary["has_expenses"] = (int)$row["total_count"] > 0;
$expenses_summary["total_amount"] = $row["total"];
$expenses_summary["recent"] = $recent_expenses;

$settle_up = compute_settle_up($mysql, $trip_id);

$my_balance = "0.00";
foreach($settle_up["balances"] as $balance) {
    if($balance["trip_member_id"] == $trip_member_id) {
        $my_balance = $balance["amount"];
    }
}

$preview_transactions = [];
foreach($settle_up["transactions"] as $transaction) {
    if($transaction["from_trip_member_id"] == $trip_member_id || $transaction["to_trip_member_id"] == $trip_member_id) {
        $preview_transactions[] = $transaction;
    }
}
foreach($settle_up["transactions"] as $transaction) {
    if(count($preview_transactions) >= 2) {
        break;
    }
    if($transaction["from_trip_member_id"] != $trip_member_id && $transaction["to_trip_member_id"] != $trip_member_id) {
        $preview_transactions[] = $transaction;
    }
}
$preview_transactions = array_slice($preview_transactions, 0, 2);

$settle_up_summary = [];
$settle_up_summary["settled"] = count($settle_up["transactions"]) == 0;
$settle_up_summary["my_balance"] = $my_balance;
$settle_up_summary["preview_transactions"] = $preview_transactions;

$data = [];
$data["trip"] = $trip;
$data["members"] = $members;
$data["your_trip_member_id"] = $trip_member_id;
$data["itinerary_summary"] = $itinerary_summary;
$data["expenses_summary"] = $expenses_summary;
$data["settle_up_summary"] = $settle_up_summary;
echo json_encode(["success" => true, "data" => $data]);

?>

