/* Shared UI primitives — Resurface */

// ─── Logo ─────────────────────────────────────────────────
// Bookmark silhouette: rectangle with notch at bottom, rounded top-right,
// amber dot accent. Placeholder until final mark is specced.
const Logo = ({ size = 20, variant = 'default', showWord = true, wordSize = 15 }) => {
  const w = size * 0.75;
  const h = size;
  const bodyColor = variant === 'light' ? '#0d9488' : '#2dd4bf';
  const accent = '#fbbf24';
  const textColor = variant === 'light' ? '#0f0f0e' : '#f0ede8';

  // Bookmark path: rect w/ rounded top-right, notch at bottom-center
  const r = w * 0.30; // rounded corner radius
  const notchW = w * 0.40;
  const notchD = h * 0.25;
  const notchX1 = (w - notchW) / 2;
  const notchX2 = notchX1 + notchW;
  const notchMidX = w / 2;
  const path = [
    `M 0 0`,
    `L ${w - r} 0`,
    `Q ${w} 0 ${w} ${r}`,
    `L ${w} ${h}`,
    `L ${notchX2} ${h}`,
    `L ${notchMidX} ${h - notchD}`,
    `L ${notchX1} ${h}`,
    `L 0 ${h}`,
    `Z`,
  ].join(' ');

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, lineHeight: 1 }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" aria-label="Resurface">
        <path d={path} fill={bodyColor} />
        {/* amber dot accent */}
        <circle cx={w * 0.32} cy={h * 0.30} r={Math.max(1.2, w * 0.09)} fill={accent} />
      </svg>
      {showWord && (
        <span style={{
          font: `500 ${wordSize}px/1 'Geist', sans-serif`,
          letterSpacing: '-0.025em',
          color: textColor,
        }}>
          Resurface
        </span>
      )}
    </span>
  );
};

// ─── Icon (Lucide-style, hand-rolled subset) ─────────────
const Icon = ({ name, size = 16, color = 'currentColor', strokeWidth = 1.5 }) => {
  const props = {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round',
  };
  const paths = {
    inbox: <><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z"/></>,
    checkCircle: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
    check: <polyline points="20 6 9 17 4 12"/>,
    clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></>,
    tag: <><path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z"/><line x1="7" y1="7" x2="7.01" y2="7"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></>,
    search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></>,
    arrowUpRight: <><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></>,
    alarmSnooze: <><circle cx="12" cy="13" r="8"/><path d="M5 3 2 6"/><path d="m22 6-3-3"/><path d="M9 13h6l-6 5h6"/></>,
    mail: <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></>,
    bookmarkPlus: <><path d="M19 21V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v14l7-5 7 5Z"/><line x1="12" y1="7" x2="12" y2="13"/><line x1="9" y1="10" x2="15" y2="10"/></>,
    puzzle: <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z"/>,
    x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    chevronDown: <polyline points="6 9 12 15 18 9"/>,
    chevronRight: <polyline points="9 18 15 12 9 6"/>,
    chevronLeft: <polyline points="15 18 9 12 15 6"/>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    flame: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>,
    sparkles: <><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></>,
    play: <polygon points="5 3 19 12 5 21 5 3"/>,
    grid: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
    layout: <><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    log: <><path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
    panelLeft: <><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    at: <><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/></>,
    send: <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
    moreHorizontal: <><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></>,
    sliders: <><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></>,
    filter: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    chrome: <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></>,
    zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
    heart: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>,
    arrowRight: <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
    arrowLeft: <><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 19"/></>,
    undo: <><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></>,
    trendingUp: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
  };
  return <svg {...props} style={{ flexShrink: 0, display: 'block' }}>{paths[name]}</svg>;
};

// ─── Platform icons (inline brand glyphs, simplified) ─────
const XGlyph = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0, display: 'block' }}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const YTGlyph = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0, display: 'block' }}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

