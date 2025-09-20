// ======================================== 
// PHOTO GALLERY LIGHTBOX
// ======================================== 

class PhotoGallery {
    constructor() {
        this.currentIndex = 0;
        this.photos = [];
        this.lightbox = null;
        this.lightboxImage = null;
        this.photoCounter = null;
        this.isOpen = false;
        
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadPhotos();
    }

    cacheElements() {
        this.lightbox = document.getElementById('photoLightbox');
        this.lightboxImage = document.getElementById('lightboxImage');
        this.photoCounter = document.getElementById('photoCounter');
        this.closeBtn = document.getElementById('closeLightbox');
        this.prevBtn = document.getElementById('prevPhoto');
        this.nextBtn = document.getElementById('nextPhoto');
        this.backdrop = document.querySelector('.lightbox-backdrop');
        
        this.photoItems = document.querySelectorAll('.photo-item');
    }

    bindEvents() {
        // Photo item clicks
        this.photoItems.forEach((item, index) => {
            item.addEventListener('click', () => this.openLightbox(index));
        });

        // Lightbox controls
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeLightbox());
        }

        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.previousPhoto());
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextPhoto());
        }

        // Backdrop click to close
        if (this.backdrop) {
            this.backdrop.addEventListener('click', () => this.closeLightbox());
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Prevent body scroll when lightbox is open
        document.addEventListener('touchmove', (e) => {
            if (this.isOpen) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    loadPhotos() {
        this.photos = Array.from(this.photoItems).map(item => {
            const img = item.querySelector('img');
            return {
                src: img.src,
                alt: img.alt || 'Wedding Photo',
                element: item
            };
        });
    }

    openLightbox(index) {
        this.currentIndex = index;
        this.isOpen = true;
        
        if (this.lightbox) {
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            
            // Show lightbox
            this.lightbox.classList.add('active');
            
            // Load image
            this.loadCurrentPhoto();
            
            // Update navigation
            this.updateNavigation();
            
            // Update counter
            this.updateCounter();
        }
    }

    closeLightbox() {
        this.isOpen = false;
        
        if (this.lightbox) {
            // Restore body scroll
            document.body.style.overflow = '';
            
            // Hide lightbox with animation
            this.lightbox.classList.remove('active');
        }
    }

    loadCurrentPhoto() {
        if (this.photos[this.currentIndex] && this.lightboxImage) {
            const photo = this.photos[this.currentIndex];
            
            // Add loading state
            this.lightboxImage.style.opacity = '0';
            
            // Create new image to preload
            const img = new Image();
            img.onload = () => {
                this.lightboxImage.src = photo.src;
                this.lightboxImage.alt = photo.alt;
                
                // Fade in with animation
                setTimeout(() => {
                    this.lightboxImage.style.opacity = '1';
                }, 50);
            };
            
            img.onerror = () => {
                console.error('Failed to load image:', photo.src);
                this.lightboxImage.alt = 'Failed to load image';
            };
            
            img.src = photo.src;
        }
    }

    nextPhoto() {
        if (this.currentIndex < this.photos.length - 1) {
            this.currentIndex++;
            this.loadCurrentPhoto();
            this.updateNavigation();
            this.updateCounter();
        }
    }

    previousPhoto() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.loadCurrentPhoto();
            this.updateNavigation();
            this.updateCounter();
        }
    }

    updateNavigation() {
        if (this.prevBtn) {
            this.prevBtn.disabled = this.currentIndex === 0;
        }
        
        if (this.nextBtn) {
            this.nextBtn.disabled = this.currentIndex === this.photos.length - 1;
        }
    }

    updateCounter() {
        if (this.photoCounter) {
            this.photoCounter.textContent = `${this.currentIndex + 1} / ${this.photos.length}`;
        }
    }

    handleKeyboard(e) {
        if (!this.isOpen) return;

        switch(e.key) {
            case 'Escape':
                this.closeLightbox();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.previousPhoto();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextPhoto();
                break;
        }
    }

    // Public method to refresh gallery if photos are added dynamically
    refresh() {
        this.loadPhotos();
        this.cacheElements();
    }

    // Public method to go to specific photo
    goToPhoto(index) {
        if (index >= 0 && index < this.photos.length) {
            this.openLightbox(index);
        }
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if gallery exists on page
    if (document.querySelector('.photo-gallery')) {
        window.photoGallery = new PhotoGallery();
        console.log('📸 Photo Gallery initialized successfully!');
    }
});

// Export for external use
if (typeof window !== 'undefined') {
    window.PhotoGallery = PhotoGallery;
}
