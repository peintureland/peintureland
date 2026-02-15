// logo-loader.js - Updated for GSAP compatibility
class LogoLoader {
    constructor() {
        this.logo = document.querySelector('.logo');
        if (this.logo) {
            this.init();
        }
    }

    init() {
        // Remove old CSS animation classes
        if (this.logo) {
            this.logo.classList.remove('animate-float', 'animate-pulse-slow');
            
            // GSAP hover effect
            this.logo.addEventListener('mouseenter', () => {
                if (typeof gsap !== 'undefined') {
                    gsap.to(this.logo, {
                        rotation: 15,
                        scale: 1.1,
                        duration: 0.4,
                        ease: "back.out(1.7)"
                    });
                }
            });

            this.logo.addEventListener('mouseleave', () => {
                if (typeof gsap !== 'undefined') {
                    gsap.to(this.logo, {
                        rotation: 0,
                        scale: 1,
                        duration: 0.4,
                        ease: "power2.out"
                    });
                }
            });
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.logoLoader = new LogoLoader();
});