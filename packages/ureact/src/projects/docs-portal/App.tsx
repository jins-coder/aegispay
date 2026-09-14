import React, { useState, useMemo, useEffect } from 'react';
import { useShortcut, useRouter, Head, DevTools, registerDevTools } from 'ureact';
import { DocHeader } from './components/DocHeader';
import { DocSidebar } from './components/DocSidebar';
import { DocTableOfContents } from './components/DocTableOfContents';
import { DocPagination } from './components/DocPagination';
import { ShortcutMenuModal } from './components/ShortcutMenuModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ALL_DOC_PAGES, DOC_CATEGORIES, getDocPageByPath, getDocPageById } from './docs/docsData';
import { canvasStore } from './examples/HistoryDemo';

// Import All 13 Documentation Pages
import { QuickstartPage } from './docs/pages/QuickstartPage';
import { ReactiveStatePage } from './docs/pages/ReactiveStatePage';
import { DirectBindingPage } from './docs/pages/DirectBindingPage';
import { CollectionsPage } from './docs/pages/CollectionsPage';
import { AutoFormPage } from './docs/pages/AutoFormPage';
import { React19ActionsPage } from './docs/pages/React19ActionsPage';
import { React19AsyncPage } from './docs/pages/React19AsyncPage';
import { React19ResourcesPage } from './docs/pages/React19ResourcesPage';
import { QueryCachePage } from './docs/pages/QueryCachePage';
import { ControlFlowPage } from './docs/pages/ControlFlowPage';
import { TimeTravelPage } from './docs/pages/TimeTravelPage';
import { HooksReferencePage } from './docs/pages/HooksReferencePage';
import { CodeReducerLabPage } from './docs/pages/CodeReducerLabPage';
import { PlaygroundPage } from './docs/pages/PlaygroundPage';
import { RoadmapPage } from './docs/pages/RoadmapPage';
import { DevFeaturesPage } from './docs/pages/DevFeaturesPage';
import { DevToolsPage } from './docs/pages/DevToolsPage';
import { CompilerPage } from './docs/pages/CompilerPage';
import { RoadmapModal } from './components/RoadmapModal';



