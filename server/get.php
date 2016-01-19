<?php
$types  = array(1=>'bug','idea','safe','tool');
$states = array(1=>'wait', 'done', 'cancel');
$names  = array(1=>'Pit','Sven','John','Mike','Ruby','Naomi','Ivan','Nika','Bob','Dave','Ron','Jenny','Jim','Lisa','Leo');

$data = array(
    'success'    => true,
    'message'    => "ok",
    'data'        => array()
);

$from = mktime( 0, 0, 0,  substr($_GET['_from'],5,2) , substr($_GET['_from'],8,2) , substr($_GET['_from'],0,4) );
$till = mktime( 0, 0, 0,  substr($_GET['_till'],5,2) , substr($_GET['_till'],8,2) , substr($_GET['_till'],0,4) );

$count = rand(3,7);
for($i=0; $i<$count; $i++) {
    $data['data'][] = array(
        'id'        => rand(1,9999),
        'date'		=> @date("Y-m-d", rand($from, $till)),
		'name'		=> $names[ rand(1,15) ],
        'type'		=> $types[ rand(1,4) ],
        'state'		=> $states[ rand(1,3) ],
    );
}

die( json_encode($data) );

?>