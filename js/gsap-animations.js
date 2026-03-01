// js/gsap-animations.js - FIXED with proper opacity handling
class GsapAnimations {
    constructor() {
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.isInitialized = false;

        // Init animations as soon as DOM + GSAP are ready
        requestAnimationFrame(() => {
            this.initAfterLoader();
        });

        // OPTIONAL: if loader exists, sync with it (non-blocking)
        window.addEventListener('paintLoaderComplete', () => {
            this.finishLoaderVisuals();
        });
    }
    
    initAfterLoader() {
        if (this.isInitialized) return;

        // 🔓 IMMEDIATELY unlock page
        document.body.classList.remove('loader-active');
        document.body.classList.add('loader-complete');
        document.body.style.overflow = '';

        // 🚀 Init animations AFTER paint (non-blocking)
        requestIdleCallback(() => {
            if (!this.prefersReducedMotion) {
                this.init();
            } else {
                this.enableReducedMotionMode();
            }
        });

        this.isInitialized = true;
        console.log('GSAP animations initialized');
    }

    finishLoaderVisuals() {
        document.body.classList.add('loader-complete');
    }

    init() {
        console.log('GSAP Animations initialized');
        this.isInitialized = true;
        
        // Wait a bit for DOM to be fully ready
        setTimeout(() => {
            // Core animations
            this.initPageEntrance();
            this.initHoverEffects();
            
            // Initialize scroll animations after a short delay
            setTimeout(() => {
                this.initScrollAnimations();
            }, 100);
            
            // Page-specific animations
            this.detectPageAndAnimate();
            
            // Setup dynamic content handler
            this.setupDynamicContentHandler();
        }, 50);
    }

    enableReducedMotionMode() {
        // Remove will-animate class for reduced motion users
        document.querySelectorAll('.will-animate').forEach(el => {
            el.classList.remove('will-animate');
        });
    }



    // ===== CORE ANIMATIONS =====
    initPageEntrance() {
        // Body fade in
        gsap.fromTo('body',
            { opacity: 0 },
            { opacity: 1, duration: 0.6, ease: "power2.out" }
        );

        // Header animation
        gsap.from('.header', {
            y: -30,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
            delay: 0.2
        });

        // Logo animation
        const logo = document.querySelector('.logo');
        if (logo) {
            gsap.from(logo, {
                scale: 0.8,
                opacity: 0,
                duration: 0.7,
                ease: "back.out(1.7)",
                delay: 0.3
            });
        }
    }

