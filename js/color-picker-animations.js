// js/color-picker-animations.js - GSAP animations for color picker
class ColorPickerAnimations {
    constructor() {
        this.init();
    }

    init() {
        this.setupColorDropdown();
        this.setupColorSwatches();
    }

    setupColorDropdown() {
        const dropdownHeader = document.getElementById('colorDropdownHeader');
        const dropdown = document.getElementById('colorDropdown');
        
        if (dropdownHeader && dropdown) {
            dropdownHeader.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (dropdown.style.display === 'block') {
                    if (typeof gsap !== 'undefined' && gsap.to) {
                        gsap.to(dropdown, {
                            height: 0,
                            opacity: 0,
                            duration: 0.3,
                            ease: "power2.out",
                            onComplete: () => {
                                dropdown.style.display = 'none';
                            }
                        });
                    } else {
                        dropdown.style.display = 'none';
                        dropdown.style.height = '0';
                        dropdown.style.opacity = '0';
                    }
                } else {
                    dropdown.style.display = 'block';
                    if (typeof gsap !== 'undefined' && gsap.fromTo) {
                        gsap.fromTo(dropdown,
                            { height: 0, opacity: 0 },
                            { height: 'auto', opacity: 1, duration: 0.3, ease: "power2.out" }
                        );
                    } else {
                        dropdown.style.height = '';
                        dropdown.style.opacity = '1';
                    }
                }
            });
        }
    }

    setupColorSwatches() {
        document.querySelectorAll('.color-dropdown-option').forEach((option, index) => {
            option.style.opacity = '0';
            option.style.transform = 'translateX(-20px)';
            
            gsap.to(option, {
                opacity: 1,
                x: 0,
                duration: 0.3,
                delay: index * 0.05,
                ease: "power2.out"
            });

            option.addEventListener('click', (e) => {
                gsap.to(e.target, {
                    scale: 1.1,
                    duration: 0.2,
                    yoyo: true,
                    repeat: 1,
                    ease: "power2.inOut"
                });
            });
        });
    }
}

// Initialize on product page
if (window.location.pathname.includes('product.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            window.colorPickerAnimations = new ColorPickerAnimations();
        }, 1000); // Wait for color variants to load
    });
}