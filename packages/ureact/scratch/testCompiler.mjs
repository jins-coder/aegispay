import { compileUReact, runCompilerBenchmark } from '../dist/index.js';

console.log('--- Testing compileUReact ---');

const input1 = `
import { createStore } from 'ureact';

const store = createStore({
  user: {
    profile: {
      score: 10,
      name: "Alice"
    }
  },
  items: []
});

function handleIncrement() {
  store.user.profile.score++;
  store.user.profile.name = "Bob";
  store.items.push({ id: 1, text: "Item" });
}

export function ProfileView() {
  return (
    <div>
      <span>{counter.value}</span>
      <input $bind={store.user.profile.name} />
    </div>
  );
}
`;

const res = compileUReact(input1);
console.log('Compiled Output:\n', res.code);
console.log('\nStats:\n', JSON.stringify(res.stats, null, 2));

console.log('\n--- Testing runCompilerBenchmark ---');
const bench = runCompilerBenchmark(50000);
console.log('Benchmark (50k iterations):', bench);

if (res.stats.mutationsOptimized >= 3 && res.stats.signalsPruned >= 1 && res.stats.bindingsCompiled >= 1) {
  console.log('\n✅ All transform assertions passed!');
} else {
  console.error('\n❌ Assertions failed!');
  process.exit(1);
}
