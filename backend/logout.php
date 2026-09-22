<?php
// Remove os dados da sessão e retorna para o login.
session_start();
$_SESSION = [];
session_destroy();
header('Location: ../login.php');
exit;
