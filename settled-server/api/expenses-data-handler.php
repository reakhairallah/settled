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

$trip_member_id = $trip_member["id"];

$sql = "SELECT DISTINCT expenses.id, expenses.amount, expenses.description, payer_users.username AS payer_username
        FROM expenses
        INNER JOIN trip_members payer_members ON payer_members.id = expenses.payer_trip_member_id
        INNER JOIN users payer_users ON payer_users.id = payer_members.user_id
        INNER JOIN expense_splits ON expense_splits.expense_id = expenses.id
        WHERE expenses.trip_id = ?
        ORDER BY expenses.created_at DESC, expenses.id DESC";
$query = $mysql->prepare($sql);
$query->bind_param("i", $trip_id);
$query->execute();
$array = $query->get_result();

$trip_expenses = [];
while($row = $array->fetch_assoc()) {
    $expense = [];
    $expense["id"] = $row["id"];
    $expense["amount"] = $row["amount"];
    $expense["description"] = $row["description"];
    $expense["payer_username"] = $row["payer_username"];

    $split_sql = "SELECT users.username, expense_splits.share_amount
            FROM expense_splits
            INNER JOIN trip_members ON trip_members.id = expense_splits.trip_member_id
            INNER JOIN users ON users.id = trip_members.user_id
            WHERE expense_splits.expense_id = ?
            ORDER BY trip_members.id ASC";
    $split_query = $mysql->prepare($split_sql);
    $split_query->bind_param("i", $row["id"]);
    $split_query->execute();
    $split_array = $split_query->get_result();

    $splits = [];
    while($split_row = $split_array->fetch_assoc()) {
        $split = [];
        $split["username"] = $split_row["username"];
        $split["share_amount"] = $split_row["share_amount"];
        $splits[] = $split;
    }

    $expense["splits"] = $splits;
    $trip_expenses[] = $expense;
}

$sql = "SELECT expenses.id, expenses.amount, expenses.description
        FROM expenses
        LEFT JOIN expense_splits ON expense_splits.expense_id = expenses.id
        WHERE expenses.trip_id = ? AND expenses.payer_trip_member_id = ? AND expense_splits.id IS NULL
        ORDER BY expenses.created_at DESC, expenses.id DESC";
$query = $mysql->prepare($sql);
$query->bind_param("ii", $trip_id, $trip_member_id);
$query->execute();
$array = $query->get_result();

$personal_expenses = [];
while($row = $array->fetch_assoc()) {
    $expense = [];
    $expense["id"] = $row["id"];
    $expense["amount"] = $row["amount"];
    $expense["description"] = $row["description"];
    $personal_expenses[] = $expense;
}

$data = [];
$data["trip_expenses"] = $trip_expenses;
$data["personal_expenses"] = $personal_expenses;
echo json_encode(["success" => true, "data" => $data]);

?>
