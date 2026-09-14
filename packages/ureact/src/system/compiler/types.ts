export interface CompilerOptions {
  /**
   * Optimize direct store mutations into atomic __patch() calls
   * e.g. store.count++ -> store.__patch(['count'], v => v + 1)
   * @default true
   */
  optimizeMutations?: boolean;

  /**
   * Prune signal reads in JSX into fine-grained <SignalValue> nodes
   * e.g. <span>{counter.value}</span> -> <span><SignalValue signal={counter} /></span>
   * @default true
   */
  signalDomPruning?: boolean;

  /**
   * Transform $bind={store.prop} into compiled value/onChange handlers
   * @default true
   */
  compileTwoWayBind?: boolean;

  /**
   * Automatically wrap functional components reading stores/signals with view()
   * @default true
   */
  autoView?: boolean;

  /**
   * Target React runtime environment
   * @default 'react19'
   */
  target?: 'react19' | 'react18';

  /**
   * Include inline source maps
   * @default false
   */
  sourcemap?: boolean;
}

export interface CompilerStats {
  mutationsOptimized: number;
  viewsInjected: number;
  signalsPruned: number;
  bindingsCompiled: number;
  bytecodeReductionPct: number;
  compileTimeMs: number;
}

export interface CompilerResult {
  code: string;
  stats: CompilerStats;
  transformed: boolean;
}
