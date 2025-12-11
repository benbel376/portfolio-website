<?php

/**
 * AI Assistant API Endpoint
 * Handles chat requests with multi-turn context gathering
 */

class AiAssistantEndpoint {
    
    private $config;
    private const MAX_ROUNDS = 5; // Maximum back-and-forth rounds for multi-page search
    
    public function __construct() {
        $this->loadConfig();
    }
    
    /**
     * Handle incoming requests
     */
    public function handle($action, $requestData) {
        switch ($action) {
            case 'chat':
                return $this->handleChat($requestData);
            case 'status':
                return $this->handleStatus();
            default:
                return ['success' => false, 'error' => 'Unknown action'];
        }
    }
    
    /**
     * Handle chat message with multi-turn context gathering
     */
    private function handleChat($requestData) {
        $userMessage = $requestData['message'] ?? '';
        $chatHistory = $requestData['history'] ?? []; // Previous conversation from client
        
        if (empty($userMessage)) {
            return ['success' => false, 'error' => 'Message is required'];
        }
        
        if (!$this->config || empty($this->config['apiKey'])) {
            return [
                'success' => true,
                'message' => 'I\'m currently in demo mode. To enable full AI capabilities, please configure the API key in your site JSON file.',
                'navigate' => null
            ];
        }
        
        try {
            // Build initial lightweight context
            $siteStructure = $this->buildSiteStructure();
            $internalHistory = []; // For multi-turn data requests within this call
            
            // Multi-turn loop
            for ($round = 0; $round < self::MAX_ROUNDS; $round++) {
                // Create prompt based on round
                if ($round === 0) {
                    $systemPrompt = $this->createInitialPrompt($siteStructure);
                } else {
                    $systemPrompt = $this->createFollowUpPrompt($siteStructure);
                }
                
                // Build conversation for API (includes chat history from client)
                $fullPrompt = $this->buildConversationPrompt($systemPrompt, $chatHistory, $internalHistory, $userMessage, $round);
                
                // Call LLM API
                $aiResponse = $this->callLlmApi($fullPrompt);
                
                // Parse response
                $parsed = $this->parseAiResponse($aiResponse);
                
                if ($parsed['type'] === 'response') {
                    // Final response for user
                    return [
                        'success' => true,
                        'message' => $parsed['message'],
                        'navigate' => $parsed['navigate'] ?? null
                    ];
                } elseif ($parsed['type'] === 'request') {
                    // AI wants more information
                    $requestedSection = $parsed['section'] ?? null;
                    if ($requestedSection) {
                        $sectionData = $this->getSectionData($requestedSection, $siteStructure);
                        $internalHistory[] = [
                            'role' => 'assistant',
                            'content' => json_encode($parsed)
                        ];
                        $internalHistory[] = [
                            'role' => 'system',
                            'content' => "Here is the detailed data for '{$requestedSection}':\n" . json_encode($sectionData, JSON_PRETTY_PRINT)
                        ];
                    } else {
                        // Invalid request, force response
                        break;
                    }
                } else {
                    // Unknown type, treat as response
                    return [
                        'success' => true,
                        'message' => $parsed['message'] ?? $aiResponse,
                        'navigate' => $parsed['navigate'] ?? null
                    ];
                }
            }
            
            // Max rounds reached, force a response
            return [
                'success' => true,
                'message' => 'I have the information you need. How can I help you explore my portfolio?',
                'navigate' => null
            ];
            
        } catch (Exception $e) {
            error_log('AI Assistant Error: ' . $e->getMessage());
            
            // Handle rate limit error with user-friendly message
            if ($e->getMessage() === 'RATE_LIMIT_EXCEEDED') {
                return [
                    'success' => true,
                    'message' => 'I\'ve reached my daily conversation limit. The free tier allows 20 requests per day. Please try again tomorrow, or feel free to explore the portfolio using the navigation menu!',
                    'navigate' => null
                ];
            }
            
            return [
                'success' => true,
                'message' => 'I apologize, but I encountered an issue. Please try again.',
                'navigate' => null
            ];
        }
    }
    
