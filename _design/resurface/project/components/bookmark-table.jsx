// Bookmark table with filters, hover actions, row expand, inline topic edit

const FilterBar = ({ filters, setFilters, density, setDensity }) => {
  const PillGroup = ({ value, onChange, options }) => (
    <div style={{
      display: 'inline-flex', padding: 2,
      background: 'var(--rs-bg-elevated)',
      border: '0.5px solid var(--rs-border-subtle)',
      borderRadius: 'var(--rs-radius-md)',
      gap: 2,
    }}>
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <button key={opt.value} onClick={() => onChange(opt.value)} className="rs-focus-ring"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 10px',
              background: active ? 'var(--rs-bg-hover)' : 'transparent',
              border: 'none',
              borderLeft: active ? '2px solid var(--rs-teal-400)' : '2px solid transparent',
              borderRadius: active ? '0 var(--rs-radius-sm) var(--rs-radius-sm) 0' : 'var(--rs-radius-sm)',
              color: active ? 'var(--rs-teal-300)' : 'var(--rs-text-secondary)',
              font: '500 12px/1 Geist, sans-serif',
              cursor: 'pointer',
              transition: 'all 120ms',
            }}>
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
      padding: '10px 0 14px', marginBottom: 2,
    }}>
      <PillGroup value={filters.platform} onChange={v => setFilters({...filters, platform: v})} options={[
        { value: 'all', label: 'All' },
        { value: 'x', label: 'X', icon: <XGlyph size={10} /> },
        { value: 'youtube', label: 'YouTube', icon: <YTGlyph size={12} color="var(--rs-yt-red)" /> },
      ]} />
      <div style={{ width: 0.5, height: 20, background: 'var(--rs-border-subtle)' }} />
      <PillGroup value={filters.status} onChange={v => setFilters({...filters, status: v})} options={[
        { value: 'all', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'reviewed', label: 'Reviewed' },
        { value: 'snoozed', label: 'Snoozed' },
      ]} />
      <div style={{ flex: 1 }} />
      <button className="rs-focus-ring" style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        height: 28, padding: '0 10px',
        background: 'var(--rs-bg-elevated)',
        border: '0.5px solid var(--rs-border-subtle)',
        borderRadius: 'var(--rs-radius-md)',
        color: 'var(--rs-text-secondary)',
        font: '500 12px/1 Geist, sans-serif',
        cursor: 'pointer',
      }}>
        <Icon name="sliders" size={13} color="var(--rs-text-tertiary)" />
        Date saved
        <Icon name="chevronDown" size={12} color="var(--rs-text-tertiary)" />
      </button>
      <button onClick={() => setDensity(density === 'comfortable' ? 'compact' : 'comfortable')}
        className="rs-focus-ring"
        title={density === 'comfortable' ? 'Switch to compact' : 'Switch to comfortable'}
        style={{
          width: 28, height: 28, border: '0.5px solid var(--rs-border-subtle)',
          background: 'var(--rs-bg-elevated)', borderRadius: 'var(--rs-radius-md)',
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--rs-text-tertiary)',
        }}>
        <Icon name={density === 'compact' ? 'grid' : 'log'} size={13} />
      </button>
    </div>
  );
};

// ─── Thumbnail ─────────────────────────────────────────────
const Thumb = ({ platform, size = 40, title = '' }) => {
  // Deterministic gradient per item based on title
  const hash = (title || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue = (hash * 7) % 360;
  const base = platform === 'youtube'
    ? `linear-gradient(135deg, hsl(${hue}, 35%, 14%), hsl(${(hue + 40) % 360}, 45%, 22%))`
    : `linear-gradient(135deg, hsl(${hue}, 18%, 14%), hsl(${(hue + 60) % 360}, 22%, 20%))`;
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      borderRadius: 'var(--rs-radius-sm)',
      background: base,
      border: '0.5px solid var(--rs-border-subtle)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', position: 'relative',
    }}>
      {platform === 'youtube'
        ? <Icon name="play" size={size * 0.4} color="rgba(255,255,255,0.55)" />
        : <XGlyph size={size * 0.35} color="rgba(255,255,255,0.55)" />
      }
    </div>
  );
};

