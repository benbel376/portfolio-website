/* In-browser Test Helper (Temporary) */
(function() {
  const log = (...args) => console.log('[TEST]', ...args);
  const warn = (...args) => console.warn('[TEST]', ...args);
  const err = (...args) => console.error('[TEST]', ...args);

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const waitFor = async (fn, timeout = 3000, interval = 50) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try { if (fn()) return true; } catch (_) {}
      await sleep(interval);
    }
    return false;
  };

  const assert = (cond, msg) => {
    if (cond) { log('PASS:', msg); return true; }
    err('FAIL:', msg);
    return false;
  };

  const isVisible = (el) => {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && !el.classList.contains('nav-hidden');
  };

  const activeTabId = () => {
    const active = document.querySelector('.nav-link.active');
    return active ? (active.getAttribute('data-tab-id') || active.getAttribute('data-target')) : null;
  };

  const navigateHash = async (hash) => {
    window.location.hash = hash || '';
    await sleep(150); // allow hashchange + navigation cycle
  };

  const programmaticNavigate = async (elementId, state, params = {}, tabId = null) => {
    if (window.globalNavigator) {
      window.globalNavigator.navigate(elementId, state, params, tabId);
      await sleep(150);
    } else {
      await navigateHash(`${elementId}/${state}${tabId ? '.' + tabId : ''}`);
    }
  };

  const ensureLoggedOut = async () => {
    if (window.authManager && window.authManager.isAuthenticated) {
      await fetch('endpoints/security_t1.php?action=logout', { method: 'POST', credentials: 'same-origin' });
      await window.authManager.refreshStatus();
      window.authManager.broadcast();
      await sleep(100);
    }
  };

  const loginDemo = async () => {
    await fetch('endpoints/security_t1.php?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ username: 'admin', password: 'admin' })
    });
    if (window.authManager) {
      await window.authManager.refreshStatus();
      window.authManager.broadcast();
    }
    await sleep(100);
  };

  async function testNavigationBasics() {
    log('--- testNavigationBasics ---');
    await ensureLoggedOut();
    await programmaticNavigate('summary-main-container', 'visible', {}, 'about');
    const summary = document.getElementById('summary-main-container');
    const skills = document.getElementById('skills-main-container');
    assert(isVisible(summary), 'Summary visible after navigate');
    assert(!isVisible(skills), 'Skills hidden when summary visible (default restore)');
    assert(activeTabId() === 'about', 'Active tab is about');

    await programmaticNavigate('skills-main-container', 'visible', {}, 'skills');
    assert(isVisible(skills), 'Skills visible after navigate');
    assert(activeTabId() === 'skills', 'Active tab is skills');
  }

  async function testMultipleStateHash() {
    log('--- testMultipleStateHash ---');
    await navigateHash('skills-main-container/visible|summary-main-container/hidden.skills');
    const skills = document.getElementById('skills-main-container');
    const summary = document.getElementById('summary-main-container');
    assert(isVisible(skills), 'Skills visible in multi-state hash');
    assert(!isVisible(summary), 'Summary hidden in multi-state hash');
  }

  async function testTabHighlighting() {
    log('--- testTabHighlighting ---');
    await programmaticNavigate('skills-main-container', 'visible', {}, 'skills');
    const skillsLink = document.querySelector('.nav-link[data-tab-id="skills"]');
    assert(skillsLink && skillsLink.classList.contains('active'), 'Skills tab highlighted');
  }

  async function testDynamicProtectedFlow() {
    log('--- testDynamicProtectedFlow ---');
    await ensureLoggedOut();
    const adminLink = document.querySelector('.nav-link[data-tab-id="admin"]');
    assert(adminLink && adminLink.classList.contains('secured-hidden'), 'Admin tab hidden while logged out');

    // Attempt to navigate to admin directly should be blocked
    await programmaticNavigate('admin-main-container', 'visible', {}, 'admin');
    const adminContainer = document.getElementById('admin-main-container');
    // Wait a bit to allow filters to apply
    await sleep(150);
    assert(!isVisible(adminContainer), 'Admin container not visible when logged out');

    // Login and verify
    await loginDemo();
    assert(!(adminLink && adminLink.classList.contains('secured-hidden')), 'Admin tab visible after login');
    await programmaticNavigate('admin-main-container', 'visible', {}, 'admin');
    const loadedOk = await waitFor(() => {
      const comp = document.getElementById('admin-header');
      return comp && comp.getAttribute('data-load-state') === 'loaded';
    }, 5000);
    assert(loadedOk, 'Admin dynamic component loaded');

    // Logout and verify redirect
    await ensureLoggedOut();
    await sleep(150);
    const current = window.location.hash;
    assert(!/admin-main-container/.test(current), 'Hash redirected away from admin after logout');
    assert(!isVisible(adminContainer), 'Admin container hidden after logout');
  }

  async function testHistoryNavigation() {
    log('--- testHistoryNavigation ---');
    await programmaticNavigate('summary-main-container', 'visible', {}, 'about');
    await programmaticNavigate('skills-main-container', 'visible', {}, 'skills');
    const before = activeTabId();
    window.history.back();
    const backOk = await waitFor(() => activeTabId() !== before, 2000);
    assert(backOk && activeTabId() === 'about', 'History back returns to About');
  }

  async function runAll() {
    log('Starting test suite...');
    try {
      await testNavigationBasics();
      await testMultipleStateHash();
      await testTabHighlighting();
      await testDynamicProtectedFlow();
      await testHistoryNavigation();
      log('All tests completed. Review PASS/FAIL above.');
    } catch (e) {
      err('Test suite error:', e);
    }
  }

  window.siteTest = {
    runAll,
    testNavigationBasics,
    testMultipleStateHash,
    testTabHighlighting,
    testDynamicProtectedFlow,
    testHistoryNavigation
  };

  log('Test helper loaded. Run siteTest.runAll() to execute the suite.');
})();


