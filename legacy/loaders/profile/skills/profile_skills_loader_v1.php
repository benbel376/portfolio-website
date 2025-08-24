<?php
// loaders/profile/skills/profile_skills_loader_v1.php

$dataFile = __DIR__ . '/../../../contents/profile/skills/profile_skills_data_v1.json';
$skillsData = [];

if (file_exists($dataFile)) {
    $json = file_get_contents($dataFile);
    $skillsData = json_decode($json, true);
}

// Get unique categories for filtering
$categories = array_unique(array_column($skillsData, 'category'));
sort($categories);

ob_start();
?>

<div class="skills-component">
    <?php if (!empty($skillsData)): ?>
        <!-- Simple Controls -->
        <div class="skills-controls">
            <div class="skills-simple-bar">
                <!-- Search Section -->
                <div class="skills-search-section">
                    <ion-icon name="search-outline"></ion-icon>
                    <input 
                        type="text" 
                        id="skillsSearchInput" 
                        placeholder="Search skills..."
                        autocomplete="off"
                    >
                    <button id="clearSearchBtn" style="display: none;">
                        <ion-icon name="close-outline"></ion-icon>
                    </button>
                </div>
                
                <!-- Category Filter -->
                <div class="skills-filter-section">
                    <select id="categoryFilter">
                        <option value="">All Categories</option>
                        <?php foreach ($categories as $category): ?>
                            <option value="<?= htmlspecialchars($category) ?>"><?= htmlspecialchars($category) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
            </div>
        </div>

        <!-- Skills List Container -->
        <div class="skills-list-container">
            <div class="skills-list" id="skillsList">
                <?php foreach ($skillsData as $index => $skill): ?>
                    <div class="skill-item" 
                         data-skill-name="<?= htmlspecialchars(strtolower($skill['skillName'])) ?>"
                         data-category="<?= htmlspecialchars($skill['category']) ?>"
                         data-type="<?= htmlspecialchars($skill['type']) ?>"
                         data-proficiency="<?= htmlspecialchars($skill['proficiency']) ?>"
                         data-experience="<?= htmlspecialchars($skill['yearsOfExperience']) ?>"
                         data-index="<?= $index ?>"
                         onclick="openSkillModal(<?= $index ?>)">
                        
                        <div class="skill-icon" style="color: <?= htmlspecialchars($skill['color']) ?>">
                            <ion-icon name="<?= htmlspecialchars($skill['icon']) ?>"></ion-icon>
                        </div>
                        
                        <div class="skill-content">
                            <div class="skill-name"><?= htmlspecialchars($skill['skillName']) ?></div>
                        </div>
                        
                        <div class="skill-meta">
                            <span class="skill-type-tag skill-type-<?= strtolower($skill['type']) ?>">
                                <?= htmlspecialchars($skill['type']) ?>
                            </span>
                            <span class="skill-category"><?= htmlspecialchars($skill['category']) ?></span>
                        </div>
                        
                        <div class="skill-arrow">
                            <ion-icon name="chevron-forward-outline"></ion-icon>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
            
            <!-- Pagination Controls -->
            <div class="skills-pagination" id="skillsPagination">
                <button id="prevSkillsPageBtn" class="pagination-btn" disabled>
                    <ion-icon name="chevron-back-outline"></ion-icon>
                </button>
                
                <div class="pagination-dots" id="skillsPaginationDots"></div>
                
                <div class="pagination-info">
                    <span id="currentSkillsPageInfo">Page 1 of 1</span>
                </div>
                
                <button id="nextSkillsPageBtn" class="pagination-btn" disabled>
                    <ion-icon name="chevron-forward-outline"></ion-icon>
                </button>
            </div>
        </div>

        <!-- No Results -->
        <div class="skills-no-results" id="skillsNoResults" style="display: none;">
            <ion-icon name="search-outline"></ion-icon>
            <p>No skills found matching your criteria</p>
            <button id="clearFiltersBtn">Clear all filters</button>
        </div>

    <?php else: ?>
        <div class="skills-empty">
            <ion-icon name="code-outline"></ion-icon>
            <p>No skills data available</p>
        </div>
    <?php endif; ?>
</div>