// ─── Topic pill with dropdown ─────────────────────────────
const TopicPill = ({ topic, onChange }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);
  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        className="rs-focus-ring"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          font: '500 11px/1 Geist, sans-serif',
          padding: '2px 8px',
          borderRadius: 'var(--rs-radius-full)',
          background: 'rgba(45,212,191,0.08)',
          color: 'var(--rs-teal-300)',
          border: '0.5px solid rgba(45,212,191,0.18)',
          cursor: 'pointer',
          transition: 'all 120ms',
        }}>
        {topic}
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 50,
          minWidth: 180,
          background: 'var(--rs-bg-overlay)',
          border: '0.5px solid var(--rs-border-default)',
          borderRadius: 'var(--rs-radius-lg)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.40)',
          padding: 4,
          animation: 'rsDropdownIn 150ms var(--rs-ease-default)',
        }}>
          {TOPICS.map(t => {
            const selected = t.name === topic;
            return (
              <button key={t.id}
                onClick={(e) => { e.stopPropagation(); onChange(t.name); setOpen(false); }}
                className="rs-focus-ring"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', height: 32, padding: selected ? '0 10px 0 8px' : '0 10px',
                  background: selected ? 'rgba(45,212,191,0.07)' : 'transparent',
                  borderLeft: selected ? '2px solid var(--rs-teal-400)' : '2px solid transparent',
                  border: 'none',
                  borderRadius: selected ? '0 var(--rs-radius-sm) var(--rs-radius-sm) 0' : 'var(--rs-radius-sm)',
                  font: '400 13px/1 Geist, sans-serif',
                  color: selected ? 'var(--rs-teal-300)' : 'var(--rs-text-secondary)',
                  cursor: 'pointer', textAlign: 'left',
                }}
                onMouseEnter={e => { if (!selected) { e.currentTarget.style.background = 'var(--rs-bg-hover)'; e.currentTarget.style.color = 'var(--rs-text-primary)'; } }}
                onMouseLeave={e => { if (!selected) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--rs-text-secondary)'; } }}
              >
                <Icon name="tag" size={13} color={selected ? 'var(--rs-teal-400)' : 'var(--rs-text-tertiary)'} />
                <span style={{ flex: 1 }}>{t.name}</span>
                <span style={{ color: 'var(--rs-text-tertiary)', font: '400 10px/1 Geist' }}>{t.count}</span>
              </button>
            );
          })}
        </div>
      )}
    </span>
  );
};

// ─── Row actions (hover) ──────────────────────────────────
const RowAction = ({ icon, label, onClick, variant }) => {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      className="rs-focus-ring"
      title={label}
      aria-label={label}
      style={{
        width: 28, height: 28,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: hover ? 'var(--rs-bg-hover)' : 'transparent',
        border: '0.5px solid ' + (hover ? 'var(--rs-border-subtle)' : 'transparent'),
        borderRadius: 'var(--rs-radius-xs)',
        cursor: 'pointer',
        color: hover ? (variant === 'danger' ? 'var(--rs-red-400)' : 'var(--rs-teal-400)') : 'var(--rs-text-tertiary)',
        transition: 'all 100ms',
      }}>
      <Icon name={icon} size={14} />
    </button>
  );
};

