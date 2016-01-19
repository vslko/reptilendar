<?php
$data = array(
    'success'    => true,
    'message'    => "moved",
    'data'        => array( 'id'=>$_POST['id'] , 'date'=>$_POST['date'] )
);

die( json_encode($data) );
?>