<!-- Professional Skill Details Modal -->
<div class="skill-modal-overlay" id="skillModalOverlay" onclick="closeSkillModal()">
    <div class="skill-modal" id="skillModal" onclick="event.stopPropagation()">
        <button class="skill-modal-close" onclick="closeSkillModal()">
            <ion-icon name="close-outline"></ion-icon>
        </button>
        
        <div class="skill-modal-header">
            <div class="skill-modal-header-content">
                <div class="skill-modal-icon" id="modalSkillIcon">
                    <ion-icon name="code-outline"></ion-icon>
                </div>
                
                <div class="skill-modal-title-section">
                    <h3 id="modalSkillName">Skill Name</h3>
                    <div class="skill-modal-tags">
                        <span class="skill-modal-category" id="modalSkillCategory">Category</span>
                        <span class="skill-modal-type" id="modalSkillType">Type</span>
                        <span class="skill-modal-level" id="modalSkillLevel">Level</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="skill-modal-body">
            <div class="skill-modal-description" id="modalSkillDescription">
                Description will appear here...
            </div>
            
            <div class="skill-modal-section" id="modalProjectsSection" style="display: none;">
                <h4>
                    <ion-icon name="folder-outline"></ion-icon>
                    Projects
                </h4>
                <div class="skill-tags" id="modalProjects"></div>
            </div>
            
            <div class="skill-modal-section" id="modalCertificationsSection" style="display: none;">
                <h4>
                    <ion-icon name="ribbon-outline"></ion-icon>
                    Certifications
                </h4>
                <div class="skill-tags" id="modalCertifications"></div>
            </div>
        </div>
    </div>
</div>

<script>
// Store skills data for modal
window.skillsModalData = <?= json_encode($skillsData) ?>;

// Skills pagination and filtering
let currentSkillsPage = 1;
const skillsPerPage = 4;
let filteredSkills = [...window.skillsModalData];

// Modal functions
function openSkillModal(index) {
    const skill = window.skillsModalData[index];
    if (!skill) return;
    
    // Update modal content
    document.getElementById('modalSkillName').textContent = skill.skillName;
    document.getElementById('modalSkillCategory').textContent = skill.category;
    document.getElementById('modalSkillType').textContent = skill.type;
    document.getElementById('modalSkillLevel').textContent = skill.proficiency;
    document.getElementById('modalSkillDescription').textContent = skill.description || 'No description available.';
    
    // Update icon
    const modalIcon = document.getElementById('modalSkillIcon');
    modalIcon.innerHTML = `<ion-icon name="${skill.icon}"></ion-icon>`;
    modalIcon.style.color = skill.color;
    
    // Update projects section
    const projectsSection = document.getElementById('modalProjectsSection');
    const projectsContainer = document.getElementById('modalProjects');
    if (skill.projects && skill.projects.length > 0) {
        projectsContainer.innerHTML = skill.projects.map(project => 
            `<span class="skill-tag">${project}</span>`
        ).join('');
        projectsSection.style.display = 'block';
    } else {
        projectsSection.style.display = 'none';
    }
    
    // Update certifications section
    const certificationsSection = document.getElementById('modalCertificationsSection');
    const certificationsContainer = document.getElementById('modalCertifications');
    if (skill.certifications && skill.certifications.length > 0) {
        certificationsContainer.innerHTML = skill.certifications.map(cert => 
            `<span class="skill-tag">${cert}</span>`
        ).join('');
        certificationsSection.style.display = 'block';
    } else {
        certificationsSection.style.display = 'none';
    }
    
    // Show modal with proper display and class
    const modalOverlay = document.getElementById('skillModalOverlay');
    modalOverlay.style.display = 'flex';
    modalOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeSkillModal() {
    const modalOverlay = document.getElementById('skillModalOverlay');
    modalOverlay.classList.remove('show');
    document.body.style.overflow = 'auto';
    
    // Hide after animation
    setTimeout(() => {
        modalOverlay.style.display = 'none';
    }, 400);
}

// Pagination functions
function updateSkillsPagination() {
    const totalPages = Math.ceil(filteredSkills.length / skillsPerPage);
    const prevBtn = document.getElementById('prevSkillsPageBtn');
    const nextBtn = document.getElementById('nextSkillsPageBtn');
    const pageInfo = document.getElementById('currentSkillsPageInfo');
    const dotsContainer = document.getElementById('skillsPaginationDots');
    
    // Update buttons
    prevBtn.disabled = currentSkillsPage === 1;
    nextBtn.disabled = currentSkillsPage === totalPages || totalPages === 0;
    
    // Update page info
    pageInfo.textContent = `Page ${currentSkillsPage} of ${totalPages}`;
    
    // Update dots
    dotsContainer.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const dot = document.createElement('button');
        dot.className = `pagination-dot ${i === currentSkillsPage ? 'active' : ''}`;
        dot.onclick = () => goToSkillsPage(i);
        dotsContainer.appendChild(dot);
    }
    
    // Show/hide pagination
    const pagination = document.getElementById('skillsPagination');
    pagination.style.display = totalPages > 1 ? 'flex' : 'none';
}

