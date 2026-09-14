import React from 'react';
import ReactDOM from 'react-dom/client';
import OperationsConsoleApp from './App.tsx';

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <OperationsConsoleApp />
    </React.StrictMode>
  );
}
