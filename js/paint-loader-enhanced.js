// js/paint-loader-enhanced.js - Updated to show on every page load
class PaintBucketLoaderEnhanced {
    constructor() {
        this.loaderDuration = 2000; // 2 seconds (shorter for frequent page loads)
        this.primaryColor = '#00E0FF';
        this.secondaryColor = '#FFB000';
        this.backgroundColor = '#0B0D10';
        this.textColor = '#EAEAEA';
        this.splashes = [];
        
        // Add loading class to body immediately
        document.body.classList.add('loader-active');
        document.body.style.overflow = 'hidden';
        
        this.createLoader();
        this.animate();
    }
    
    createLoader() {
        // Check if loader already exists (in case of rapid clicks)
        const existingLoader = document.getElementById('paint-bucket-loader');
        if (existingLoader) {
            existingLoader.remove();
        }
        
        // Create loader container
        this.loaderContainer = document.createElement('div');
        this.loaderContainer.id = 'paint-bucket-loader';
        this.loaderContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${this.backgroundColor};
            z-index: 9999;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            overflow: hidden;
        `;
        
        // Create paint splash background container
        this.createSplashBackground();
        
        // Create paint bucket
        this.createPaintBucket();
        
        // Create loading text
        this.createLoadingText();
        
        // Add to body
        document.body.appendChild(this.loaderContainer);
    }
    
    createSplashBackground() {
        this.splashContainer = document.createElement('div');
        this.splashContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;
        
        // Create initial splashes
        this.createInitialSplashes();
        
        this.loaderContainer.appendChild(this.splashContainer);
    }
    
    createInitialSplashes() {
        // Create 6-8 random paint splashes in the background
        const splashCount = 6;
        for (let i = 0; i < splashCount; i++) {
            this.createPaintSplash(
                Math.random() * 100, // x position
                Math.random() * 100, // y position
                Math.random() * 0.6 + 0.3, // scale
                Math.random() * 0.2 + 0.1, // opacity
                Math.random() > 0.5 ? this.primaryColor : this.secondaryColor
            );
        }
    }
    
    createPaintBucket() {
        // Bucket container
        this.bucketContainer = document.createElement('div');
        this.bucketContainer.style.cssText = `
            position: relative;
            width: 160px;
            height: 160px;
            margin-bottom: 30px;
            z-index: 2;
        `;
        
        // Bucket body
        this.bucketBody = document.createElement('div');
        this.bucketBody.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 100px;
            height: 80px;
            background: #2A2D35;
            border-radius: 4px 4px 10px 10px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        `;
        
        // Bucket fill (liquid paint)
        this.bucketFill = document.createElement('div');
        this.bucketFill.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 0%;
            background: linear-gradient(0deg, ${this.primaryColor} 0%, ${this.secondaryColor} 100%);
            border-radius: 4px 4px 10px 10px;
            transition: height 0.1s linear;
        `;
        
        // Bucket rim
        this.bucketRim = document.createElement('div');
        this.bucketRim.style.cssText = `
            position: absolute;
            top: -12px;
            left: 50%;
            transform: translateX(-50%);
            width: 120px;
            height: 18px;
            background: #3A3D45;
            border-radius: 18px 18px 4px 4px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        `;
        
        // Bucket handle
        this.bucketHandle = document.createElement('div');
        this.bucketHandle.style.cssText = `
            position: absolute;
            top: -35px;
            left: 50%;
            transform: translateX(-50%);
            width: 40px;
            height: 20px;
            border: 8px solid #3A3D45;
            border-bottom: none;
            border-radius: 40px 40px 0 0;
        `;
        
        // Build bucket
        this.bucketBody.appendChild(this.bucketFill);
        this.bucketContainer.appendChild(this.bucketBody);
        this.bucketContainer.appendChild(this.bucketRim);
        this.bucketContainer.appendChild(this.bucketHandle);
        
        this.loaderContainer.appendChild(this.bucketContainer);
    }
    
    createLoadingText() {
        // Loading percentage
        this.percentageText = document.createElement('div');
        this.percentageText.style.cssText = `
            color: ${this.primaryColor};
            font-size: 1.8rem;
            font-weight: 700;
            text-align: center;
            margin-top: 10px;
            font-family: 'Segoe UI', monospace;
            z-index: 2;
            text-shadow: 0 2px 8px rgba(0, 224, 255, 0.3);
        `;
        this.percentageText.textContent = '0%';
        
        this.loaderContainer.appendChild(this.percentageText);
        
        // Create drip container
        this.dripContainer = document.createElement('div');
        this.dripContainer.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 120px;
            overflow: visible;
            pointer-events: none;
            z-index: 3;
        `;
        this.loaderContainer.appendChild(this.dripContainer);
    }
    
