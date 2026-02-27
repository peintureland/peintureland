let BRAND_MAP = {};
let brandsGrid = null;

document.addEventListener('DOMContentLoaded', async function() {
  console.log('Website initialized');
  brandsGrid = document.getElementById('brandsGrid');
  updateCartCount();

  // Only attempt to load brands if the grid exists on this page
  if (brandsGrid) {
    console.log('Brands grid found – loading brands...');

    // Helper to start loading when Supabase is ready
    const loadWhenSupabaseReady = () => {
      if (typeof ensureSupabase !== 'undefined') {
        ensureSupabase(async () => {
          console.log('Supabase ready, calling loadBrands...');
          await loadBrands();
        });
      } else {
        // If ensureSupabase is missing, wait a bit and try direct
        console.warn('ensureSupabase not found, waiting 200ms for supabase-client...');
        setTimeout(() => {
          if (window.supabaseClient) {
            console.log('supabaseClient now available, loading brands...');
            loadBrands();
          } else {
            console.error('supabaseClient still not available after delay');
            if (brandsGrid) {
              brandsGrid.innerHTML = '<div class="loading error">Failed to load brands. Please refresh.</div>';
            }
          }
        }, 200);
      }
    };

    // If supabase-client might still be loading, give it a moment
    if (typeof ensureSupabase === 'undefined' && !window.supabaseClient) {
      setTimeout(loadWhenSupabaseReady, 50);
    } else {
      loadWhenSupabaseReady();
    }
  } else {
    console.log('Not a brand page, skipping brand load');
  }
});

// Second DOMContentLoaded for smooth scroll (unchanged, but keep it)
document.addEventListener('DOMContentLoaded', () => {
  function forceSmoothScrollTo(targetY, duration = 800) {
    const startY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const diff = targetY - startY;
    if (diff === 0) return;
    const startTime = performance.now();
    const ease = t => 0.5 * (1 - Math.cos(Math.PI * t));
    function step(now) {
      const elapsed = Math.min(1, (now - startTime) / duration);
      const eased = ease(elapsed);
      window.scrollTo(0, Math.round(startY + diff * eased));
      if (elapsed < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;
      e.preventDefault();

      try {
        const hasScrollToPlugin = (typeof ScrollToPlugin !== 'undefined') ||
          (typeof gsap !== 'undefined' && gsap.plugins && gsap.plugins.ScrollToPlugin) ||
          (typeof gsap !== 'undefined' && gsap.core && gsap.core.plugins && gsap.core.plugins.ScrollToPlugin);

        if (hasScrollToPlugin && typeof gsap !== 'undefined' && typeof gsap.to === 'function') {
          gsap.to(window, {
            duration: 1,
            scrollTo: { y: targetElement, offsetY: 80 },
            ease: "power2.inOut"
          });
          return;
        }
      } catch (err) {}

      const y = targetElement.getBoundingClientRect().top + window.pageYOffset - 80;
      try {
        forceSmoothScrollTo(y, 800);
      } catch (err) {
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });
});

function showErrorMessage(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'global-error';
  errorDiv.innerHTML = `<div class="error-content"><i class="fas fa-exclamation-triangle error-icon"></i><span class="error-text">${message}</span><button class="error-close" aria-label="Close error"><i class="fas fa-times"></i></button></div>`;
  document.body.appendChild(errorDiv);
  errorDiv.querySelector('.error-close').onclick = () => {
    errorDiv.classList.add('hide');
    setTimeout(() => errorDiv.remove(), 300);
  };
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.classList.add('hide');
      setTimeout(() => errorDiv.remove(), 300);
    }
  }, 5000);
}

async function runWithTimeoutUi(promiseFactory, container, timeoutMs = 7000) {
  const timeoutId = setTimeout(() => {
    try {
      if (container && container.innerHTML && container.innerHTML.toLowerCase().includes('loading')) {
        container.innerHTML = `<div class="loading">Still loading… please refresh or <button onclick="location.reload()">Retry</button></div>`;
      }
    } catch (e) {}
  }, timeoutMs);

  try {
    if (window.supabaseCallWithTimeout) {
      const res = await window.supabaseCallWithTimeout(promiseFactory, container ? container.id : null, timeoutMs);
      clearTimeout(timeoutId);
      return res;
    }
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs));
    const res = await Promise.race([promiseFactory(), timeoutPromise]);
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

