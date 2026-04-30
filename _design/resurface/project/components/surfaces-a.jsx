// Surfaces: Landing, Extension, Onboarding, Settings, Digest, Empty states

// ═══ LANDING ═══════════════════════════════════════════════
const Landing = () => (
  <div style={{ background: 'var(--rs-bg-base)', minHeight: '100%', position: 'relative', zIndex: 1 }}>
    {/* Nav */}
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '22px 48px', maxWidth: 1200, margin: '0 auto',
    }}>
      <Logo size={22} wordSize={16} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <a style={{ font: '500 13px/1 Geist', color: 'var(--rs-text-secondary)', textDecoration: 'none' }}>How it works</a>
        <a style={{ font: '500 13px/1 Geist', color: 'var(--rs-text-secondary)', textDecoration: 'none' }}>Pricing</a>
        <a style={{ font: '500 13px/1 Geist', color: 'var(--rs-text-secondary)', textDecoration: 'none' }}>Sign in</a>
        <Button variant="primary"><Icon name="chrome" size={13}/> Get the extension</Button>
      </div>
    </nav>

    {/* Hero */}
    <section style={{ maxWidth: 1060, margin: '0 auto', padding: '56px 48px 32px', textAlign: 'center' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '4px 10px 4px 4px',
        borderRadius: 'var(--rs-radius-full)',
        background: 'var(--rs-bg-elevated)',
        border: '0.5px solid var(--rs-border-subtle)',
        marginBottom: 28,
      }}>
        <span style={{
          font: '500 10px/1 Geist, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase',
          color: 'var(--rs-teal-300)', background: 'rgba(45,212,191,0.10)',
          padding: '3px 8px', borderRadius: 'var(--rs-radius-full)',
        }}>New</span>
        <span style={{ font: '400 12px/1 Geist', color: 'var(--rs-text-secondary)' }}>Now capturing YouTube Shorts →</span>
      </div>
      <h1 style={{ font: '500 64px/1.02 Geist, sans-serif', letterSpacing: '-0.035em', margin: 0, color: 'var(--rs-text-primary)' }}>
        Your bookmarks<br/>are a graveyard.
      </h1>
      <p style={{
        font: '400 17px/1.55 Geist, sans-serif', color: 'var(--rs-text-secondary)',
        maxWidth: 520, margin: '22px auto 32px',
      }}>
        Resurface captures what you save on X and YouTube, then brings it back at the moment it matters — so your intentions don&rsquo;t quietly rot.
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 48 }}>
        <Button variant="primary" size="lg">
          <Icon name="chrome" size={14}/> Add to Chrome &mdash; it&rsquo;s free
        </Button>
        <Button variant="ghost" size="lg">See how it works ↓</Button>
      </div>

      {/* product screenshot preview */}
      <div style={{
        perspective: 1400, maxWidth: 920, margin: '0 auto',
      }}>
        <div style={{
          transform: 'rotateX(8deg) rotateY(-3deg)',
          border: '0.5px solid rgba(255,255,255,0.10)',
          borderRadius: 'var(--rs-radius-lg)',
          background: 'var(--rs-bg-surface)',
          overflow: 'hidden',
          boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.04)',
        }}>
          <MiniDashboardPreview />
        </div>
      </div>
    </section>

    {/* Problem row */}
    <section style={{ maxWidth: 1060, margin: '48px auto', padding: '48px 48px' }}>
      <div className="rs-micro" style={{ textAlign: 'center', marginBottom: 24 }}>The before</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { n: '847', label: 'saved tweets you haven&rsquo;t read' },
          { n: '214h', label: 'of Watch Later, mostly untouched' },
          { n: '0', label: 'reminders from any of it' },
        ].map((it, i) => (
          <div key={i} style={{
            background: 'var(--rs-bg-surface)', border: '0.5px solid var(--rs-border-subtle)',
            borderRadius: 'var(--rs-radius-lg)', padding: '28px 24px',
          }}>
            <div style={{ font: '500 40px/1 Geist', letterSpacing: '-0.03em', color: 'var(--rs-text-primary)', marginBottom: 10 }}>{it.n}</div>
            <div style={{ font: '400 13px/1.5 Geist', color: 'var(--rs-text-secondary)' }} dangerouslySetInnerHTML={{__html: it.label}} />
          </div>
        ))}
      </div>
    </section>

    {/* Core loop */}
    <section style={{ maxWidth: 1060, margin: '0 auto', padding: '32px 48px 64px' }}>
      <h2 className="rs-display" style={{ textAlign: 'center', margin: '0 0 12px' }}>One quiet loop.</h2>
      <p style={{ textAlign: 'center', color: 'var(--rs-text-secondary)', font: '400 15px/1.55 Geist', margin: '0 auto 40px', maxWidth: 520 }}>
        No new habit. No new app to open. The work happens between saves.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, position: 'relative' }}>
        {[
          { step: '01', title: 'Save', body: 'Bookmark normally on X or YouTube. The extension sees it.', icon: 'bookmarkPlus' },
          { step: '02', title: 'Capture', body: 'A quiet prompt offers a topic and optional reminder.', icon: 'puzzle' },
          { step: '03', title: 'Organise', body: 'It lands in your dashboard, tagged and filterable.', icon: 'inbox' },
          { step: '04', title: 'Resurface', body: 'Five hand-picked saves come back in your weekly digest.', icon: 'mail' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--rs-bg-surface)', border: '0.5px solid var(--rs-border-subtle)',
            borderRadius: 'var(--rs-radius-lg)', padding: 18,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 'var(--rs-radius-sm)',
                background: 'rgba(45,212,191,0.08)', border: '0.5px solid rgba(45,212,191,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><Icon name={s.icon} size={14} color="var(--rs-teal-400)"/></div>
              <span className="rs-micro">{s.step}</span>
            </div>
            <div style={{ font: '500 16px/1.35 Geist', color: 'var(--rs-text-primary)', marginBottom: 6, letterSpacing: '-0.01em' }}>{s.title}</div>
            <div style={{ font: '400 13px/1.55 Geist', color: 'var(--rs-text-secondary)' }}>{s.body}</div>
          </div>
        ))}
      </div>
    </section>

    {/* Inverted CTA panel (the only light surface) */}
    <section style={{
      background: '#f5f2ed', color: '#0f0f0e',
      padding: '88px 48px',
      margin: '48px 0 0', textAlign: 'center',
    }}>
      <h2 style={{ font: '500 44px/1.08 Geist', letterSpacing: '-0.03em', margin: '0 auto 16px', maxWidth: 640, color: '#0f0f0e' }}>
        Your saves deserve better than a black hole.
      </h2>
      <p style={{ font: '400 16px/1.55 Geist', color: '#5e5b57', maxWidth: 480, margin: '0 auto 28px' }}>
        Two minutes to install. Works silently from there. Free while we&rsquo;re in beta.
      </p>
      <Button variant="inverted" size="lg"><Icon name="chrome" size={14}/> Add to Chrome</Button>
    </section>

    {/* Footer */}
    <footer style={{
      borderTop: '0.5px solid var(--rs-border-subtle)',
      padding: '32px 48px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      maxWidth: 1200, margin: '0 auto',
    }}>
      <Logo size={16} wordSize={13} />
      <div style={{ display: 'flex', gap: 18, font: '400 12px/1 Geist', color: 'var(--rs-text-tertiary)' }}>
        <span>Privacy</span><span>Terms</span><span>Contact</span><span>© 2026</span>
      </div>
    </footer>
  </div>
);

