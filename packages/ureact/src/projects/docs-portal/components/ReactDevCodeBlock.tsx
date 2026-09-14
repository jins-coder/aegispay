import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Highlight, type PrismTheme } from 'prism-react-renderer';
import {
  Copy,
  Check,
  WrapText,
  Maximize2,
  Minimize2,
  Download,
  ChevronDown,
  ChevronUp,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Terminal
} from 'lucide-react';

export interface ReactDevCodeProps {
  code: string;
  language?: string;
  title?: string;
  badge?: string;
  badgeType?: 'bad' | 'good' | 'emerald' | 'neutral' | 'react19';
  highlightLines?: number[];
  showLineNumbers?: boolean;
  collapsible?: boolean;
  initialCollapsed?: boolean;
  maxLines?: number;
  className?: string;
  style?: React.CSSProperties;
  onOpenPlayground?: (code: string) => void;
}

/**
 * The authentic react.dev Prism syntax theme for Light Mode
 */
export const reactDevLightTheme: PrismTheme = {
  plain: {
    color: '#24292f',
    backgroundColor: '#ffffff'
  },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: {
        color: '#6e7781',
        fontStyle: 'italic'
      }
    },
    {
      types: ['string', 'attr-value'],
      style: {
        color: '#0a3069'
      }
    },
    {
      types: ['punctuation'],
      style: {
        color: '#24292f'
      }
    },
    {
      types: ['operator'],
      style: {
        color: '#cf222e'
      }
    },
    {
      types: ['entity', 'url', 'symbol', 'number', 'boolean', 'variable', 'constant', 'property'],
      style: {
        color: '#0550ae'
      }
    },
    {
      types: ['atrule', 'keyword'],
      style: {
        color: '#cf222e',
        fontWeight: '600'
      }
    },
    {
      types: ['attr-name'],
      style: {
        color: '#116329'
      }
    },
    {
      types: ['function', 'function-variable', 'class-name'],
      style: {
        color: '#8250df',
        fontWeight: '600'
      }
    },
    {
      types: ['tag'],
      style: {
        color: '#116329',
        fontWeight: '600'
      }
    },
    {
      types: ['inserted'],
      style: {
        color: '#116329',
        backgroundColor: 'rgba(17, 99, 41, 0.08)'
      }
    },
    {
      types: ['deleted'],
      style: {
        color: '#cf222e',
        backgroundColor: 'rgba(207, 34, 46, 0.08)'
      }
    }
  ]
};

/**
 * The authentic react.dev Prism syntax theme for Dark Mode
 */
export const reactDevDarkTheme: PrismTheme = {
  plain: {
    color: '#e6edf3',
    backgroundColor: '#16181d'
  },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: {
        color: '#8b949e',
        fontStyle: 'italic'
      }
    },
    {
      types: ['string', 'attr-value'],
      style: {
        color: '#a5d6ff'
      }
    },
    {
      types: ['punctuation'],
      style: {
        color: '#e6edf3'
      }
    },
    {
      types: ['operator'],
      style: {
        color: '#ff7b72'
      }
    },
    {
      types: ['entity', 'url', 'symbol', 'number', 'boolean', 'variable', 'constant', 'property'],
      style: {
        color: '#79c0ff'
      }
    },
    {
      types: ['atrule', 'keyword'],
      style: {
        color: '#ff7b72',
        fontWeight: '600'
      }
    },
    {
      types: ['attr-name'],
      style: {
        color: '#ffa657'
      }
    },
    {
      types: ['function', 'function-variable', 'class-name'],
      style: {
        color: '#d2a8ff',
        fontWeight: '600'
      }
    },
    {
      types: ['tag'],
      style: {
        color: '#7ee787',
        fontWeight: '600'
      }
    },
    {
      types: ['inserted'],
      style: {
        color: '#7ee787',
        backgroundColor: 'rgba(56, 139, 253, 0.15)'
      }
    },
    {
      types: ['deleted'],
      style: {
        color: '#ffa198',
        backgroundColor: 'rgba(248, 81, 73, 0.15)'
      }
    }
  ]
};

