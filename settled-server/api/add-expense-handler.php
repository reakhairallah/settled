<?php

include("../database/connection.php");
include("../db_helpers.php");
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

$payer_trip_member_id = $trip_member["id"];

$amount_raw = trim($_POST["amount"] ?? "");

if($amount_raw == "" || !is_numeric($amount_raw) || (float)$amount_raw <= 0) {
    echo json_encode(["success" => false, "error" => "Please enter a valid amount."]);
    exit;
}

$amount = round((float)$amount_raw, 2);

$description = trim($_POST["description"] ?? "");
$description = $description == "" ? null : $description;

$submitted_ids = $_POST["member_ids"] ?? [];
if(!is_array($submitted_ids)) {
    $submitted_ids = [];
}

$member_ids = [];
foreach($submitted_ids as $id) {
    $id_int = (int)$id;
    if($id_int > 0 && !in_array($id_int, $member_ids)) {
        $member_ids[] = $id_int;
    }
}

if(count($member_ids) > 0) {
    $sql = "SELECT id FROM trip_members WHERE trip_id = ?";
    $query = $mysql->prepare($sql);
    $query->bind_param("i", $trip_id);
    $query->execute();
    $array = $query->get_result();

    $valid_ids = [];
    while($row = $array->fetch_assoc()) {
        $valid_ids[] = (int)$row["id"];
    }

    foreach($member_ids as $member_id) {
        if(!in_array($member_id, $valid_ids)) {
            echo json_encode(["success" => false, "error" => "One or more selected members are not part of this trip."]);
            exit;
        }
    }
}

$sql = "INSERT INTO expenses(trip_id, payer_trip_member_id, amount, description) VALUES(?, ?, ?, ?)";
$query = $mysql->prepare($sql);
$query->bind_param("iids", $trip_id, $payer_trip_member_id, $amount, $description);
$query->execute();

$expense_id = $mysql->insert_id;

if(count($member_ids) > 0) {
    sort($member_ids);

    $amount_cents = (int)round($amount * 100);
    $split_count = count($member_ids);
    $base_cents = intdiv($amount_cents, $split_count);
    $remainder_cents = $amount_cents % $split_count;

    $remainder_recipient_id = in_array($payer_trip_member_id, $member_ids) ? $payer_trip_member_id : $member_ids[0];

    foreach($member_ids as $member_id) {
        $share_cents = $base_cents;
        if($member_id == $remainder_recipient_id) {
            $share_cents += $remainder_cents;
        }
        $share_amount = $share_cents / 100;

        $sql = "INSERT INTO expense_splits(expense_id, trip_member_id, share_amount) VALUES(?, ?, ?)";
        $query = $mysql->prepare($sql);
        $query->bind_param("iid", $expense_id, $member_id, $share_amount);
        insert_or_duplicate_error($query);
    }
}

$data = [];
$data["expense_id"] = $expense_id;
echo json_encode(["success" => true, "data" => $data]);

?>
