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
        const targetSection = document.getElementById(targetId);
        if(targetSection) {
            targetSection.style.display = 'block';
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ===============================
// NAVBAR SHADOW
// ===============================
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    navbar.style.boxShadow = window.scrollY > 50 
        ? '0 8px 20px rgba(0,0,0,0.2)' 
        : '0 4px 12px rgba(0,0,0,0.1)';
});

// ===============================
// MODAL
// ===============================
const cards = document.querySelectorAll('.card');
const modal = document.getElementById('mediaModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = modal.querySelector('.close');
const nextBtn = modal.querySelector('.next');
const prevBtn = modal.querySelector('.prev');

let currentMedia = [];
let currentIndex = 0;

// -------------------------------
// YouTube helper
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
// Create media container
// -------------------------------
let mediaContainer = document.createElement('div');
mediaContainer.id = 'mediaContainer';
mediaContainer.style.position = 'relative';
mediaContainer.style.width = '100%';
mediaContainer.style.textAlign = 'center';
modalContent.insertBefore(mediaContainer, closeBtn); // insert before close button

// -------------------------------
// Show media
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
        el.style.maxWidth = '100%';
        el.style.maxHeight = '80vh';
        el.style.display = 'block';
        el.style.margin = '0 auto';
    }

    mediaContainer.appendChild(el);
}

// -------------------------------
// Open modal
// -------------------------------
cards.forEach(card => {
    card.addEventListener('click', () => {
        let media = card.getAttribute('data-media') || card.getAttribute('data-images') || card.getAttribute('data-image');
        if (!media) return;

        currentMedia = media.split(',').map(m => m.trim());
        currentIndex = 0;
        showMedia(currentIndex);

        modal.style.display = 'flex';
        modal.classList.add('show');
    });
});

// -------------------------------
// Close modal
// -------------------------------
function closeModal() {
    modal.style.display = 'none';
    modal.classList.remove('show');
    mediaContainer.innerHTML = '';
}

closeBtn.addEventListener('click', closeModal);
modal.addEventListener('click', e => {
    if(e.target === modal) closeModal();
});

// -------------------------------
// Next / Prev buttons
// -------------------------------
nextBtn.addEventListener('click', () => {
    if(currentMedia.length === 0) return;
    currentIndex = (currentIndex + 1) % currentMedia.length;
    showMedia(currentIndex);
});

prevBtn.addEventListener('click', () => {
    if(currentMedia.length === 0) return;
    currentIndex = (currentIndex - 1 + currentMedia.length) % currentMedia.length;
    showMedia(currentIndex);
});