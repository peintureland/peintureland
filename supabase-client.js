// Supabase Client Configuration (Netlify / Browser-safe)
const supabaseUrl = window.SUPABASE_URL;
const supabaseKey = window.SUPABASE_KEY;

// Initialize Supabase client ONCE
(function () {
    try {
        if (!supabaseUrl || !supabaseKey) {
            console.error('Supabase env vars missing');
            return;
        }

        if (window.supabase && !window.supabaseClient) {
            window.supabaseClient = window.supabase.createClient(
                supabaseUrl,
                supabaseKey
            );
        }
    } catch (e) {
        console.error('Error while creating Supabase client:', e);
    }
})();

// Ensure Supabase helper
function ensureSupabase(callback) {
    const callIfFunction = fn => {
        if (typeof fn === 'function') {
            try { fn(); } catch (e) {}
        }
    };

    if (window.supabaseClient) {
        callIfFunction(callback);
        return Promise.resolve(window.supabaseClient);
    }

    if (!window._supabaseLoading) {
        window._supabaseLoading = true;
        window._supabaseLoadPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

            script.onload = () => {
                try {
                    window.supabaseClient = window.supabase.createClient(
                        supabaseUrl,
                        supabaseKey
                    );
                    resolve(window.supabaseClient);
                    callIfFunction(callback);
                } catch (e) {
                    reject(e);
                }
            };

            script.onerror = () => reject(new Error('Supabase CDN load failed'));
            document.head.appendChild(script);
        });
    }

    return window._supabaseLoadPromise;
}

// Timeout-safe helper
async function supabaseCallWithTimeout(promiseFactory, containerId, timeoutMs = 7000) {
    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), timeoutMs)
    );

    try {
        const res = await Promise.race([promiseFactory(), timeoutPromise]);
        if (res?.error) throw res.error;
        return res;
    } catch (err) {
        if (containerId) {
            const el = document.getElementById(containerId);
            if (el) {
                el.innerHTML = `<div class="loading error">Failed to load data.</div>`;
            }
        }
        throw err;
    }
}

// Global exports
window.ensureSupabase = ensureSupabase;
window.supabaseCallWithTimeout = supabaseCallWithTimeout;
