<?php
try {
  $p = new PDO('mysql:host=127.0.0.1;dbname=gycanic', 'root', '');
  echo 'DB-OK';
} catch (Exception $e) {
  echo 'ERRO: ' . $e->getMessage();
}
