#!/usr/local/bin/php
<?php

echo "HELLO BOOTSTRAPBOOTSTRAPBOOTSTRAPBOOTSTRAPBOOTSTRAPBOOTSTRAP!!!!\n";

$output = shell_exec('../html/occ config:list');
if (strpos($output, 'There are no commands defined') !== false) {
  sleep(3);
  shell_exec('./bootstrap.php');
}

?>