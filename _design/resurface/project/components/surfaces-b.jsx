// Onboarding, Settings, Digest

// ═══ ONBOARDING ═══════════════════════════════════════════
const Onboarding = () => {
  const [step, setStep] = React.useState(0);
  const steps = [
    {
      eyebrow: 'Step 1 of 3',
      title: 'Install the extension.',
      body: 'It runs silently on X and YouTube. It asks for the minimum permissions a Chrome extension can ask for.',
      cta: <Button variant="primary" size="lg"><Icon name="chrome" size={14}/> Add to Chrome</Button>,
      visual: <InstallVisual />,
    },
    {
      eyebrow: 'Step 2 of 3',
      title: 'Bookmark something. Anything.',
      body: "Save a tweet or a YouTube video like you normally would. We'll take it from there — a small prompt appears in the corner.",
      cta: <Button variant="secondary" size="lg">I've saved something</Button>,
      visual: <SaveVisual />,
    },
    {
      eyebrow: 'Step 3 of 3',
      title: 'Set your digest.',
      body: 'Five hand-picked saves, once a week. Monday morning is the default. You can change when, how often, and whether.',
      cta: (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" size="lg">Use defaults</Button>
          <Button variant="primary" size="lg">Finish setup</Button>
        </div>
      ),
      visual: <DigestVisual />,
    },
  ];
  const s = steps[step];
  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', padding: '32px 48px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
        <Logo size={22} wordSize={16} />
        <div style={{ display: 'flex', gap: 4 }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              width: 24, height: 3, borderRadius: 2,
              background: i <= step ? 'var(--rs-teal-400)' : 'var(--rs-border-subtle)',
              transition: 'background 300ms',
            }}/>
          ))}
        </div>
        <button style={{
          font: '500 12px/1 Geist', color: 'var(--rs-text-tertiary)',
          background: 'transparent', border: 'none', cursor: 'pointer',
        }}>Skip setup</button>
      </div>

      <div style={{
        flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center',
        maxWidth: 1040, margin: '0 auto', width: '100%',
      }}>
        <div>
          <div className="rs-micro" style={{ marginBottom: 14, color: 'var(--rs-teal-400)' }}>{s.eyebrow}</div>
          <h1 style={{ font: '500 40px/1.1 Geist', letterSpacing: '-0.03em', margin: '0 0 18px', color: 'var(--rs-text-primary)' }}>{s.title}</h1>
          <p style={{ font: '400 16px/1.55 Geist', color: 'var(--rs-text-secondary)', maxWidth: 420, margin: '0 0 28px' }}>{s.body}</p>
          {s.cta}
        </div>
        <div style={{
          background: 'var(--rs-bg-surface)',
          border: '0.5px solid var(--rs-border-subtle)',
          borderRadius: 'var(--rs-radius-xl)',
          padding: 24,
          minHeight: 380,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{s.visual}</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: 1040, margin: '24px auto 0', width: '100%' }}>
        <Button variant="ghost" disabled={step === 0} onClick={() => setStep(s => Math.max(0, s - 1))}>
          <Icon name="arrowLeft" size={12}/> Back
        </Button>
        <Button variant="secondary" onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} disabled={step === steps.length - 1}>
          Next <Icon name="arrowRight" size={12}/>
        </Button>
      </div>
    </div>
  );
};

