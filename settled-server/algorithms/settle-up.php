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

function compute_settle_up($mysql, $trip_id) {
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
        $balance["trip_member_id"] = $member_id;
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
        $transaction["from_trip_member_id"] = $debtor_id;
        $transaction["to_trip_member_id"] = $creditor_id;
        $transaction["from_username"] = $usernames[$debtor_id];
        $transaction["to_username"] = $usernames[$creditor_id];
        $transaction["amount"] = cents_to_decimal_string($transaction_cents);
        $transactions[] = $transaction;

        $working_cents[$creditor_id] -= $transaction_cents;
        $working_cents[$debtor_id] += $transaction_cents;
    }

    $result = [];
    $result["balances"] = $balances;
    $result["transactions"] = $transactions;
    $result["balance_cents"] = $balance_cents;
    return $result;
}

?>

