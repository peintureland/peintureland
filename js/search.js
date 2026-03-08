class SearchSystem {
    constructor() {
        this.searchInput = null;
        this.searchForm = null;
        this.searchDropdown = null;
        this.isDropdownOpen = false;
        this.currentSearchQuery = '';
        this.debounceTimer = null;
        this.minQueryLength = 3;
        this.maxDropdownResults = 10;
        this.isLoading = false;
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupSearch());
        } else {
            this.setupSearch();
        }
    }

    setupSearch() {
        this.searchInput = document.getElementById('globalSearchInput');
        this.searchForm = document.getElementById('globalSearchForm');
        this.searchDropdown = document.getElementById('searchDropdown');

        if (!this.searchInput || !this.searchForm || !this.searchDropdown) {
            console.warn('Search elements not found - search disabled');
            return;
        }

        this.searchInput.addEventListener('input', e => this.handleInput(e));
        this.searchInput.addEventListener('focus', () => this.showDropdown());
        this.searchForm.addEventListener('submit', e => this.handleSubmit(e));
        document.addEventListener('click', e => this.handleClickOutside(e));
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && this.isDropdownOpen) this.hideDropdown();
        });

        console.log('Search system initialized');
    }

    handleInput(e) {
        const q = e.target.value.trim();
        this.currentSearchQuery = q;
        if (q.length < this.minQueryLength) {
            this.hideDropdown();
            return;
        }
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => this.performLiveSearch(q), 300);
    }

    handleSubmit(e) {
        e.preventDefault();
        const q = this.searchInput.value.trim();
        if (!q) return;
        this.hideDropdown();
        window.location.href = `search.html?q=${encodeURIComponent(q)}`;
    }

    handleClickOutside(e) {
        if (!this.searchDropdown.contains(e.target) && !this.searchForm.contains(e.target)) {
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

    async performLiveSearch(q) {
        if (this.isLoading) return;
        this.isLoading = true;
        this.showLoadingState();
        try {
            if (!window.supabaseClient) await window.ensureSupabase();
            if (!window.supabaseClient) throw new Error('Supabase client not available');

            const { data, error } = await window.supabaseClient.rpc('autocomplete_search', {
                search_query: q,
                max_results: this.maxDropdownResults
            });

            if (error) {
                // Log full error details to console for debugging
                console.error('Autocomplete RPC error:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                throw error;
            }
            this.updateAutocompleteDropdown(data || [], q);

        } catch (e) {
            console.error('Autocomplete error:', e);
            this.showErrorState();
        } finally {
            this.isLoading = false;
        }
    }

    updateAutocompleteDropdown(results, query) {
        if (!results || results.length === 0) {
            this.showNoResults(query);
            return;
        }

        const grouped = results.reduce((acc, item) => {
            if (!acc[item.type]) acc[item.type] = [];
            acc[item.type].push(item);
            return acc;
        }, {});

        let html = '';
        const typeOrder = ['product', 'brand', 'property'];
        const typeLabels = { product: 'Products', brand: 'Brands', property: 'Properties' };

        for (const type of typeOrder) {
            if (grouped[type] && grouped[type].length > 0) {
                html += `<div class="dropdown-section"><h4>${typeLabels[type]}</h4><div class="dropdown-results">`;
                html += grouped[type].map(item => this.createAutocompleteItem(item, query)).join('');
                html += '</div></div>';
            }
        }

        html += `<a href="search.html?q=${encodeURIComponent(query)}" class="view-all-results">
                    View all results for "${this.escapeHtml(query)}"
                    <i class="fas fa-arrow-right ml-2"></i>
                 </a>`;

        this.searchDropdown.innerHTML = html;
        this.showDropdown();
    }

    createAutocompleteItem(item, query) {
        const highlightedName = this.highlightText(item.name || '', query);
        let imageUrl = item.image_url || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=100&h=100&fit=crop';
        let link = '#';
        let extraHtml = '';

        if (item.type === 'product') {
            link = `product.html?id=${item.id}`;
            if (item.brand_name) {
                extraHtml = `<div class="dropdown-item-brand">${this.highlightText(item.brand_name, query)}</div>`;
            }
        } else if (item.type === 'brand') {
            link = `brand.html?id=${item.id}`;
        } else if (item.type === 'property') {
            link = `search.html?q=${encodeURIComponent(item.name)}`;
        }

        return `<a href="${link}" class="dropdown-item">
                    <img src="${imageUrl}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=100&h=100&fit=crop'">
                    <div class="dropdown-item-content">
                        <div class="dropdown-item-name">${highlightedName}</div>
                        ${extraHtml}
                    </div>
                    <i class="fas fa-arrow-right text-muted"></i>
                </a>`;
    }

    highlightText(text, query) {
        if (!text || !query) return text;
        const re = new RegExp(`(${this.escapeRegExp(query)})`, 'gi');
        return text.replace(re, '<mark>$1</mark>');
    }

    escapeRegExp(s) {
        return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    escapeHtml(unsafe) {
        if (!unsafe) return unsafe;
        return unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    showLoadingState() {
        this.searchDropdown.innerHTML = `<div class="loading-results">
            <i class="fas fa-spinner fa-spin"></i>
            <div>Searching...</div>
        </div>`;
        this.showDropdown();
    }

    showNoResults(query) {
        this.searchDropdown.innerHTML = `<div class="no-results">
            <i class="fas fa-search"></i>
            <div>No results found for "${this.escapeHtml(query)}"</div>
        </div>`;
        this.showDropdown();
    }

    showErrorState() {
        this.searchDropdown.innerHTML = `<div class="no-results">
            <i class="fas fa-exclamation-triangle"></i>
            <div>Search temporarily unavailable</div>
        </div>`;
        this.showDropdown();
    }
}

// ========================
// Search results page logic
// ========================
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
        const params = new URLSearchParams(window.location.search);
        this.currentQuery = params.get('q') || '';
        if (!this.currentQuery) {
            window.location.href = 'index.html';
            return;
        }

        document.title = `Search: ${this.currentQuery} - PEINTURE LAND`;
        const qd = document.getElementById('searchQuery');
        if (qd) qd.textContent = this.currentQuery;

        this.resultsGrid = document.getElementById('searchResultsGrid');
        this.loader = document.getElementById('infiniteScrollLoader');

        if (!this.resultsGrid) {
            console.error('Search results grid not found');
            return;
        }

        await this.loadResults();
        this.setupInfiniteScroll();
    }

    async loadResults() {
        if (this.isLoading || !this.hasMoreResults) return;
        this.isLoading = true;
        this.showLoading(true);

        try {
            if (!window.supabaseClient) await window.ensureSupabase();

            const { data, error } = await window.supabaseClient.rpc('search_products', {
                search_query: this.currentQuery,
                limit_count: this.limit,
                offset_count: this.currentPage * this.limit
            });

            if (error) {
                console.error('Search products RPC error:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                throw error;
            }

            const products = data || [];
            this.hasMoreResults = products.length === this.limit;

            if (products.length > 0) {
                this.renderProducts(products);
            } else if (this.currentPage === 0) {
                this.showNoResults();
            }

            this.currentPage++;

        } catch (e) {
            console.error('Search error:', e);
            this.showError();
        } finally {
            this.isLoading = false;
            this.showLoading(false);
        }
    }

    renderProducts(products) {
        products.forEach(p => {
            const card = this.createSearchProductCard(p);
            if (card) this.resultsGrid.appendChild(card);
        });
    }

    createSearchProductCard(p) {
        const c = document.createElement('a');
        c.href = `product.html?id=${p.id}`;
        c.className = 'product-card will-animate';

        const desc = p.description?.length > 100 ? p.description.substring(0, 100) + '...' : p.description || '';

        const nameHighlighted = this.highlightText(p.name, this.currentQuery);
        const descHighlighted = this.highlightText(desc, this.currentQuery);
        const brandHighlighted = this.highlightText(p.brand_name || '', this.currentQuery);

        c.innerHTML = `
            <div class="product-image-container">
                <img src="${p.image_url || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop'}" alt="${p.name}" class="product-image">
            </div>
            <div class="product-info">
                <div class="brand-badge">🔖 ${brandHighlighted}</div>
                <h3 class="product-name">${nameHighlighted}</h3>
                <div class="product-description-container"><p class="product-description">${descHighlighted}</p></div>
                <div class="product-actions">
                    <button class="btn add-to-cart" data-product-id="${p.id}" data-product-name="${p.name}" data-product-description="${p.description}" data-product-image="${p.image_url || ''}" data-brand-id="${p.brand_id}">
                        <i class="fas fa-cart-plus"></i> Add To Cart
                    </button>
                    <span class="view-details">View Details <i class="fas fa-arrow-right"></i></span>
                </div>
            </div>
        `;

        setTimeout(() => {
            const btn = c.querySelector('.add-to-cart');
            if (btn) {
                btn.addEventListener('click', e => {
                    e.preventDefault();
                    e.stopPropagation();
                    const pd = {
                        id: p.id,
                        name: p.name,
                        description: p.description,
                        image_url: p.image_url,
                        brand_id: p.brand_id,
                        quantity: 1
                    };
                    if (window.cartManager && typeof window.cartManager.addToCart === 'function') {
                        window.cartManager.addToCart(pd);
                    } else if (typeof addToCartFallback === 'function') {
                        addToCartFallback(pd);
                    }
                });
            }
        }, 50);

        return c;
    }

    highlightText(text, query) {
        if (!text || !query) return text;
        const re = new RegExp(`(${this.escapeRegExp(query)})`, 'gi');
        return text.replace(re, '<mark>$1</mark>');
    }

    escapeRegExp(s) {
        return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    escapeHtml(unsafe) {
        if (!unsafe) return unsafe;
        return unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    showLoading(show) {
        if (this.loader) {
            show ? this.loader.classList.remove('hidden') : this.loader.classList.add('hidden');
        }
    }

    showNoResults() {
        this.resultsGrid.innerHTML = `
            <div class="no-search-results" style="grid-column: 1 / -1;">
                <i class="fas fa-search"></i>
                <h3>No results found for "${this.escapeHtml(this.currentQuery)}"</h3>
                <p class="search-suggestions">Try different keywords or browse our brands</p>
                <a href="index.html" class="btn" style="margin-top: 20px;"><i class="fas fa-home"></i> Back to Home</a>
            </div>
        `;
    }

    showError() {
        this.resultsGrid.innerHTML = `
            <div class="no-search-results" style="grid-column: 1 / -1;">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Search temporarily unavailable</h3>
                <p class="search-suggestions">Please try again in a few moments</p>
                <button onclick="window.location.reload()" class="btn" style="margin-top: 20px;"><i class="fas fa-redo"></i> Retry</button>
            </div>
        `;
    }

    setupInfiniteScroll() {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && this.hasMoreResults && !this.isLoading) {
                this.loadResults();
            }
        }, { threshold: 0.1 });
        if (this.loader) observer.observe(this.loader);
    }
}

// ========================
// Initialize both systems
// ========================
window.initializeSearchSystem = function() {
    window.searchSystem = new SearchSystem();
    window.searchResultsPage = new SearchResultsPage();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initializeSearchSystem);
} else {
    window.initializeSearchSystem();
}

window.SearchSystem = SearchSystem;
window.SearchResultsPage = SearchResultsPage;