const InstallVisual = () => (
  <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
    <div style={{
      background: 'var(--rs-bg-elevated)', border: '0.5px solid var(--rs-border-subtle)',
      borderRadius: 'var(--rs-radius-lg)', padding: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <Icon name="chrome" size={24} color="var(--rs-teal-400)" />
        <div>
          <div style={{ font: '500 13px/1.3 Geist', color: 'var(--rs-text-primary)' }}>Resurface</div>
          <div style={{ font: '400 11px/1.3 Geist', color: 'var(--rs-text-tertiary)' }}>Chrome Web Store</div>
        </div>
      </div>
      <div style={{ font: '400 12px/1.5 Geist', color: 'var(--rs-text-secondary)', marginBottom: 14 }}>
        Reads only the page URL and title when you save. Stores nothing else locally.
      </div>
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 6,
        padding: '10px 12px',
        background: 'var(--rs-bg-base)', border: '0.5px solid var(--rs-border-subtle)',
        borderRadius: 'var(--rs-radius-md)',
      }}>
        {['activeTab', 'storage', 'notifications'].map(p => (
          <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, font: '400 11px/1 Geist', color: 'var(--rs-text-secondary)' }}>
            <Icon name="check" size={11} color="var(--rs-teal-400)"/>{p}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SaveVisual = () => (
  <div style={{ position: 'relative', width: '100%', height: 340 }}>
    <div style={{
      position: 'absolute', inset: 0,
      background: 'var(--rs-bg-base)',
      borderRadius: 'var(--rs-radius-md)',
      border: '0.5px solid var(--rs-border-subtle)',
      overflow: 'hidden',
    }}>
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--rs-bg-elevated)' }}/>
          <div style={{ flex: 1 }}>
            <div style={{ font: '500 12px/1 Geist', color: 'var(--rs-text-primary)', marginBottom: 4 }}>Hamel Husain</div>
            <div style={{ font: '400 11px/1 Geist', color: 'var(--rs-text-tertiary)' }}>@HamelHusain · 2h</div>
          </div>
        </div>
        <div style={{ font: '400 12px/1.5 Geist', color: 'var(--rs-text-primary)' }}>
          The unreasonable effectiveness of writing your LLM eval set by hand before you build anything.
        </div>
        <div style={{ display: 'flex', gap: 18, marginTop: 14, color: 'var(--rs-text-tertiary)' }}>
          <Icon name="heart" size={14}/>
          <span style={{ position: 'relative' }}>
            <Icon name="bookmarkPlus" size={14} color="var(--rs-teal-400)"/>
            <span style={{
              position: 'absolute', inset: -6,
              border: '1px solid var(--rs-teal-400)', borderRadius: '50%',
              animation: 'rsRipple 1.6s ease-out infinite',
            }}/>
          </span>
        </div>
      </div>
    </div>
    <div style={{ position: 'absolute', bottom: 8, right: 8, transform: 'scale(0.85)', transformOrigin: 'bottom right' }}>
      <MiniPrompt />
    </div>
  </div>
);

const MiniPrompt = () => (
  <div style={{
    width: 260, padding: 12,
    background: 'var(--rs-bg-elevated)',
    border: '0.5px solid var(--rs-border-default)',
    borderRadius: 'var(--rs-radius-xl)',
    boxShadow: '0 4px 32px rgba(0,0,0,0.6)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--rs-teal-400)' }}/>
      <div style={{ font: '500 11px/1 Geist', color: 'var(--rs-text-primary)' }}>Saved to Resurface</div>
    </div>
    <div style={{ font: '400 11px/1.4 Geist', color: 'var(--rs-text-secondary)' }}>
      The unreasonable effectiveness of writing your LLM eval set…
    </div>
  </div>
);

const DigestVisual = () => (
  <div style={{ width: '100%' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
      <Icon name="mail" size={18} color="var(--rs-teal-400)"/>
      <div style={{ font: '500 13px/1 Geist', color: 'var(--rs-text-primary)' }}>Weekly digest</div>
      <div style={{ marginLeft: 'auto', font: '400 11px/1 Geist', color: 'var(--rs-text-tertiary)' }}>Mon · 8:00am</div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 16 }}>
      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
        <div key={i} style={{
          height: 32,
          background: i === 0 ? 'rgba(45,212,191,0.12)' : 'var(--rs-bg-elevated)',
          borderLeft: i === 0 ? '2px solid var(--rs-teal-400)' : '0.5px solid transparent',
          border: i === 0 ? undefined : '0.5px solid var(--rs-border-subtle)',
          borderRadius: i === 0 ? '0 6px 6px 0' : 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          font: '500 11px/1 Geist',
          color: i === 0 ? 'var(--rs-teal-300)' : 'var(--rs-text-tertiary)',
        }}>{d}</div>
      ))}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {['8:00am', '12:00pm', '6:00pm', '9:00pm'].map((t, i) => (
        <div key={t} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 10px',
          background: i === 0 ? 'rgba(45,212,191,0.07)' : 'transparent',
          borderLeft: i === 0 ? '2px solid var(--rs-teal-400)' : '2px solid transparent',
          borderRadius: i === 0 ? '0 6px 6px 0' : 6,
        }}>
          <div style={{
            width: 12, height: 12, borderRadius: '50%',
            border: i === 0 ? '3px solid var(--rs-teal-400)' : '1px solid var(--rs-border-strong)',
            background: i === 0 ? 'var(--rs-bg-base)' : 'transparent',
          }}/>
          <span style={{ font: '400 12px/1 Geist', color: i === 0 ? 'var(--rs-text-primary)' : 'var(--rs-text-secondary)' }}>{t}</span>
          {i === 0 && <span style={{ marginLeft: 'auto', font: '400 10px/1 Geist', color: 'var(--rs-text-tertiary)' }}>in your timezone</span>}
        </div>
      ))}
    </div>
  </div>
);

