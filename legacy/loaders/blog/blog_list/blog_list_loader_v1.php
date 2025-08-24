<?php
// loaders/blog/blog_list/blog_list_loader_v1.php

$dataFile = __DIR__ . '/../../../contents/blog/blog_list/blog_list_data_v1.json';
$blogData = [];

if (file_exists($dataFile)) {
    $json = file_get_contents($dataFile);
    $blogData = json_decode($json, true);
}

// Sort blog posts by publish date (newest first) by default
usort($blogData, function($a, $b) {
    return strtotime($b['publishDate']) - strtotime($a['publishDate']);
});

// Get unique values for filtering
$categories = array_unique(array_column($blogData, 'category'));
$authors = array_unique(array_column($blogData, 'author'));
$tags = [];

foreach ($blogData as $post) {
    $tags = array_merge($tags, $post['tags']);
}
$tags = array_unique($tags);

sort($categories);
sort($authors);
sort($tags);

ob_start();
?>

<div class="blog-list-component">
    <?php if (!empty($blogData)): ?>
        <!-- Unified Search and Filter Controls -->
        <div class="blog-controls">
            <div class="blog-unified-bar">
                <div class="blog-search-section">
                    <ion-icon name="search-outline"></ion-icon>
                    <input 
                        type="text" 
                        id="blogSearchInput" 
                        placeholder="Search blog posts..."
                        autocomplete="off"
                    >
                    <button id="clearBlogSearchBtn" style="display: none;">
                        <ion-icon name="close-outline"></ion-icon>
                    </button>
                </div>
                
                <div class="blog-filter-section">
                    <select id="filterTypeSelect">
                        <option value="">Filter by...</option>
                        <option value="category">Category</option>
                        <option value="author">Author</option>
                        <option value="tag">Tag</option>
                        <option value="featured">Featured</option>
                    </select>
                    
                    <select id="filterValueSelect" disabled>
                        <option value="">Select value...</option>
                    </select>
                    
                    <button id="addFilterBtn" disabled>
                        <ion-icon name="add-outline"></ion-icon>
                    </button>
                </div>
                
                <div class="blog-sort-section">
                    <select id="sortBy">
                        <option value="publishDate">Sort by Date</option>
                        <option value="title">Sort by Title</option>
                        <option value="author">Sort by Author</option>
                        <option value="category">Sort by Category</option>
                        <option value="readTime">Sort by Read Time</option>
                        <option value="views">Sort by Views</option>
                        <option value="likes">Sort by Likes</option>
                    </select>
                    
                    <button id="sortOrderBtn" data-order="desc" title="Sort Order">
                        <ion-icon name="arrow-down-outline"></ion-icon>
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

        <!-- Blog Grid Container -->
        <div class="blog-grid-container">
            <div class="blog-grid" id="blogGrid">
                <?php foreach ($blogData as $index => $post): ?>
                    <article class="blog-card" 
                             data-post-id="<?= $post['id'] ?>"
                             data-title="<?= htmlspecialchars(strtolower($post['title'])) ?>"
                             data-category="<?= htmlspecialchars($post['category']) ?>"
                             data-author="<?= htmlspecialchars($post['author']) ?>"
                             data-tags="<?= htmlspecialchars(implode(',', $post['tags'])) ?>"
                             data-publish-date="<?= htmlspecialchars($post['publishDate']) ?>"
                             data-read-time="<?= htmlspecialchars($post['readTime']) ?>"
                             data-featured="<?= $post['featured'] ? 'true' : 'false' ?>"
                             data-views="<?= htmlspecialchars($post['views']) ?>"
                             data-likes="<?= htmlspecialchars($post['likes']) ?>">
                        
                        <?php if ($post['featured']): ?>
                            <div class="blog-featured-badge">
                                <ion-icon name="star"></ion-icon>
                                Featured
                            </div>
                        <?php endif; ?>
                        
                        <div class="blog-card-image">
                            <div class="blog-image-placeholder">
                                <ion-icon name="document-text-outline"></ion-icon>
                            </div>
                        </div>
                        
                        <div class="blog-card-content">
                            <h3 class="blog-title"><?= htmlspecialchars($post['title']) ?></h3>
                            <p class="blog-excerpt"><?= htmlspecialchars($post['excerpt']) ?></p>
                            
                            <div class="blog-read-more">
                                <a href="#" class="blog-read-more-btn">
                                    Read More
                                    <ion-icon name="arrow-forward-outline"></ion-icon>
                                </a>
                            </div>
                        </div>
                    </article>
                <?php endforeach; ?>
            </div>
            
            <!-- Pagination Controls -->
            <div class="blog-pagination" id="blogPagination">
                <button id="prevBlogPageBtn" class="pagination-btn" disabled>
                    <ion-icon name="chevron-back-outline"></ion-icon>
                </button>
                
                <div class="pagination-dots" id="paginationDots"></div>
                
                <div class="pagination-info">
                    <span id="currentBlogPageInfo">Page 1 of 1</span>
                </div>
                
                <button id="nextBlogPageBtn" class="pagination-btn" disabled>
                    <ion-icon name="chevron-forward-outline"></ion-icon>
                </button>
            </div>
        </div>

        <!-- No Results -->
        <div class="blog-no-results" id="blogNoResults" style="display: none;">
            <ion-icon name="search-outline"></ion-icon>
            <p>No blog posts found</p>
            <button id="clearBlogFiltersBtn">Clear all filters</button>
        </div>

    <?php else: ?>
        <div class="blog-empty">
            <ion-icon name="document-text-outline"></ion-icon>
            <p>No blog posts available</p>
        </div>
    <?php endif; ?>
</div>

<script>
// Store blog data for JavaScript access
window.blogData = <?= json_encode($blogData) ?>;
window.blogCategories = <?= json_encode($categories) ?>;
window.blogAuthors = <?= json_encode($authors) ?>;
window.blogTags = <?= json_encode($tags) ?>;
</script>

<?php
$output = ob_get_clean();
echo $output;
?> 