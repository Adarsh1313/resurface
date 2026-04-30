// Dashboard page composition + X/YouTube backgrounds for extension prompts

const DashboardPage = () => {
  const [bookmarks, setBookmarks] = React.useState(BOOKMARKS);
  const [filters, setFilters] = React.useState({ platform: 'all', status: 'all', search: '' });
  const [density, setDensity] = React.useState('comfortable');
  const [activePage, setActivePage] = React.useState('all');
  const [collapsed, setCollapsed] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  const showToast = (msg, action) => {
    setToast({ msg, action });
    setTimeout(() => setToast(null), 4200);
  };

  const onAction = (type, id, payload) => {
    if (type === 'review') {
      setBookmarks(bs => bs.map(b => b.id === id ? { ...b, status: 'reviewed' } : b));
      showToast('Marked as reviewed', 'undo');
    } else if (type === 'snooze') {
      setBookmarks(bs => bs.map(b => b.id === id ? { ...b, status: 'snoozed' } : b));
      showToast('Snoozed until next week', 'undo');
    } else if (type === 'delete') {
      setBookmarks(bs => bs.filter(b => b.id !== id));
      showToast('Deleted', 'undo');
    } else if (type === 'topic') {
      setBookmarks(bs => bs.map(b => b.id === id ? { ...b, topic: payload } : b));
      showToast(`Moved to ${payload}`);
    } else if (type === 'open') {
      showToast('Opening original…');
    }
  };

  let filteredBookmarks = bookmarks;
  if (activePage === 'reviewed') filteredBookmarks = bookmarks.filter(b => b.status === 'reviewed');
  else if (activePage === 'snoozed') filteredBookmarks = bookmarks.filter(b => b.status === 'snoozed');
  else if (activePage === 'reminders') filteredBookmarks = bookmarks.filter(b => b.reminder);
  else if (activePage.startsWith('topic:')) {
    const tid = activePage.split(':')[1];
    const topic = TOPICS.find(t => t.id === tid);
    if (topic) filteredBookmarks = bookmarks.filter(b => b.topic === topic.name);
  }

  return (
    <div style={{ display: 'flex', height: '100%', background: 'var(--rs-bg-base)' }}>
      <Sidebar activePage={activePage} onNav={setActivePage} collapsed={collapsed} onToggleCollapse={() => setCollapsed(c => !c)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header search={filters.search} onSearch={v => setFilters({ ...filters, search: v })} />
        <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h1 className="rs-display" style={{ margin: 0 }}>
                {activePage === 'all' ? 'All saves' :
                 activePage === 'reviewed' ? 'Reviewed' :
                 activePage === 'snoozed' ? 'Snoozed' :
                 activePage === 'reminders' ? 'With reminders' :
                 activePage === 'dashboard' ? 'Dashboard' :
                 activePage.startsWith('topic:') ? TOPICS.find(t => t.id === activePage.split(':')[1])?.name : 'Saves'}
              </h1>
              <div style={{ font: '400 13px/1.5 Geist', color: 'var(--rs-text-tertiary)', marginTop: 4 }}>
                {filteredBookmarks.length} {filteredBookmarks.length === 1 ? 'save' : 'saves'}
              </div>
            </div>
            <Button variant="secondary" size="sm"><Icon name="mail" size={13}/> Preview digest</Button>
          </div>
          <StatsBar />
          <FilterBar filters={filters} setFilters={setFilters} density={density} setDensity={setDensity} />
          <BookmarkTable bookmarks={filteredBookmarks} density={density} filters={filters} onAction={onAction} />
        </div>
      </div>
      {toast && (
        <div style={{
          position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--rs-bg-overlay)', border: '0.5px solid var(--rs-border-default)',
          borderRadius: 'var(--rs-radius-lg)',
          padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 14,
          font: '400 12px/1 Geist', color: 'var(--rs-text-primary)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          animation: 'rsToastIn 220ms var(--rs-ease-default)',
          zIndex: 100,
        }}>
          <Icon name="check" size={13} color="var(--rs-teal-400)"/>
          {toast.msg}
          {toast.action === 'undo' && (
            <button onClick={() => setToast(null)} style={{
              background: 'transparent', border: 'none',
              font: '500 12px/1 Geist', color: 'var(--rs-teal-300)', cursor: 'pointer',
            }}>Undo</button>
          )}
        </div>
      )}
    </div>
  );
};

