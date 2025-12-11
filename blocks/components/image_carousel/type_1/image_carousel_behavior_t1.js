/**
 * Image Carousel Component Behavior
 */

window.imageCarouselData = window.imageCarouselData || {};

function initializeImageCarousel(componentElement) {
    const component = componentElement || document.querySelector('.image-carousel-component');
    if (!component) return;

    const componentId = component.id;
    if (!window.imageCarouselData[componentId]) {
        window.imageCarouselData[componentId] = { currentIndex: 0 };
    }

    setupCarouselNavigation(component);
    setupCarouselLightbox(component);
}

function setupCarouselNavigation(component) {
    const prevBtn = component.querySelector('.image-carousel__nav--prev');
    const nextBtn = component.querySelector('.image-carousel__nav--next');

    if (prevBtn && !prevBtn.hasAttribute('data-listener')) {
        prevBtn.addEventListener('click', () => navigateCarouselSlide(component, -1));
        prevBtn.setAttribute('data-listener', 'true');
    }
    if (nextBtn && !nextBtn.hasAttribute('data-listener')) {
        nextBtn.addEventListener('click', () => navigateCarouselSlide(component, 1));
        nextBtn.setAttribute('data-listener', 'true');
    }
}

function setupCarouselLightbox(component) {
    let lightbox = component.querySelector('.image-carousel__lightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.className = 'image-carousel__lightbox';
        lightbox.innerHTML = '<button class="image-carousel__lightbox-close"><ion-icon name="close-outline"></ion-icon></button><img src="" alt="" />';
        component.appendChild(lightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.closest('.image-carousel__lightbox-close')) {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}

function navigateCarouselSlide(component, direction) {
    const state = window.imageCarouselData[component.id];
    const slides = component.querySelectorAll('.image-carousel__slide');
    if (!slides.length) return;

    let newIndex = state.currentIndex + direction;
    if (newIndex < 0) newIndex = slides.length - 1;
    if (newIndex >= slides.length) newIndex = 0;
    goToCarouselSlide(component, newIndex);
}

function goToCarouselSlide(component, index) {
    const state = window.imageCarouselData[component.id];
    const slidesContainer = component.querySelector('.image-carousel__slides');
    const thumbnails = component.querySelectorAll('.image-carousel__thumbnail');
    const currentEl = component.querySelector('.image-carousel__current');
    const captionEl = component.querySelector('.image-carousel__caption');

    state.currentIndex = index;
    if (slidesContainer) slidesContainer.style.transform = `translateX(-${index * 100}%)`;
    thumbnails.forEach((t, i) => t.classList.toggle('active', i === index));
    if (currentEl) currentEl.textContent = index + 1;
    if (captionEl && state.images && state.images[index]) {
        captionEl.textContent = state.images[index].caption || '';
    }
}

function setImageCarouselData(componentId, data) {
    window.imageCarouselData[componentId] = { currentIndex: 0, images: data.images || [], title: data.title || '' };
    const component = document.getElementById(componentId);
    if (component) renderImageCarousel(component, data);
}

function renderImageCarousel(component, data) {
    if (!component || !data) return;
    const images = data.images || [];

    const title = component.querySelector('.image-carousel__title');
    if (title) title.textContent = data.title || 'Gallery';

    const header = component.querySelector('.image-carousel__header');
    if (header) header.style.display = data.title ? 'flex' : 'none';

    const totalEl = component.querySelector('.image-carousel__total');
    if (totalEl) totalEl.textContent = images.length;

    const slidesContainer = component.querySelector('.image-carousel__slides');
    if (slidesContainer) {
        slidesContainer.innerHTML = images.map((img, i) => 
            `<div class="image-carousel__slide"><img src="${img.src}" alt="${img.alt || ''}" loading="lazy" /></div>`
        ).join('');
        slidesContainer.querySelectorAll('img').forEach(img => {
            img.addEventListener('click', () => {
                const lightbox = component.querySelector('.image-carousel__lightbox');
                if (lightbox) {
                    lightbox.querySelector('img').src = img.src;
                    lightbox.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        });
    }

    const thumbsContainer = component.querySelector('.image-carousel__thumbnails');
    if (thumbsContainer && images.length > 1) {
        thumbsContainer.innerHTML = images.map((img, i) => 
            `<button class="image-carousel__thumbnail ${i === 0 ? 'active' : ''}" data-index="${i}"><img src="${img.src}" alt="" /></button>`
        ).join('');
        thumbsContainer.querySelectorAll('.image-carousel__thumbnail').forEach(t => {
            t.addEventListener('click', () => goToCarouselSlide(component, parseInt(t.dataset.index)));
        });
        thumbsContainer.style.display = 'flex';
    } else if (thumbsContainer) {
        thumbsContainer.style.display = 'none';
    }

    const captionEl = component.querySelector('.image-carousel__caption');
    if (captionEl && images[0]) captionEl.textContent = images[0].caption || '';

    setupCarouselNavigation(component);
    setupCarouselLightbox(component);
}

function handleImageCarouselNavigation(elementId, state, parameters = {}) {
    const element = document.getElementById(elementId);
    if (!element) return false;

    switch (state) {
        case 'visible':
            element.style.display = 'block';
            element.classList.remove('nav-hidden');
            element.classList.add('nav-visible');
            initializeImageCarousel(element);
            break;
        case 'hidden':
            element.classList.remove('nav-visible');
            element.classList.add('nav-hidden');
            setTimeout(() => { if (element.classList.contains('nav-hidden')) element.style.display = 'none'; }, 300);
            break;
        case 'scrollTo':
            element.scrollIntoView({ behavior: 'smooth' });
            break;
    }
    return true;
}

window.initializeImageCarousel = initializeImageCarousel;
window.setImageCarouselData = setImageCarouselData;
window.handleImageCarouselNavigation = handleImageCarouselNavigation;
