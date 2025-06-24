<?php
require __DIR__ . '/../vendor/autoload.php';
use Dotenv\Dotenv;

header('Content-Type: application/json');

$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

$store_id = $_ENV['SSLC_STORE_ID'];
$store_passwd = $_ENV['SSLC_STORE_PASSWORD'];

$data = json_decode(file_get_contents('php://input'), true);

$post_data = [
    'store_id' => $store_id,
    'store_passwd' => $store_passwd,
    'total_amount' => $data['amount'],
    'currency' => 'BDT',
    'tran_id' => uniqid(),
    'success_url' => $_ENV['SUCCESS_URL'],
    'fail_url' => $_ENV['FAIL_URL'],
    'cancel_url' => $_ENV['CANCEL_URL'],
    'ipn_url' => $_ENV['IPN_URL'],
];

$ch = curl_init('https://sandbox.sslcommerz.com/gwprocess/v3/api.php');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post_data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

echo $response; 