# Dynamic Loading Test Suite

Comprehensive testing for all 12 dynamic loading scenarios and their permutations.

## Test Files

### 1. `dynamic_loading_test.js` - Browser Tests
Client-side testing of the DynamicContentLoader class.

**Run in browser console:**
```javascript
// Load the script
<script src="tests/dynamic_loading_test.js"></script>

// Run all tests
new DynamicLoadingTestSuite().runAll();
```

**Tests:**
- Scenario 1: Protected content (with/without auth)
- Scenario 2: Explicit dynamic components
- Scenario 3: URL parameters
- Scenario 6: Smart reload prevention
- Scenario 7: Content switching
- Scenario 8: Caching
- Scenario 9: Protected content not cached
- Scenario 10: Authentication checks
- Scenario 11: Init hooks
- Scenario 12: Script execution & deduplication
- Integration: Container scanning
- Integration: Metadata extraction

### 2. `dynamic_loading_test.php` - Backend Tests
Server-side testing of the API endpoint and builder integration.

**Run from command line:**
```bash
C:\xampp\php\php.exe tests/dynamic_loading_test.php
```

**Tests:**
- Scenario 1: Protected content authentication
- Scenario 2: Explicit dynamic component loading
- Scenario 3: URL parameter passing
- Scenario 4: Page definition validation
- Scenario 5: Component extraction
- Scenario 6: Builder integration
- Scenario 7: Dynamic flag management
- Scenario 8: Request type detection
- Scenario 9: Error handling
- Scenario 10: Cache key generation

## Test Coverage

### Scenarios Tested

| Scenario | Description | JS Test | PHP Test |
|----------|-------------|---------|----------|
| 1 | Protected Content | ✅ | ✅ |
| 2 | Explicit Dynamic | ✅ | ✅ |
| 3 | URL Parameters | ✅ | ✅ |
| 4 | Initial Hash Load | ⚠️ Manual | N/A |
| 5 | Multiple Components | ✅ | ✅ |
| 6 | Smart Reload Skip | ✅ | N/A |
| 7 | Content Switching | ✅ | N/A |
| 8 | Public Caching | ✅ | ✅ |
| 9 | Protected No Cache | ✅ | ✅ |
| 10 | Auth Check | ✅ | ✅ |
| 11 | Init Hooks | ✅ | N/A |
| 12 | Script Execution | ✅ | N/A |

### Permutations Tested

- Protected + Authenticated
- Protected + Not Authenticated
- Dynamic + URL Parameters
- Dynamic + No Parameters
- Same Content Reload (skip)
- Different Content Reload (switch)
- Cached Content Retrieval
- Fresh Content Load
- Multiple Components in Container
- Component Extraction from Nested Structure

## Expected Results

### All Tests Pass ✅
- Dynamic loading works correctly
- Authentication enforced
- Caching works as expected
- Smart reload prevention active
- Init hooks triggered
- Scripts executed without duplicates

### Some Tests Skipped ⏭️
- No protected components found
- No dynamic components found
- Feature not applicable in test environment

### Tests Fail ❌
- Implementation issue detected
- Configuration problem
- Missing dependencies

## Manual Testing Checklist

After running automated tests, manually verify:

1. **Navigate to Projects Page**
   - [ ] Projects grid loads dynamically
   - [ ] No console errors

2. **Click on a Project**
   - [ ] Project details load dynamically
   - [ ] URL parameters passed correctly
   - [ ] Back button works

3. **Click Same Project Again**
   - [ ] Content not reloaded (smart skip)
   - [ ] Very fast response

4. **Click Different Project**
   - [ ] Content switches
   - [ ] New project details shown

5. **Navigate Away and Back**
   - [ ] Content cached (if public)
   - [ ] Loads instantly from cache

6. **Try Admin Page (Protected)**
   - [ ] Without login: Blocked
   - [ ] With login: Loads successfully
   - [ ] Content not cached

7. **Check Browser Console**
   - [ ] No errors
   - [ ] Dynamic loading logs visible
   - [ ] Init hooks called

## Debugging

### Enable Debug Mode

**JavaScript:**
```javascript
// Check loader status
console.log(window.dynamicContentLoader);

// Check cache
console.log(localStorage);

// Clear cache
window.dynamicContentLoader.clearCache();
```

**PHP:**
```php
// In endpoints/dynamic_content_t1.php
$debugMode = true; // Line 48
```

### Common Issues

**Issue: Tests skip because no dynamic components found**
- Solution: Ensure page has components with `data-dynamic="true"`

**Issue: Protected content tests fail**
- Solution: Check session handling and authentication

**Issue: Caching tests fail**
- Solution: Check localStorage is enabled in browser

**Issue: Init hooks not called**
- Solution: Verify `data-init-hook` attribute and function exists

## Test Output Example

```
╔════════════════════════════════════════════════════════╗
║   DYNAMIC LOADING COMPREHENSIVE TEST SUITE            ║
╚════════════════════════════════════════════════════════╝

✅ DynamicContentLoader found

🧪 Test 1: Scenario 1.1: Protected content blocked without auth
✅ PASSED: Scenario 1.1: Protected content blocked without auth

🧪 Test 2: Scenario 1.2: Protected content loads with auth
✅ PASSED: Scenario 1.2: Protected content loads with auth

...

╔════════════════════════════════════════════════════════╗
║                    TEST REPORT                         ║
╚════════════════════════════════════════════════════════╝

Total Tests: 15
✅ Passed: 13
❌ Failed: 0
⏭️  Skipped: 2
⚠️  Warnings: 0

✅ PASSED TESTS:
   ✓ Scenario 1.1: Protected content blocked without auth
   ✓ Scenario 1.2: Protected content loads with auth
   ...

════════════════════════════════════════════════════════════
🎉 ALL TESTS PASSED!
════════════════════════════════════════════════════════════
```

## Contributing

When adding new dynamic loading features:

1. Add test case to appropriate test file
2. Document expected behavior
3. Run tests to verify
4. Update this README

## Notes

- Tests use mocking where necessary
- Some tests require actual page components
- Backend tests require XAMPP PHP
- Browser tests require actual portfolio site loaded