// Mini dashboard screenshot for hero
const MiniDashboardPreview = () => (
  <div style={{ display: 'flex', height: 440 }}>
    <div style={{ width: 180, background: 'var(--rs-bg-surface)', borderRight: '0.5px solid var(--rs-border-subtle)', padding: 12 }}>
      {['Dashboard', 'All saves', 'Reviewed', 'Snoozed', 'Reminders'].map((l, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          height: 28, padding: i === 1 ? '0 8px 0 6px' : '0 8px',
          background: i === 1 ? 'rgba(45,212,191,0.07)' : 'transparent',
          borderLeft: i === 1 ? '2px solid var(--rs-teal-400)' : '2px solid transparent',
          borderRadius: i === 1 ? '0 6px 6px 0' : '6px',
          font: '500 12px/1 Geist',
          color: i === 1 ? 'var(--rs-teal-300)' : 'var(--rs-text-secondary)',
          marginBottom: 2,
        }}>
          <div style={{ width: 12, height: 12, borderRadius: 2, background: i === 1 ? 'var(--rs-teal-400)' : 'var(--rs-text-tertiary)', opacity: 0.6 }} />
          {l}
        </div>
      ))}
      <div className="rs-micro" style={{ padding: '12px 8px 4px' }}>Topics</div>
      {['Entrepreneurship', 'Fitness', 'AI & Research'].map((l, i) => (
        <div key={i} style={{ font: '400 12px/1 Geist', color: 'var(--rs-text-secondary)', padding: '4px 8px' }}>{l}</div>
      ))}
    </div>
    <div style={{ flex: 1, padding: 14, background: 'var(--rs-bg-base)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 12 }}>
        {[
          { l: 'This week', v: '12', d: '+33%' },
          { l: 'Pending', v: '28', d: '−3' },
          { l: 'Top topic', v: 'Entre.', d: '+4' },
          { l: 'Streak', v: '3w', d: '🔥' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--rs-bg-elevated)', border: '0.5px solid var(--rs-border-subtle)',
            borderRadius: 8, padding: '10px 12px',
          }}>
            <div style={{ font: '400 9px/1 Geist', color: 'var(--rs-text-tertiary)', marginBottom: 6 }}>{s.l}</div>
            <div style={{ font: '500 16px/1 Geist', color: 'var(--rs-text-primary)' }}>{s.v}</div>
            <div style={{ font: '400 9px/1 Geist', color: 'var(--rs-teal-400)', marginTop: 3 }}>{s.d}</div>
          </div>
        ))}
      </div>
      <div style={{ background: 'var(--rs-bg-surface)', border: '0.5px solid var(--rs-border-subtle)', borderRadius: 10 }}>
        {BOOKMARKS.slice(0, 5).map((b, i) => (
          <div key={b.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px',
            borderBottom: i < 4 ? '0.5px solid var(--rs-border-subtle)' : 'none',
            opacity: b.status === 'reviewed' ? 0.55 : 1,
          }}>
            <Thumb platform={b.platform} size={28} title={b.title} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ font: '500 11px/1.3 Geist', color: 'var(--rs-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</div>
              <div style={{ font: '400 10px/1.2 Geist', color: 'var(--rs-text-tertiary)', marginTop: 2 }}>{b.author} · {b.savedAgo}</div>
            </div>
            <Badge variant={b.platform === 'x' ? 'x' : 'youtube'}>{b.platform === 'x' ? 'X' : 'YT'}</Badge>
            <Badge variant="topic">{b.topic.split(' ')[0]}</Badge>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ═══ EXTENSION CAPTURE PROMPT ═════════════════════════════
const ExtensionPrompt = ({ platform = 'x', onClose, onSave }) => {
  const [dismissed, setDismissed] = React.useState(false);
  const [topic, setTopic] = React.useState('Entrepreneurship');
  const [remindOpen, setRemindOpen] = React.useState(false);
  const [topicOpen, setTopicOpen] = React.useState(false);
  const [progress, setProgress] = React.useState(100);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    if (paused) return;
    const start = Date.now();
    const initial = progress;
    const dur = (progress / 100) * 8000;
    const iv = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, initial - (elapsed / dur) * initial);
      setProgress(remaining);
      if (remaining === 0) { clearInterval(iv); setDismissed(true); }
    }, 50);
    return () => clearInterval(iv);
  }, [paused]);

  const content = platform === 'x'
    ? { title: 'The unreasonable effectiveness of writing your LLM eval set by hand before you build anything.', author: '@HamelHusain' }
    : { title: 'Zone 2 cardio explained: why 80% of your training should feel this easy', author: 'Peter Attia, MD' };

  if (dismissed) return null;

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        position: 'absolute', bottom: 20, right: 20, zIndex: 2147483647,
        width: 320,
        background: 'var(--rs-bg-elevated)',
        border: '0.5px solid var(--rs-border-default)',
        borderRadius: 'var(--rs-radius-xl)',
        padding: 16,
        boxShadow: '0 4px 32px rgba(0,0,0,0.60), 0 0 0 0.5px rgba(255,255,255,0.04)',
        animation: 'rsPromptIn 240ms var(--rs-ease-default)',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--rs-teal-400)', boxShadow: '0 0 8px rgba(45,212,191,0.5)' }} />
        <div style={{ font: '500 13px/1 Geist', color: 'var(--rs-text-primary)' }}>Saved to Resurface</div>
        <div style={{ marginLeft: 'auto' }}>
          <Badge variant={platform === 'x' ? 'x' : 'youtube'} icon={platform === 'x' ? <XGlyph size={10}/> : <YTGlyph size={12} color="var(--rs-yt-red)"/>}>
            {platform === 'x' ? 'X' : 'YouTube'}
          </Badge>
        </div>
      </div>
      <div style={{
        font: '400 12px/1.45 Geist', color: 'var(--rs-text-secondary)',
        marginBottom: 12,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>{content.title}</div>

      {/* Topic row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, position: 'relative' }}>
        <div style={{ font: '400 11px/1 Geist', color: 'var(--rs-text-tertiary)', width: 44 }}>Topic</div>
        <button onClick={() => setTopicOpen(o => !o)} style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 8,
          height: 30, padding: '0 10px',
          background: 'var(--rs-bg-base)', border: '0.5px solid var(--rs-border-default)',
          borderRadius: 'var(--rs-radius-md)', cursor: 'pointer',
          font: '400 12px/1 Geist', color: 'var(--rs-text-primary)',
        }}>
          <Icon name="tag" size={12} color="var(--rs-teal-400)"/>
          <span style={{ flex: 1, textAlign: 'left' }}>{topic}</span>
          <span style={{
            font: '500 9px/1 Geist', color: 'var(--rs-teal-300)',
            background: 'rgba(45,212,191,0.08)', padding: '2px 6px', borderRadius: 100,
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>AI suggested</span>
          <Icon name="chevronDown" size={12} color="var(--rs-text-tertiary)"/>
        </button>
        {topicOpen && (
          <div style={{
            position: 'absolute', top: 34, left: 54, right: 0, zIndex: 10,
            background: 'var(--rs-bg-overlay)', border: '0.5px solid var(--rs-border-default)',
            borderRadius: 'var(--rs-radius-lg)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            padding: 4,
          }}>
            {['Entrepreneurship', 'AI & Research', 'Design', 'Fitness', '+ New topic…'].map(t => (
              <div key={t} onClick={() => { setTopic(t.replace('+ ', '').replace('…', '')); setTopicOpen(false); }}
                style={{
                  font: '400 12px/1 Geist', color: 'var(--rs-text-secondary)',
                  padding: '7px 10px', borderRadius: 'var(--rs-radius-sm)', cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--rs-bg-hover)'; e.currentTarget.style.color = 'var(--rs-text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--rs-text-secondary)'; }}
              >{t}</div>
            ))}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ font: '400 11px/1 Geist', color: 'var(--rs-text-tertiary)', width: 44 }}>Remind</div>
        <button onClick={() => setRemindOpen(o => !o)} style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 8,
          height: 30, padding: '0 10px',
          background: 'var(--rs-bg-base)', border: '0.5px solid var(--rs-border-default)',
          borderRadius: 'var(--rs-radius-md)', cursor: 'pointer',
          font: '400 12px/1 Geist', color: remindOpen ? 'var(--rs-text-primary)' : 'var(--rs-text-tertiary)',
        }}>
          <Icon name="bell" size={12} color="var(--rs-text-tertiary)"/>
          <span style={{ flex: 1, textAlign: 'left' }}>{remindOpen ? 'Fri, Apr 24 · 9:00am' : 'No reminder'}</span>
          <Icon name="chevronDown" size={12} color="var(--rs-text-tertiary)"/>
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <Button variant="ghost" style={{ flex: 1 }} onClick={() => { setDismissed(true); onClose && onClose(); }}>Skip</Button>
        <Button variant="primary" style={{ flex: 2 }} onClick={() => { setDismissed(true); onSave && onSave(); }}>
          Save & Close
        </Button>
      </div>

      {/* timer bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 2, background: 'rgba(255,255,255,0.04)',
      }}>
        <div style={{
          width: `${progress}%`, height: '100%',
          background: 'var(--rs-teal-400)', opacity: 0.5,
          transition: 'width 50ms linear',
        }} />
      </div>
    </div>
  );
};

// ═══ EMPTY STATES GALLERY ═════════════════════════════════
const Illustration = ({ kind }) => {
  const props = { width: 120, height: 80, fill: 'none', stroke: '#5eead4', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (kind === 'bookmark') return (
    <svg {...props} viewBox="0 0 120 80">
      <path d="M48 18 L72 18 Q76 18 76 22 L76 56 L60 48 L44 56 L44 22 Q44 18 48 18 Z" />
      <circle cx="52" cy="26" r="2" fill="#fbbf24" stroke="none"/>
      <path d="M60 68 L60 62 M56 66 L60 62 L64 66" />
    </svg>
  );
  if (kind === 'filter') return (
    <svg {...props} viewBox="0 0 120 80">
      <rect x="30" y="18" width="60" height="12" rx="1"/>
      <rect x="30" y="34" width="60" height="12" rx="1" fill="rgba(94,234,212,0.06)"/>
      <rect x="30" y="50" width="60" height="12" rx="1"/>
      <circle cx="86" cy="24" r="2.5" fill="#fbbf24" stroke="none"/>
    </svg>
  );
  if (kind === 'check') return (
    <svg {...props} viewBox="0 0 120 80">
      <path d="M38 42 L50 54 L82 24" />
      <line x1="20" y1="66" x2="100" y2="66" />
      <circle cx="88" cy="22" r="2.5" fill="#fbbf24" stroke="none"/>
    </svg>
  );
  if (kind === 'clock') return (
    <svg {...props} viewBox="0 0 120 80">
      <circle cx="52" cy="40" r="20"/>
      <path d="M52 28 L52 40 L60 46" />
      <text x="78" y="32" fill="#fbbf24" stroke="none" fontSize="10" fontFamily="Geist">z</text>
      <text x="84" y="26" fill="#fbbf24" stroke="none" fontSize="8" fontFamily="Geist">z</text>
      <text x="88" y="21" fill="#fbbf24" stroke="none" fontSize="6" fontFamily="Geist">z</text>
    </svg>
  );
  if (kind === 'bell') return (
    <svg {...props} viewBox="0 0 120 80">
      <path d="M48 44 Q48 28 60 28 Q72 28 72 44 L76 50 L44 50 Z"/>
      <path d="M56 54 Q60 58 64 54"/>
      <circle cx="80" cy="26" r="2" fill="#fbbf24" stroke="none"/>
    </svg>
  );
  return null;
};

const EmptyState = ({ kind, heading, body, cta }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    textAlign: 'center', gap: 12,
    padding: '48px 24px',
    background: 'var(--rs-bg-surface)',
    border: '0.5px solid var(--rs-border-subtle)',
    borderRadius: 'var(--rs-radius-lg)',
  }}>
    <Illustration kind={kind} />
    <div style={{ font: '500 16px/1.35 Geist', color: 'var(--rs-text-primary)' }}>{heading}</div>
    <div style={{ font: '400 13px/1.5 Geist', color: 'var(--rs-text-secondary)', maxWidth: 260 }}>{body}</div>
    {cta && <div style={{ marginTop: 4 }}>{cta}</div>}
  </div>
);

const EmptyStatesGallery = () => (
  <div style={{ padding: 32, maxWidth: 1100, margin: '0 auto' }}>
    <h2 className="rs-heading" style={{ margin: '0 0 6px' }}>Empty states</h2>
    <p style={{ font: '400 14px/1.5 Geist', color: 'var(--rs-text-secondary)', margin: '0 0 28px' }}>
      Dry wit, not pep talk. One amber detail per illustration — echoes the two-tone mark.
    </p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
      <EmptyState kind="bookmark" heading="Nothing here yet." body="Install the extension to start capturing saves from X and YouTube."
        cta={<Button variant="primary"><Icon name="chrome" size={13}/> Get the extension</Button>} />
      <EmptyState kind="filter" heading="No saves match this." body="Try loosening a filter, or go back to All saves."
        cta={<Button variant="secondary">Clear filters</Button>} />
      <EmptyState kind="check" heading="Nothing reviewed yet." body="Mark a save as reviewed and it'll live here." />
      <EmptyState kind="clock" heading="Nothing snoozed." body="Snooze a save and it'll resurface when you're ready." />
      <EmptyState kind="bell" heading="No reminders set." body="Add a reminder when capturing a save. We'll ping you." />
      <EmptyState kind="bookmark" heading="Topic's quiet." body="No saves assigned to this topic. Tag one to get started." />
    </div>
  </div>
);

Object.assign(window, { Landing, ExtensionPrompt, EmptyState, EmptyStatesGallery, Illustration });