// ═══ SETTINGS ═════════════════════════════════════════════
const Settings = () => {
  const [freq, setFreq] = React.useState(1);
  const [days, setDays] = React.useState([1]);
  const [time, setTime] = React.useState('8:00am');
  const [active, setActive] = React.useState(true);

  const sections = [
    { id: 'profile', label: 'Profile', icon: 'user' },
    { id: 'digest', label: 'Digest', icon: 'mail' },
    { id: 'topics', label: 'Topics', icon: 'tag' },
    { id: 'extension', label: 'Extension', icon: 'puzzle' },
    { id: 'notifications', label: 'Notifications', icon: 'bell' },
    { id: 'account', label: 'Account', icon: 'settings' },
  ];
  const [activeSection, setActiveSection] = React.useState('digest');

  return (
    <div style={{ display: 'flex', minHeight: '100%' }}>
      <div style={{ width: 200, padding: '32px 16px', borderRight: '0.5px solid var(--rs-border-subtle)' }}>
        <div className="rs-micro" style={{ padding: '0 10px 8px' }}>Settings</div>
        {sections.map(s => {
          const isActive = activeSection === s.id;
          return (
            <button key={s.id} onClick={() => setActiveSection(s.id)} className="rs-focus-ring" style={{
              display: 'flex', alignItems: 'center', gap: 8,
              width: '100%', height: 32,
              padding: isActive ? '0 10px 0 8px' : '0 10px',
              background: isActive ? 'rgba(45,212,191,0.07)' : 'transparent',
              borderLeft: isActive ? '2px solid var(--rs-teal-400)' : '2px solid transparent',
              border: 'none',
              borderRadius: isActive ? '0 6px 6px 0' : 6,
              color: isActive ? 'var(--rs-teal-300)' : 'var(--rs-text-secondary)',
              font: '500 13px/1 Geist',
              cursor: 'pointer', marginBottom: 2, textAlign: 'left',
            }}>
              <Icon name={s.icon} size={14} color={isActive ? 'var(--rs-teal-400)' : 'var(--rs-text-tertiary)'}/>
              {s.label}
            </button>
          );
        })}
      </div>
      <div style={{ flex: 1, padding: '32px 48px', maxWidth: 720 }}>
        {activeSection === 'digest' && (
          <>
            <h2 className="rs-heading" style={{ margin: '0 0 6px' }}>Digest</h2>
            <p style={{ font: '400 13px/1.55 Geist', color: 'var(--rs-text-secondary)', margin: '0 0 28px' }}>
              Your weekly curated briefing. Five hand-picked saves. Short, terminal.
            </p>

            <Row label="Active" help="Turn the digest on or off entirely.">
              <Toggle value={active} onChange={setActive} />
            </Row>

            <Row label="Frequency" help="Up to three times a week.">
              <div style={{ display: 'flex', gap: 4, padding: 2, background: 'var(--rs-bg-elevated)', border: '0.5px solid var(--rs-border-subtle)', borderRadius: 8 }}>
                {[1, 2, 3].map(n => (
                  <button key={n} onClick={() => setFreq(n)} style={{
                    padding: '5px 14px',
                    background: freq === n ? 'var(--rs-bg-hover)' : 'transparent',
                    borderLeft: freq === n ? '2px solid var(--rs-teal-400)' : '2px solid transparent',
                    border: 'none',
                    borderRadius: freq === n ? '0 6px 6px 0' : 6,
                    font: '500 12px/1 Geist',
                    color: freq === n ? 'var(--rs-teal-300)' : 'var(--rs-text-secondary)',
                    cursor: 'pointer',
                  }}>{n}x / week</button>
                ))}
              </div>
            </Row>

            <Row label="Days" help="Which days to send.">
              <div style={{ display: 'flex', gap: 4 }}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => {
                  const on = days.includes(i);
                  return (
                    <button key={i} onClick={() => setDays(on ? days.filter(x => x !== i) : [...days, i].slice(0, freq))} style={{
                      width: 32, height: 32, borderRadius: 6,
                      background: on ? 'rgba(45,212,191,0.07)' : 'var(--rs-bg-elevated)',
                      borderLeft: on ? '2px solid var(--rs-teal-400)' : '0.5px solid var(--rs-border-subtle)',
                      borderTop: '0.5px solid var(--rs-border-subtle)',
                      borderRight: '0.5px solid var(--rs-border-subtle)',
                      borderBottom: '0.5px solid var(--rs-border-subtle)',
                      borderTopLeftRadius: on ? 0 : 6, borderBottomLeftRadius: on ? 0 : 6,
                      font: '500 11px/1 Geist',
                      color: on ? 'var(--rs-teal-300)' : 'var(--rs-text-tertiary)',
                      cursor: 'pointer',
                    }}>{d}</button>
                  );
                })}
              </div>
            </Row>

            <Row label="Time" help="Your local timezone.">
              <div style={{ display: 'flex', gap: 4, padding: 2, background: 'var(--rs-bg-elevated)', border: '0.5px solid var(--rs-border-subtle)', borderRadius: 8 }}>
                {['8:00am', '12:00pm', '6:00pm', '9:00pm'].map(t => (
                  <button key={t} onClick={() => setTime(t)} style={{
                    padding: '5px 12px',
                    background: time === t ? 'var(--rs-bg-hover)' : 'transparent',
                    borderLeft: time === t ? '2px solid var(--rs-teal-400)' : '2px solid transparent',
                    border: 'none',
                    borderRadius: time === t ? '0 6px 6px 0' : 6,
                    font: '500 12px/1 Geist',
                    color: time === t ? 'var(--rs-teal-300)' : 'var(--rs-text-secondary)',
                    cursor: 'pointer',
                  }}>{t}</button>
                ))}
              </div>
            </Row>

            <div style={{ display: 'flex', gap: 8, marginTop: 28 }}>
              <Button variant="primary"><Icon name="send" size={13}/> Send digest now</Button>
              <Button variant="secondary"><Icon name="eye" size={13}/> Preview</Button>
            </div>
          </>
        )}
        {activeSection === 'profile' && <ProfileSection />}
        {activeSection === 'topics' && <TopicsSection />}
        {activeSection === 'extension' && <ExtensionSection />}
        {activeSection === 'notifications' && <NotificationsSection />}
        {activeSection === 'account' && <AccountSection />}
      </div>
    </div>
  );
};

