<?php
require __DIR__ . '/../vendor/autoload.php';
use Dotenv\Dotenv;
use Kreait\Firebase\Factory;

$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

$factory = (new Factory)->withServiceAccount($_ENV['FIREBASE_CREDENTIALS_JSON']);
$firestore = $factory->createFirestore()->database();

$tran_id = $_POST['tran_id'] ?? null;
$status = $_POST['status'] ?? null;

if ($tran_id && $status) {
    $firestore->collection('payments')->document($tran_id)->set([
        'status' => $status,
        'ipn_data' => $_POST,
    ]);
} 