<?php

function decimal_string_to_cents($decimal_string) {
    $parts = explode(".", $decimal_string);
    $whole = (int)$parts[0];
    $fraction = isset($parts[1]) ? str_pad(substr($parts[1], 0, 2), 2, "0") : "00";
    return $whole * 100 + (int)$fraction;
}

function cents_to_decimal_string($cents) {
    $sign = $cents < 0 ? "-" : "";
    $abs_cents = abs($cents);
    $whole = intdiv($abs_cents, 100);
    $fraction = str_pad($abs_cents % 100, 2, "0", STR_PAD_LEFT);
    return $sign . $whole . "." . $fraction;
}

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

$sql = "SELECT trip_members.id, users.username
        FROM trip_members
        INNER JOIN users ON users.id = trip_members.user_id
        WHERE trip_members.trip_id = ?";
$query = $mysql->prepare($sql);
$query->bind_param("i", $trip_id);
$query->execute();
$array = $query->get_result();

$usernames = [];
$balance_cents = [];
while($row = $array->fetch_assoc()) {
    $usernames[$row["id"]] = $row["username"];
    $balance_cents[$row["id"]] = 0;
}

$sql = "SELECT DISTINCT expenses.id, expenses.payer_trip_member_id, expenses.amount
        FROM expenses
        INNER JOIN expense_splits ON expense_splits.expense_id = expenses.id
        WHERE expenses.trip_id = ?";
$query = $mysql->prepare($sql);
$query->bind_param("i", $trip_id);
$query->execute();
$array = $query->get_result();

while($row = $array->fetch_assoc()) {
    $balance_cents[$row["payer_trip_member_id"]] += decimal_string_to_cents($row["amount"]);
}

$sql = "SELECT expense_splits.trip_member_id, expense_splits.share_amount
        FROM expense_splits
        INNER JOIN expenses ON expenses.id = expense_splits.expense_id
        WHERE expenses.trip_id = ?";
$query = $mysql->prepare($sql);
$query->bind_param("i", $trip_id);
$query->execute();
$array = $query->get_result();

while($row = $array->fetch_assoc()) {
    $balance_cents[$row["trip_member_id"]] -= decimal_string_to_cents($row["share_amount"]);
}

$balances = [];
foreach($balance_cents as $member_id => $cents) {
    $balance = [];
    $balance["username"] = $usernames[$member_id];
    $balance["amount"] = cents_to_decimal_string($cents);
    $balances[] = $balance;
}

$working_cents = $balance_cents;
$transactions = [];
$max_iterations = count($working_cents);
$iterations = 0;

while($iterations <= $max_iterations) {
    $iterations++;

    $creditor_id = null;
    $creditor_balance = 0;
    foreach($working_cents as $member_id => $cents) {
        if($cents > 0 && ($creditor_id == null || $cents > $creditor_balance || ($cents == $creditor_balance && $member_id < $creditor_id))) {
            $creditor_id = $member_id;
            $creditor_balance = $cents;
        }
    }

    $debtor_id = null;
    $debtor_balance = 0;
    foreach($working_cents as $member_id => $cents) {
        if($cents < 0 && ($debtor_id == null || $cents < $debtor_balance || ($cents == $debtor_balance && $member_id < $debtor_id))) {
            $debtor_id = $member_id;
            $debtor_balance = $cents;
        }
    }

    if($creditor_id == null || $debtor_id == null) {
        break;
    }

    $transaction_cents = min($creditor_balance, -$debtor_balance);

    if($transaction_cents <= 0) {
        break;
    }

    $transaction = [];
    $transaction["from_username"] = $usernames[$debtor_id];
    $transaction["to_username"] = $usernames[$creditor_id];
    $transaction["amount"] = cents_to_decimal_string($transaction_cents);
    $transactions[] = $transaction;

    $working_cents[$creditor_id] -= $transaction_cents;
    $working_cents[$debtor_id] += $transaction_cents;
}

$data = [];
$data["balances"] = $balances;
$data["transactions"] = $transactions;
echo json_encode(["success" => true, "data" => $data]);

?>