const Row = ({ label, help, children }) => (
  <div style={{
    display: 'grid', gridTemplateColumns: '180px 1fr',
    gap: 24, alignItems: 'flex-start',
    padding: '18px 0',
    borderBottom: '0.5px solid var(--rs-border-subtle)',
  }}>
    <div>
      <div style={{ font: '500 13px/1.4 Geist', color: 'var(--rs-text-primary)', marginBottom: 2 }}>{label}</div>
      {help && <div style={{ font: '400 12px/1.45 Geist', color: 'var(--rs-text-tertiary)' }}>{help}</div>}
    </div>
    <div>{children}</div>
  </div>
);

const Toggle = ({ value, onChange }) => (
  <button onClick={() => onChange(!value)} className="rs-focus-ring" style={{
    width: 36, height: 20,
    borderRadius: 100,
    background: value ? 'var(--rs-teal-400)' : 'var(--rs-bg-elevated)',
    border: value ? 'none' : '0.5px solid var(--rs-border-default)',
    position: 'relative', cursor: 'pointer',
    transition: 'background 150ms',
    padding: 0,
  }}>
    <span style={{
      position: 'absolute', top: 2, left: value ? 18 : 2,
      width: 16, height: 16, borderRadius: '50%',
      background: value ? '#042f2e' : 'var(--rs-text-tertiary)',
      transition: 'left 150ms var(--rs-ease-default)',
    }}/>
  </button>
);

const ProfileSection = () => (
  <>
    <h2 className="rs-heading" style={{ margin: '0 0 6px' }}>Profile</h2>
    <p style={{ font: '400 13px/1.55 Geist', color: 'var(--rs-text-secondary)', margin: '0 0 28px' }}>
      Shown in the digest greeting and nowhere else.
    </p>
    <Row label="Avatar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #2dd4bf, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '500 20px/1 Geist', color: '#042f2e' }}>AR</div>
        <Button variant="secondary">Change</Button>
      </div>
    </Row>
    <Row label="Name"><Input defaultValue="Arjun Rao" style={{ maxWidth: 320 }}/></Row>
    <Row label="Email" help="Where your digest is sent.">
      <Input defaultValue="arjun@resurface.app" style={{ maxWidth: 320 }}/>
    </Row>
    <Row label="Timezone"><Input defaultValue="Asia/Kolkata (IST, UTC+5:30)" style={{ maxWidth: 320 }}/></Row>
  </>
);

