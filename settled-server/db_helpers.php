<?php

function insert_or_duplicate_error($query) {
    try {
        $query->execute();
        return null;
    } catch(mysqli_sql_exception $e) {
        if($e->getCode() == 1062) {
            return $e->getMessage();
        }
        throw $e;
    }
}

?>