// ═══ X feed background ════════════════════════════════════
const XFeedBg = () => (
  <div style={{ background: '#000', color: '#e7e9ea', minHeight: '100%', display: 'flex', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
    <div style={{ width: 72, borderRight: '1px solid #2f3336', padding: '14px 8px', flexShrink: 0 }}>
      <div style={{ width: 32, height: 32, marginBottom: 16 }}>
        <XGlyph size={28} color="#fff"/>
      </div>
      {['🏠', '🔍', '🔔', '✉️', '🔖', '👤'].map((e, i) => (
        <div key={i} style={{
          width: 44, height: 44, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: i === 4 ? 'rgba(239,243,244,0.1)' : 'transparent',
          marginBottom: 4, fontSize: 18, opacity: 0.8,
        }}>{e}</div>
      ))}
    </div>
    <div style={{ flex: 1, maxWidth: 600, borderRight: '1px solid #2f3336' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #2f3336', fontSize: 20, fontWeight: 700, position: 'sticky', top: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)' }}>
        For you
      </div>
      {[
        { author: 'Hamel Husain', handle: '@HamelHusain', time: '2h', saved: true,
          text: 'The unreasonable effectiveness of writing your LLM eval set by hand before you build anything. 🧵' },
        { author: 'Nick Huber', handle: '@sweatystartup', time: '4h',
          text: 'Value-based pricing is about what the customer gets, not what it costs you to build. Here are 3 frameworks that actually survive first contact with customers.' },
        { author: 'Jason Lemkin', handle: '@jasonlk', time: '6h',
          text: 'Three questions I ask every founder before I invest a dollar. Most fail #2: who renewed last month? who churned? And why?' },
      ].map((p, i) => (
        <article key={i} style={{ padding: '14px 16px', borderBottom: '1px solid #2f3336', display: 'flex', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #555, #222)', flexShrink: 0 }}/>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{p.author}</span>
              <span style={{ color: '#71767b', fontSize: 14 }}>{p.handle} · {p.time}</span>
            </div>
            <div style={{ fontSize: 15, lineHeight: 1.4 }}>{p.text}</div>
            <div style={{ display: 'flex', gap: 42, marginTop: 12, color: '#71767b', fontSize: 13 }}>
              <span>💬 24</span><span>🔁 108</span><span>♥ 1.2K</span>
              <span style={{ color: p.saved ? '#2dd4bf' : '#71767b' }}>🔖</span>
            </div>
          </div>
        </article>
      ))}
    </div>
    <div style={{ flex: 1, padding: 20, maxWidth: 360 }}>
      <div style={{ background: '#16181c', borderRadius: 16, padding: 16 }}>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>What&rsquo;s happening</div>
        {['Trending in Tech', 'AI evals going mainstream', 'Design · 12K posts'].map((t, i) => (
          <div key={i} style={{ padding: '10px 0', borderTop: i > 0 ? '1px solid #2f3336' : 'none', fontSize: 13, color: '#71767b' }}>{t}</div>
        ))}
      </div>
    </div>
  </div>
);

// ═══ YouTube background ═══════════════════════════════════
const YTFeedBg = () => (
  <div style={{ background: '#0f0f0f', color: '#f1f1f1', minHeight: '100%', display: 'flex', fontFamily: 'Roboto, -apple-system, sans-serif' }}>
    <div style={{ width: 72, padding: '12px 0', flexShrink: 0 }}>
      {['🏠', '🎬', '📹', '📺', '🎵'].map((e, i) => (
        <div key={i} style={{
          width: 72, height: 62, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: i === 0 ? 'rgba(255,255,255,0.1)' : 'transparent',
          fontSize: 18, marginBottom: 2,
        }}>
          <span>{e}</span>
          <span style={{ fontSize: 10, marginTop: 4, color: '#aaa' }}>{['Home', 'Shorts', 'Subs', 'You', 'Music'][i]}</span>
        </div>
      ))}
    </div>
    <div style={{ flex: 1, padding: '14px 20px' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['All', 'Mixes', 'Fitness', 'Design', 'AI', 'Podcasts', 'Music', 'Gaming'].map((t, i) => (
          <div key={i} style={{
            padding: '6px 12px', borderRadius: 8,
            background: i === 0 ? '#f1f1f1' : '#272727',
            color: i === 0 ? '#0f0f0f' : '#f1f1f1',
            fontSize: 13, fontWeight: 500,
          }}>{t}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
        {[
          { title: 'Zone 2 cardio explained: why 80% of your training should feel this easy', author: 'Peter Attia, MD', views: '812K', time: '3 days', dur: '18:34', hue: 200 },
          { title: 'Full Body Workout — No Equipment', author: 'Jeff Nippard', views: '1.4M', time: '1 week', dur: '45:12', hue: 30, saved: true },
          { title: 'The best pan I\'ve cooked with in 10 years, and it costs $24', author: 'Kenji López-Alt', views: '320K', time: '6 days', dur: '6:12', hue: 80 },
          { title: 'A quiet tour of the MUJI design archive', author: 'Kenya Hara', views: '48K', time: '2 weeks', dur: '32:45', hue: 260 },
        ].map((v, i) => (
          <div key={i}>
            <div style={{
              aspectRatio: '16/9', borderRadius: 10,
              background: `linear-gradient(135deg, hsl(${v.hue}, 30%, 22%), hsl(${v.hue + 30}, 35%, 14%))`,
              position: 'relative', marginBottom: 10, border: v.saved ? '2px solid #2dd4bf' : 'none',
            }}>
              <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.85)', color: '#fff', fontSize: 11, padding: '2px 4px', borderRadius: 3, fontWeight: 500 }}>{v.dur}</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#444', flexShrink: 0 }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: '500 14px/1.3 Roboto, sans-serif', color: '#f1f1f1', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{v.title}</div>
                <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>{v.author}</div>
                <div style={{ fontSize: 12, color: '#aaa' }}>{v.views} views · {v.time} ago</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

Object.assign(window, { DashboardPage, XFeedBg, YTFeedBg });
