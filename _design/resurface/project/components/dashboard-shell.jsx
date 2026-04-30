// Dashboard — sidebar, header, stats, table

const Sidebar = ({ activePage, onNav, collapsed, onToggleCollapse, pendingCount = 28 }) => {
  const nav = [
    { id: 'dashboard', label: 'Dashboard', icon: 'layout' },
    { id: 'all', label: 'All saves', icon: 'inbox', count: 47 },
    { id: 'reviewed', label: 'Reviewed', icon: 'checkCircle', count: 19 },
    { id: 'snoozed', label: 'Snoozed', icon: 'clock', count: 4 },
    { id: 'reminders', label: 'Reminders', icon: 'bell', count: 2 },
  ];

  const width = collapsed ? 52 : 220;

  return (
    <aside style={{
      width, flexShrink: 0,
      background: 'var(--rs-bg-surface)',
      borderRight: '0.5px solid var(--rs-border-subtle)',
      padding: collapsed ? '16px 6px' : '16px 8px',
      display: 'flex', flexDirection: 'column',
      transition: 'width 200ms var(--rs-ease-default)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {nav.map(item => (
        <NavItem key={item.id} {...item} active={activePage === item.id} collapsed={collapsed} onClick={() => onNav(item.id)} />
      ))}

      {!collapsed && <div className="rs-micro" style={{ padding: '16px 10px 6px' }}>Topics</div>}
      {!collapsed && TOPICS.map(t => (
        <NavItem key={t.id} label={t.name} icon="tag" count={t.count}
          active={activePage === `topic:${t.id}`}
          onClick={() => onNav(`topic:${t.id}`)}
          muted
          collapsed={collapsed}
        />
      ))}
      {!collapsed && (
        <button className="rs-focus-ring" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          height: 30, padding: '0 10px',
          font: '400 12px/1 Geist, sans-serif',
          color: 'var(--rs-text-tertiary)',
          background: 'transparent', border: 'none', borderRadius: 'var(--rs-radius-sm)',
          cursor: 'pointer', marginTop: 2,
        }}>
          <Icon name="plus" size={13} />
          Add topic
        </button>
      )}

      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        <button onClick={onToggleCollapse} className="rs-focus-ring" style={{
          display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
          gap: 8, width: '100%',
          height: 32, padding: collapsed ? 0 : '0 10px',
          font: '500 12px/1 Geist, sans-serif',
          color: 'var(--rs-text-tertiary)',
          background: 'transparent', border: 'none', borderRadius: 'var(--rs-radius-sm)',
          cursor: 'pointer',
        }}>
          <Icon name="panelLeft" size={14} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
};

const NavItem = ({ label, icon, count, active, onClick, muted, collapsed }) => {
  const [hover, setHover] = React.useState(false);
  const showActive = active;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="rs-focus-ring"
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        width: '100%',
        height: 32,
        padding: collapsed ? 0 : (showActive ? '0 10px 0 8px' : '0 10px'),
        justifyContent: collapsed ? 'center' : 'flex-start',
        background: showActive ? 'rgba(45,212,191,0.07)' : (hover ? 'var(--rs-bg-elevated)' : 'transparent'),
        borderLeft: showActive && !collapsed ? '2px solid var(--rs-teal-400)' : '2px solid transparent',
        border: collapsed ? 'none' : undefined,
        borderRadius: showActive && !collapsed ? '0 var(--rs-radius-sm) var(--rs-radius-sm) 0' : 'var(--rs-radius-sm)',
        font: `500 ${muted ? 12 : 13}px/1 Geist, sans-serif`,
        color: showActive ? 'var(--rs-teal-300)' : (hover ? 'var(--rs-text-primary)' : 'var(--rs-text-secondary)'),
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 120ms, color 120ms',
      }}
    >
      <Icon name={icon} size={16} color={showActive ? 'var(--rs-teal-400)' : (hover ? 'var(--rs-text-secondary)' : 'var(--rs-text-tertiary)')} />
      {!collapsed && <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{label}</span>}
      {!collapsed && count !== undefined && (
        <span style={{
          font: '400 10px/1 Geist, sans-serif',
          background: 'var(--rs-bg-hover)', color: 'var(--rs-text-tertiary)',
          padding: '2px 6px', borderRadius: 'var(--rs-radius-full)',
        }}>{count}</span>
      )}
    </button>
  );
};