function refreshPageAnimations() {
  if (window.gsapAnimations && typeof window.gsapAnimations.refreshAnimations === 'function') {
    window.gsapAnimations.refreshAnimations();
  }
  if (typeof ScrollTrigger !== 'undefined' && typeof ScrollTrigger.refresh === 'function') {
    ScrollTrigger.refresh();
  }
}

async function loadBrands() {
  try {
    console.log('Loading brands from Supabase...');
    if (!window.supabaseClient) {
      console.error('Supabase client not available');
      if (brandsGrid) {
        brandsGrid.innerHTML = '<div class="loading error">Supabase not available. Please refresh.</div>';
      }
      return;
    }

    if (brandsGrid) {
      brandsGrid.innerHTML = `<div class="loading">Loading brands...</div>`;
    }

    const res = await runWithTimeoutUi(
      () => window.supabaseClient.from('brands').select('*').order('name'),
      brandsGrid,
      7000
    );

    const brands = res && res.data ? res.data : [];
    console.log('Brands loaded:', brands);

    BRAND_MAP = {};
    if (brands && brands.length > 0) {
      brands.forEach(brand => {
        BRAND_MAP[brand.id] = brand.name;
      });
    }

    if (brandsGrid) {
      brandsGrid.innerHTML = '';
      if (brands && brands.length > 0) {
        brands.forEach(brand => {
          const brandCard = createBrandCard(brand);
          brandsGrid.appendChild(brandCard);
        });
        setTimeout(() => {
          refreshPageAnimations();
          if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        }, 100);
      } else {
        brandsGrid.innerHTML = `<div class="loading">No brands found. Please add brands in Supabase.</div>`;
      }
    }
  } catch (error) {
    console.error('Error loading brands:', error);
    if (brandsGrid) {
      brandsGrid.innerHTML = `<div class="loading error">Error loading brands. Please try again later.</div>`;
    }
  }
}

function createBrandCard(brand) {
  console.log('Creating brand card:', brand.name, 'with ID:', brand.id);
  const card = document.createElement('a');
  card.href = `brand.html?id=${brand.id}`;
  card.className = 'brand-card will-animate';
  card.innerHTML = `
    <img src="${brand.logo_url || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=200&fit=crop'}" alt="${brand.name}" class="brand-image">
    <div class="brand-info">
      <h3 class="brand-name">${brand.name}</h3>
      <p class="brand-description">${brand.description || 'Professional paint products'}</p>
      <div class="view-products">View Products <i class="fas fa-arrow-right"></i></div>
    </div>
  `;
  card.addEventListener('click', function(e) {
    console.log('Brand card clicked:', brand.name);
    console.log('Link URL:', this.href);
  });
  return card;
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('peintureLandCart')) || [];
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  document.querySelectorAll('.cart-count').forEach(element => {
    element.textContent = cartCount;
  });
}

function addToCartFallback(product) {
  try {
    const cart = JSON.parse(localStorage.getItem('peintureLandCart')) || [];
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('peintureLandCart', JSON.stringify(cart));
    updateCartCount();

    if (typeof gsap !== 'undefined') {
      const cartCountElement = document.querySelector('.cart-count');
      if (cartCountElement) {
        gsap.to(cartCountElement, {
          scale: 1.3,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut"
        });
      }
    }

    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
      padding: 15px 25px;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      z-index: 10000;
      font-weight: 600;
    `;
    notification.innerHTML = `<i class="fas fa-check-circle"></i> ${product.name} added to cart`;
    document.body.appendChild(notification);
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  } catch (error) {
    console.error('Error adding to cart:', error);
  }
}

window.websiteFunctions = { loadBrands, updateCartCount, createBrandCard, addToCartFallback };
window.BRAND_MAP = BRAND_MAP;
window.onerror = function(message, source, lineno, colno, error) {
  try {
    console.error('Global error caught:', message, 'at', source + ':' + lineno + ':' + colno, error || '');
  } catch (e) {}
};