const TopicsSection = () => (
  <>
    <h2 className="rs-heading" style={{ margin: '0 0 6px' }}>Topics</h2>
    <p style={{ font: '400 13px/1.55 Geist', color: 'var(--rs-text-secondary)', margin: '0 0 28px' }}>
      Your own folders. Rename or delete anytime.
    </p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, background: 'var(--rs-bg-surface)', border: '0.5px solid var(--rs-border-subtle)', borderRadius: 10, padding: 4 }}>
      {TOPICS.map(t => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 14px', borderRadius: 6,
        }} onMouseEnter={e => e.currentTarget.style.background = 'var(--rs-bg-elevated)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <Icon name="tag" size={14} color="var(--rs-teal-400)"/>
          <div style={{ font: '500 13px/1 Geist', color: 'var(--rs-text-primary)', flex: 1 }}>{t.name}</div>
          <span style={{ font: '400 11px/1 Geist', color: 'var(--rs-text-tertiary)' }}>{t.count} saves</span>
          <RowAction icon="moreHorizontal" label="More"/>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 16 }}><Button variant="secondary"><Icon name="plus" size={13}/> Add topic</Button></div>
  </>
);

const ExtensionSection = () => (
  <>
    <h2 className="rs-heading" style={{ margin: '0 0 6px' }}>Extension</h2>
    <p style={{ font: '400 13px/1.55 Geist', color: 'var(--rs-text-secondary)', margin: '0 0 28px' }}>
      Status and connected platforms.
    </p>
    <Row label="Status">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, font: '500 13px/1 Geist', color: 'var(--rs-green-300)' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--rs-green-400)', boxShadow: '0 0 8px rgba(74,222,128,0.4)' }}/>
        Connected · v1.0.3
      </div>
    </Row>
    {[
      { p: 'X (Twitter)', icon: <XGlyph size={14}/>, status: 'active', last: '2 hours ago' },
      { p: 'YouTube', icon: <YTGlyph size={16} color="var(--rs-yt-red)"/>, status: 'active', last: '5 hours ago' },
    ].map(p => (
      <Row key={p.p} label={p.p}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {p.icon}
          <span style={{ font: '400 13px/1 Geist', color: 'var(--rs-text-secondary)' }}>Last capture · {p.last}</span>
        </div>
      </Row>
    ))}
  </>
);

const NotificationsSection = () => (
  <>
    <h2 className="rs-heading" style={{ margin: '0 0 28px' }}>Notifications</h2>
    <Row label="Digest email" help="Weekly or bi-weekly summary."><Toggle value={true} onChange={()=>{}}/></Row>
    <Row label="Reminder emails" help="When a reminder time is reached and your browser is closed."><Toggle value={true} onChange={()=>{}}/></Row>
    <Row label="Chrome notifications" help="When your browser is open at reminder time."><Toggle value={false} onChange={()=>{}}/></Row>
    <Row label="Product updates" help="Occasional. Never more than once a month."><Toggle value={false} onChange={()=>{}}/></Row>
  </>
);

const AccountSection = () => (
  <>
    <h2 className="rs-heading" style={{ margin: '0 0 28px' }}>Account</h2>
    <Row label="Export data" help="JSON. Everything you've saved."><Button variant="secondary"><Icon name="download" size={13}/> Download</Button></Row>
    <Row label="Log out"><Button variant="secondary"><Icon name="logout" size={13}/> Log out</Button></Row>
    <Row label="Delete account" help="Permanent. Data retained for 12 months for recovery.">
      <Button variant="danger"><Icon name="trash" size={13}/> Delete account</Button>
    </Row>
  </>
);