// ─── Bookmark row ─────────────────────────────────────────
const BookmarkRow = ({ bm, density, expanded, onToggle, onAction, justReviewed }) => {
  const [hover, setHover] = React.useState(false);
  const rowHeight = density === 'compact' ? 40 : 52;
  const reviewed = bm.status === 'reviewed';
  const snoozed = bm.status === 'snoozed';

  return (
    <div style={{
      borderBottom: '0.5px solid var(--rs-border-subtle)',
      opacity: justReviewed ? 0.55 : (reviewed ? 0.55 : (snoozed ? 0.65 : 1)),
      transition: 'opacity 200ms var(--rs-ease-smooth)',
    }}>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={onToggle}
        style={{
          display: 'grid',
          gridTemplateColumns: density === 'compact'
            ? '28px 1fr auto auto auto auto 120px'
            : '40px 1fr auto auto auto auto 120px',
          alignItems: 'center',
          gap: 14,
          height: rowHeight,
          padding: '0 16px',
          background: hover && !reviewed ? 'var(--rs-bg-elevated)' : 'transparent',
          cursor: 'pointer',
          transition: 'background 100ms',
        }}>
        <Thumb platform={bm.platform} size={density === 'compact' ? 28 : 40} title={bm.title} />
        <div style={{ minWidth: 0 }}>
          <div style={{
            font: '500 13px/1.3 Geist, sans-serif',
            color: 'var(--rs-text-primary)',
            fontStyle: snoozed ? 'italic' : 'normal',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{bm.title}</div>
          <div style={{
            font: '400 11px/1.4 Geist, sans-serif',
            color: 'var(--rs-text-tertiary)',
            marginTop: 2,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span>{bm.author}</span>
            <span>·</span>
            <span>{bm.savedAgo}</span>
            {bm.reminder && (<><span>·</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: 'var(--rs-amber-200)' }}>
                <Icon name="bell" size={10} />{bm.reminder}
              </span></>)}
          </div>
        </div>
        <Badge variant={bm.platform === 'x' ? 'x' : 'youtube'}
          icon={bm.platform === 'x' ? <XGlyph size={10} /> : <YTGlyph size={12} color="var(--rs-yt-red)" />}>
          {bm.platform === 'x' ? 'X' : 'YouTube'}
        </Badge>
        <TopicPill topic={bm.topic} onChange={(t) => onAction('topic', bm.id, t)} />
        <span style={{
          font: '400 11px/1 Geist, sans-serif',
          color: 'var(--rs-text-tertiary)',
          whiteSpace: 'nowrap',
        }} title={bm.savedISO}>{bm.savedAgo}</span>
        <Badge variant={justReviewed ? 'reviewed' : (bm.status === 'pending' ? 'pending' : bm.status === 'reviewed' ? 'reviewed' : 'snoozed')}>
          {justReviewed ? 'Reviewed' : (bm.status.charAt(0).toUpperCase() + bm.status.slice(1))}
        </Badge>
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 2,
          opacity: hover ? 1 : 0, transition: 'opacity 100ms',
        }}>
          <RowAction icon="check" label="Mark reviewed" onClick={() => onAction('review', bm.id)} />
          <RowAction icon="alarmSnooze" label="Snooze" onClick={() => onAction('snooze', bm.id)} />
          <RowAction icon="arrowUpRight" label="Open original" onClick={() => onAction('open', bm.id)} />
          <RowAction icon="trash" label="Delete" variant="danger" onClick={() => onAction('delete', bm.id)} />
        </div>
      </div>
      {expanded && (
        <div style={{
          borderLeft: '2px solid var(--rs-teal-400)',
          background: 'var(--rs-bg-elevated)',
          padding: '14px 20px 18px 56px',
          animation: 'rsRowExpand 200ms var(--rs-ease-default)',
          overflow: 'hidden',
        }}>
          <div style={{
            font: '400 14px/1.65 Geist, sans-serif',
            color: 'var(--rs-text-primary)',
            maxWidth: 720,
            marginBottom: 10,
          }}>{bm.excerpt}</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); onAction('review', bm.id); }}>
              <Icon name="check" size={13} /> Mark reviewed
            </Button>
            <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); onAction('snooze', bm.id); }}>
              <Icon name="alarmSnooze" size={13} /> Snooze
            </Button>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onAction('open', bm.id); }}>
              Open original <Icon name="arrowUpRight" size={12} />
            </Button>
            {bm.duration && (
              <span style={{ marginLeft: 'auto', font: '400 11px/1 Geist', color: 'var(--rs-text-tertiary)' }}>
                Duration · {bm.duration}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Table ────────────────────────────────────────────────
const BookmarkTable = ({ bookmarks, density, filters, onAction }) => {
  const [expandedId, setExpandedId] = React.useState('b1');
  const [justReviewedId, setJustReviewedId] = React.useState(null);

  const filtered = bookmarks.filter(b => {
    if (filters.platform !== 'all' && b.platform !== filters.platform) return false;
    if (filters.status !== 'all' && b.status !== filters.status) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!(b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.topic.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const handleAction = (type, id, payload) => {
    if (type === 'review') {
      setJustReviewedId(id);
      setTimeout(() => { onAction(type, id); setJustReviewedId(null); }, 400);
    } else {
      onAction(type, id, payload);
    }
  };

  return (
    <div style={{
      background: 'var(--rs-bg-surface)',
      border: '0.5px solid var(--rs-border-subtle)',
      borderRadius: 'var(--rs-radius-lg)',
      overflow: 'hidden',
    }}>
      {/* table header row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: density === 'compact'
          ? '28px 1fr auto auto auto auto 120px'
          : '40px 1fr auto auto auto auto 120px',
        alignItems: 'center', gap: 14,
        height: 36, padding: '0 16px',
        borderBottom: '0.5px solid var(--rs-border-subtle)',
        background: 'var(--rs-bg-surface)',
      }}>
        <div />
        <div className="rs-micro">Title</div>
        <div className="rs-micro">Platform</div>
        <div className="rs-micro">Topic</div>
        <div className="rs-micro">Date</div>
        <div className="rs-micro">Status</div>
        <div className="rs-micro" style={{ textAlign: 'right' }}>Actions</div>
      </div>
      {filtered.length === 0 ? (
        <InlineEmpty filters={filters} />
      ) : filtered.map(bm => (
        <BookmarkRow
          key={bm.id}
          bm={bm}
          density={density}
          expanded={expandedId === bm.id}
          justReviewed={justReviewedId === bm.id}
          onToggle={() => setExpandedId(expandedId === bm.id ? null : bm.id)}
          onAction={handleAction}
        />
      ))}
    </div>
  );
};

const InlineEmpty = ({ filters }) => (
  <div style={{
    padding: '48px 24px', textAlign: 'center',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
  }}>
    <svg width="100" height="72" viewBox="0 0 100 72" fill="none" stroke="#5eead4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="12" y="14" width="76" height="12" rx="1" />
      <rect x="12" y="32" width="76" height="12" rx="1" fill="rgba(94,234,212,0.05)" />
      <rect x="12" y="50" width="76" height="12" rx="1" />
      <circle cx="84" cy="20" r="2" fill="#fbbf24" stroke="none" />
    </svg>
    <div style={{ font: '500 16px/1.35 Geist', color: 'var(--rs-text-primary)' }}>No saves match this.</div>
    <div style={{ font: '400 13px/1.5 Geist', color: 'var(--rs-text-secondary)', maxWidth: 260 }}>
      Try loosening a filter, or go back to All saves.
    </div>
  </div>
);

Object.assign(window, { FilterBar, BookmarkTable, Thumb, TopicPill });
