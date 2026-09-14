import React, { useState, useRef, useEffect } from 'react';
import { UReactLogo } from './UReactLogo';
import {
  Zap,
  Search,
  BookOpen,
  Code2,
  Package,
  Cpu,
  TrendingDown,
  Layers,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  Check,
  Sparkles,
  GitBranch
} from 'lucide-react';

export interface DocHeaderProps {
  onOpenSearch: () => void;
  activeCategory: string;
  onSelectPage: (id: string) => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  currentVersion?: string;
  onSelectVersion?: (version: string) => void;
  onOpenRoadmap?: () => void;
}

export function DocHeader({
  onOpenSearch,
  activeCategory,
  onSelectPage,
  mobileMenuOpen,
  onToggleMobileMenu,
  theme = 'light',
  onToggleTheme,
  currentVersion = '2.3.0',
  onSelectVersion,
  onOpenRoadmap
}: DocHeaderProps) {
  const [versionMenuOpen, setVersionMenuOpen] = useState(false);
  const versionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (versionMenuRef.current && !versionMenuRef.current.contains(e.target as Node)) {
        setVersionMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const versions = [
    { id: '2.3.0', label: 'v2.3.0', tag: 'Latest / Canary', desc: 'Scoped CSS, Form Store, DevTools HUD' },
    { id: '2.2.0', label: 'v2.2.0', tag: 'Stable', desc: 'Signals v2, Live Sandbox, Actions' },
    { id: '2.1.0', label: 'v2.1.0', tag: 'LTS', desc: 'Concurrent proxy store, $bind, SWR' }
  ];


  return (
    <header
      className="doc-header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(16px)',
        backgroundColor: 'var(--bg-header)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      {/* Left: Brand + Version */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onToggleMobileMenu}
          className="mobile-toggle-btn btn btn-secondary"
          style={{ padding: '6px', display: 'none' }}
          title="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <div
          onClick={() => onSelectPage('quickstart')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          title="uReact Documentation Home"
        >
          <UReactLogo size={36} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>uReact</span>
              <span
                style={{
                  fontSize: '0.65rem',
                  padding: '1px 6px',
                  borderRadius: '12px',
                  background: 'var(--accent-cyan-bg)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--accent-cyan)',
                  fontWeight: 700
                }}
              >
                react.dev docs
              </span>
            </div>
          </div>
        </div>

        {/* Version Switcher Dropdown (react.dev style) */}
        <div ref={versionMenuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setVersionMenuOpen(!versionMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              color: 'var(--text-dim)',
              fontFamily: 'var(--font-mono)',
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              background: versionMenuOpen ? 'var(--bg-card)' : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Switch Documentation Version"
          >
            <span style={{ color: currentVersion.includes('next') ? 'var(--accent-cyan)' : 'var(--text-main)', fontWeight: 700 }}>
              v{currentVersion}
            </span>
            <ChevronDown size={12} style={{ opacity: 0.7, transform: versionMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
          </button>

          {versionMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                width: '260px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)',
                padding: '8px',
                zIndex: 1000,
                animation: 'paletteFadeIn 0.12s ease-out'
              }}
            >
              <div style={{ padding: '6px 8px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Versions
              </div>

              {versions.map((ver) => {
                const isSelected = currentVersion === ver.id;
                return (
                  <button
                    key={ver.id}
                    onClick={() => {
                      onSelectVersion?.(ver.id);
                      setVersionMenuOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isSelected ? 'var(--accent-cyan-bg)' : 'transparent',
                      color: isSelected ? 'var(--accent-cyan)' : 'var(--text-main)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      marginBottom: '2px',
                      transition: 'background 0.12s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'var(--bg-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
                          {ver.label}
                        </span>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: ver.id.includes('next') ? 'var(--accent-cyan-bg)' : 'var(--bg-secondary)',
                            color: ver.id.includes('next') ? 'var(--accent-cyan)' : 'var(--text-dim)',
                            border: '1px solid var(--border-subtle)'
                          }}
                        >
                          {ver.tag}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                        {ver.desc}
                      </div>
                    </div>
                    {isSelected && <Check size={14} color="var(--accent-cyan)" />}
                  </button>
                );
              })}

              <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '6px 0' }} />

              <button
                onClick={() => {
                  setVersionMenuOpen(false);
                  onOpenRoadmap?.();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--accent-cyan)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.12s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-cyan-bg)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Sparkles size={14} />
                <span>What's New in v2.2.0 Roadmap</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Middle: Global Search Input Trigger */}
      <div
        style={{
          flex: '0 1 420px',
          margin: '0 20px'
        }}
        className="header-search-wrapper"
      >
        <button
          onClick={onOpenSearch}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '7px 14px',
            borderRadius: '10px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-dim)',
            fontSize: '0.84rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          className="search-trigger-btn"
          title="Press Ctrl+K or Cmd+K to search documentation"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={15} />
            <span>Search React &amp; uReact docs...</span>
          </div>
          <kbd
            style={{
              padding: '2px 6px',
              borderRadius: '4px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent-cyan)'
            }}
          >
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right: Quick Links + Theme Toggle + GitHub */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <nav className="header-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => onSelectPage('quickstart')}
            className={`tab-btn-ghost ${activeCategory === 'GETTING STARTED' ? 'active' : ''}`}
            style={{ fontSize: '0.82rem', padding: '6px 12px' }}
          >
            Learn
          </button>
          <button
            onClick={() => onSelectPage('hooks-reference')}
            className={`tab-btn-ghost ${activeCategory === 'REFERENCE & TOOLS' ? 'active' : ''}`}
            style={{ fontSize: '0.82rem', padding: '6px 12px' }}
          >
            Reference
          </button>
          <button
            onClick={() => onSelectPage('react19-actions')}
            className={`tab-btn-ghost ${activeCategory === 'REACT 19 NATIVE ENGINE' ? 'active' : ''}`}
            style={{ fontSize: '0.82rem', padding: '6px 12px' }}
          >
            React 19
          </button>
          <button
            onClick={() => onSelectPage('code-reducer')}
            className={`tab-btn-ghost ${activeCategory === 'code-reducer' ? 'active' : ''}`}
            style={{ fontSize: '0.82rem', padding: '6px 12px', color: 'var(--accent-emerald)' }}
          >
            -89% Reducer
          </button>
        </nav>

        {/* Theme Toggle Button */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            className="theme-toggle-btn"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        )}

        <a
          href="https://github.com/facebook/react"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-main)',
            transition: 'all 0.2s ease'
          }}
          title="View React GitHub"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
            <path d="M9 18c-4.51 2-5-2-7-2"></path>
          </svg>
        </a>
      </div>
    </header>
  );
}
