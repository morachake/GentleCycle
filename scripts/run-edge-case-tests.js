#!/usr/bin/env node

/**
 * Edge Case Test Runner for GentleCycle
 * Demonstrates critical edge case testing scenarios
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 GentleCycle Edge Case Test Runner');
console.log('=====================================\n');

// Check if test files exist
const testDir = path.join(__dirname, '..', '__tests__');
const testFiles = [
  'edge-cases.test.ts',
  'medical-safety.test.ts', 
  'data-integrity.test.ts'
];

console.log('📁 Checking test files...');
testFiles.forEach(file => {
  const filePath = path.join(testDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} found`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

console.log('\n🔍 Critical Edge Cases to Test:');
console.log('');

const criticalTests = [
  {
    category: '🧮 Mathematical',
    tests: [
      'Division by zero with identical cycle lengths',
      'Empty datasets and null values',
      'Leap year date calculations',
      'Same-day period calculations',
      'Performance with 1000+ cycles'
    ]
  },
  {
    category: '⚕️ Medical Safety', 
    tests: [
      'Missed period detection (pregnancy)',
      'PCOS irregular pattern detection',
      'Extended bleeding warnings',
      'Medical consultation thresholds',
      'Age-related cycle changes'
    ]
  },
  {
    category: '🔒 Data Integrity',
    tests: [
      'Malformed JSON recovery',
      'Duplicate period prevention',
      'Corrupted numeric values',
      'Large dataset memory management',
      'Life event transitions'
    ]
  }
];

criticalTests.forEach(category => {
  console.log(`${category.category}:`);
  category.tests.forEach(test => {
    console.log(`  • ${test}`);
  });
  console.log('');
});

console.log('🚀 To run these tests:');
console.log('');
console.log('📦 Install dependencies:');
console.log('   npm install');
console.log('');
console.log('🧪 Run all edge case tests:');
console.log('   npm test');
console.log('');
console.log('🎯 Run specific test suites:');
console.log('   npm run test:edge-cases      # Mathematical edge cases');
console.log('   npm run test:medical-safety  # Medical safety scenarios');
console.log('   npm run test:data-integrity  # Data corruption recovery');
console.log('');
console.log('📊 Generate coverage report:');
console.log('   npm run test:coverage');
console.log('');

console.log('⚠️  Critical Tests That Must Pass:');
console.log('   ✅ No app crashes with any input');
console.log('   ✅ Medical warnings for concerning patterns');
console.log('   ✅ Data integrity maintained');
console.log('   ✅ Performance <50ms for calculations');
console.log('   ✅ Invalid data handled gracefully');
console.log('');

console.log('🏥 Medical Safety Thresholds:');
console.log('   • Cycle <21 or >35 days → Medical consultation');
console.log('   • Period >7 days → Extended bleeding warning');
console.log('   • >42 days since last period → Pregnancy test');
console.log('   • High irregularity (>25% variation) → Medical review');
console.log('');

console.log('📈 Success Criteria:');
console.log('   • 80%+ test coverage');
console.log('   • All critical tests pass');
console.log('   • No memory leaks');
console.log('   • Clear error messages');
console.log('');

console.log('Ready to test your app\'s edge case handling! 🎯');

// If Jest is available, show a quick demo
try {
  console.log('\n🎬 Quick Demo - Running Mathematical Edge Cases:');
  console.log('================================================');
  
  // Try to run a quick test
  execSync('npx jest --version', { stdio: 'pipe' });
  console.log('Jest detected! You can run tests now.');
  
} catch (error) {
  console.log('Jest not installed. Run "npm install" first.');
}

console.log('\n💡 Tip: Use "npm run test:watch" during development');
console.log('   This will re-run tests automatically as you code.');
console.log('');