    /**
     * Handle status check
     */
    private function handleStatus() {
        return [
            'success' => true,
            'configured' => !empty($this->config['apiKey']),
            'provider' => $this->config['provider'] ?? 'none'
        ];
    }
    
    /**
     * Load configuration from site JSON
     */
    private function loadConfig() {
        $this->config = null;
        
        $entryPath = 'definitions/entry.json';
        if (!file_exists($entryPath)) return;
        
        $entry = json_decode(file_get_contents($entryPath), true);
        $profileKey = $entry['default_profile'] ?? $entry['defaultProfile'] ?? 'profile_t1';
        
        if (isset($entry['profiles'][$profileKey]['profile'])) {
            $profileFile = $entry['profiles'][$profileKey]['profile'];
        } else {
            $profileFile = $profileKey . '.json';
        }
        
        $profilePath = 'definitions/profiles/' . $profileFile;
        if (!file_exists($profilePath)) return;
        
        $profile = json_decode(file_get_contents($profilePath), true);
        if (empty($profile['site'])) return;
        
        $sitePath = 'definitions/sites/' . $profile['site'];
        if (!file_exists($sitePath)) return;
        
        $site = json_decode(file_get_contents($sitePath), true);
        
        if (!empty($site['aiAssistant'])) {
            $this->config = $site['aiAssistant'];
        }
    }
    
    /**
     * Get profile path from entry.json
     */
    private function getProfilePath() {
        $entryPath = 'definitions/entry.json';
        if (!file_exists($entryPath)) return null;
        
        $entry = json_decode(file_get_contents($entryPath), true);
        $profileKey = $entry['default_profile'] ?? $entry['defaultProfile'] ?? 'profile_t1';
        
        if (isset($entry['profiles'][$profileKey]['profile'])) {
            $profileFile = $entry['profiles'][$profileKey]['profile'];
        } else {
            $profileFile = $profileKey . '.json';
        }
        
        return 'definitions/profiles/' . $profileFile;
    }

    /**
     * Build lightweight site structure (no heavy data)
     */
    private function buildSiteStructure() {
        $structure = [
            'pages' => [],
            'navigation' => [],
            'ownerName' => 'the portfolio owner'
        ];
        
        $profilePath = $this->getProfilePath();
        if (!$profilePath || !file_exists($profilePath)) return $structure;
        
        $profile = json_decode(file_get_contents($profilePath), true);
        
        // Load site navigation
        if (!empty($profile['site'])) {
            $sitePath = 'definitions/sites/' . $profile['site'];
            if (file_exists($sitePath)) {
                $site = json_decode(file_get_contents($sitePath), true);
                $structure['navigation'] = array_map(function($tab) {
                    return [
                        'label' => $tab['label'],
                        'target' => $tab['target'],
                        'tabId' => $tab['tabId'] ?? null
                    ];
                }, $site['navigation']['tabs'] ?? []);
            }
        }
        
        // Load page structures (lightweight - just containers and component types)
        if (!empty($profile['pages'])) {
            foreach ($profile['pages'] as $pageFile) {
                $pagePath = 'definitions/pages/' . $pageFile;
                if (file_exists($pagePath)) {
                    $pageData = json_decode(file_get_contents($pagePath), true);
                    $structure['pages'][$pageFile] = $this->extractPageStructure($pageData);
                    
                    // Extract owner name from hero if available
                    if ($structure['ownerName'] === 'the portfolio owner') {
                        $ownerName = $this->extractOwnerName($pageData);
                        if ($ownerName) $structure['ownerName'] = $ownerName;
                    }
                }
            }
        }
        
        return $structure;
    }
    
