<?php
// loaders/projects/projects_list_loader_v1.php

// ✅ FLEXIBLE CONTENT LOADING: Support both API and direct include with content specification
$contentFile = '';

// Method 1: API call parameter (client-side dynamic)
if (isset($_GET['content'])) {
    $contentFile = $_GET['content'];
}
// Method 2: Include parameter (server-side rendered)
elseif (isset($CONTENT_FILE)) {
    $contentFile = $CONTENT_FILE;
}
// Method 3: Fallback to default
else {
    $contentFile = 'projects_list_data_v1';
}

// Ensure .json extension and build secure path
$contentFile = preg_replace('/\.json$/', '', $contentFile) . '.json';
$dataFile = __DIR__ . '/../../../contents/projects/projects_list/' . $contentFile;

$projectsData = [];

if (file_exists($dataFile)) {
    $json = file_get_contents($dataFile);
    $projectsData = json_decode($json, true);
} else {
    // Log error for debugging
    error_log("Content file not found: " . $dataFile);
}

// Get unique values for filtering
$categories = array_unique(array_column($projectsData, 'category'));
$statuses = array_unique(array_column($projectsData, 'status'));
$difficulties = array_unique(array_column($projectsData, 'difficulty'));
$technologies = [];

foreach ($projectsData as $project) {
    $technologies = array_merge($technologies, $project['technologies']);
}
$technologies = array_unique($technologies);

sort($categories);
sort($statuses);
sort($difficulties);
sort($technologies);

ob_start();
?>

<div class="projects-list-component">
    <?php if (!empty($projectsData)): ?>
        <!-- Unified Search and Filter Controls -->
        <div class="projects-controls">
            <div class="projects-unified-bar">
                <div class="projects-search-section">
                    <ion-icon name="search-outline"></ion-icon>
                    <input 
                        type="text" 
                        id="projectsSearchInput" 
                        placeholder="Search projects..."
                        autocomplete="off"
                    >
                    <button id="clearProjectsSearchBtn" style="display: none;">
                        <ion-icon name="close-outline"></ion-icon>
                    </button>
                </div>
                
                <div class="projects-filter-section">
                    <select id="filterTypeSelect">
                        <option value="">Filter by...</option>
                        <option value="category">Category</option>
                        <option value="status">Status</option>
                        <option value="difficulty">Difficulty</option>
                        <option value="technology">Technology</option>
                    </select>
                    
                    <select id="filterValueSelect" disabled>
                        <option value="">Select value...</option>
                    </select>
                    
                    <button id="addFilterBtn" disabled>
                        <ion-icon name="add-outline"></ion-icon>
                    </button>
                </div>
                
                <div class="projects-sort-section">
                    <select id="sortBy">
                        <option value="title">Sort by Title</option>
                        <option value="category">Sort by Category</option>
                        <option value="status">Sort by Status</option>
                        <option value="difficulty">Sort by Difficulty</option>
                        <option value="startDate">Sort by Start Date</option>
                        <option value="featured">Sort by Featured</option>
                    </select>
                    
                    <button id="sortOrderBtn" data-order="asc" title="Sort Order">
                        <ion-icon name="arrow-up-outline"></ion-icon>
                    </button>
                </div>
            </div>
            
            <!-- Applied Filters -->
            <div class="applied-filters" id="appliedFilters" style="display: none;">
                <span class="applied-filters-label">Active filters:</span>
                <div class="applied-filters-list" id="appliedFiltersList"></div>
                <button class="clear-all-filters" id="clearAllFiltersBtn">
                    <ion-icon name="close-outline"></ion-icon>
                    Clear all
                </button>
            </div>
        </div>

        <!-- Projects Grid Container -->
        <div class="projects-grid-container">
            <div class="projects-grid" id="projectsGrid">
                <?php foreach ($projectsData as $index => $project): ?>
                    <div class="project-card" 
                         data-project-id="<?= $project['id'] ?>"
                         data-title="<?= htmlspecialchars(strtolower($project['title'])) ?>"
                         data-category="<?= htmlspecialchars($project['category']) ?>"
                         data-status="<?= htmlspecialchars($project['status']) ?>"
                         data-difficulty="<?= htmlspecialchars($project['difficulty']) ?>"
                         data-technologies="<?= htmlspecialchars(implode(',', $project['technologies'])) ?>"
                         data-start-date="<?= htmlspecialchars($project['startDate']) ?>"
                         data-duration="<?= htmlspecialchars($project['duration']) ?>"
                         data-featured="<?= $project['featured'] ? 'true' : 'false' ?>"
                         onclick="openProjectModal(<?= $index ?>)">
                        
                        <div class="project-card-image">
                            <div class="project-image-placeholder">
                                <ion-icon name="folder-outline"></ion-icon>
                            </div>
                            
                            <!-- Floating Category Badge -->
                            <div class="project-category-floating">
                                <?= htmlspecialchars($project['category']) ?>
                            </div>
                        </div>
                        
                        <div class="project-card-content">
                            <h3 class="project-title"><?= htmlspecialchars($project['title']) ?></h3>
                            <p class="project-description"><?= htmlspecialchars(substr($project['description'], 0, 120)) ?>...</p>
                            
                            <div class="project-difficulty-text">
                                <?= htmlspecialchars($project['difficulty']) ?> Level
                            </div>
                            
                            <div class="project-card-footer">
                                <div class="project-links">
                                    <?php if ($project['githubUrl']): ?>
                                        <a href="<?= htmlspecialchars($project['githubUrl']) ?>" target="_blank" onclick="event.stopPropagation()" title="View Code">
                                            <ion-icon name="logo-github"></ion-icon>
                                        </a>
                                    <?php endif; ?>
                                    <?php if ($project['liveUrl']): ?>
                                        <a href="<?= htmlspecialchars($project['liveUrl']) ?>" target="_blank" onclick="event.stopPropagation()" title="Live Demo">
                                            <ion-icon name="open-outline"></ion-icon>
                                        </a>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
            
            <!-- Pagination Controls -->
            <div class="projects-pagination" id="projectsPagination">
                <button id="prevProjectsPageBtn" class="pagination-btn" disabled>
                    <ion-icon name="chevron-back-outline"></ion-icon>
                </button>
                
                <div class="pagination-dots" id="paginationDots"></div>
                
                <div class="pagination-info">
                    <span id="currentProjectsPageInfo">Page 1 of 1</span>
                </div>
                
                <button id="nextProjectsPageBtn" class="pagination-btn" disabled>
                    <ion-icon name="chevron-forward-outline"></ion-icon>
                </button>
            </div>
        </div>

        <!-- No Results -->
        <div class="projects-no-results" id="projectsNoResults" style="display: none;">
            <ion-icon name="search-outline"></ion-icon>
            <p>No projects found</p>
            <button id="clearProjectsFiltersBtn">Clear all filters</button>
        </div>

    <?php else: ?>
        <div class="projects-empty">
            <ion-icon name="folder-outline"></ion-icon>
            <p>No projects data available</p>
        </div>
    <?php endif; ?>
