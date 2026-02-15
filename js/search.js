// ============================================
// SEARCH SYSTEM CORE ENGINE
// Handles global search functionality
// ============================================

class SearchSystem {
    constructor() {
        this.searchInput = null;
        this.searchForm = null;
        this.searchDropdown = null;
        this.isDropdownOpen = false;
        this.currentSearchQuery = '';
        this.debounceTimer = null;
        this.minQueryLength = 3;
        this.maxDropdownResults = 5;
        this.isLoading = false;
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupSearch());
        } else {
            this.setupSearch();
        }
    }
    
    setupSearch() {
        // Get search elements
        this.searchInput = document.getElementById('globalSearchInput');
        this.searchForm = document.getElementById('globalSearchForm');
        this.searchDropdown = document.getElementById('searchDropdown');
        
        if (!this.searchInput || !this.searchForm || !this.searchDropdown) {
            console.warn('Search elements not found - search functionality disabled');
            return;
        }
        
        // Attach event listeners
        this.searchInput.addEventListener('input', (e) => this.handleInput(e));
        this.searchInput.addEventListener('focus', () => this.showDropdown());
        this.searchForm.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => this.handleClickOutside(e));
        
        // Close dropdown on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isDropdownOpen) {
                this.hideDropdown();
            }
        });
        
        console.log('Search system initialized');
    }
    
    handleInput(e) {
        const query = e.target.value.trim();
        this.currentSearchQuery = query;
        
        if (query.length < this.minQueryLength) {
            this.hideDropdown();
            return;
        }
        
        // Debounce search requests
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.performLiveSearch(query);
        }, 300);
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        const query = this.searchInput.value.trim();
        if (!query) return;
        
        // Close dropdown
        this.hideDropdown();
        
        // Navigate to search results page
        window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    }
    
    handleClickOutside(e) {
        if (!this.searchDropdown.contains(e.target) && 
            !this.searchForm.contains(e.target)) {
            this.hideDropdown();
        }
    }
    
    showDropdown() {
        if (this.currentSearchQuery.length >= this.minQueryLength) {
            this.searchDropdown.classList.add('active');
            this.isDropdownOpen = true;
        }
    }
    
    hideDropdown() {
        this.searchDropdown.classList.remove('active');
        this.isDropdownOpen = false;
    }
    
    async performLiveSearch(query) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoadingState();
        
        try {
            // Ensure Supabase is loaded
            if (!window.supabaseClient) {
                await window.ensureSupabase();
            }
            
            if (!window.supabaseClient) {
                throw new Error('Supabase client not available');
            }
            
            // Perform both searches in parallel
            const [brandsResult, productsResult] = await Promise.all([
                this.searchBrands(query),
                this.searchProducts(query, this.maxDropdownResults, 0)
            ]);
            
            const brands = brandsResult?.data || [];
            const products = productsResult?.data || [];
            
            // Combine and rank results
            const allResults = this.combineAndRankResults(products, brands);
            
            // Update dropdown
            this.updateDropdown(allResults, query);
            
        } catch (error) {
            console.error('Search error:', error);
            this.showErrorState();
        } finally {
            this.isLoading = false;
        }
    }
    
    async searchBrands(query) {
        try {
            return await window.supabaseClient.rpc('search_brands', {
                search_query: query,
                limit_count: 3
            });
        } catch (error) {
            console.error('Brand search error:', error);
            return { data: [], error };
        }
    }
    
    async searchProducts(query, limit = 10, offset = 0) {
        try {
            return await window.supabaseClient.rpc('search_products', {
                search_query: query,
                limit_count: limit,
                offset_count: offset
            });
        } catch (error) {
            console.error('Product search error:', error);
            return { data: [], error };
        }
    }
    
    combineAndRankResults(products, brands) {
        // Rank by Supabase's rank score (descending)
        const rankedProducts = products
            .sort((a, b) => (b.rank || 0) - (a.rank || 0))
            .slice(0, this.maxDropdownResults);
        
        const rankedBrands = brands.slice(0, 2);
        
        return {
            products: rankedProducts,
            brands: rankedBrands
        };
    }
    
    updateDropdown(results, query) {
        const { products, brands } = results;
        const hasProducts = products.length > 0;
        const hasBrands = brands.length > 0;
        
        if (!hasProducts && !hasBrands) {
            this.showNoResults(query);
            return;
        }
        
        let html = '';
        
        // Add brands section if available
        if (hasBrands) {
            html += `
                <div class="dropdown-section">
                    <h4>Brands</h4>
                    <div class="dropdown-results">
                        ${brands.map(brand => this.createBrandDropdownItem(brand, query)).join('')}
                    </div>
                </div>
            `;
        }
        
        // Add products section if available
        if (hasProducts) {
            html += `
                <div class="dropdown-section">
                    <h4>Products</h4>
                    <div class="dropdown-results">
                        ${products.map(product => this.createProductDropdownItem(product, query)).join('')}
                    </div>
                </div>
            `;
        }
        
        // Add view all results link
        html += `
            <a href="search.html?q=${encodeURIComponent(query)}" class="view-all-results">
                View all results for "${this.highlightText(query, query)}"
                <i class="fas fa-arrow-right ml-2"></i>
            </a>
        `;
        
        this.searchDropdown.innerHTML = html;
        this.showDropdown();
    }
    
    createBrandDropdownItem(brand, query) {
        const highlightedName = this.highlightText(brand.name || '', query);
        
        return `
            <a href="brand.html?id=${brand.id}" class="dropdown-item">
                <img src="${brand.logo_url || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=100&h=100&fit=crop'}" 
                     alt="${brand.name}" 
                     onerror="this.src='https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=100&h=100&fit=crop'">
                <div class="dropdown-item-content">
                    <div class="dropdown-item-name">${highlightedName}</div>
                </div>
                <i class="fas fa-arrow-right text-muted"></i>
            </a>
        `;
    }
    
    createProductDropdownItem(product, query) {
        const highlightedName = this.highlightText(product.name || '', query);
        const highlightedBrand = this.highlightText(product.brand_name || '', query);
        
        return `
            <a href="product.html?id=${product.id}" class="dropdown-item">
                <img src="${product.image_url || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=100&h=100&fit=crop'}" 
                     alt="${product.name}" 
                     onerror="this.src='https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=100&h=100&fit=crop'">
                <div class="dropdown-item-content">
                    <div class="dropdown-item-name">${highlightedName}</div>
                    <div class="dropdown-item-brand">${highlightedBrand}</div>
                </div>
                <i class="fas fa-arrow-right text-muted"></i>
            </a>
        `;
    }
    
    highlightText(text, query) {
        if (!query || !text) return text;
        
        const lowerText = text.toLowerCase();
        const lowerQuery = query.toLowerCase();
        
        if (!lowerText.includes(lowerQuery)) {
            return text;
        }
        
        const startIndex = lowerText.indexOf(lowerQuery);
        const endIndex = startIndex + query.length;
        
        return text.substring(0, startIndex) +
               '<mark>' + text.substring(startIndex, endIndex) + '</mark>' +
               text.substring(endIndex);
    }
    
    showLoadingState() {
        this.searchDropdown.innerHTML = `
            <div class="loading-results">
                <i class="fas fa-spinner fa-spin"></i>
                <div>Searching...</div>
            </div>
        `;
        this.showDropdown();
    }
    
    showNoResults(query) {
        this.searchDropdown.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <div>No results found for "${query}"</div>
            </div>
        `;
        this.showDropdown();
    }
    
    showErrorState() {
        this.searchDropdown.innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-triangle"></i>
                <div>Search temporarily unavailable</div>
            </div>
        `;
        this.showDropdown();
    }
}

