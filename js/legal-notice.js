// company-profile.js – Enhanced GSAP animations
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP or ScrollTrigger not loaded');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // ------------------------------------------------------------
    // 1. INITIAL STATES (set before animations)
    // ------------------------------------------------------------
    // Cards: all main content blocks
    const cards = document.querySelectorAll('[data-anim="card"], [data-anim="slide"], .cp-leader, .cp-address-block, .cp-glass-card');
    gsap.set(cards, { opacity: 0, y: 40 });

    // Timeline items (separate for stagger effect)
    const timelineItems = document.querySelectorAll('[data-anim="timeline"]');
    gsap.set(timelineItems, { opacity: 0, x: -20 });

    // Hero elements
    gsap.set('.cp-title-xl, .cp-rne-badge, .cp-divider', { opacity: 0 });

    // ------------------------------------------------------------
    // 2. SCROLL-TRIGGERED ANIMATIONS
    // ------------------------------------------------------------
    // Hero title (fade + slide)
    gsap.to('.cp-title-xl', {
      scrollTrigger: {
        trigger: '#hero',
        start: 'top 70%',
        once: true
      },
      opacity: 1,
      x: 0,
      duration: 1.2,
      ease: 'power2.out'
    });

    // Badge (scale in)
    gsap.to('.cp-rne-badge', {
      scrollTrigger: {
        trigger: '#hero',
        start: 'top 70%',
        once: true
      },
      opacity: 1,
      scale: 1,
      duration: 0.8,
      delay: 0.3,
      ease: 'back.out(1.2)'
    });

    // Divider (width animation)
    gsap.to('.cp-divider', {
      scrollTrigger: {
        trigger: '#hero',
        start: 'top 60%',
        once: true
      },
      opacity: 1,
      width: 80,
      duration: 1,
      ease: 'power3.inOut'
    });

    // Cards batch (staggered entrance)
    ScrollTrigger.batch(cards, {
      onEnter: batch => gsap.to(batch, {
        opacity: 1,
        y: 0,
        stagger: 0.12,
        duration: 0.9,
        ease: 'power3.out',
        overwrite: true
      }),
      once: true,
      start: 'top 85%'
    });

    // Timeline items (staggered from left)
    ScrollTrigger.batch(timelineItems, {
      onEnter: batch => gsap.to(batch, {
        opacity: 1,
        x: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: 'back.out(1.2)'
      }),
      once: true,
      start: 'top 80%'
    });

    // Capital counter
    const capitalEl = document.getElementById('capitalCounter');
    if (capitalEl) {
      const capitalValue = 50000;
      ScrollTrigger.create({
        trigger: '#identity',
        start: 'top 80%',
        onEnter: () => {
          gsap.to({ val: 0 }, {
            val: capitalValue,
            duration: 2.2,
            ease: 'power2.inOut',
            onUpdate: function() {
              capitalEl.innerText = Math.round(this.targets()[0].val).toLocaleString('fr-FR') + ' €';
            }
          });
        },
        once: true
      });
    }

    // Parallax effect on hero title
    const heroTitle = document.getElementById('heroTitle');
    if (heroTitle) {
      gsap.to(heroTitle, {
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5
        },
        y: -30,
        opacity: 0.9,
        ease: 'none'
      });
    }

    // Subtle scale animation on timeline card while scrolling
    const timelineCard = document.getElementById('timelineCard');
    if (timelineCard) {
      gsap.fromTo(timelineCard, 
        { scale: 0.95 },
        {
          scale: 1,
          ease: 'power1.inOut',
          scrollTrigger: {
            trigger: timelineCard,
            start: 'top 30%',
            end: 'bottom 30%',
            scrub: 0.5
          }
        }
      );
    }

    // ------------------------------------------------------------
    // 3. HOVER MICRO-INTERACTIONS (GSAP)
    // ------------------------------------------------------------
    const hoverElements = document.querySelectorAll('.cp-glass-card, .cp-leader, .cp-address-block, .cp-rne-badge, .cp-map-link, .trust-link');
    hoverElements.forEach(el => {
      el.addEventListener('mouseenter', (e) => {
        if (el.classList.contains('cp-map-link') || el.classList.contains('trust-link')) {
          gsap.to(el, { scale: 1.05, duration: 0.2, ease: 'power2.out' });
        } else {
          gsap.to(el, { 
            y: -6, 
            boxShadow: '0 30px 50px -20px rgba(0,0,0,0.2)', 
            duration: 0.3, 
            ease: 'power2.out' 
          });
          const icon = el.querySelector('.cp-icon, .cp-leader-icon, i.fas');
          if (icon) {
            gsap.to(icon, { 
              rotation: 2, 
              scale: 1.1, 
              duration: 0.3, 
              ease: 'backOut(1.2)' 
            });
          }
        }
      });

      el.addEventListener('mouseleave', (e) => {
        if (el.classList.contains('cp-map-link') || el.classList.contains('trust-link')) {
          gsap.to(el, { scale: 1, duration: 0.2 });
        } else {
          gsap.to(el, { 
            y: 0, 
            boxShadow: '0 20px 40px -12px rgba(0,0,0,0.08)', 
            duration: 0.3, 
            ease: 'power2.in' 
          });
          const icon = el.querySelector('.cp-icon, .cp-leader-icon, i.fas');
          if (icon) {
            gsap.to(icon, { 
              rotation: 0, 
              scale: 1, 
              duration: 0.3, 
              ease: 'backIn' 
            });
          }
        }
      });
    });

    // Refresh ScrollTrigger after all animations are set
    ScrollTrigger.refresh();
    console.log('Enhanced GSAP company profile animations running');
  });
})();