const Header = ({ onSearch, search }) => (
  <header style={{
    height: 52, flexShrink: 0,
    background: 'var(--rs-bg-surface)',
    borderBottom: '0.5px solid var(--rs-border-subtle)',
    padding: '0 20px',
    display: 'flex', alignItems: 'center', gap: 16,
    position: 'sticky', top: 0, zIndex: 10,
    backdropFilter: 'blur(12px)',
  }}>
    <Logo size={20} />
    <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
      <Input
        value={search} onChange={e => onSearch(e.target.value)}
        placeholder="Search saves, topics, authors…"
        icon={<Icon name="search" size={14} color="var(--rs-text-tertiary)" />}
        style={{ maxWidth: 360, width: '100%' }}
      />
    </div>
    <button className="rs-focus-ring" style={{
      width: 28, height: 28, border: 'none', background: 'transparent',
      borderRadius: 'var(--rs-radius-xs)', cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--rs-text-tertiary)',
    }}>
      <Icon name="settings" size={16} />
    </button>
    <div style={{
      width: 28, height: 28, borderRadius: '50%',
      background: 'linear-gradient(135deg, #2dd4bf, #0d9488)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      font: '500 11px/1 Geist, sans-serif', color: '#042f2e',
    }}>AR</div>
  </header>
);

// ─── Stats bar ────────────────────────────────────────────
const StatCard = ({ label, value, delta, deltaLabel, sparkline, accent }) => (
  <div style={{
    background: 'var(--rs-bg-elevated)',
    border: '0.5px solid var(--rs-border-subtle)',
    borderRadius: 'var(--rs-radius-lg)',
    padding: '14px 16px',
    display: 'flex', flexDirection: 'column',
    position: 'relative',
    minHeight: 80,
  }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
      <div>
        <div style={{ font: '400 11px/1 Geist, sans-serif', color: 'var(--rs-text-tertiary)', marginBottom: 8 }}>{label}</div>
        <div style={{ font: '500 22px/1 Geist, sans-serif', color: 'var(--rs-text-primary)', letterSpacing: '-0.02em' }}>
          {value}
        </div>
        {delta !== undefined && (
          <div style={{ marginTop: 4, font: '400 11px/1.2 Geist, sans-serif', color: delta >= 0 ? 'var(--rs-teal-400)' : 'var(--rs-red-400)' }}>
            {delta >= 0 ? '+' : ''}{delta}{deltaLabel}
          </div>
        )}
      </div>
      {sparkline && <Sparkline data={sparkline} color={accent || 'var(--rs-teal-400)'} />}
    </div>
  </div>
);

const Sparkline = ({ data, color, width = 80, height = 28 }) => {
  const max = Math.max(...data, 1);
  const step = width / (data.length - 1);
  const points = data.map((v, i) => `${i * step},${height - (v / max) * (height - 2) - 1}`).join(' ');
  const areaPoints = `0,${height} ${points} ${width},${height}`;
  const gradId = React.useId();
  return (
    <svg width={width} height={height} style={{ flexShrink: 0, opacity: 0.9 }}>
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${gradId})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const StreakCard = () => (
  <div style={{
    background: 'var(--rs-bg-elevated)',
    border: '0.5px solid var(--rs-border-subtle)',
    borderRadius: 'var(--rs-radius-lg)',
    padding: '14px 16px',
    display: 'flex', alignItems: 'center', gap: 14,
    minHeight: 80,
  }}>
    <div style={{
      width: 36, height: 36, borderRadius: 'var(--rs-radius-md)',
      background: 'rgba(251,191,36,0.10)', border: '0.5px solid rgba(251,191,36,0.18)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon name="flame" size={18} color="var(--rs-amber-400)" />
    </div>
    <div>
      <div style={{ font: '400 11px/1 Geist, sans-serif', color: 'var(--rs-text-tertiary)', marginBottom: 6 }}>Review streak</div>
      <div style={{ font: '500 22px/1 Geist, sans-serif', color: 'var(--rs-text-primary)', letterSpacing: '-0.02em' }}>
        3 weeks
      </div>
      <div style={{ marginTop: 4, font: '400 11px/1.2 Geist, sans-serif', color: 'var(--rs-text-tertiary)' }}>
        Reviewed ≥ 1 every week
      </div>
    </div>
  </div>
);

const StatsBar = () => {
  const delta = ((STATS.savedThisWeek - STATS.savedLastWeek) / Math.max(STATS.savedLastWeek, 1) * 100).toFixed(0);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
      <StatCard label="Saved this week" value={STATS.savedThisWeek} delta={+delta} deltaLabel="% vs last" sparkline={STATS.spark} />
      <StatCard label="Pending review" value={STATS.pendingReview} delta={-3} deltaLabel=" since Mon" sparkline={STATS.reviewSpark} accent="var(--rs-amber-400)" />
      <StatCard label="Top topic" value="Entrepreneurship" delta={4} deltaLabel=" new saves" />
      <StreakCard />
    </div>
  );
};

Object.assign(window, { Sidebar, Header, StatsBar, StatCard, Sparkline });