// ─── Button ───────────────────────────────────────────────
const Button = ({ variant = 'primary', size = 'md', children, onClick, disabled, style, ...rest }) => {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    font: '500 13px/1 Geist, sans-serif',
    padding: size === 'lg' ? '10px 20px' : size === 'sm' ? '4px 10px' : '6px 16px',
    borderRadius: 'var(--rs-radius-md)',
    border: '0.5px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.35 : 1,
    transition: 'all 150ms ease',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  };
  const variants = {
    primary: { background: 'var(--rs-teal-400)', color: 'var(--rs-teal-900)', border: 'none' },
    secondary: { background: 'var(--rs-bg-elevated)', color: 'var(--rs-text-primary)', border: '0.5px solid var(--rs-border-default)' },
    ghost: { background: 'transparent', color: 'var(--rs-text-secondary)', border: '0.5px solid transparent' },
    danger: { background: 'rgba(239,68,68,0.10)', color: 'var(--rs-red-400)', border: '0.5px solid rgba(239,68,68,0.20)' },
    inverted: { background: '#0f0f0e', color: '#f0ede8', border: 'none' },
  };
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const hoverStyles = {
    primary: { background: 'var(--rs-teal-300)' },
    secondary: { background: 'var(--rs-bg-hover)', borderColor: 'var(--rs-border-strong)' },
    ghost: { background: 'var(--rs-bg-elevated)', color: 'var(--rs-text-primary)' },
    danger: { background: 'rgba(239,68,68,0.18)' },
    inverted: { background: '#1e1e1b' },
  };
  return (
    <button
      className="rs-focus-ring"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        ...base,
        ...variants[variant],
        ...(hover && !disabled ? hoverStyles[variant] : {}),
        transform: active && !disabled ? 'scale(0.97)' : 'scale(1)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
};

// ─── Badges ───────────────────────────────────────────────
const Badge = ({ variant, children, icon }) => {
  const variants = {
    pending: { background: 'rgba(251,191,36,0.12)', color: 'var(--rs-amber-200)', border: '0.5px solid rgba(251,191,36,0.20)' },
    reviewed: { background: 'rgba(74,222,128,0.10)', color: 'var(--rs-green-300)', border: '0.5px solid rgba(74,222,128,0.18)' },
    snoozed: { background: 'var(--rs-bg-elevated)', color: 'var(--rs-text-tertiary)', border: '0.5px solid var(--rs-border-subtle)' },
    x: { background: 'var(--rs-x-bg)', color: 'var(--rs-x-text)', border: '0.5px solid var(--rs-x-border)' },
    youtube: { background: 'var(--rs-yt-bg)', color: 'var(--rs-yt-text)', border: '0.5px solid var(--rs-yt-border)' },
    topic: { background: 'rgba(45,212,191,0.08)', color: 'var(--rs-teal-300)', border: '0.5px solid rgba(45,212,191,0.18)' },
  };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      font: '500 11px/1 Geist, sans-serif',
      padding: '2px 8px',
      borderRadius: 'var(--rs-radius-full)',
      ...variants[variant],
    }}>
      {icon}
      {children}
    </span>
  );
};

// ─── Input ────────────────────────────────────────────────
const Input = ({ style, icon, ...rest }) => {
  const [focused, setFocused] = React.useState(false);
  const wrap = {
    display: 'flex', alignItems: 'center', gap: 8,
    height: 34, padding: '0 12px',
    background: 'var(--rs-bg-elevated)',
    border: `0.5px solid ${focused ? 'var(--rs-teal-600)' : 'var(--rs-border-default)'}`,
    borderRadius: 'var(--rs-radius-md)',
    boxShadow: focused ? '0 0 0 3px rgba(45,212,191,0.12)' : 'none',
    transition: 'border 120ms, box-shadow 120ms',
    ...style,
  };
  return (
    <label style={wrap}>
      {icon}
      <input
        {...rest}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1,
          border: 'none', outline: 'none', background: 'transparent',
          font: '400 13px/1 Geist, sans-serif',
          color: 'var(--rs-text-primary)',
        }}
      />
    </label>
  );
};

// Export to window for cross-script access
Object.assign(window, { Logo, Icon, XGlyph, YTGlyph, Button, Badge, Input });
