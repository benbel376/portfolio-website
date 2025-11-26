<?php
echo "=== QUICK END-TO-END TEST SUMMARY ===\n\n";

// Test 1: Website Load
echo "1. WEBSITE LOAD TEST\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8080');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Status: " . ($httpCode === 200 ? "✅ SUCCESS ($httpCode)" : "❌ FAILED ($httpCode)") . "\n";
echo "Length: " . strlen($response) . " chars\n";
echo "Has HTML: " . (strpos($response, '<html') !== false ? "✅ YES" : "❌ NO") . "\n\n";

// Test 2: Dynamic API
echo "2. DYNAMIC API TEST\n";
$postData = json_encode(['componentId' => 'project-details-main', 'pageDefinition' => 'project_details_page_t1.json']);
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8080/endpoints/dynamic_content_t1.php');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$data = json_decode($response, true);
echo "Status: " . ($httpCode === 200 ? "✅ SUCCESS ($httpCode)" : "❌ FAILED ($httpCode)") . "\n";
if ($data && $data['success']) {
    echo "Result: ✅ Component loaded (" . $data['objectCount'] . " objects)\n";
} else {
    echo "Result: ❌ " . ($data['error'] ?? 'Unknown error') . "\n";
}
echo "\n";

// Test 3: Protected Content
echo "3. SECURITY TEST (Protected Content)\n";
$postData = json_encode(['componentId' => 'admin-placeholder', 'pageDefinition' => 'control_page_t1.json']);
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8080/endpoints/dynamic_content_t1.php');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Status: $httpCode\n";
if ($httpCode === 401) {
    echo "Security: ✅ Protected content blocked correctly\n";
} else {
    echo "Security: ❌ Protected content should be blocked\n";
}
echo "\n";

// Test 4: Architecture Files
echo "4. ARCHITECTURE VALIDATION\n";
$files = [
    'index.php' => 'Main Entry',
    'builders/builder_t1.php' => 'Builder',
    'endpoints/dynamic_content_t1.php' => 'Dynamic API'
];

foreach ($files as $file => $name) {
    echo "$name: " . (file_exists($file) ? "✅ Present" : "❌ Missing") . "\n";
}

echo "\n=== TEST COMPLETE ===\n";
?>
