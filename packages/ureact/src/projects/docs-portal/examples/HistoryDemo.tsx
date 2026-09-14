import React, { useState } from 'react';
import { createHistoryStore, useHistoryStore, useShortcut } from 'ureact';
import { Undo2, Redo2, History, RotateCcw, Palette, Keyboard, Check } from 'lucide-react';

export const canvasStore = createHistoryStore({
  color: '#38bdf8',
  radius: 24,
  text: 'uReact v1.1.0 Time Travel',
  elements: ['Box 1', 'Box 2']
});

export function HistoryDemo() {
  const { state, undo, redo, canUndo, canRedo, history, pointer, reset } = useHistoryStore(canvasStore);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleUndo = () => {
    if (undo()) {
      setLastAction('Undid last action');
      setTimeout(() => setLastAction(null), 1500);
    }
  };

  const handleRedo = () => {
    if (redo()) {
      setLastAction('Redid action');
      setTimeout(() => setLastAction(null), 1500);
    }
  };

  // Bind keyboard shortcuts
  useShortcut(['mod+z', 'ctrl+z'], () => handleUndo(), { preventDefault: true });
  useShortcut(['mod+y', 'ctrl+y', 'mod+shift+z'], () => handleRedo(), { preventDefault: true });

  const colors = ['#38bdf8', '#818cf8', '#34d399', '#f43f5e', '#fbbf24', '#e879f9'];

  return (
    <div>
      <div className="panel-header">
        <div>
          <h3 className="panel-title">
            <History size={20} style={{ color: 'var(--accent-purple)' }} />
            Time-Travel State &amp; Shortcuts (<code>createHistoryStore</code> &amp; <code>useShortcut</code>)
          </h3>
          <p className="panel-subtitle">
            Zero-overhead Undo/Redo state management with keyboard shortcuts (<code>Cmd/Ctrl+Z</code>, <code>Cmd/Ctrl+Y</code>). Step backward and forward through your application state effortlessly.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {lastAction && (
            <span
              style={{
                fontSize: '0.8rem',
                color: 'var(--accent-cyan)',
                background: 'rgba(56, 189, 248, 0.12)',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(56, 189, 248, 0.25)'
              }}
            >
              {lastAction}
            </span>
          )}
          <button onClick={() => reset()} className="btn btn-secondary">
            <RotateCcw size={15} /> Reset
          </button>
        </div>
      </div>

      <div className="interactive-playground">
        {/* Controls */}
        <div className="widget-card">
          <h4 className="widget-title">
            <Palette size={18} style={{ color: 'var(--accent-cyan)' }} />
            Interactive Canvas Editor
          </h4>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className="btn btn-secondary"
              style={{
                flex: 1,
                opacity: canUndo ? 1 : 0.4,
                cursor: canUndo ? 'pointer' : 'not-allowed',
                background: canUndo ? 'rgba(56, 189, 248, 0.1)' : undefined
              }}
            >
              <Undo2 size={16} /> Undo (Ctrl+Z)
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className="btn btn-secondary"
              style={{
                flex: 1,
                opacity: canRedo ? 1 : 0.4,
                cursor: canRedo ? 'pointer' : 'not-allowed',
                background: canRedo ? 'rgba(56, 189, 248, 0.1)' : undefined
              }}
            >
              <Redo2 size={16} /> Redo (Ctrl+Y)
            </button>
          </div>

          {/* Color Palette */}
          <div className="form-group">
            <label className="form-label">Pick Color (triggers new history snapshot)</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    state.color = c;
                  }}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: c,
                    border: state.color === c ? '3px solid #fff' : '2px solid transparent',
                    cursor: 'pointer',
                    boxShadow: state.color === c ? `0 0 16px ${c}` : 'none',
                    transform: state.color === c ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.15s ease'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Text Input */}
          <div className="form-group">
            <label className="form-label">Badge Text</label>
            <input
              type="text"
              className="input-field"
              value={state.text}
              onChange={(e) => {
                state.text = e.target.value;
              }}
            />
          </div>

          {/* Border Radius */}
          <div className="form-group">
            <label className="form-label">Border Radius: {state.radius}px</label>
            <input
              type="range"
              min="0"
              max="50"
              className="input-field"
              value={state.radius}
              onChange={(e) => {
                state.radius = Number(e.target.value);
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginTop: '16px',
              padding: '10px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <Keyboard size={15} style={{ color: 'var(--accent-cyan)' }} />
            <span>Shortcuts active: Press <strong>Ctrl+Z</strong> to undo, <strong>Ctrl+Y</strong> to redo.</span>
          </div>
        </div>

        {/* Live Canvas & Timeline */}
        <div className="widget-card">
          <h4 className="widget-title">Live Render Preview &amp; History Stack</h4>

          {/* Render Preview */}
          <div
            style={{
              padding: '36px',
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '20px'
            }}
          >
            <div
              style={{
                display: 'inline-block',
                padding: '16px 28px',
                backgroundColor: state.color,
                color: '#030712',
                fontWeight: 800,
                fontSize: '1.1rem',
                borderRadius: `${state.radius}px`,
                boxShadow: `0 8px 30px ${state.color}55`,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {state.text || 'Preview'}
            </div>
          </div>

          {/* History Stack Inspector */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="form-label">
                History Timeline ({pointer + 1} of {history.length} snapshots)
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontWeight: 600 }}>
                canUndo: {canUndo ? 'true' : 'false'} • canRedo: {canRedo ? 'true' : 'false'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
              {history.map((snap, idx) => {
                const isActive = idx === pointer;
                return (
                  <div
                    key={idx}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: isActive ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255,255,255,0.03)',
                      border: isActive ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid var(--border-subtle)',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: snap.color,
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}
                      />
                      <span style={{ fontWeight: isActive ? 700 : 500, color: isActive ? '#fff' : 'inherit' }}>
                        Snapshot #{idx + 1}: "{snap.text}"
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>r: {snap.radius}px</span>
                      {isActive && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: 'var(--accent-cyan)',
                            color: '#031327'
                          }}
                        >
                          ACTIVE
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