export function App() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<'2.3.0' | '2.2.0' | '2.1.0'>('2.3.0');
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);

  useEffect(() => {
    // Register global store with DevTools HUD
    registerDevTools('CanvasStore', 'store', canvasStore);
  }, []);


  // Theme state: defaults to light theme (clean react.dev white palette)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ureact-theme');
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ureact-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Derive active document page directly from multi-page URL pathname
  const currentPage = useMemo(() => {
    return getDocPageByPath(router.pathname) || ALL_DOC_PAGES[0];
  }, [router.pathname]);

  const activePageId = currentPage.id;

  // Global shortcut to toggle search palette: Ctrl+K or Cmd+K
  useShortcut(['mod+k', 'ctrl+k'], () => setIsSearchOpen((prev) => !prev), { preventDefault: true });

  // Escape to close search or mobile menu
  useShortcut('escape', () => {
    setIsSearchOpen(false);
    setMobileMenuOpen(false);
  });

  const handleSelectPage = (idOrPath: string) => {
    const item = ALL_DOC_PAGES.find((p) => p.id === idOrPath || p.path === idOrPath) || ALL_DOC_PAGES[0];
    router.navigate(item.path);
    setMobileMenuOpen(false);
  };

  // Quick jump shortcuts 1-9 using multi-page URLs
  useShortcut('1', () => handleSelectPage('quickstart'));
  useShortcut('2', () => handleSelectPage('reactive-state'));
  useShortcut('3', () => handleSelectPage('direct-binding'));
  useShortcut('4', () => handleSelectPage('collections'));
  useShortcut('5', () => handleSelectPage('react19-actions'));
  useShortcut('6', () => handleSelectPage('auto-form'));
  useShortcut('7', () => handleSelectPage('react19-async'));
  useShortcut('8', () => handleSelectPage('react19-resources'));
  useShortcut('9', () => handleSelectPage('code-reducer'));

  const currentCategoryTitle = useMemo(() => {
    const cat = DOC_CATEGORIES.find((c) => c.items.some((item) => item.id === activePageId));
    return cat ? cat.title : 'DOCUMENTATION';
  }, [activePageId]);

  const renderActivePage = () => {
    switch (activePageId) {
      case 'quickstart':
        return <QuickstartPage />;
      case 'reactive-state':
        return <ReactiveStatePage />;
      case 'direct-binding':
        return <DirectBindingPage />;
      case 'collections':
        return <CollectionsPage />;
      case 'auto-form':
        return <AutoFormPage />;
      case 'react19-actions':
        return <React19ActionsPage />;
      case 'react19-async':
        return <React19AsyncPage />;
      case 'react19-resources':
        return <React19ResourcesPage />;
      case 'query-cache':
        return <QueryCachePage />;
      case 'control-flow':
        return <ControlFlowPage />;
      case 'time-travel':
        return <TimeTravelPage />;
      case 'hooks-reference':
        return <HooksReferencePage />;
      case 'code-reducer':
        return <CodeReducerLabPage />;
      case 'playground':
        return <PlaygroundPage />;
      case 'roadmap':
        return <RoadmapPage />;
      case 'dev-features':
        return <DevFeaturesPage />;
      case 'devtools':
        return <DevToolsPage />;
      case 'compiler':
        return <CompilerPage />;
      default:
        return <QuickstartPage />;


    }
  };

  return (
    <div>
      {/* Dynamic Document Head for Multi-Page SEO */}
      <Head>
        <title>{`${currentPage.title} — uReact Official Docs`}</title>
        <meta name="description" content={currentPage.description} />
      </Head>

      {/* Ambient background glow orbs */}
      <div className="ambient-glow">
        <div className="glow-orb-1" />
        <div className="glow-orb-2" />
      </div>

      {/* Top react.dev Style Navbar */}
      <DocHeader
        onOpenSearch={() => setIsSearchOpen(true)}
        activeCategory={currentCategoryTitle}
        onSelectPage={handleSelectPage}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        theme={theme}
        onToggleTheme={toggleTheme}
        currentVersion={currentVersion}
        onSelectVersion={(v) => setCurrentVersion(v as any)}
        onOpenRoadmap={() => setIsRoadmapOpen(true)}
      />

      {/* 3-Column React.dev Documentation Layout */}
      <div
        className="doc-layout"
        style={{
          display: 'flex',
          minHeight: 'calc(100vh - 64px)',
          position: 'relative'
        }}
      >
        {/* Left Sticky Sidebar */}
        <DocSidebar
          activePageId={activePageId}
          onSelectPage={handleSelectPage}
          mobileMenuOpen={mobileMenuOpen}
          onCloseMobileMenu={() => setMobileMenuOpen(false)}
        />

        {/* Center Main Documentation Article */}
        <main
          className="doc-content-container"
          style={{
            flex: 1,
            minWidth: 0,
            padding: '36px 48px 80px',
            maxWidth: '960px',
            margin: '0 auto'
          }}
        >
          <ErrorBoundary fallbackTitle="Documentation Page Error">
            {renderActivePage()}
          </ErrorBoundary>

          {/* Bottom Previous / Next Pagination Buttons */}
          <DocPagination
            currentPageId={activePageId}
            onSelectPage={handleSelectPage}
          />

          {/* react.dev Style Footer */}
          <footer
            style={{
              marginTop: '64px',
              paddingTop: '28px',
              borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '0.84rem',
              color: 'var(--text-muted, #94a3b8)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <strong>uReact Official Documentation</strong> — 100% of React &amp; React 19 features with radical developer experience.
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem' }}>
                <a
                  href="https://react.dev"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--accent-cyan, #38bdf8)', textDecoration: 'none' }}
                >
                  Official React.dev ↗
                </a>
                <a
                  href="https://github.com/facebook/react"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--accent-cyan, #38bdf8)', textDecoration: 'none' }}
                >
                  React GitHub ↗
                </a>
              </div>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim, #64748b)' }}>
              Released under the MIT License. Multi-page routing enabled. Pure React 19 engine under the hood.
            </div>
          </footer>
        </main>

        {/* Right Sticky Table of Contents */}
        <DocTableOfContents items={currentPage?.toc || []} />
      </div>

      {/* Shortcuts & Command Palette Modal */}
      <ShortcutMenuModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectPage={handleSelectPage}
        onUndo={() => canvasStore.undo()}
        onRedo={() => canvasStore.redo()}
        canUndo={canvasStore.canUndo}
        canRedo={canvasStore.canRedo}
        theme={theme}
        onToggleTheme={toggleTheme}
        currentVersion={currentVersion}
        onSelectVersion={(v) => setCurrentVersion(v as any)}
        onOpenRoadmap={() => setIsRoadmapOpen(true)}
      />

      {/* Roadmap & Releases Modal */}
      <RoadmapModal
        isOpen={isRoadmapOpen}
        onClose={() => setIsRoadmapOpen(false)}
        currentVersion={currentVersion}
        onSelectVersion={(v) => setCurrentVersion(v as any)}
      />

      {/* Built-in uReact DevTools HUD */}
      <DevTools defaultOpen={false} position="bottom-right" />
    </div>
  );
}

