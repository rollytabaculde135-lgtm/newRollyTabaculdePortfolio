// ===============================
// NAVIGATION
// ===============================
const sections = document.querySelectorAll('#home, #projects, #about, #contacts');
const navLinks = document.querySelectorAll('nav a');

navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        
        sections.forEach(s => s.style.display = 'none');
        
        // Update navigation ARIA attributes
        navLinks.forEach(l => {
            l.removeAttribute('aria-current');
            l.classList.remove('active');
        });
        this.setAttribute('aria-current', 'page');
        this.classList.add('active');

        const targetSection = document.getElementById(targetId);
        if(targetSection) {
            targetSection.style.display = 'block';
            targetSection.scrollIntoView({ behavior: 'smooth' });
            
            // Focus target section/heading for keyboard users
            const heading = targetSection.querySelector('h1, h2');
            if(heading) {
                heading.setAttribute('tabindex', '-1');
                heading.focus();
            }
        }
    });
});

// ===============================
// NAVBAR SHADOW
// ===============================
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) {
        navbar.style.boxShadow = window.scrollY > 50 
            ? '0 8px 20px rgba(0,0,0,0.2)' 
            : '0 4px 12px rgba(0,0,0,0.1)';
    }
});

// ===============================
// MODAL & ACCESSIBILITY MANAGEMENT
// ===============================
const cards = document.querySelectorAll('.card');
const modal = document.getElementById('mediaModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = modal ? modal.querySelector('.close') : null;
const nextBtn = modal ? modal.querySelector('.next') : null;
const prevBtn = modal ? modal.querySelector('.prev') : null;

let currentMedia = [];
let currentIndex = 0;
let lastFocusedElement = null; // Store trigger element to restore focus on close

// -------------------------------
// YouTube Helper
// -------------------------------
function isYouTube(url) {
    return url.includes('youtube.com') || url.includes('youtu.be');
}

function getYouTubeEmbed(url) {
    let videoId = '';
    if(url.includes('youtu.be')) videoId = url.split('/').pop();
    else videoId = new URL(url).searchParams.get('v');
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
}

// -------------------------------
// Create Media Container
// -------------------------------
let mediaContainer = document.createElement('div');
mediaContainer.id = 'mediaContainer';
mediaContainer.style.position = 'relative';
mediaContainer.style.width = '100%';
mediaContainer.style.textAlign = 'center';

if (modalContent && closeBtn) {
    modalContent.insertBefore(mediaContainer, closeBtn); // insert before close button
}

// -------------------------------
// Show Media
// -------------------------------
function showMedia(index) {
    // Clear previous media only
    mediaContainer.innerHTML = '';

    const src = currentMedia[index];
    let el;

    if(isYouTube(src)) {
        el = document.createElement('iframe');
        el.src = getYouTubeEmbed(src);
        el.width = '100%';
        el.height = '450px';
        el.title = 'Project Video Content';
        el.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        el.allowFullscreen = true;
        el.style.border = 'none';
        el.style.pointerEvents = 'auto';
    } else if(src.match(/\.(mp4|webm|ogg)$/i)) {
        el = document.createElement('video');
        el.src = src;
        el.controls = true;
        el.autoplay = true;
        el.style.maxWidth = '100%';
        el.style.maxHeight = '80vh';
        el.style.display = 'block';
        el.style.margin = '0 auto';
    } else {
        el = document.createElement('img');
        el.src = src;
        el.alt = 'Project Media Preview Image';
        el.style.maxWidth = '100%';
        el.style.maxHeight = '80vh';
        el.style.display = 'block';
        el.style.margin = '0 auto';
    }

    mediaContainer.appendChild(el);
}

// -------------------------------
// Open Modal
// -------------------------------
function openCardModal(card) {
    let media = card.getAttribute('data-media') || card.getAttribute('data-images') || card.getAttribute('data-image');
    if (!media) return;

    lastFocusedElement = card; // Store card element for focus restoration
    currentMedia = media.split(',').map(m => m.trim());
    currentIndex = 0;
    showMedia(currentIndex);

    modal.style.display = 'flex';
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');

    // Shift focus to close button inside modal
    if (closeBtn) closeBtn.focus();
}

cards.forEach(card => {
    // Mouse Click Handler
    card.addEventListener('click', () => openCardModal(card));

    // Keyboard Activation Handler (Enter / Space)
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openCardModal(card);
        }
    });
});

// -------------------------------
// Close Modal
// -------------------------------
function closeModal() {
    if (!modal) return;
    modal.style.display = 'none';
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    mediaContainer.innerHTML = '';

    // Restore focus back to original trigger element
    if (lastFocusedElement) {
        lastFocusedElement.focus();
    }
}

if (closeBtn) closeBtn.addEventListener('click', closeModal);

if (modal) {
    modal.addEventListener('click', e => {
        if(e.target === modal) closeModal();
    });
}

// -------------------------------
// Next / Prev Navigation
// -------------------------------
function showNextMedia() {
    if(currentMedia.length === 0) return;
    currentIndex = (currentIndex + 1) % currentMedia.length;
    showMedia(currentIndex);
}

function showPrevMedia() {
    if(currentMedia.length === 0) return;
    currentIndex = (currentIndex - 1 + currentMedia.length) % currentMedia.length;
    showMedia(currentIndex);
}

if (nextBtn) nextBtn.addEventListener('click', showNextMedia);
if (prevBtn) prevBtn.addEventListener('click', showPrevMedia);

// -------------------------------
// Global Keyboard Navigation & Focus Trap (Operable)
// -------------------------------
document.addEventListener('keydown', (e) => {
    if (!modal || modal.style.display !== 'flex') return;

    // ESC Key -> Close Modal
    if (e.key === 'Escape') {
        closeModal();
        return;
    }

    // Arrow Keys -> Navigate Media
    if (e.key === 'ArrowRight') {
        showNextMedia();
    } else if (e.key === 'ArrowLeft') {
        showPrevMedia();
    }

    // Focus Trap inside Modal
    if (e.key === 'Tab') {
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([-tabindex="-1"])');
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }
});