    createPaintSplash(x, y, scale, opacity, color) {
        const splash = document.createElement('div');
        const size = Math.random() * 50 + 30; // 30-80px
        
        splash.style.cssText = `
            position: absolute;
            top: ${y}%;
            left: ${x}%;
            width: ${size}px;
            height: ${size}px;
            background: radial-gradient(circle, ${color} 0%, transparent 70%);
            border-radius: 50%;
            opacity: ${opacity};
            transform: translate(-50%, -50%) scale(${scale});
            filter: blur(${Math.random() * 4 + 1}px);
            pointer-events: none;
        `;
        
        this.splashContainer.appendChild(splash);
        this.splashes.push(splash);
        
        return splash;
    }
    
    animate() {
        if (typeof gsap !== 'undefined') {
            this.animateWithGSAP();
        } else {
            this.animateWithCSS();
        }
    }
    
    animateWithGSAP() {
        const timeline = gsap.timeline({
            onComplete: () => this.removeLoader()
        });
        
        // 1. Animate background splashes
        timeline.fromTo(this.splashContainer.children,
            { scale: 0, opacity: 0 },
            {
                scale: 1,
                opacity: 0.3,
                duration: 0.5,
                stagger: 0.08,
                ease: "back.out(1.7)"
            }
        );
        
        // 2. Bucket entrance animation
        timeline.fromTo(this.bucketContainer,
            { scale: 0, rotation: -15, opacity: 0 },
            {
                scale: 1,
                rotation: 0,
                opacity: 1,
                duration: 0.6,
                ease: "back.out(1.7)"
            },
            "-=0.3"
        );
        
        // 3. Percentage counter entrance
        timeline.fromTo(this.percentageText,
            { scale: 0, opacity: 0 },
            {
                scale: 1,
                opacity: 1,
                duration: 0.4,
                ease: "back.out(1.7)"
            },
            "-=0.4"
        );
        
        // 4. Main fill animation with percentage
        let fillHeight = 0;
        const fillDuration = 1.5; // Shorter duration
        
        timeline.to(this.bucketFill, {
            height: '100%',
            duration: fillDuration,
            ease: "power2.out",
            onUpdate: () => {
                // Update percentage
                fillHeight = Math.round(this.bucketFill.offsetHeight / this.bucketBody.offsetHeight * 100);
                this.percentageText.textContent = `${fillHeight}%`;
                
                // Create paint drips at specific percentages
                if ([25, 50, 75, 90].includes(fillHeight)) {
                    this.createPaintDrip();
                }
                
                // Create random splashes during fill
                if (fillHeight % 20 === 0 && fillHeight < 100) {
                    this.createRandomSplash();
                }
            }
        }, "-=0.2");
        
        // 5. Final splashes when full
        timeline.call(() => {
            this.createFinalSplashes();
        }, null, "-=0.1");
    }
    
    createPaintDrip() {
        const drip = document.createElement('div');
        const leftPosition = 50 + (Math.random() * 60 - 30); // Center ± 30%
        const dripHeight = Math.random() * 20 + 10;
        const dripColor = Math.random() > 0.5 ? this.primaryColor : this.secondaryColor;
        
        drip.style.cssText = `
            position: absolute;
            bottom: 80px;
            left: ${leftPosition}%;
            width: ${Math.random() * 6 + 4}px;
            height: ${dripHeight}px;
            background: linear-gradient(to bottom, 
                ${dripColor} 0%, 
                ${dripColor}80 80%, 
                transparent 100%);
            border-radius: 0 0 8px 8px;
            transform-origin: top center;
            z-index: 4;
        `;
        
        this.dripContainer.appendChild(drip);
        
        if (typeof gsap !== 'undefined') {
            // Drip formation and fall
            gsap.to(drip, {
                scaleY: 1,
                opacity: 1,
                duration: 0.2,
                ease: "power2.out",
                onComplete: () => {
                    gsap.to(drip, {
                        y: 100,
                        opacity: 0,
                        duration: 0.5,
                        ease: "power2.in",
                        onComplete: () => {
                            if (drip.parentNode) drip.remove();
                        }
                    });
                }
            });
        }
    }
    
