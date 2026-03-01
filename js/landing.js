// home.js – GSAP animations & interactivity

// Wait for DOM and GSAP/ScrollTrigger to be ready
window.addEventListener('load', () => {
    'use strict';

    //============================================================================

    (() => {
      // Only run if GSAP is loaded
      if (typeof gsap === 'undefined') return;

      // Timeline for text entrance
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Check elements before animating
      const heroEyebrow = document.querySelector(".hero-eyebrow");
      const heroTitle = document.querySelector(".hero-title");
      const heroDivider = document.querySelector(".hero-divider");
      const heroNote = document.querySelector(".hero-note");
      const heroCta = document.querySelector(".hero-cta"); // does not exist, skip

      if (heroEyebrow) tl.from(heroEyebrow, { opacity: 0, y: 20, duration: 0.8 });
      if (heroTitle) tl.from(heroTitle, { opacity: 0, y: 50, duration: 1.2 }, "-=0.4");
      if (heroDivider) tl.from(heroDivider, { scaleX: 0, transformOrigin: "left", duration: 0.8 }, "-=0.6");
      if (heroNote) tl.from(heroNote, { opacity: 0, y: 20, duration: 0.8 }, "-=0.5");
      // hero-cta does not exist – skip

      // Floating panels motion
      gsap.to(".panel-1", { y: [-10, 15], x: [-5, 5], rotation: 0.3, duration: 20, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".panel-2", { y: [-15, 10], x: [-10, 10], rotation: -0.2, duration: 25, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".panel-3", { y: [-8, 12], x: [-6, 6], rotation: 0.1, duration: 22, repeat: -1, yoyo: true, ease: "sine.inOut" });

      // Particles setup (unchanged)
      const canvas = document.getElementById("heroParticles");
      if (canvas) {
        const ctx = canvas.getContext("2d");
        let particles = [];
        const particleCount = 60;

        function resizeCanvas() {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        }
        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();

        for (let i = 0; i < particleCount; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 2 + 1,
            dx: (Math.random() - 0.5) * 0.2,
            dy: (Math.random() - 0.5) * 0.2,
            opacity: Math.random() * 0.4 + 0.2
          });
        }

        function animateParticles() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          particles.forEach(p => {
            p.x += p.dx; p.y += p.dy;
            if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(212,176,106,${p.opacity})`;
            ctx.fill();
          });
          requestAnimationFrame(animateParticles);
        }
        animateParticles();
      }
    })();

    // Panel image hover effects (unchanged)
    const panelImages = document.querySelectorAll(".panel img");
    panelImages.forEach(img => {
      const hoverTL = gsap.timeline({ paused: true });
      hoverTL.to(img, {
        y: -10,
        scale: 1.05,
        borderColor: "#ffffff",
        boxShadow: "0 10px 30px rgba(255,254,254,0.5)",
        duration: 0.4,
        ease: "power1.out"
      });
      img.addEventListener("mouseenter", () => hoverTL.play());
      img.addEventListener("mouseleave", () => hoverTL.reverse());
    });

    // --- CAROUSEL (unchanged) ---
    const track = document.getElementById('carouselTrack');
    const slides = Array.from(track?.children || []);
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const dotsContainer = document.getElementById('carouselDots');

    if (track && prevBtn && nextBtn && dotsContainer && slides.length) {
      let currentIndex = 0;
      const autoSlideInterval = 4000;

      slides.forEach((_, idx) => {
        const dot = document.createElement('button');
        if (idx === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(idx));
        dotsContainer.appendChild(dot);
      });

      const dots = Array.from(dotsContainer.children);

      function goToSlide(index) {
        currentIndex = index;
        const slideWidth = slides[0].getBoundingClientRect().width;
        gsap.to(track, { x: -slideWidth * currentIndex, duration: 1, ease: "power2.out" });
        updateDots();
      }

      function updateDots() {
        dots.forEach(dot => dot.classList.remove('active'));
        dots[currentIndex]?.classList.add('active');
      }

      function nextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        goToSlide(currentIndex);
      }

      function prevSlide() {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        goToSlide(currentIndex);
      }

      nextBtn.addEventListener('click', nextSlide);
      prevBtn.addEventListener('click', prevSlide);

      let autoSlide = setInterval(nextSlide, autoSlideInterval);
      track.addEventListener('mouseenter', () => clearInterval(autoSlide));
      track.addEventListener('mouseleave', () => autoSlide = setInterval(nextSlide, autoSlideInterval));

      // Touch support
      let startX = 0;
      let isDragging = false;
      track.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
        isDragging = true;
        clearInterval(autoSlide);
      }, { passive: true });
      track.addEventListener('touchmove', e => {
        if (!isDragging) return;
        const moveX = e.touches[0].clientX;
        const diff = moveX - startX;
        const slideWidth = slides[0].getBoundingClientRect().width;
        gsap.set(track, { x: -slideWidth * currentIndex + diff });
      }, { passive: true });
      track.addEventListener('touchend', e => {
        isDragging = false;
        const endX = e.changedTouches[0].clientX;
        const diff = endX - startX;
        if (diff > 50) prevSlide();
        else if (diff < -50) nextSlide();
        else goToSlide(currentIndex);
        autoSlide = setInterval(nextSlide, autoSlideInterval);
      });

      window.addEventListener('resize', () => goToSlide(currentIndex));
    }

    // --- ABOUT SECTION: animation + counter ---
    (() => {
      let aboutPlayed = false;
      const aboutSection = document.querySelector('#about');
      if (!aboutSection) return;

      function playAbout() {
        if (aboutPlayed) return;
        aboutPlayed = true;

        gsap.from('#aboutText', { opacity: 0, x: -50, duration: 1, ease: 'power2.out' });
        gsap.from('#aboutImage', { opacity: 0, x: 50, duration: 1, ease: 'power2.out' });

        document.querySelectorAll('.stat-number').forEach(stat => {
          const target = Number(stat.dataset.target);
          const counter = { value: 0 };
          gsap.to(counter, {
            value: target,
            duration: 2,
            ease: 'power2.out',
            onUpdate: () => { stat.textContent = Math.floor(counter.value); }
          });
        });
      }

      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            playAbout();
            observer.disconnect();
          }
        });
      }, { threshold: 0.3 });
      observer.observe(aboutSection);

      window.addEventListener('load', () => {
        const rect = aboutSection.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) playAbout();
      });
    })();

    // --- PROCESS STEPS: stagger on scroll ---
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.create({
        trigger: '#how-it-works',
        start: 'top 80%',
        onEnter: () => {
          gsap.from('.process-step', {
            opacity: 0,
            y: 40,
            stagger: 0.2,
            duration: 0.8,
            ease: 'back.out(1.2)'
          });
        },
        once: true
      });

      // Process Step Hover Animation
      const steps = document.querySelectorAll('.process-step');
      steps.forEach(step => {
        gsap.set(step, { willChange: 'transform, box-shadow' });
        const tl = gsap.timeline({ paused: true });
        tl.to(step, { y: -10, boxShadow: '0 15px 40px rgba(0,0,0,0.5)', duration: 0.35, ease: 'power2.out' });
        step.addEventListener('mouseenter', () => tl.play());
        step.addEventListener('mouseleave', () => tl.reverse());
      });
    }

    // --- Brands luxury entrance animation ---
    const brandLogos = document.querySelectorAll('.brand-logo');
    brandLogos.forEach(logo => {
      const hoverTL = gsap.timeline({ paused: true });
      hoverTL.to(logo, { scale: 1.08, y: -8, rotationX: 5, boxShadow: "0px 0px 20px rgba(0,0,0,0.7)", duration: 0.2, ease: "power3.out" })
             .to(logo.querySelector('img'), { filter: "grayscale(0%)", duration: 0.2, ease: "power2.out" }, 0);
      logo.addEventListener('mouseenter', () => hoverTL.play());
      logo.addEventListener('mouseleave', () => hoverTL.reverse());
    });

    // --- LUXURY BUTTON interactions ---
    const luxBtn = document.querySelector(".lux-btn");
    if (luxBtn) {
      const line = luxBtn.querySelector(".lux-btn__line");
      gsap.fromTo(luxBtn, { opacity: 0, y: 40, scale: 0.92, filter: "blur(6px)" },
                          { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 1.4, ease: "expo.out" });
      luxBtn.addEventListener("mouseenter", () => {
        if (line) gsap.to(line, { width: "70%", duration: 0.6, ease: "power3.out" });
        gsap.to(luxBtn, { boxShadow: "0 35px 65px rgba(0,0,0,0.55), inset 0 1px 1px rgba(255,255,255,0.2)", duration: 0.5, ease: "power3.out" });
      });
      luxBtn.addEventListener("mouseleave", () => {
        if (line) gsap.to(line, { width: "0%", duration: 0.5, ease: "power3.inOut" });
        gsap.to(luxBtn, { boxShadow: "0 25px 45px rgba(0,0,0,0.45), inset 0 1px 1px rgba(255,255,255,0.15)", duration: 0.5, ease: "power3.out" });
        gsap.to(luxBtn, { x: 0, y: 0, duration: 0.6, ease: "expo.out" });
      });
      luxBtn.addEventListener("mousemove", (e) => {
        const rect = luxBtn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(luxBtn, { x: x * 0.15, y: y * 0.15, duration: 0.4, ease: "power3.out" });
      });
    }

    // --- BENEFITS: staggered icons + text ---
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.create({
        trigger: '#benefits',
        start: 'top 80%',
        onEnter: () => {
          gsap.from('.benefit', { opacity: 0, y: 30, stagger: 0.15, duration: 0.7, ease: 'power2.out' });
        },
        once: true
      });
    }

    // --- disable heavy animations on mobile (width < 768) ---
    if (window.innerWidth < 768 && typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.getAll().forEach(st => st.disable());
      gsap.set('.process-step, .brand-logo, .benefit, .stock-content, .final-cta-content', { opacity: 1, y: 0 });
    }

    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
});

// ===== CTA BUTTON GSAP HOVER =====
(() => {
    'use strict';
    const buttons = document.querySelectorAll('.final-cta .btn-primary, .final-cta .btn-whatsapp');
    if (!buttons.length) return;

    const isTouch = window.matchMedia('(hover: none)').matches;

    buttons.forEach(button => {
        gsap.set(button, { willChange: 'transform, box-shadow', transformOrigin: 'center center' });

        const hoverTl = gsap.timeline({ paused: true });
        hoverTl
            .to(button, { y: -10, scale: 1.045, boxShadow: '0 26px 35px rgba(0,0,0,0.5)', duration: 0.2, ease: 'power2.out' })
            .to(button, { y: -6, scale: 1.03, duration: 0.28, ease: 'sine.out' });

        const glowFlash = gsap.to(button, {
            boxShadow: '0 0 0 2px rgba(212,176,106,0.9), 0 26px 55px rgba(0,0,0,0.35)',
            duration: 0.06,
            yoyo: true,
            repeat: 1,
            ease: 'none',
            paused: true
        });

        const pressTl = gsap.timeline({ paused: true });
        pressTl
            .to(button, { scale: 0.97, y: -2, duration: 0.12, ease: 'power1.out' })
            .to(button, { scale: 1, y: -6, duration: 0.16, ease: 'power2.out' });

        if (!isTouch) {
            button.addEventListener('mouseenter', () => { hoverTl.restart(); glowFlash.restart(); });
            button.addEventListener('mouseleave', () => { hoverTl.reverse(); });
        }

        button.addEventListener('mousedown', () => { pressTl.restart(); });

        if (isTouch) {
            let revealed = false;
            button.addEventListener('touchstart', (e) => {
                if (!revealed) {
                    e.preventDefault();
                    revealed = true;
                    hoverTl.restart();
                    glowFlash.restart();
                    setTimeout(() => { hoverTl.reverse(); revealed = false; }, 2200);
                }
            }, { passive: false });
        }
    });
})();


/**
 * Updates the store opening status dynamically.
 * Works on any page that contains the '.footer-hours' class.
 */
function updateStoreStatus() {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1-6 = Mon-Sat
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hour + (minutes / 60);

    // Target the specific section in your footer
    const statusContainer = document.querySelector('.footer-hours');
    
    if (!statusContainer) {
        console.warn("Status element .footer-hours not found on this page.");
        return;
    }

    // Business Logic: Mon-Sat (1-6), 06:30 (6.5) to 18:00 (18)
    const isOpen = day !== 0 && currentTime >= 6.5 && currentTime < 18;

    // Create the status badge
    const statusHTML = `
        <div class="store-status-badge" style="margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
            <span style="color: ${isOpen ? '#2ecc71' : '#e74c3c'}; font-size: 18px;">●</span>
            <span style="font-weight: 700; color: ${isOpen ? '#2ecc71' : '#e74c3c'}; text-transform: uppercase; font-size: 14px;">
                ${isOpen ? 'Actuellement Ouvert' : 'Actuellement Fermé'}
            </span>
        </div>
    `;
    
    // Remove any existing status badge first (prevents duplicates if script runs twice)
    const existingBadge = statusContainer.querySelector('.store-status-badge');
    if (existingBadge) existingBadge.remove();

    // Insert at the very top of the hours section
    statusContainer.insertAdjacentHTML('afterbegin', statusHTML);
}

// Run once on load
document.addEventListener('DOMContentLoaded', updateStoreStatus);
// Optional: Update every minute so it changes while the user is on the site
setInterval(updateStoreStatus, 60000);