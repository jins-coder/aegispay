import React from 'react';
import { BoilerplateDemo } from '../../examples/BoilerplateDemo';
import { Callout } from '../../components/Callout';
import { Minimize2, TrendingDown } from 'lucide-react';

export function CodeReducerLabPage() {
  return (
    <article className="doc-content">
      <div className="doc-breadcrumb">Reference &gt; Code Reduction Lab (-89.2%)</div>

      <h1 className="doc-title">Code Reduction Lab</h1>
      <p className="doc-lead">
        The core mission of uReact is to radically reduce the size and ceremony of React code blocks. See the progression from 65 lines of standard React down to 7 lines of uReact below:
      </p>

      {/* Embedded Live Code Reduction Demonstration */}
      <BoilerplateDemo />
    </article>
  );
}