// Search Results Page Handler
class SearchResultsPage {
    constructor() {
        this.resultsGrid = null;
        this.loader = null;
        this.currentPage = 0;
        this.hasMoreResults = true;
        this.isLoading = false;
        this.currentQuery = '';
        this.limit = 12;
        
        if (window.location.pathname.includes('search.html')) {
            this.initResultsPage();
        }
    }
    
    async initResultsPage() {
        // Get URL query parameter
        const urlParams = new URLSearchParams(window.location.search);
        this.currentQuery = urlParams.get('q') || '';
        
        if (!this.currentQuery) {
            window.location.href = 'index.html';
            return;
        }
        
        // Update page title and query display
        document.title = `Search: ${this.currentQuery} - PEINTURE LAND`;
        const queryDisplay = document.getElementById('searchQuery');
        if (queryDisplay) {
            queryDisplay.textContent = this.currentQuery;
        }
        
        // Get DOM elements
        this.resultsGrid = document.getElementById('searchResultsGrid');
        this.loader = document.getElementById('infiniteScrollLoader');
        
        if (!this.resultsGrid) {
            console.error('Search results grid not found');
            return;
        }
        
        // Load initial results
        await this.loadResults();
        
        // Setup infinite scroll
        this.setupInfiniteScroll();
        
        // Initialize animations
        if (window.gsapAnimations && typeof window.gsapAnimations.refreshAnimations === 'function') {
            setTimeout(() => window.gsapAnimations.refreshAnimations(), 100);
        }
    }
    
