/**
 * Simple Auth Manager
 * - Manages auth state, login modal, and broadcasts auth changes
 */
(function() {
    class AuthManager {
        constructor() {
            this.isAuthenticated = false;
            this.statusEndpoint = 'endpoints/security_t1.php?action=status';
            this.loginEndpoint = 'endpoints/security_t1.php?action=login';
            this.logoutEndpoint = 'endpoints/security_t1.php?action=logout';
            this.listeners = new Set();
            this.initialize();
        }

        async initialize() {
            await this.refreshStatus();
            this.setupUiBindings();
            document.addEventListener('DOMContentLoaded', () => this.setupUiBindings());
            this.broadcast();
        }

        async refreshStatus() {
            try {
                const res = await fetch(this.statusEndpoint, { credentials: 'same-origin' });
                const data = await res.json();
                this.isAuthenticated = !!data.authenticated;
            } catch (e) {
                this.isAuthenticated = false;
            }
        }

        onChange(callback) {
            this.listeners.add(callback);
            return () => this.listeners.delete(callback);
        }

        broadcast() {
            this.listeners.forEach(cb => {
                try { cb(this.isAuthenticated); } catch (_) {}
            });
            document.dispatchEvent(new CustomEvent('auth:changed', { detail: { authenticated: this.isAuthenticated } }));
        }

        setupUiBindings() {
            // Auth button
            const authBtn = document.getElementById('siteAuthBtn');
            if (authBtn) {
                authBtn.addEventListener('click', () => this.handleSiteAuthClick());
            }

            // Modal events
            const modal = document.getElementById('siteLoginModal');
            const closeBtn = document.getElementById('siteLoginModalClose');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.hideLoginModal());
            }
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) this.hideLoginModal();
                });
            }

            const form = document.getElementById('siteLoginForm');
            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await this.loginFromForm(form);
                });
            }

            // React on auth changes to update UI
            this.onChange((authed) => {
                // Toggle button state
                const btn = document.getElementById('siteAuthBtn');
                if (btn) {
                    btn.classList.toggle('authenticated', authed);
                    const icon = btn.querySelector('.site-auth-icon');
                    if (icon) icon.setAttribute('name', authed ? 'log-out-outline' : 'log-in-outline');
                }

                // Hide/show protected nav links
                const protectedLinks = document.querySelectorAll('.nav-link[data-protected="true"]');
                protectedLinks.forEach(link => {
                    if (authed) {
                        link.classList.remove('secured-hidden');
                    } else {
                        link.classList.add('secured-hidden');
                    }
                });
            });
        }

        async handleSiteAuthClick() {
            if (this.isAuthenticated) {
                await this.logout();
            } else {
                this.showLoginModal();
            }
        }

        showLoginModal() {
            const modal = document.getElementById('siteLoginModal');
            if (modal) modal.classList.add('visible');
        }

        hideLoginModal() {
            const modal = document.getElementById('siteLoginModal');
            if (modal) modal.classList.remove('visible');
        }

        async loginFromForm(form) {
            const submitBtn = form.querySelector('.site-login-submit');
            const errorBox = form.querySelector('.site-error-message');
            const spinner = form.querySelector('.site-loading-spinner');
            const username = form.querySelector('input[name="username"]').value.trim();
            const password = form.querySelector('input[name="password"]').value.trim();

            errorBox && (errorBox.style.display = 'none');
            submitBtn && submitBtn.classList.add('loading');
            spinner && (spinner.style.display = 'block');

            try {
                const res = await fetch(this.loginEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'same-origin',
                    body: JSON.stringify({ username, password })
                });
                const data = await res.json();
                if (!data.success) throw new Error(data.error || 'Login failed');
                this.isAuthenticated = true;
                this.broadcast();
                this.hideLoginModal();
            } catch (e) {
                if (errorBox) {
                    errorBox.textContent = e.message || 'Login failed';
                    errorBox.style.display = 'block';
                }
            } finally {
                submitBtn && submitBtn.classList.remove('loading');
                spinner && (spinner.style.display = 'none');
            }
        }

        async logout() {
            try {
                await fetch(this.logoutEndpoint, { method: 'POST', credentials: 'same-origin' });
            } catch (_) {}
            this.isAuthenticated = false;
            this.broadcast();
            // Force navigate away from protected views
            try {
                const currentHash = window.location.hash.substring(1);
                if (currentHash) {
                    const hasProtected = currentHash.split('|').some(part => {
                        const id = part.split('/')[0];
                        const el = document.getElementById(id);
                        return el && el.getAttribute('data-protected') === 'true';
                    });
                    if (hasProtected) {
                        // Navigate to default hash from site config, or clear hash
                        const siteContainer = document.querySelector('.site-container');
                        const defaultNavRaw = siteContainer && siteContainer.getAttribute('data-default-navigation');
                        if (defaultNavRaw) {
                            try {
                                const cfg = JSON.parse(defaultNavRaw);
                                if (cfg.hash) {
                                    window.location.hash = cfg.hash;
                                } else {
                                    window.location.hash = '';
                                }
                            } catch (_) { window.location.hash = ''; }
                        } else {
                            window.location.hash = '';
                        }
                    }
                }
            } catch (_) {}
        }
    }

    // Global instance
    window.authManager = new AuthManager();
    // For HTML inline handlers
    window.handleSiteAuthClick = () => window.authManager.handleSiteAuthClick();
})();


