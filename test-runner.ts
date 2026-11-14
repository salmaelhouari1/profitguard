import { runMilestone1Tests } from './src/backend/tests/milestone1.test';
import { runIndependentVerification } from './src/backend/tests/independentVerification.test';

console.log('================================================================');
console.log('    PROFITGUARD MILESTONE 1 INDEPENDENT VERIFICATION RUNNER     ');
console.log('================================================================\n');

console.log('>>> RUNNING BASE REGRESSION TESTS...');
const base = runMilestone1Tests();
console.log(`Base Tests: ${base.passed} Passed, ${base.failed} Failed\n`);

console.log('>>> RUNNING INDEPENDENT ADVERSARIAL & EDGE-CASE TESTS...');
const independent = runIndependentVerification();

let passed = 0;
let failed = 0;

independent.forEach((r) => {
  if (r.passed) {
    passed++;
    console.log(`✅ [${r.category}] ${r.name}`);
  } else {
    failed++;
    console.log(`❌ [${r.category}] ${r.name}\n   Error: ${r.error}`);
  }
});

console.log('\n================================================================');
console.log(`INDEPENDENT VERIFICATION TOTAL: ${passed} Passed, ${failed} Failed`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL INDEPENDENT VERIFICATION TESTS PASSED!');
}