    /**
     * Extract lightweight page structure (containers + component types only)
     */
    private function extractPageStructure($pageData) {
        $structure = [];
        
        if (!empty($pageData['objects'])) {
            foreach ($pageData['objects'] as $object) {
                $structure[] = $this->extractObjectStructure($object);
            }
        }
        
        return $structure;
    }
    
    /**
     * Extract object structure recursively (no data content)
     */
    private function extractObjectStructure($object) {
        $struct = [
            'type' => $object['type'] ?? 'unknown',
            'id' => $object['id'] ?? null,
            'component' => $object['component'] ?? null,
            'parentTab' => $object['parentTab'] ?? null
        ];
        
        // Include children structure
        if (!empty($object['objects'])) {
            $struct['children'] = [];
            foreach ($object['objects'] as $child) {
                $struct['children'][] = $this->extractObjectStructure($child);
            }
        }
        
        return $struct;
    }
    
    /**
     * Extract owner name from page data
     */
    private function extractOwnerName($pageData) {
        if (empty($pageData['objects'])) return null;
        
        foreach ($pageData['objects'] as $object) {
            $name = $this->findOwnerNameInObject($object);
            if ($name) return $name;
        }
        return null;
    }
    
    /**
     * Recursively find owner name in object
     */
    private function findOwnerNameInObject($object) {
        if ($object['type'] === 'component') {
            $component = $object['component'] ?? '';
            if (strpos($component, 'heros') !== false) {
                $variant = $object['variant'] ?? 'main';
                $data = $object['data'][$variant] ?? [];
                if (!empty($data['name'])) return $data['name'];
            }
        }
        
        if (!empty($object['objects'])) {
            foreach ($object['objects'] as $child) {
                $name = $this->findOwnerNameInObject($child);
                if ($name) return $name;
            }
        }
        return null;
    }
    
    /**
     * Get detailed section data when AI requests it
     */
    private function getSectionData($section, $siteStructure) {
        $profilePath = $this->getProfilePath();
        if (!$profilePath || !file_exists($profilePath)) return null;
        
        $profile = json_decode(file_get_contents($profilePath), true);
        
        // Check if section is a page file
        if (strpos($section, '.json') !== false) {
            $pagePath = 'definitions/pages/' . $section;
            if (file_exists($pagePath)) {
                $pageData = json_decode(file_get_contents($pagePath), true);
                return $this->extractPageData($pageData);
            }
        }
        
        // Check if section is a component type (e.g., "skills", "projects")
        foreach ($profile['pages'] as $pageFile) {
            $pagePath = 'definitions/pages/' . $pageFile;
            if (file_exists($pagePath)) {
                $pageData = json_decode(file_get_contents($pagePath), true);
                $componentData = $this->findComponentData($pageData, $section);
                if ($componentData) return $componentData;
            }
        }
        
        return ['error' => 'Section not found: ' . $section];
    }
    
    /**
     * Extract full page data (with content)
     */
    private function extractPageData($pageData) {
        $data = [];
        
        if (!empty($pageData['objects'])) {
            foreach ($pageData['objects'] as $object) {
                $this->extractObjectData($object, $data);
            }
        }
        
        return $data;
    }
    
