<?php
echo "=== END-TO-END TESTING: DICTIONARY-DRIVEN ARCHITECTURE ===\n\n";

// Test 1: Website Load Test
echo "TEST 1: Full Website Load\n";
echo str_repeat("-", 50) . "\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8080');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    echo "❌ CURL Error: $error\n";
} else {
    echo "✅ HTTP Status: $httpCode\n";
    echo "✅ Response Length: " . strlen($response) . " characters\n";
    
    // Check for key elements
    $checks = [
        'HTML Document' => preg_match('/<html[^>]*>/i', $response),
        'Navigation' => strpos($response, 'nav') !== false,
        'Components' => preg_match('/<[^>]*class="[^"]*component[^"]*"/', $response),
        'Dynamic Elements' => strpos($response, 'data-dynamic') !== false,
        'CSS Loaded' => strpos($response, 'stylesheet') !== false || strpos($response, '<style') !== false,
        'JavaScript Loaded' => strpos($response, '<script') !== false,
    ];
    
    foreach ($checks as $check => $result) {
        echo ($result ? "✅" : "❌") . " $check: " . ($result ? "Present" : "Missing") . "\n";
    }
}

echo "\n";

// Test 2: Dynamic Content API Test
echo "TEST 2: Dynamic Content Loading\n";
echo str_repeat("-", 50) . "\n";

$dynamicTests = [
    [
        'name' => 'Project Details (Dynamic Component)',
        'componentId' => 'project-details-main',
        'pageDefinition' => 'project_details_page_t1.json'
    ],
    [
        'name' => 'Summary Container (Dynamic Container)',
        'componentId' => 'summary-main-container', 
        'pageDefinition' => 'summary_page_t1.json'
    ]
];

foreach ($dynamicTests as $test) {
    echo "\nTesting: " . $test['name'] . "\n";
    
    $postData = json_encode([
        'componentId' => $test['componentId'],
        'pageDefinition' => $test['pageDefinition']
    ]);
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'http://localhost:8080/endpoints/dynamic_content_t1.php');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        echo "❌ CURL Error: $error\n";
        continue;
    }
    
    echo "HTTP Status: $httpCode\n";
    
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        if ($data) {
            if ($data['success']) {
                echo "✅ Success: Component loaded\n";
                echo "   Object Count: " . ($data['objectCount'] ?? 'N/A') . "\n";
                echo "   Content Length: " . strlen($data['content'] ?? '') . " chars\n";
                echo "   Has HTML: " . (preg_match('/<[^>]+>/', $data['content'] ?? '') ? 'Yes' : 'No') . "\n";
            } else {
                echo "❌ API Error: " . ($data['error'] ?? 'Unknown') . "\n";
            }
        } else {
            echo "❌ Invalid JSON response\n";
        }
    } else {
        echo "❌ HTTP Error: $httpCode\n";
    }
}

echo "\n";

// Test 3: Protected Content Test
echo "TEST 3: Protected Content Security\n";
echo str_repeat("-", 50) . "\n";

echo "Testing protected component without authentication...\n";

$postData = json_encode([
    'componentId' => 'admin-placeholder',
    'pageDefinition' => 'control_page_t1.json'
]);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8080/endpoints/dynamic_content_t1.php');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    echo "❌ CURL Error: $error\n";
} else {
    echo "HTTP Status: $httpCode\n";
    
    if ($httpCode === 401) {
        echo "✅ Security Working: Protected content correctly blocked (401 Unauthorized)\n";
    } else if ($httpCode === 200) {
        $data = json_decode($response, true);
        if ($data && !$data['success']) {
            echo "✅ Security Working: " . ($data['error'] ?? 'Access denied') . "\n";
        } else {
            echo "❌ Security Issue: Protected content accessible without authentication\n";
        }
    } else {
        echo "⚠️  Unexpected response code: $httpCode\n";
    }
}

echo "\n";

// Test 4: Architecture Validation
echo "TEST 4: Architecture Validation\n";
echo str_repeat("-", 50) . "\n";

// Check if files exist and are properly structured
$criticalFiles = [
    'index.php' => 'Main entry point',
    'builders/builder_t1.php' => 'Dictionary-driven builder',
    'endpoints/dynamic_content_t1.php' => 'Dynamic content API',
    'definitions/entry.json' => 'Entry configuration',
    'definitions/profiles/ml_mlops_t1.json' => 'Profile configuration'
];

foreach ($criticalFiles as $file => $description) {
    if (file_exists($file)) {
        echo "✅ $description: Present ($file)\n";
    } else {
        echo "❌ $description: Missing ($file)\n";
    }
}

// Check configuration structure
echo "\nConfiguration Structure Validation:\n";

if (file_exists('definitions/entry.json')) {
    $entry = json_decode(file_get_contents('definitions/entry.json'), true);
    
    // Validate clean structure (no parameters, builders list, etc.)
    $structureChecks = [
        'No parameters' => !isset($entry['parameters']),
        'No builders list' => !isset($entry['builders']),
        'No default_builder' => !isset($entry['default_builder']),
        'Has default_profile' => isset($entry['default_profile']),
        'Has profiles' => isset($entry['profiles']) && is_array($entry['profiles'])
    ];
    
    foreach ($structureChecks as $check => $result) {
        echo ($result ? "✅" : "❌") . " $check\n";
    }
}

echo "\n=== END-TO-END TESTING COMPLETE ===\n";
echo "\nOpen test_end_to_end.html in browser for interactive testing!\n";
?>
