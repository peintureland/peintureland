// Supabase Client Configuration
const supabaseUrl = 'https://ywcpovfepiuspgcsjizs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Y3BvdmZlcGl1c3BnY3NqaXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNDQ2OTgsImV4cCI6MjA4MTYyMDY5OH0.UY8WgnpVJbckuwnrxTALikfWU9VwBzaW2hIVvgk9D48';

// Initialize Supabase client (without declaring global 'supabase' to avoid conflicts)
(function(){
    // Create client if supabase library already present
    try {
        if (window.supabase && !window.supabaseClient) {
            window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
        }
    } catch (e) {
        console.error('Error while creating Supabase client:', e);
    }
    console.log('Supabase client initialized:', !!window.supabaseClient);
})();

// Helper function to ensure Supabase is loaded. Returns a Promise and
// supports an optional callback for older call sites.
function ensureSupabase(callback) {
    const callIfFunction = fn => {
        if (typeof fn === 'function') {
            try { fn(); } catch (e) { console.error('ensureSupabase callback error:', e); }
        }
    };

    // If client already exists, resolve immediately
    if (window.supabaseClient) {
        callIfFunction(callback);
        return Promise.resolve(window.supabaseClient);
    }

    // If Supabase library available but client not created, try to create it
    if (window.supabase && !window.supabaseClient) {
        try {
            window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
            callIfFunction(callback);
            return Promise.resolve(window.supabaseClient);
        } catch (e) {
            console.error('Error creating Supabase client:', e);
            // fallthrough to dynamic load
        }
    }

    // Otherwise, try to load Supabase from CDN and create the client.
    if (!window._supabaseLoading) {
        window._supabaseLoading = true;
        window._supabaseLoadPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            let resolved = false;

            script.onload = () => {
                try {
                    window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
                    resolved = true;
                    resolve(window.supabaseClient);
                    callIfFunction(callback);
                } catch (e) {
                    console.error('Error creating Supabase client after load:', e);
                    resolved = true;
                    reject(e);
                }
            };

            script.onerror = () => {
                console.error('Failed to load Supabase client script');
                if (!resolved) {
                    resolved = true;
                    reject(new Error('Failed to load Supabase script'));
                }
            };

            // Failsafe timeout: reject after 8s
            const timeout = setTimeout(() => {
                if (!resolved) {
                    console.error('Supabase load timeout');
                    resolved = true;
                    reject(new Error('Supabase load timeout'));
                }
            }, 8000);

            document.head.appendChild(script);
        }).catch(err => {
            // Mark load failure for other code paths
            window.supabaseLoadFailed = true;
            return Promise.reject(err);
        });
    }

    if (typeof window._supabaseLoadPromise !== 'undefined') {
        // Also call callback when resolved
        window._supabaseLoadPromise.then(() => callIfFunction(callback)).catch(() => callIfFunction(callback));
        return window._supabaseLoadPromise;
    }

    // Fallback: return a rejected promise
    return Promise.reject(new Error('Unable to initialize Supabase'));
}

// A small helper to perform Supabase calls with a timeout and user-friendly fallback.
async function supabaseCallWithTimeout(promiseFactory, containerId, timeoutMs = 7000) {
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs));
    try {
        const res = await Promise.race([promiseFactory(), timeoutPromise]);
        if (res && res.error) throw res.error;
        return res;
    } catch (err) {
        if (containerId) {
            const el = document.getElementById(containerId);
            if (el && el.innerHTML && el.innerHTML.toLowerCase().includes('loading')) {
                el.innerHTML = `<div class="loading error">Failed to load data. Please refresh or try again later.</div>`;
            }
        }
        throw err;
    }
}

// Export helpers to the global scope for use in other scripts
window.ensureSupabase = ensureSupabase;
window.supabaseCallWithTimeout = supabaseCallWithTimeout;