    /**
     * Recursively extract data from objects
     */
    private function extractObjectData($object, &$data) {
        if ($object['type'] === 'component') {
            $componentType = $object['component'] ?? '';
            $variant = $object['variant'] ?? 'main';
            $componentData = $object['data'][$variant] ?? [];
            
            // Map component types to data keys
            if (strpos($componentType, 'heros') !== false) {
                $data['hero'] = [
                    'name' => $componentData['name'] ?? '',
                    'title' => $componentData['title'] ?? '',
                    'description' => $componentData['description'] ?? ''
                ];
            } elseif (strpos($componentType, 'summaries') !== false) {
                $data['summary'] = $componentData['summary'] ?? '';
                $data['expertise'] = $componentData['expertise'] ?? [];
            } elseif (strpos($componentType, 'competencies') !== false) {
                // Extract skills from categories structure
                $skills = [];
                if (!empty($componentData['categories'])) {
                    foreach ($componentData['categories'] as $category) {
                        $categoryName = $category['title'] ?? 'General';
                        $categorySkills = [];
                        foreach ($category['skills'] ?? [] as $skill) {
                            $categorySkills[] = $skill['title'] ?? '';
                        }
                        $skills[$categoryName] = $categorySkills;
                    }
                }
                $data['competencies'] = $skills;
            } elseif (strpos($componentType, 'tools') !== false) {
                // Extract tools from categories structure
                $tools = [];
                if (!empty($componentData['categories'])) {
                    foreach ($componentData['categories'] as $category) {
                        $categoryName = $category['title'] ?? 'General';
                        $categoryTools = [];
                        foreach ($category['tools'] ?? [] as $tool) {
                            $categoryTools[] = $tool['name'] ?? '';
                        }
                        $tools[$categoryName] = $categoryTools;
                    }
                }
                $data['tools'] = $tools;
            } elseif (strpos($componentType, 'projects_grid') !== false) {
                $data['projects'] = array_map(function($p) {
                    return [
                        'name' => $p['name'] ?? '',
                        'description' => $p['description'] ?? '',
                        'technologies' => $p['technologies'] ?? []
                    ];
                }, $componentData['projects'] ?? []);
            } elseif (strpos($componentType, 'experience') !== false) {
                $data['experience'] = array_map(function($e) {
                    return [
                        'company' => $e['company'] ?? '',
                        'title' => $e['title'] ?? '',
                        'period' => ($e['startDate'] ?? '') . ' - ' . ($e['endDate'] ?? 'Present')
                    ];
                }, $componentData['experience'] ?? []);
            } elseif (strpos($componentType, 'education') !== false) {
                $data['education'] = array_map(function($e) {
                    return [
                        'institution' => $e['institution'] ?? '',
                        'degree' => $e['degree'] ?? '',
                        'field' => $e['field'] ?? ''
                    ];
                }, $componentData['education'] ?? []);
            } elseif (strpos($componentType, 'certifications') !== false) {
                $data['certifications'] = array_map(function($c) {
                    return [
                        'name' => $c['name'] ?? '',
                        'issuer' => $c['issuer'] ?? ''
                    ];
                }, $componentData['certifications'] ?? []);
            } elseif (strpos($componentType, 'project_hero') !== false) {
                $data['project_details'] = [
                    'title' => $componentData['title'] ?? '',
                    'description' => $componentData['description'] ?? '',
                    'technologies' => $componentData['technologies'] ?? [],
                    'status' => $componentData['status'] ?? ''
                ];
            }
        }
        
        if (!empty($object['objects'])) {
            foreach ($object['objects'] as $child) {
                $this->extractObjectData($child, $data);
            }
        }
    }
    
    /**
     * Find component data by type keyword
     */
    private function findComponentData($pageData, $keyword) {
        $data = [];
        $keyword = strtolower($keyword);
        
        if (!empty($pageData['objects'])) {
            foreach ($pageData['objects'] as $object) {
                $this->searchComponentData($object, $keyword, $data);
            }
        }
        
        return !empty($data) ? $data : null;
    }
    
    /**
     * Search for component data matching keyword
     */
    private function searchComponentData($object, $keyword, &$data) {
        if ($object['type'] === 'component') {
            $component = strtolower($object['component'] ?? '');
            if (strpos($component, $keyword) !== false) {
                $variant = $object['variant'] ?? 'main';
                $data[$object['id'] ?? 'component'] = $object['data'][$variant] ?? [];
            }
        }
        
        if (!empty($object['objects'])) {
            foreach ($object['objects'] as $child) {
                $this->searchComponentData($child, $keyword, $data);
            }
        }
    }

