<?php
$data = array(
    'success'    => true,
    'message'    => "removed",
    'data'       => $_POST['id']
);
die( json_encode($data) );
?>