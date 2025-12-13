<?php
$result = file_put_contents('test.txt', 'Test writing at ' . date('H:i:s'));
echo $result ? 'SUCCESS' : 'FAILED';
?>