    // Add this method to your GsapAnimations class
    animateHeroSection() {
        if (!document.querySelector('.hero')) return;
        
        // Create a timeline for hero animations
        const heroTimeline = gsap.timeline({
            defaults: { ease: "power2.out" }
        });
        
        // 1. Paint drip accents
        heroTimeline
            .to('.paint-drip-accent', {
                height: 100,
                opacity: 0.6,
                duration: 1.2,
                stagger: 0.2,
                ease: "power2.inOut"
            })
            .to('.paint-drip-accent', {
                height: 0,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "power2.in",
                delay: 0.5
            }, "+=0.3");
        
        // 2. Logo entrance
        heroTimeline.from('.hero-logo', {
            y: -30,
            opacity: 0,
            duration: 0.8,
            ease: "back.out(1.7)"
        }, "-=0.5");
        
        // 3. Tagline
        heroTimeline.from('.hero-tagline', {
            y: 20,
            opacity: 0,
            duration: 0.7
        }, "-=0.3");
        
        // 4. Main title (staggered lines)
        heroTimeline.from('.title-line-1', {
            y: 40,
            opacity: 0,
            duration: 0.9,
            ease: "power3.out"
        }, "-=0.2");
        
        heroTimeline.from('.title-line-2', {
            y: 40,
            opacity: 0,
            duration: 0.9,
            ease: "power3.out"
        }, "-=0.5");
        
        // 5. Divider
        heroTimeline.from('.hero-divider', {
            scaleX: 0,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out"
        }, "-=0.3");
        
        // 6. Description
        heroTimeline.from('.hero-description', {
            y: 20,
            opacity: 0,
            duration: 0.7
        }, "-=0.2");
        
        // 7. Buttons
        heroTimeline.from('.hero-actions', {
            y: 20,
            opacity: 0,
            duration: 0.6
        }, "-=0.1");
        
        // 8. Scroll indicator
        heroTimeline.from('.scroll-indicator', {
            y: 20,
            opacity: 0,
            duration: 0.5,
            delay: 0.5
        });
        
        // 9. Subtle continuous animations
        heroTimeline.to('.hero-logo-img', {
            rotation: 360,
            duration: 20,
            repeat: -1,
            ease: "none"
        }, "+=1");
        
        // Button hover effects with GSAP
        document.querySelectorAll('.btn-hero').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                gsap.to(btn, {
                    scale: 1.05,
                    duration: 0.2,
                    ease: "power2.out"
                });
            });
            
            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, {
                    scale: 1,
                    duration: 0.2,
                    ease: "power2.out"
                });
            });
        });
        
        return heroTimeline;
    }

    // Update your detectPageAndAnimate method to include hero animations
    detectPageAndAnimate() {
        const path = window.location.pathname;
        
        if (path.includes('index.html') || path === '/') {
            this.animateHeroSection(); // Call the new hero animation
            this.animateIndexPage();
        } else if (path.includes('product.html')) {
            this.animateProductPage();
        } else if (path.includes('brand.html')) {
            this.animateBrandPage();
        } else if (path.includes('cart.html')) {
            this.animateCartPage();
        } else if (path.includes('checkout.html')) {
            this.animateCheckoutPage();
        } else if (path.includes('material.html')) {
            this.animateMaterialPage();
        }
    }




    initHoverEffects() {
        // Card hover effects - only if GSAP is available
        const cards = document.querySelectorAll('.brand-card, .product-card, .material-card, .cart-item, .related-product-card');
        
        cards.forEach(card => {
            // Don't add will-animate here - it's already in HTML/JS
            
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    scale: 1.03,
                    y: -5,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
            
            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    scale: 1,
                    y: 0,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
        });

        // Button hover effects
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                gsap.to(btn, { scale: 1.05, duration: 0.2 });
            });
            
            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, { scale: 1, duration: 0.2 });
            });
        });
    }

    // ===== SCROLL-TRIGGERED ANIMATIONS - FIXED =====
    initScrollAnimations() {
        if (typeof ScrollTrigger !== 'undefined') {
            // Register ScrollTrigger plugin
            gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
            
            console.log('Initializing ScrollTrigger animations...');
            
            // 1. ANIMATE SECTION TITLES
            this.animateSectionTitles();
            
            // 2. ANIMATE ALL CARD GRIDS
            this.animateCardGrids();
            
            // 3. ANIMATE OTHER PAGE ELEMENTS
            this.animatePageSpecificElements();
            
            // Refresh ScrollTrigger
            setTimeout(() => {
                ScrollTrigger.refresh();
                console.log('ScrollTrigger refreshed');
            }, 200);
        } else {
            console.warn('ScrollTrigger not loaded, falling back to basic animations');
            this.fallbackAnimations();
        }
    }

    animateSectionTitles() {
        // Section title animations
        const titles = document.querySelectorAll('.section-title');
        if (titles.length > 0) {
            titles.forEach(title => {
                gsap.from(title, {
                    scrollTrigger: {
                        trigger: title,
                        start: 'top 85%',
                        toggleActions: 'play none none none',
                        markers: false
                    },
                    x: -30,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.out"
                });
            });
        }

        // Subtle premium animation for the brands heading
        const brandsHeading = document.querySelector('.brands-section h2');
        if (brandsHeading) {
            gsap.fromTo(brandsHeading,
                { opacity: 0, scale: 0.95 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: brandsHeading,
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }
        /* GSAP Scroll Animation */
        gsap.to(".materials-section h2", {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: ".materials-section h2",
                start: "top 85%",
                toggleActions: "play none none none",
            }
        });

    }

    animateCardGrids() {
        // Define all card grid selectors
        const gridConfigs = [
            {
                selector: '.brands-grid',
                itemSelector: '.brand-card',
                stagger: 0.1,
                yOffset: 30
            },
            {
                selector: '.materials-grid', 
                itemSelector: '.material-card',
                stagger: 0.1,
                yOffset: 30
            },
            {
                selector: '.products-grid',
                itemSelector: '.product-card',
                stagger: 0.08,
                yOffset: 25
            },
            {
                selector: '.brand-products',
                itemSelector: '.product-card',
                stagger: 0.08,
                yOffset: 25
            },
            {
                selector: '.related-products-grid',
                itemSelector: '.related-product-card',
                stagger: 0.1,
                yOffset: 20
            },
            {
                selector: '.related-grid',
                itemSelector: '.material-card, .product-card',
                stagger: 0.1,
                yOffset: 25
            }
        ];

        gridConfigs.forEach(config => {
            const grid = document.querySelector(config.selector);
            if (grid) {
                const items = grid.querySelectorAll(config.itemSelector);
                if (items.length > 0) {
                    console.log(`Animating ${items.length} items in ${config.selector}`);
                    
                    // Set initial state for each item
                    gsap.set(items, {
                        opacity: 0,
                        y: config.yOffset
                    });
                    
                    // Create the animation
                    gsap.to(items, {
                        scrollTrigger: {
                            trigger: grid,
                            start: 'top 80%',
                            end: 'bottom 60%',
                            toggleActions: 'play none none none',
                            once: true
                        },
                        opacity: 1,
                        y: 0,
                        duration: 0.7,
                        stagger: config.stagger,
                        ease: "power2.out",
                        onComplete: () => {
                            // Clean up after animation
                            gsap.set(items, { clearProps: "opacity,transform" });
                        }
                    });
                }
            }
        });
    }

    animatePageSpecificElements() {
        // Product page animations
        if (window.location.pathname.includes('product.html')) {
            this.animateProductPage();
        }
        
        // Cart page animations
        if (window.location.pathname.includes('cart.html')) {
            this.animateCartPage();
        }
        
        // Checkout page animations
        if (window.location.pathname.includes('checkout.html')) {
            this.animateCheckoutPage();
        }
    }

    animateProductPage() {
        // Product image animation
        const mainImage = document.querySelector('.product-main-image');
        if (mainImage) {
            gsap.from(mainImage, {
                scrollTrigger: {
                    trigger: mainImage,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                scale: 0.9,
                opacity: 0,
                duration: 0.8,
                ease: "power2.out"
            });
        }

        // Color picker section
        const colorSection = document.getElementById('colorSection');
        if (colorSection && colorSection.style.display !== 'none') {
            gsap.from(colorSection, {
                scrollTrigger: {
                    trigger: colorSection,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                y: 20,
                opacity: 0,
                duration: 0.6,
                ease: "power2.out"
            });
        }
    }

    animateCartPage() {
        // Cart items
        const cartItems = document.querySelectorAll('.cart-item');
        if (cartItems.length > 0) {
            gsap.set(cartItems, { opacity: 0, x: 30 });
            
            gsap.to(cartItems, {
                scrollTrigger: {
                    trigger: '.cart-container',
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                opacity: 1,
                x: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: "power2.out"
            });
        }
    }

    animateCheckoutPage() {
        // Form groups
        const formGroups = document.querySelectorAll('.form-group');
        if (formGroups.length > 0) {
            gsap.set(formGroups, { opacity: 0, y: 20 });
            
            gsap.to(formGroups, {
                scrollTrigger: {
                    trigger: '.checkout-form',
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: "power2.out"
            });
        }
    }

    // ===== FALLBACK ANIMATIONS =====
    fallbackAnimations() {
        // If ScrollTrigger fails, still animate cards on page load
        const allCards = document.querySelectorAll('.brand-card, .product-card, .material-card, .related-product-card');
        
        if (allCards.length > 0) {
            gsap.set(allCards, { opacity: 0, y: 20 });
            
            gsap.to(allCards, {
                opacity: 1,
                y: 0,
                duration: 0.7,
                stagger: 0.1,
                delay: 0.5,
                ease: "power2.out",
                onComplete: () => {
                    gsap.set(allCards, { clearProps: "opacity,transform" });
                }
            });
        }
    }

    // ===== DYNAMIC CONTENT HANDLER =====
    setupDynamicContentHandler() {
        // Refresh animations when new content loads
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length > 0) {
                    setTimeout(() => {
                        this.refreshAnimations();
                    }, 100);
                }
            });
        });

        // Observe main content containers
        const containers = ['brandsGrid', 'materialsGrid', 'productsGrid', 'brand-products'];
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                observer.observe(container, { childList: true, subtree: true });
            }
        });
    }

    // ===== PUBLIC METHODS =====
    refreshAnimations() {
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
            console.log('ScrollTrigger refreshed');
        }
        
        // Re-animate any new cards
        const newCards = document.querySelectorAll('.brand-card:not(.animated), .product-card:not(.animated), .material-card:not(.animated)');
        if (newCards.length > 0) {
            gsap.set(newCards, { opacity: 0, y: 20 });
            
            gsap.to(newCards, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "power2.out",
                onComplete: () => {
                    newCards.forEach(card => card.classList.add('animated'));
                    gsap.set(newCards, { clearProps: "opacity,transform" });
                }
            });
        }
    }

    // ===== PAGE DETECTION =====
    detectPageAndAnimate() {
        const path = window.location.pathname;
        
        if (path.includes('index.html') || path === '/') {
            this.animateIndexPage();
        }
    }

    animateIndexPage() {
        // Hero section animations
        const heroTitle = document.querySelector('.hero h2');
        const heroText = document.querySelector('.hero p');
        
        if (heroTitle) {
            gsap.from(heroTitle, {
                y: 40,
                opacity: 0,
                duration: 0.9,
                ease: "power3.out",
                delay: 0.5
            });
        }
        
        if (heroText) {
            gsap.from(heroText, {
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out",
                delay: 0.7
            });
        }
    }



    
    // ===== INTERACTION ANIMATIONS =====
    initCartInteraction() {
        // Cart icon animation when adding items
        document.addEventListener('click', (e) => {
            const addToCartBtn = e.target.closest('.add-to-cart');
            if (addToCartBtn) {
                const cartIcon = document.querySelector('.cart-link i');
                if (cartIcon) {
                    gsap.to(cartIcon, {
                        scale: 1.4,
                        duration: 0.2,
                        yoyo: true,
                        repeat: 1,
                        ease: "power2.inOut"
                    });
                }

                // Button feedback
                gsap.to(addToCartBtn, {
                    scale: 1.1,
                    duration: 0.1,
                    yoyo: true,
                    repeat: 1,
                    ease: "power2.inOut"
                });
            }
        });
    }
}

// ===== INITIALIZATION =====
// Wait for DOM and GSAP to be ready
function initializeGsapAnimations() {
    if (typeof gsap === 'undefined') {
        console.error('GSAP not loaded!');
        return;
    }
    
    // Don't create instance here, let the constructor handle it
    window.gsapAnimations = new GsapAnimations();
}

// Initialize when everything is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGsapAnimations);
} else {
    initializeGsapAnimations();
}