function displaySkillsPage() {
    const startIndex = (currentSkillsPage - 1) * skillsPerPage;
    const endIndex = startIndex + skillsPerPage;
    const skillsToShow = filteredSkills.slice(startIndex, endIndex);
    
    const skillsList = document.getElementById('skillsList');
    const allSkills = skillsList.querySelectorAll('.skill-item');
    
    // Hide all skills
    allSkills.forEach(skill => skill.style.display = 'none');
    
    // Show skills for current page
    skillsToShow.forEach(skill => {
        const skillElement = skillsList.querySelector(`[data-index="${skill.originalIndex}"]`);
        if (skillElement) {
            skillElement.style.display = 'flex';
        }
    });
    
    updateSkillsPagination();
}

function goToSkillsPage(page) {
    currentSkillsPage = page;
    displaySkillsPage();
}

function applySkillsFilters() {
    const searchTerm = document.getElementById('skillsSearchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    filteredSkills = window.skillsModalData.filter((skill, index) => {
        const matchesSearch = !searchTerm || skill.skillName.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || skill.category === categoryFilter;
        
        if (matchesSearch && matchesCategory) {
            skill.originalIndex = index;
            return true;
        }
        return false;
    });
    
    currentSkillsPage = 1;
    displaySkillsPage();
    
    // Show/hide no results
    const noResults = document.getElementById('skillsNoResults');
    const skillsContainer = document.querySelector('.skills-list-container');
    if (filteredSkills.length === 0) {
        noResults.style.display = 'flex';
        skillsContainer.style.display = 'none';
    } else {
        noResults.style.display = 'none';
        skillsContainer.style.display = 'block';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add original indices to skills data
    window.skillsModalData.forEach((skill, index) => {
        skill.originalIndex = index;
    });
    
    filteredSkills = [...window.skillsModalData];
    displaySkillsPage();
    
    // Event listeners
    document.getElementById('skillsSearchInput').addEventListener('input', applySkillsFilters);
    document.getElementById('categoryFilter').addEventListener('change', applySkillsFilters);
    
    document.getElementById('prevSkillsPageBtn').addEventListener('click', () => {
        if (currentSkillsPage > 1) {
            goToSkillsPage(currentSkillsPage - 1);
        }
    });
    
    document.getElementById('nextSkillsPageBtn').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredSkills.length / skillsPerPage);
        if (currentSkillsPage < totalPages) {
            goToSkillsPage(currentSkillsPage + 1);
        }
    });
    
    document.getElementById('clearFiltersBtn').addEventListener('click', () => {
        document.getElementById('skillsSearchInput').value = '';
        document.getElementById('categoryFilter').value = '';
        applySkillsFilters();
    });
    
    // Clear search button
    const searchInput = document.getElementById('skillsSearchInput');
    const clearBtn = document.getElementById('clearSearchBtn');
    
    searchInput.addEventListener('input', function() {
        clearBtn.style.display = this.value ? 'block' : 'none';
    });
    
    clearBtn.addEventListener('click', function() {
        searchInput.value = '';
        this.style.display = 'none';
        applySkillsFilters();
    });
});
</script>

<?php
$output = ob_get_clean();
echo $output;
?> 