// ═══ DIGEST EMAIL ═════════════════════════════════════════
const EmailDigest = () => {
  const items = BOOKMARKS.filter(b => b.status === 'pending').slice(0, 5);
  return (
    <div style={{ padding: '24px 16px', background: '#0a0a09', minHeight: '100%' }}>
      <div style={{
        maxWidth: 560, margin: '0 auto',
        background: '#0f0f0e',
        border: '1px solid #1e1e1b',
        borderRadius: 10,
        overflow: 'hidden',
      }}>
        {/* email client chrome */}
        <div style={{ padding: '16px 24px', background: '#161614', borderBottom: '1px solid #1e1e1b' }}>
          <div style={{ font: '400 11px/1.4 Geist', color: '#5e5b57', marginBottom: 4 }}>From: Resurface &lt;digest@resurface.app&gt;</div>
          <div style={{ font: '400 11px/1.4 Geist', color: '#5e5b57', marginBottom: 4 }}>To: arjun@resurface.app</div>
          <div style={{ font: '500 13px/1.4 Geist', color: '#f0ede8' }}>Your Resurface Digest — 5 saves worth revisiting</div>
        </div>
        {/* email body */}
        <div style={{ padding: '28px 24px', fontFamily: "-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif" }}>
          {/* header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid #1e1e1b' }}>
            <Logo size={18} showWord={false}/>
            <span style={{ font: '500 13px/1 -apple-system, sans-serif', letterSpacing: '0.10em', textTransform: 'uppercase', color: '#2dd4bf' }}>Resurface</span>
            <span style={{ marginLeft: 'auto', font: '400 11px/1 -apple-system, sans-serif', color: '#5e5b57' }}>Monday, Apr 20</span>
          </div>

          <div style={{ font: '400 13px/1.55 -apple-system, sans-serif', color: '#9b9690', marginBottom: 6 }}>Hey Arjun,</div>
          <div style={{ font: '400 13px/1.55 -apple-system, sans-serif', color: '#9b9690', marginBottom: 20 }}>
            Here are your top 5 unreviewed saves this week.
          </div>

          {items.map((b, i) => (
            <div key={b.id} style={{
              background: '#161614',
              border: '1px solid #1e1e1b',
              borderRadius: 8,
              padding: 14,
              marginBottom: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                <Thumb platform={b.platform} size={52} title={b.title}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: '500 14px/1.3 -apple-system, sans-serif', color: '#f0ede8', marginBottom: 4 }}>
                    {b.title}
                  </div>
                  <div style={{ font: '400 11px/1.4 -apple-system, sans-serif', color: '#5e5b57', marginBottom: 6 }}>
                    {b.platform === 'x' ? 'X' : 'YouTube'} · {b.author} · Saved {b.savedAgo}
                  </div>
                  <span style={{
                    display: 'inline-block',
                    background: '#042f2e', color: '#2dd4bf',
                    border: '1px solid #0d9488',
                    font: '500 10px/1 -apple-system, sans-serif',
                    padding: '2px 7px', borderRadius: 100,
                  }}>{b.topic}</span>
                </div>
              </div>
              <div style={{ font: '400 12px/1.55 -apple-system, sans-serif', fontStyle: 'italic', color: '#9b9690', marginBottom: 12 }}>
                &ldquo;{b.excerpt.slice(0, 150)}…&rdquo;
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <a style={{
                  display: 'inline-block',
                  background: '#2dd4bf', color: '#042f2e',
                  font: '500 11px/1 -apple-system, sans-serif',
                  padding: '7px 12px', borderRadius: 6, textDecoration: 'none',
                }}>Mark Reviewed</a>
                <a style={{
                  display: 'inline-block',
                  background: 'transparent', color: '#9b9690',
                  border: '1px solid #4b4b47',
                  font: '500 11px/1 -apple-system, sans-serif',
                  padding: '6px 12px', borderRadius: 6, textDecoration: 'none',
                }}>Snooze 1 week</a>
                <a style={{
                  display: 'inline-block',
                  color: '#5eead4',
                  font: '500 11px/1 -apple-system, sans-serif',
                  padding: '7px 8px', textDecoration: 'none',
                }}>Open ↗</a>
              </div>
            </div>
          ))}

          <div style={{ paddingTop: 16, marginTop: 8, borderTop: '1px solid #1e1e1b' }}>
            <div style={{ font: '400 13px/1.55 -apple-system, sans-serif', color: '#9b9690' }}>
              You have <span style={{ color: '#f0ede8' }}>23 more saves</span> pending review. <a style={{ color: '#2dd4bf', textDecoration: 'none' }}>View all on the dashboard →</a>
            </div>
            <div style={{ marginTop: 14, font: '400 11px/1.4 -apple-system, sans-serif', color: '#5e5b57' }}>
              <a style={{ color: '#5e5b57', textDecoration: 'underline' }}>Manage digest frequency</a> · <a style={{ color: '#5e5b57', textDecoration: 'underline' }}>Unsubscribe</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Onboarding, Settings, EmailDigest });
