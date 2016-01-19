<?php
$data = array(
    'success'    => true,
    'message'    => "ok",
    'data'       => array( 'id'=>rand(1,999), 'date'=>$_POST['date'], 'name'=>$_POST['name'], 'type'=>$_POST['type'], 'state'=>$_POST['state'] )
);
die( json_encode($data) );
?>