    createRandomSplash() {
        const x = Math.random() * 80 + 10; // 10% to 90%
        const y = Math.random() * 80 + 10;
        const color = Math.random() > 0.5 ? this.primaryColor : this.secondaryColor;
        
        this.createPaintSplash(x, y, Math.random() * 0.5 + 0.2, Math.random() * 0.15 + 0.05, color);
    }
    
    createFinalSplashes() {
        // Create celebratory splashes when loading completes
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                const x = Math.random() * 100;
                const y = Math.random() * 100;
                const color = Math.random() > 0.5 ? this.primaryColor : this.secondaryColor;
                
                this.createPaintSplash(x, y, Math.random() * 0.6 + 0.3, 0.3, color);
            }, i * 100);
        }
    }
    
    animateWithCSS() {
        // Fallback CSS animation
        let height = 0;
        const interval = 15;
        const increment = 100 / (this.loaderDuration / interval);
        
        const fillInterval = setInterval(() => {
            height += increment;
            if (height >= 100) {
                height = 100;
                clearInterval(fillInterval);
                
                // Final splashes
                this.createFinalSplashes();
                
                setTimeout(() => this.removeLoader(), 500);
            }
            
            this.bucketFill.style.height = `${height}%`;
            this.percentageText.textContent = `${Math.round(height)}%`;
            
            // Create effects
            if ([25, 50, 75, 90].includes(Math.round(height))) {
                this.createPaintDrip();
            }
            
            if (Math.round(height) % 20 === 0) {
                this.createRandomSplash();
            }
        }, interval);
    }
    
    removeLoader() {
        if (typeof gsap !== 'undefined') {
            gsap.to(this.loaderContainer, {
                opacity: 0,
                duration: 0.3,
                ease: "power2.in",
                onComplete: () => this.cleanup()
            });
        } else {
            this.loaderContainer.style.opacity = '0';
            setTimeout(() => this.cleanup(), 300);
        }
    }
    
    cleanup() {
        if (this.loaderContainer && this.loaderContainer.parentNode) {
            this.loaderContainer.remove();
        }
        
        // Restore body styles and mark as complete
        document.body.style.overflow = '';
        document.body.classList.remove('loader-active');
        document.body.classList.add('loader-complete');
        
        // Dispatch completion event
        window.dispatchEvent(new CustomEvent('paintLoaderComplete'));
    }
}

// ===== NEW INITIALIZATION - Show on EVERY page load =====

// Function to check if page is being refreshed
function isPageRefresh() {
    return performance.navigation.type === 1 || 
           performance.getEntriesByType("navigation")[0]?.type === "reload";
}

// Function to check if it's a back/forward navigation
function isBackForwardNavigation() {
    return performance.navigation.type === 2 || 
           (window.performance && window.performance.getEntriesByType("navigation")[0]?.type === "back_forward");
}

// Initialize loader on every page load
function initializePaintLoader() {
    // Remove any existing loader first
    const existingLoader = document.getElementById('paint-bucket-loader');
    if (existingLoader) {
        existingLoader.remove();
    }
    
    // Create new loader instance
    window.paintBucketLoader = new PaintBucketLoaderEnhanced();
}

// Start loader when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePaintLoader);
} else {
    initializePaintLoader();
}

// Also show loader when page is shown again (like from back/forward cache)
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        // Page was loaded from cache (browser back/forward)
        initializePaintLoader();
    }
});

// Optional: Show loader on link clicks (for better UX)
document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (link && 
        link.href && 
        !link.href.includes('#') && 
        !link.href.includes('javascript:') &&
        link.target !== '_blank' &&
        link.getAttribute('download') === null) {
        
        // Small delay to let navigation start
        setTimeout(() => {
            if (document.visibilityState === 'visible') {
                initializePaintLoader();
            }
        }, 50);
    }
});