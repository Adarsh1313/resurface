'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { Puzzle, Plus, Mail } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useDigestSchedule, useInsights } from '@/lib/insights';
import { AddBookmarkModal } from '@/components/AddBookmarkModal';
import { TopNav } from '@/components/dashboard/TopNav';
import {
  AuthorsCard,
  BacklogCard,
  DigestQueueCard,
  GraveyardCard,
  Hero,
  PlatformCard,
  RescueCard,
  RhythmCard,
  SaveClockCard,
  TopicDriftCard,
} from '@/components/dashboard/cards';
import s from '@/components/dashboard/dashboard.module.css';

export default function DashboardPage() {
  const user = useAuthStore((st) => st.user);
  const qc = useQueryClient();
  const { data, isLoading, error } = useInsights();
  const { data: schedule } = useDigestSchedule();
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const firstName = (user?.name || user?.email || 'there').split(/[\s@]/)[0];

  return (
    <div className={s.frame}>
      <TopNav onAdd={() => setShowAdd(true)} />

      {error ? (
        <section className={s.hero}>
          <div className={s.heroLeft}>
            <h1 className={s.h1}>Hello {firstName}<span>.</span></h1>
            <p className={s.sub}>Couldn&apos;t load your dashboard: {(error as Error).message}. Try refreshing.</p>
          </div>
        </section>
      ) : isLoading || !data ? (
        <Skeleton name={firstName} />
      ) : (
        <>
          <Hero name={firstName} data={data} />
          <section className={s.grid}>
            {data.totals.all === 0 && <Welcome onAdd={() => setShowAdd(true)} />}
            <RescueCard data={data} />
            <RhythmCard data={data} />
            <BacklogCard data={data} />
            <DigestQueueCard data={data} schedule={schedule?.settings} onMessage={setToast} />
            <SaveClockCard data={data} />
            <PlatformCard data={data} />
            <TopicDriftCard data={data} />
            <GraveyardCard data={data} onMessage={setToast} />
            <AuthorsCard data={data} />
          </section>
        </>
      )}

      {showAdd && (
        <AddBookmarkModal
          onClose={() => {
            setShowAdd(false);
            qc.invalidateQueries({ queryKey: ['insights'] });
          }}
        />
      )}
      {toast && (
        <div className={s.toast} role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

function Welcome({ onAdd }: { onAdd: () => void }) {
  return (
    <article className={`${s.card} ${s.welcome}`}>
      <h3>Start resurfacing</h3>
      <p className={s.hint}>Three steps and this dashboard starts telling you something about your habits.</p>
      <div className={s.welcomeSteps}>
        <Link href="/dashboard/settings?section=extension" className={`${s.welcomeStep} rs-focus-ring`}>
          <Puzzle size={15} /> Connect the Chrome extension
        </Link>
        <button className={`${s.welcomeStep} rs-focus-ring`} onClick={onAdd}>
          <Plus size={15} /> Add your first save
        </button>
        <Link href="/dashboard/settings?section=digest" className={`${s.welcomeStep} rs-focus-ring`}>
          <Mail size={15} /> Pick your digest day
        </Link>
      </div>
    </article>
  );
}

function Skeleton({ name }: { name: string }) {
  return (
    <>
      <section className={s.hero}>
        <div className={s.heroLeft}>
          <h1 className={s.h1}>Hello {name}<span>.</span></h1>
          <p className={s.sub}>Reading your saving habits…</p>
        </div>
      </section>
      <section className={s.grid} aria-busy="true">
        {[s.card, s.card, s.card, `${s.card} ${s.row2}`, `${s.card} ${s.span2}`, s.card].map((cls, i) => (
          <div key={i} className={`${cls} ${s.skeleton}`} />
        ))}
      </section>
    </>
  );
}
