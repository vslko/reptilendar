<?php
$data = array(
    'success'    => true,
    'message'    => "saved",
    'data'       => array( 'id'=>$_POST['id'], 'date'=>$_POST['date'], 'name'=>$_POST['name'], 'type'=>$_POST['type'], 'state'=>$_POST['state'] )
);
die( json_encode($data) );
?>