    async loadResults() {
        if (this.isLoading || !this.hasMoreResults) return;
        
        this.isLoading = true;
        this.showLoading(true);
        
        try {
            // Ensure Supabase is loaded
            if (!window.supabaseClient) {
                await window.ensureSupabase();
            }
            
            // Search for products
            const result = await this.searchProducts(
                this.currentQuery,
                this.limit,
                this.currentPage * this.limit
            );
            
            const products = result?.data || [];
            
            // Update hasMoreResults flag
            this.hasMoreResults = products.length === this.limit;
            
            // Render products
            if (products.length > 0) {
                this.renderProducts(products);
                this.updateResultsCount();
            } else if (this.currentPage === 0) {
                this.showNoResults();
            }
            
            // Increment page for next load
            this.currentPage++;
            
        } catch (error) {
            console.error('Error loading search results:', error);
            this.showError();
        } finally {
            this.isLoading = false;
            this.showLoading(false);
        }
    }
    
    async searchProducts(query, limit, offset) {
        try {
            return await window.supabaseClient.rpc('search_products', {
                search_query: query,
                limit_count: limit,
                offset_count: offset
            });
        } catch (error) {
            console.error('Search RPC error:', error);
            throw error;
        }
    }
    
    renderProducts(products) {
        products.forEach(product => {
            const productCard = this.createSearchProductCard(product);
            if (productCard) {
                this.resultsGrid.appendChild(productCard);
            }
        });
        
        // Refresh animations
        setTimeout(() => {
            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.refresh();
            }
            if (window.gsapAnimations && typeof window.gsapAnimations.refreshAnimations === 'function') {
                window.gsapAnimations.refreshAnimations();
            }
        }, 100);
    }
    
    createSearchProductCard(product) {
        // Use existing createProductCard function if available
        if (window.websiteFunctions && typeof window.websiteFunctions.createProductCard === 'function') {
            // Clone product object to match expected structure
            const productForCard = {
                ...product,
                product_properties: [] // Search results don't include properties
            };
            
            const card = window.websiteFunctions.createProductCard(productForCard, product.brand_name || '');
            
            // Add highlight to name and description
            this.highlightCardText(card, product);
            
            return card;
        }
        
        // Fallback: create basic card
        const card = document.createElement('a');
        card.href = `product.html?id=${product.id}`;
        card.className = 'product-card will-animate';
        
        const shortDesc = product.description && product.description.length > 100 
            ? product.description.substring(0, 100) + '...' 
            : product.description || '';
        
        const highlightedName = this.highlightText(product.name, this.currentQuery);
        const highlightedDesc = this.highlightText(shortDesc, this.currentQuery);
        const highlightedBrand = this.highlightText(product.brand_name || '', this.currentQuery);
        
        card.innerHTML = `
            <div class="product-image-container">
                <img src="${product.image_url || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop'}" 
                     alt="${product.name}" 
                     class="product-image">
            </div>
            <div class="product-info">
                <div class="brand-badge">🔖 ${highlightedBrand}</div>
                <h3 class="product-name">${highlightedName}</h3>
                <div class="product-description-container">
                    <p class="product-description">${highlightedDesc}</p>
                </div>
                <div class="product-actions">
                    <button class="btn add-to-cart" 
                            data-product-id="${product.id}"
                            data-product-name="${product.name}"
                            data-product-description="${product.description}"
                            data-product-image="${product.image_url || ''}"
                            data-brand-id="${product.brand_id}">
                        <i class="fas fa-cart-plus"></i> Add To Cart
                    </button>
                    <span class="view-details">
                        View Details <i class="fas fa-arrow-right"></i>
                    </span>
                </div>
            </div>
        `;
        
        // Add cart event listener
        setTimeout(() => {
            const cartBtn = card.querySelector('.add-to-cart');
            if (cartBtn) {
                cartBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const productData = {
                        id: product.id,
                        name: product.name,
                        description: product.description,
                        image_url: product.image_url,
                        brand_id: product.brand_id,
                        quantity: 1
                    };
                    
                    if (typeof addToCartFallback === 'function') {
                        addToCartFallback(productData);
                    } else if (window.cartManager && typeof window.cartManager.addToCart === 'function') {
                        window.cartManager.addToCart(productData);
                    }
                });
            }
        }, 100);
        
        return card;
    }
    
    highlightCardText(cardElement, product) {
        const nameElement = cardElement.querySelector('.product-name');
        const descElement = cardElement.querySelector('.product-description');
        const brandElement = cardElement.querySelector('.brand-badge');
        
        if (nameElement) {
            nameElement.innerHTML = this.highlightText(product.name, this.currentQuery);
        }
        
        if (descElement && product.description) {
            const shortDesc = product.description.length > 100 
                ? product.description.substring(0, 100) + '...' 
                : product.description;
            descElement.innerHTML = this.highlightText(shortDesc, this.currentQuery);
        }
        
        if (brandElement && product.brand_name) {
            brandElement.innerHTML = `🔖 ${this.highlightText(product.brand_name, this.currentQuery)}`;
        }
    }
    
    highlightText(text, query) {
        if (!query || !text) return text;
        
        const lowerText = text.toLowerCase();
        const lowerQuery = query.toLowerCase();
        const regex = new RegExp(`(${this.escapeRegExp(query)})`, 'gi');
        
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    updateResultsCount() {
        const resultsCount = this.currentPage * this.limit;
        const countElement = document.getElementById('resultsCount');
        if (countElement) {
            countElement.textContent = `trouvé ${resultsCount}+ produits correspondants`;
        }
    }
    
    showNoResults() {
        this.resultsGrid.innerHTML = `
            <div class="no-search-results" style="grid-column: 1 / -1;">
                <i class="fas fa-search"></i>
                <h3>No results found for "${this.currentQuery}"</h3>
                <p class="search-suggestions">
                    Try different keywords or browse our brands
                </p>
                <a href="index.html" class="btn" style="margin-top: 20px;">
                    <i class="fas fa-home"></i> Back to Home
                </a>
            </div>
        `;
    }
    
    showError() {
        this.resultsGrid.innerHTML = `
            <div class="no-search-results" style="grid-column: 1 / -1;">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Search temporarily unavailable</h3>
                <p class="search-suggestions">
                    Please try again in a few moments
                </p>
                <button onclick="window.location.reload()" class="btn" style="margin-top: 20px;">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
    
    showLoading(show) {
        if (this.loader) {
            if (show) {
                this.loader.classList.remove('hidden');
            } else {
                this.loader.classList.add('hidden');
            }
        }
    }
    
    setupInfiniteScroll() {
        // Use Intersection Observer for modern browsers
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && this.hasMoreResults && !this.isLoading) {
                    this.loadResults();
                }
            });
        }, {
            rootMargin: '100px',
            threshold: 0.1
        });
        
        if (this.loader) {
            observer.observe(this.loader);
        }
        
        // Fallback: scroll event listener
        window.addEventListener('scroll', () => {
            if (!this.hasMoreResults || this.isLoading) return;
            
            const scrollPosition = window.innerHeight + window.scrollY;
            const pageHeight = document.documentElement.scrollHeight;
            
            if (scrollPosition >= pageHeight - 200) {
                this.loadResults();
            }
        });
    }
}

// Initialize search system globally
window.initializeSearchSystem = function() {
    // Main search for all pages
    window.searchSystem = new SearchSystem();
    
    // Search results page handler
    window.searchResultsPage = new SearchResultsPage();
};

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initializeSearchSystem);
} else {
    window.initializeSearchSystem();
}

// Export for manual initialization
window.SearchSystem = SearchSystem;
window.SearchResultsPage = SearchResultsPage;