# GentleCycle Edge Case Testing Guide

## Overview

This testing suite covers critical edge cases for the GentleCycle period tracking app to ensure safety, accuracy, and reliability.

## Test Categories

### 🧮 Mathematical Edge Cases (`edge-cases.test.ts`)
Tests core mathematical functions for:
- Division by zero scenarios
- Empty/invalid datasets
- Leap year calculations
- Same-day periods
- Extreme cycle lengths
- Performance with large datasets

### ⚕️ Medical Safety (`medical-safety.test.ts`)
Tests medically critical scenarios:
- Missed period detection (pregnancy indicators)
- Irregular cycle patterns (PCOS, perimenopause)
- Extended bleeding (potential emergencies)
- Age-related patterns
- Medical consultation thresholds

### 🔒 Data Integrity (`data-integrity.test.ts`)
Tests data corruption and recovery:
- Malformed date strings
- Corrupted numeric values
- Rapid duplicate entries
- JSON corruption detection
- Large dataset handling
- Life event transitions (pregnancy, birth control)

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# Mathematical edge cases
npm run test:edge-cases

# Medical safety validations
npm run test:medical-safety

# Data corruption scenarios
npm run test:data-integrity
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Critical Test Scenarios

### 🚨 High Priority (Must Pass)
1. **Division by Zero**: App doesn't crash with identical cycle lengths
2. **Date Validation**: Rejects invalid dates (prevents corruption)
3. **Medical Thresholds**: Detects concerning patterns appropriately
4. **Duplicate Prevention**: No duplicate periods for same date
5. **Performance**: Calculations complete quickly with large datasets

### ⚠️ Medium Priority (Should Pass)
1. **Leap Year Handling**: Correct calculations around Feb 29
2. **Extreme Values**: Graceful handling of outlier data
3. **Memory Management**: No leaks with extensive data
4. **JSON Validation**: Detects corrupted backup files

### 💡 Nice to Have (Good to Pass)
1. **Error Messages**: Clear user communication
2. **Confidence Scoring**: Appropriate for data quality
3. **Life Transitions**: Handles pregnancy/BC changes

## Medical Safety Thresholds

### Automatic Warnings Should Trigger For:
- **Cycle too short**: <21 days
- **Cycle too long**: >35 days
- **Period too long**: >7 days
- **Missed period**: >42 days since last period
- **High irregularity**: >25% coefficient of variation

### Emergency Indicators:
- **Extended bleeding**: >10 days
- **Extreme irregularity**: Standard deviation >20 days
- **Impossible values**: Negative cycles, etc.

## Test Data Examples

### Regular Cycles (Should have low variation)
```javascript
[28, 29, 27, 28, 30, 27, 29] // ~1-2 day variation
```

### PCOS Pattern (Should trigger medical consultation)
```javascript
[19, 42, 25, 38, 21, 45] // High variation, irregular
```

### Perimenopause Pattern (Age-appropriate irregularity)
```javascript
[28, 32, 25, 40, 22, 55, 18, 65] // Increasing irregularity
```

## Success Criteria

### All Tests Must:
1. ✅ **No App Crashes** - Graceful error handling
2. ✅ **Data Integrity** - No corruption of existing data
3. ✅ **Medical Safety** - Appropriate warnings when needed
4. ✅ **Performance** - Quick calculations (<50ms for large datasets)
5. ✅ **Logical Behavior** - Sensible responses to edge cases

### Coverage Goals:
- **Functions**: 80%+ coverage
- **Branches**: 80%+ coverage
- **Lines**: 80%+ coverage
- **Medical Safety Functions**: 95%+ coverage

## Common Edge Case Patterns

### Invalid Input Handling
```javascript
// Should handle gracefully
const badInputs = [null, undefined, NaN, Infinity, 'not-a-number'];
```

### Date Edge Cases
```javascript
// Leap year
'2024-02-29' // Valid
'2023-02-29' // Invalid

// Same day period
startDate: '2024-01-15'
endDate: '2024-01-15' // Should = 1 day, not 0
```

### Medical Thresholds
```javascript
// Concerning patterns
cycles: [15, 45, 20, 50] // Requires medical consultation
period: 12 // Extended bleeding warning
```

## Debugging Failed Tests

### Common Issues:
1. **Math errors**: Check for division by zero, NaN values
2. **Date parsing**: Verify timezone handling, format validation
3. **Type errors**: Ensure proper TypeScript types
4. **Performance**: Check algorithm efficiency with large data

### Debug Commands:
```bash
# Verbose test output
npx jest --verbose

# Run single test
npx jest --testNamePattern="should handle division by zero"

# Debug mode
npx jest --runInBand --detectOpenHandles
```

## Adding New Tests

When adding new edge cases:

1. **Identify the risk**: What could go wrong?
2. **Create test data**: Reproduce the edge case
3. **Define expected behavior**: What should happen?
4. **Test both success and failure**: Valid and invalid inputs
5. **Add medical context**: Is this medically concerning?

### Test Template:
```javascript
test('should handle [specific edge case]', () => {
  // Arrange
  const edgeCaseData = /* problematic input */;
  
  // Act
  const result = functionUnderTest(edgeCaseData);
  
  // Assert
  expect(result).toBeDefined();
  expect(result).toSatisfyMedicalSafety();
});
```

## Continuous Integration

These tests should run:
- ✅ Before every commit
- ✅ On pull requests
- ✅ Before releases
- ✅ Weekly scheduled runs (catch regressions)

## Medical Disclaimer

⚠️ **Important**: These tests validate app functionality but do not replace medical validation. The app should always include appropriate medical disclaimers and encourage users to consult healthcare providers for concerning symptoms or irregular patterns.

---

*This testing suite ensures GentleCycle handles edge cases safely and provides reliable period tracking for users while maintaining appropriate medical safety warnings.*