    /**
     * Create initial prompt with lightweight structure
     */
    private function createInitialPrompt($siteStructure) {
        $ownerName = $siteStructure['ownerName'];
        
        $prompt = "You ARE {$ownerName} - the owner of this portfolio website. Respond in FIRST PERSON.\n\n";
        
        $prompt .= "SITE STRUCTURE (pages and their components):\n";
        $prompt .= json_encode($siteStructure, JSON_PRETTY_PRINT) . "\n\n";
        
        $prompt .= "RESPONSE FORMAT - You MUST respond with valid JSON in ONE of these formats:\n\n";
        
        $prompt .= "1. If you need MORE INFORMATION to answer the user's question:\n";
        $prompt .= '{"type": "request", "section": "page_file_name.json"}' . "\n";
        $prompt .= "   - Request detailed data from a specific page\n";
        $prompt .= "   - You can make MULTIPLE requests (one at a time) to check different pages\n";
        $prompt .= "   - If first page doesn't have the answer, request another relevant page\n\n";
        
        $prompt .= "2. If you have ENOUGH INFORMATION to answer:\n";
        $prompt .= '{"type": "response", "message": "Your answer here", "navigate": "container-id-or-null"}' . "\n";
        $prompt .= "   - message: Your friendly response in first person\n";
        $prompt .= "   - navigate: A container ID to navigate to, or null\n\n";
        
        $prompt .= "SEARCH STRATEGY:\n";
        $prompt .= "- For 'did you work with X' or technology questions: check projects_page first\n";
        $prompt .= "- Each project has a 'technologies' array - SEARCH through it to find matches\n";
        $prompt .= "- If asked about a specific tech (e.g., PHP), find projects where that tech appears in technologies array\n";
        $prompt .= "- Don't list all projects - only list the ones that MATCH the query\n";
        $prompt .= "- If no match found in projects, check skills_page\n\n";
        
        $prompt .= "NAVIGATION RULES:\n";
        $prompt .= "- Navigate to the CONTAINER (with -main-container suffix) that holds the relevant component\n";
        $prompt .= "- For project details, use project-*-container IDs\n\n";
        
        $prompt .= "GUIDELINES:\n";
        $prompt .= "- For simple greetings, respond directly without requesting data\n";
        $prompt .= "- Be CONCISE - max 2-3 short sentences\n";
        $prompt .= "- FILTER data to answer the specific question - don't dump everything\n";
        $prompt .= "- Use markdown: **bold**, bullet lists with '- ' prefix\n";
        $prompt .= "- Offer to navigate for full details\n";
        
        return $prompt;
    }
    
    /**
     * Create follow-up prompt after receiving requested data
     */
    private function createFollowUpPrompt($siteStructure) {
        $ownerName = $siteStructure['ownerName'];
        
        $prompt = "You ARE {$ownerName}. Review the data you received.\n\n";
        $prompt .= "OPTIONS:\n";
        $prompt .= "1. If the data ANSWERS the question → respond with:\n";
        $prompt .= '   {"type": "response", "message": "Your answer", "navigate": "container-id-or-null"}' . "\n\n";
        $prompt .= "2. If the data DOESN'T contain the answer and you need to check another page → request it:\n";
        $prompt .= '   {"type": "request", "section": "another_page.json"}' . "\n\n";
        $prompt .= "Be concise. Use markdown for lists. Speak as yourself ({$ownerName}).\n";
        
        return $prompt;
    }
    