</div>

<!-- Project Details Modal -->
<div class="project-modal-overlay" id="projectModalOverlay" onclick="closeProjectModal()">
    <div class="project-modal" id="projectModal" onclick="event.stopPropagation()">
        <button class="project-modal-close" onclick="closeProjectModal()">
            <ion-icon name="close-outline"></ion-icon>
        </button>
        
        <div class="project-modal-header">
            <div class="project-modal-header-content">
                <div class="project-modal-image">
                    <div class="project-modal-image-placeholder">
                        <ion-icon name="folder-outline"></ion-icon>
                    </div>
                </div>
                
                <div class="project-modal-title-section">
                    <div class="project-modal-title">
                        <h2 id="modalProjectTitle">Project Title</h2>
                        <div class="project-modal-badges">
                            <span class="project-modal-status" id="modalProjectStatus">Status</span>
                            <span class="project-modal-difficulty" id="modalProjectDifficulty">Difficulty</span>
                        </div>
                    </div>
                    <div class="project-modal-meta">
                        <span class="project-modal-category" id="modalProjectCategory">Category</span>
                        <span class="project-modal-duration" id="modalProjectDuration">Duration</span>
                        <span class="project-modal-team" id="modalProjectTeam">Team Size</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="project-modal-body">
            <div class="project-modal-description" id="modalProjectDescription">
                Description will appear here...
            </div>
            
            <div class="project-modal-section">
                <h4>
                    <ion-icon name="code-outline"></ion-icon>
                    Technologies Used
                </h4>
                <div class="project-modal-technologies" id="modalProjectTechnologies"></div>
            </div>
            
            <div class="project-modal-section">
                <h4>
                    <ion-icon name="person-outline"></ion-icon>
                    Project Details
                </h4>
                <div class="project-modal-details">
                    <div class="detail-item">
                        <span class="detail-label">Role:</span>
                        <span class="detail-value" id="modalProjectRole">Role</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Start Date:</span>
                        <span class="detail-value" id="modalProjectStartDate">Date</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">End Date:</span>
                        <span class="detail-value" id="modalProjectEndDate">Date</span>
                    </div>
                </div>
            </div>
            
            <div class="project-modal-links" id="modalProjectLinks">
                <h4>
                    <ion-icon name="link-outline"></ion-icon>
                    Project Links
                </h4>
                <div class="project-modal-link-buttons">
                    <a id="modalGithubLink" href="#" target="_blank" style="display: none;">
                        <ion-icon name="logo-github"></ion-icon>
                        View Code
                    </a>
                    <a id="modalLiveLink" href="#" target="_blank" style="display: none;">
                        <ion-icon name="open-outline"></ion-icon>
                        Live Demo
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>

<?php
$output = ob_get_clean();
echo $output;
?> 