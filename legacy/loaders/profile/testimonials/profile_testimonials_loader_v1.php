<?php
// loaders/profile/testimonials/profile_testimonials_loader_v1.php

$dataFile = __DIR__ . '/../../../contents/profile/testimonials/profile_testimonials_data_v1.json';
$testimonialsData = [];

if (file_exists($dataFile)) {
    $json = file_get_contents($dataFile);
    $testimonialsData = json_decode($json, true);
}

// Function to render star rating
function renderStars($rating) {
    $stars = '';
    for ($i = 1; $i <= 5; $i++) {
        if ($i <= $rating) {
            $stars .= '<ion-icon name="star" class="star"></ion-icon>';
        } else {
            $stars .= '<ion-icon name="star-outline" class="star empty"></ion-icon>';
        }
    }
    return $stars;
}

// Function to format date
function formatTestimonialDate($dateString) {
    $date = new DateTime($dateString);
    return $date->format('M Y');
}

// Function to get placeholder avatar
function getPlaceholderAvatar($name) {
    $initials = '';
    $nameParts = explode(' ', $name);
    foreach ($nameParts as $part) {
        $initials .= strtoupper(substr($part, 0, 1));
    }
    $colors = ['#4F46E5', '#7C3AED', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];
    $color = $colors[array_rand($colors)];
    return "https://ui-avatars.com/api/?name=" . urlencode($initials) . "&background=" . substr($color, 1) . "&color=fff&size=80&bold=true";
}

ob_start();
?>

<div class="testimonials-component">
    <?php if (!empty($testimonialsData)): ?>
        
        <!-- Testimonials Slider -->
        <div class="testimonials-slider">
            <div class="slider-track" id="sliderTrack">
                <?php foreach ($testimonialsData as $index => $testimonial): ?>
                <div class="testimonial-slide">
                    <div class="testimonial-card">
                        
                        <!-- Floating Avatar -->
                        <div class="avatar-container">
                            <div class="client-avatar">
                                <ion-icon name="person-outline"></ion-icon>
                            </div>
                            <div class="client-info">
                                <h4 class="client-name"><?= htmlspecialchars($testimonial['clientName']) ?></h4>
                                <p class="client-role"><?= htmlspecialchars($testimonial['clientTitle']) ?></p>
                            </div>
                        </div>
                        
                        <!-- Main Content -->
                        <div class="testimonial-main">
                            <div class="quote-content">
                                <div class="quote-text" data-full-text="<?= htmlspecialchars($testimonial['testimonial']) ?>">
                                    "<?= htmlspecialchars(strlen($testimonial['testimonial']) > 150 ? substr($testimonial['testimonial'], 0, 150) . '...' : $testimonial['testimonial']) ?>"
                                </div>
                                <?php if (strlen($testimonial['testimonial']) > 150): ?>
                                <button class="read-more-btn">Read More</button>
                                <?php endif; ?>
                            </div>
                            <div class="rating-stars">
                                <?= renderStars($testimonial['rating']) ?>
                            </div>
                        </div>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
            
            <!-- Navigation -->
            <div class="slider-controls">
                <button class="nav-btn prev-btn" id="prevBtn">
                    <ion-icon name="chevron-back-outline"></ion-icon>
                </button>
                
                <div class="dots-container">
                    <?php foreach ($testimonialsData as $index => $testimonial): ?>
                    <button class="dot <?= $index === 0 ? 'active' : '' ?>" data-slide="<?= $index ?>"></button>
                    <?php endforeach; ?>
                </div>
                
                <button class="nav-btn next-btn" id="nextBtn">
                    <ion-icon name="chevron-forward-outline"></ion-icon>
                </button>
            </div>
            
            <!-- Counter -->
            <div class="slide-counter">
                <span id="currentSlide">1</span> / <span id="totalSlides"><?= count($testimonialsData) ?></span>
            </div>
        </div>

    <?php else: ?>
        <!-- Empty State -->
        <div class="testimonials-empty">
            <ion-icon name="chatbubbles-outline"></ion-icon>
            <h3>No testimonials available</h3>
            <p>Client testimonials will appear here once they're added.</p>
        </div>
    <?php endif; ?>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const sliderTrack = document.getElementById('sliderTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dots = document.querySelectorAll('.dot');
    const currentSlideSpan = document.getElementById('currentSlide');
    
    if (sliderTrack && dots.length > 0) {
        let currentSlide = 0;
        const totalSlides = dots.length;
        
        function updateSlider() {
            const translateX = -currentSlide * 100;
            sliderTrack.style.transform = `translateX(${translateX}%)`;
            
            // Update dots
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
            
            // Update buttons
            prevBtn.disabled = currentSlide === 0;
            nextBtn.disabled = currentSlide === totalSlides - 1;
            
            // Update counter
            currentSlideSpan.textContent = currentSlide + 1;
        }
        
        function nextSlide() {
            if (currentSlide < totalSlides - 1) {
                currentSlide++;
                updateSlider();
            }
        }
        
        function prevSlide() {
            if (currentSlide > 0) {
                currentSlide--;
                updateSlider();
            }
        }
        
        function goToSlide(slideIndex) {
            currentSlide = slideIndex;
            updateSlider();
        }
        
        // Event listeners
        nextBtn.addEventListener('click', nextSlide);
        prevBtn.addEventListener('click', prevSlide);
        
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => goToSlide(index));
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'ArrowRight') nextSlide();
        });
        
        // Auto-play
        let autoPlay = setInterval(() => {
            if (currentSlide === totalSlides - 1) {
                goToSlide(0);
            } else {
                nextSlide();
            }
        }, 5000);
        
        // Pause on hover
        sliderTrack.addEventListener('mouseenter', () => clearInterval(autoPlay));
        sliderTrack.addEventListener('mouseleave', () => {
            autoPlay = setInterval(() => {
                if (currentSlide === totalSlides - 1) {
                    goToSlide(0);
                } else {
                    nextSlide();
                }
            }, 5000);
        });
        
        // Initialize
        updateSlider();
    }
    
    // Read More functionality
    const readMoreBtns = document.querySelectorAll('.read-more-btn');
    
    readMoreBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const quoteText = this.parentElement.querySelector('.quote-text');
            const fullText = quoteText.getAttribute('data-full-text');
            const isExpanded = this.textContent === 'Read Less';
            
            if (isExpanded) {
                // Collapse
                const truncatedText = fullText.length > 150 ? fullText.substring(0, 150) + '...' : fullText;
                quoteText.textContent = '"' + truncatedText + '"';
                this.textContent = 'Read More';
            } else {
                // Expand
                quoteText.textContent = '"' + fullText + '"';
                this.textContent = 'Read Less';
            }
        });
    });
});
</script>

<?php
$output = ob_get_clean();
echo $output;
?> 