    /**
     * Build conversation prompt for API
     */
    private function buildConversationPrompt($systemPrompt, $chatHistory, $internalHistory, $userMessage, $round) {
        $fullPrompt = $systemPrompt . "\n\n";
        
        // Add previous chat history from client (for conversational context)
        if (!empty($chatHistory) && $round === 0) {
            $fullPrompt .= "PREVIOUS CONVERSATION:\n";
            foreach ($chatHistory as $entry) {
                $role = strtoupper($entry['role'] ?? 'user');
                $content = $entry['content'] ?? '';
                // Skip empty or system messages
                if (empty($content)) continue;
                $fullPrompt .= "{$role}: {$content}\n";
            }
            $fullPrompt .= "\n";
        }
        
        // Add internal history (data requests within this call)
        foreach ($internalHistory as $entry) {
            $role = strtoupper($entry['role']);
            $content = $entry['content'];
            $fullPrompt .= "{$role}: {$content}\n\n";
        }
        
        // Add current user message (only on first round)
        if ($round === 0) {
            $fullPrompt .= "CURRENT USER QUESTION: " . $userMessage . "\n\n";
        }
        
        $fullPrompt .= "YOUR RESPONSE (valid JSON only):";
        
        return $fullPrompt;
    }
    
    /**
     * Parse AI response
     */
    private function parseAiResponse($response) {
        // Try to parse as JSON
        $parsed = json_decode($response, true);
        
        if ($parsed && isset($parsed['type'])) {
            return $parsed;
        }
        
        // Try to extract JSON from response
        if (preg_match('/\{[^{}]*"type"[^{}]*\}/s', $response, $matches)) {
            $parsed = json_decode($matches[0], true);
            if ($parsed && isset($parsed['type'])) {
                return $parsed;
            }
        }
        
        // Fallback - treat as direct response
        return [
            'type' => 'response',
            'message' => $response,
            'navigate' => null
        ];
    }
    
    /**
     * Call LLM API
     */
    private function callLlmApi($prompt) {
        $provider = $this->config['provider'] ?? 'gemini';
        
        switch ($provider) {
            case 'gemini':
                return $this->callGeminiApi($prompt);
            case 'openai':
                return $this->callOpenAiApi($prompt);
            default:
                throw new Exception('Unknown LLM provider: ' . $provider);
        }
    }
    
    /**
     * Call Google Gemini API
     */
    private function callGeminiApi($prompt) {
        $apiKey = $this->config['apiKey'];
        $model = $this->config['model'] ?? 'gemini-2.5-flash';
        
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";
        
        $payload = [
            'contents' => [
                ['parts' => [['text' => $prompt]]]
            ],
            'generationConfig' => [
                'temperature' => 0.7,
                'maxOutputTokens' => $this->config['maxTokens'] ?? 1024,
                'responseMimeType' => 'application/json'
            ]
        ];
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 429) {
            error_log('Gemini API Rate Limit: ' . $response);
            throw new Exception('RATE_LIMIT_EXCEEDED');
        }
        
        if ($httpCode !== 200) {
            error_log('Gemini API Error: ' . $response);
            throw new Exception('API request failed with code ' . $httpCode);
        }
        
        $data = json_decode($response, true);
        return $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
    }
    
    /**
     * Call OpenAI API
     */
    private function callOpenAiApi($prompt) {
        $apiKey = $this->config['apiKey'];
        $model = $this->config['model'] ?? 'gpt-4o-mini';
        
        $url = 'https://api.openai.com/v1/chat/completions';
        
        $payload = [
            'model' => $model,
            'messages' => [
                ['role' => 'user', 'content' => $prompt]
            ],
            'max_tokens' => $this->config['maxTokens'] ?? 1024,
            'temperature' => 0.7,
            'response_format' => ['type' => 'json_object']
        ];
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $apiKey
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            error_log('OpenAI API Error: ' . $response);
            throw new Exception('API request failed with code ' . $httpCode);
        }
        
        $data = json_decode($response, true);
        return $data['choices'][0]['message']['content'] ?? '';
    }
}

// Handle request when included via API router
$action = $_GET['action'] ?? 'chat';
$requestData = json_decode(file_get_contents('php://input'), true) ?? [];

$endpoint = new AiAssistantEndpoint();
$response = $endpoint->handle($action, $requestData);

echo json_encode($response);
exit();

?>