function usePortalTheme(): 'light' | 'dark' {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const update = () => {
      const cur = (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'light';
      setTheme(cur);
    };

    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  return theme;
}

/**
 * Ultimate Beast ReactDevCodeBlock Component
 * 
 * Features:
 * - Word Wrap toggle
 * - Font zoom control (Compact / Normal / Large)
 * - Interactive line selection & pinning
 * - Git diff line recognition (+ / - markers)
 * - Full-screen distraction-free modal
 * - Code file download (.tsx / .ts / .jsx)
 * - Auto folding for long snippets (>24 lines)
 * - Compact single-line header chrome
 */
export function ReactDevCodeBlock({
  code,
  language = 'tsx',
  title,
  badge,
  badgeType = 'neutral',
  highlightLines = [],
  showLineNumbers = false,
  collapsible = false,
  initialCollapsed = false,
  maxLines = 26,
  className = '',
  style = {}
}: ReactDevCodeProps) {
  const themeMode = usePortalTheme();
  const [copied, setCopied] = useState(false);
  const [wordWrap, setWordWrap] = useState(false);
  const [fontSizeStep, setFontSizeStep] = useState<0 | 1 | 2>(1); // 0=compact, 1=regular, 2=large
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!initialCollapsed);
  const [pinnedLines, setPinnedLines] = useState<Set<number>>(new Set());

  const trimmedCode = code.trim();
  const lineCount = useMemo(() => trimmedCode.split('\n').length, [trimmedCode]);
  const shouldFold = collapsible || (lineCount > maxLines && !isFullScreen);

  // Close full screen on Escape key
  useEffect(() => {
    if (!isFullScreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullScreen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(trimmedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = language.toLowerCase() === 'typescript' || language.toLowerCase() === 'ts' ? 'ts' : 'tsx';
    const filename = (title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'snippet') + `.${ext}`;
    const blob = new Blob([trimmedCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleLinePin = (lineNum: number) => {
    setPinnedLines((prev) => {
      const next = new Set(prev);
      if (next.has(lineNum)) next.delete(lineNum);
      else next.add(lineNum);
      return next;
    });
  };

  const fontSizes = ['0.76rem', '0.83rem', '0.92rem'];
  const activeFontSize = fontSizes[fontSizeStep];

  const activePrismTheme = themeMode === 'dark' ? reactDevDarkTheme : reactDevLightTheme;

  const badgeStyles: Record<string, { bg: string; color: string; border: string }> = {
    bad: {
      bg: 'rgba(244, 63, 94, 0.12)',
      color: 'var(--accent-rose, #e11d48)',
      border: 'rgba(244, 63, 94, 0.25)'
    },
    good: {
      bg: 'rgba(2, 132, 199, 0.12)',
      color: 'var(--accent-cyan, #0284c7)',
      border: 'rgba(2, 132, 199, 0.25)'
    },
    emerald: {
      bg: 'rgba(16, 185, 129, 0.12)',
      color: 'var(--accent-emerald, #059669)',
      border: 'rgba(16, 185, 129, 0.25)'
    },
    react19: {
      bg: 'rgba(88, 196, 220, 0.15)',
      color: 'var(--accent-cyan)',
      border: 'rgba(88, 196, 220, 0.3)'
    },
    neutral: {
      bg: 'var(--bg-secondary)',
      color: 'var(--text-muted)',
      border: 'var(--border-subtle)'
    }
  };

  const badgeStyle = badgeStyles[badgeType] || badgeStyles.neutral;

  // Normalize language for Prism
  const cleanLang = language.toLowerCase() === 'typescript' || language.toLowerCase() === 'ts'
    ? 'tsx'
    : language.toLowerCase() === 'javascript' || language.toLowerCase() === 'js'
    ? 'jsx'
    : language.toLowerCase() === 'shell' || language.toLowerCase() === 'terminal'
    ? 'bash'
    : language.toLowerCase();

  const codeBlockJSX = (
    <div
      className={`react-dev-code-box ${className}`}
      style={{
        margin: isFullScreen ? 0 : '16px 0',
        borderRadius: isFullScreen ? '16px' : '12px',
        border: '1px solid var(--code-border, #e5e7eb)',
        background: activePrismTheme.plain.backgroundColor,
        overflow: 'hidden',
        boxShadow: themeMode === 'light' ? '0 1px 3px rgba(0, 0, 0, 0.05)' : '0 4px 20px rgba(0, 0, 0, 0.4)',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        height: isFullScreen ? '90vh' : 'auto',
        ...style
      }}
    >
      {/* Beast Header Chrome */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '7px 12px',
          background: themeMode === 'light' ? '#f8fafc' : 'rgba(255, 255, 255, 0.03)',
          borderBottom: '1px solid var(--code-border, #e5e7eb)',
          fontSize: '0.75rem',
          minWidth: 0,
          gap: '8px'
        }}
      >
        {/* Left Side: Window Dots + Title + Line Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: '1 1 auto' }}>
          {/* Authentic Window Dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f56', display: 'inline-block' }} />
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }} />
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#27c93f', display: 'inline-block' }} />
          </div>

          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: 'var(--text-main)',
              fontSize: '0.74rem',
              marginLeft: '2px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minWidth: 0
            }}
            title={title || cleanLang.toUpperCase()}
          >
            {title || cleanLang.toUpperCase()}
          </span>

          <span
            style={{
              fontSize: '0.65rem',
              padding: '1px 5px',
              borderRadius: '4px',
              background: 'var(--bg-secondary)',
              color: 'var(--text-dim)',
              border: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-mono)',
              flexShrink: 0
            }}
          >
            {lineCount}L
          </span>
        </div>

        {/* Right Side Action Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
          {/* Badge */}
          {badge && (
            <span
              style={{
                fontSize: '0.66rem',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '4px',
                background: badgeStyle.bg,
                color: badgeStyle.color,
                border: `1px solid ${badgeStyle.border}`,
                whiteSpace: 'nowrap',
                lineHeight: 1.3,
                letterSpacing: '0.01em',
                flexShrink: 0
              }}
            >
              {badge}
            </span>
          )}

          {/* Word Wrap Toggle */}
          <button
            onClick={() => setWordWrap(!wordWrap)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '5px',
              background: wordWrap ? 'var(--accent-cyan-bg)' : 'transparent',
              border: '1px solid',
              borderColor: wordWrap ? 'var(--accent-cyan)' : 'var(--border-subtle)',
              color: wordWrap ? 'var(--accent-cyan)' : 'var(--text-dim)',
              cursor: 'pointer',
              transition: 'all 0.12s ease'
            }}
            title={wordWrap ? 'Word Wrap: ON' : 'Word Wrap: OFF'}
          >
            <WrapText size={12} />
          </button>

          {/* Font Zoom Cycler */}
          <button
            onClick={() => setFontSizeStep(((fontSizeStep + 1) % 3) as any)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '5px',
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              fontSize: '0.68rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)'
            }}
            title={`Font Size: ${fontSizeStep === 0 ? 'Compact' : fontSizeStep === 1 ? 'Standard' : 'Large'}`}
          >
            {fontSizeStep === 0 ? 'A-' : fontSizeStep === 1 ? 'A' : 'A+'}
          </button>

          {/* Download snippet */}
          <button
            onClick={handleDownload}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '5px',
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-dim)',
              cursor: 'pointer'
            }}
            title="Download file"
          >
            <Download size={12} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '5px',
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-dim)',
              cursor: 'pointer'
            }}
            title={isFullScreen ? 'Exit full screen (Esc)' : 'Expand full screen'}
          >
            {isFullScreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '5px',
              background: copied ? 'var(--accent-cyan-bg)' : 'var(--bg-card-hover)',
              border: '1px solid',
              borderColor: copied ? 'var(--accent-cyan)' : 'var(--border-subtle)',
              color: copied ? 'var(--accent-cyan)' : 'var(--text-main)',
              fontSize: '0.68rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.15s ease'
            }}
            title="Copy code (Ctrl+C)"
          >
            {copied ? <Check size={11} strokeWidth={2.5} /> : <Copy size={11} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Code Body via prism-react-renderer */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          maxHeight: shouldFold && !isExpanded ? '320px' : 'none',
          overflow: 'hidden'
        }}
      >
        <Highlight
          theme={activePrismTheme}
          code={trimmedCode}
          language={cleanLang as any}
        >
          {({ className: prismClass, style: prismStyle, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={`code-content ${prismClass}`}
              style={{
                ...prismStyle,
                margin: 0,
                padding: '12px 0',
                fontFamily: 'var(--font-mono)',
                fontSize: activeFontSize,
                lineHeight: '1.65',
                overflowX: wordWrap ? 'hidden' : 'auto',
                whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
                wordBreak: wordWrap ? 'break-word' : 'normal',
                background: 'transparent',
                height: isFullScreen ? 'calc(90vh - 80px)' : 'auto',
                overflowY: isFullScreen ? 'auto' : 'visible'
              }}
            >
              <code>
                {tokens.map((line, idx) => {
                  const lineNum = idx + 1;
                  const isHighlighted = highlightLines.includes(lineNum) || pinnedLines.has(lineNum);
                  const lineText = line.map(t => t.content).join('');

                  // Git Diff detection
                  const isDiffAdd = lineText.trim().startsWith('+');
                  const isDiffRemove = lineText.trim().startsWith('-');

                  const lineProps = getLineProps({ line, key: idx });

                  let lineBg = 'transparent';
                  let borderLeft = '3px solid transparent';

                  if (isHighlighted) {
                    lineBg = themeMode === 'light' ? 'rgba(2, 132, 199, 0.08)' : 'rgba(56, 189, 248, 0.12)';
                    borderLeft = `3px solid ${themeMode === 'light' ? '#0284c7' : '#38bdf8'}`;
                  } else if (isDiffAdd) {
                    lineBg = themeMode === 'light' ? 'rgba(16, 185, 129, 0.09)' : 'rgba(16, 185, 129, 0.15)';
                    borderLeft = '3px solid #10b981';
                  } else if (isDiffRemove) {
                    lineBg = themeMode === 'light' ? 'rgba(244, 63, 94, 0.09)' : 'rgba(244, 63, 94, 0.15)';
                    borderLeft = '3px solid #f43f5e';
                  }

                  return (
                    <div
                      {...lineProps}
                      key={idx}
                      onClick={() => toggleLinePin(lineNum)}
                      style={{
                        display: 'flex',
                        padding: '0 14px',
                        background: lineBg,
                        borderLeft,
                        paddingLeft: (isHighlighted || isDiffAdd || isDiffRemove) ? '11px' : '14px',
                        transition: 'background-color 0.12s ease',
                        cursor: 'pointer'
                      }}
                      title="Click line to toggle highlight"
                    >
                      {showLineNumbers && (
                        <span
                          style={{
                            width: '24px',
                            flexShrink: 0,
                            textAlign: 'right',
                            marginRight: '14px',
                            color: isHighlighted ? 'var(--accent-cyan)' : (themeMode === 'light' ? '#94a3b8' : '#64748b'),
                            userSelect: 'none',
                            fontSize: '0.72rem',
                            opacity: isHighlighted ? 1 : 0.6,
                            fontFamily: 'var(--font-mono)'
                          }}
                        >
                          {lineNum}
                        </span>
                      )}
                      <span style={{ flex: 1 }}>
                        {line.map((token, key) => (
                          <span {...getTokenProps({ token, key })} key={key} />
                        ))}
                      </span>
                    </div>
                  );
                })}
              </code>
            </pre>
          )}
        </Highlight>

        {/* Collapsible Gradient Overlay when code is folded */}
        {shouldFold && !isExpanded && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '80px',
              background: themeMode === 'light'
                ? 'linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.95))'
                : 'linear-gradient(to bottom, transparent, rgba(22, 24, 29, 0.95))',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingBottom: '10px'
            }}
          >
            <button
              onClick={() => setIsExpanded(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--accent-cyan)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
            >
              <ChevronDown size={14} />
              <span>Expand Code ({lineCount} lines)</span>
            </button>
          </div>
        )}
      </div>

      {/* Fold Collapse toggle footer when expanded */}
      {shouldFold && isExpanded && (
        <div
          style={{
            padding: '6px 14px',
            background: themeMode === 'light' ? '#f8fafc' : 'rgba(255, 255, 255, 0.02)',
            borderTop: '1px solid var(--code-border, #e5e7eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <button
            onClick={() => setIsExpanded(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <ChevronUp size={13} />
            <span>Collapse Code</span>
          </button>
        </div>
      )}
    </div>
  );

  if (isFullScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}
        onClick={() => setIsFullScreen(false)}
      >
        <div
          style={{ width: '100%', maxWidth: '1080px' }}
          onClick={(e) => e.stopPropagation()}
        >
          {codeBlockJSX}
        </div>
      </div>
    );
  }

  return codeBlockJSX;
}
