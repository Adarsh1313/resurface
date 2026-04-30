'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Loader2, Sparkles } from 'lucide-react';
import { useCreateBookmark, useTopics } from '@/lib/hooks';
import { api } from '@/lib/api';

function detectPlatform(url: string): 'x' | 'youtube' | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com') || u.hostname === 'youtu.be') return 'youtube';
    if (u.hostname.includes('x.com') || u.hostname.includes('twitter.com')) return 'x';
  } catch {
    return null;
  }
  return null;
}

export function AddBookmarkModal({ onClose }: { onClose: () => void }) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showTopicList, setShowTopicList] = useState(false);
  const { data: topicsData } = useTopics();
  const create = useCreateBookmark();
  const topicInputRef = useRef<HTMLDivElement>(null);
  const lastFetchedUrl = useRef<string>('');

  const platform = detectPlatform(url);
  const existingTopics = topicsData?.topics || [];
  const filteredTopics = topicInput
    ? existingTopics.filter(
        (t) => t.name.toLowerCase().includes(topicInput.toLowerCase()) && !selectedTopics.includes(t.name)
      )
    : existingTopics.filter((t) => !selectedTopics.includes(t.name));

  // Reset derived fields the moment the URL changes so stale data never lingers
  useEffect(() => {
    if (!platform) {
      setFetched(false);
      setSuggestions([]);
      return;
    }
    // If URL changed, nuke fields that came from the previous URL
    if (lastFetchedUrl.current && lastFetchedUrl.current !== url) {
      setTitle('');
      setAuthor('');
      setThumbnailUrl('');
      setSuggestions([]);
      setFetched(false);
    }

    let cancelled = false;
    const run = async () => {
      setFetching(true);
      setError('');
      try {
        const meta = await api.bookmarks.metadata(url);
        if (cancelled) return;
        setTitle(meta.title || '');
        setAuthor(meta.author || '');
        setThumbnailUrl(meta.thumbnail_url || '');
        setFetched(true);
        lastFetchedUrl.current = url;

        if (meta.title) {
          try {
            const s = await api.ai.suggestTopic({ title: meta.title, platform, author: meta.author });
            if (!cancelled) setSuggestions(s.suggestions || []);
          } catch {
            if (!cancelled) setSuggestions([]);
          }
        } else {
          setSuggestions([]);
        }
      } catch {
        if (!cancelled) setError('Could not auto-fetch details. Fill manually.');
      } finally {
        if (!cancelled) setFetching(false);
      }
    };
    const t = setTimeout(run, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (topicInputRef.current && !topicInputRef.current.contains(e.target as Node)) {
        setShowTopicList(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const addTopic = (name: string) => {
    const clean = name.trim();
    if (!clean) return;
    if (selectedTopics.some((t) => t.toLowerCase() === clean.toLowerCase())) return;
    setSelectedTopics([...selectedTopics, clean]);
    setTopicInput('');
    setShowTopicList(false);
  };

  const removeTopic = (name: string) => {
    setSelectedTopics(selectedTopics.filter((t) => t !== name));
  };

  const onTopicKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTopic(topicInput);
    } else if (e.key === 'Backspace' && !topicInput && selectedTopics.length) {
      setSelectedTopics(selectedTopics.slice(0, -1));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!platform) {
      setError('URL must be from x.com, twitter.com, or youtube.com');
      return;
    }
    // If they typed a topic but didn't press enter, include it
    const finalTopics = [...selectedTopics];
    if (topicInput.trim() && !finalTopics.some((t) => t.toLowerCase() === topicInput.trim().toLowerCase())) {
      finalTopics.push(topicInput.trim());
    }
    try {
      await create.mutateAsync({
        url,
        platform,
        title: title || undefined,
        author: author || undefined,
        thumbnail_url: thumbnailUrl || undefined,
        topic_names: finalTopics.length ? finalTopics : undefined,
        notes: notes || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const topicColor = (name: string) => existingTopics.find((t) => t.name.toLowerCase() === name.toLowerCase())?.color || '#6B7280';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Add bookmark</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && <div className="mb-3 p-2 rounded bg-red-50 text-red-700 text-sm">{error}</div>}

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">URL *</label>
            <div className="relative">
              <input
                required
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://x.com/... or https://youtube.com/..."
                className="w-full px-3 py-2 pr-9 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
              {fetching && (
                <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
              )}
            </div>
            {url && !platform && <p className="mt-1 text-xs text-red-600">Must be X or YouTube URL</p>}
            {platform && (
              <p className="mt-1 text-xs text-gray-500">
                Detected: {platform === 'x' ? 'X' : 'YouTube'}
                {fetched && ' · details auto-filled'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Author</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="@handle"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div ref={topicInputRef}>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Topics <span className="text-gray-400">(multiple · press Enter to add)</span>
            </label>
            <div className="min-h-[38px] w-full px-2 py-1.5 border border-gray-300 rounded-lg flex flex-wrap items-center gap-1 focus-within:ring-2 focus-within:ring-gray-900">
              {selectedTopics.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white"
                  style={{ backgroundColor: topicColor(name) }}
                >
                  {name}
                  <button type="button" onClick={() => removeTopic(name)} className="ml-0.5 hover:bg-black/20 rounded-full">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={topicInput}
                onChange={(e) => {
                  setTopicInput(e.target.value);
                  setShowTopicList(true);
                }}
                onFocus={() => setShowTopicList(true)}
                onKeyDown={onTopicKeyDown}
                placeholder={selectedTopics.length ? '' : 'Type to pick or create…'}
                className="flex-1 min-w-[100px] outline-none text-sm bg-transparent"
              />
            </div>
            {showTopicList && filteredTopics.length > 0 && (
              <div className="relative">
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {filteredTopics.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => addTopic(t.name)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-gray-50"
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                      {t.name}
                      <span className="ml-auto text-xs text-gray-400">{t.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {topicInput && !existingTopics.some((t) => t.name.toLowerCase() === topicInput.toLowerCase()) && (
              <p className="mt-1 text-xs text-blue-600">Press Enter to create &ldquo;{topicInput}&rdquo;</p>
            )}
            {suggestions.length > 0 && (
              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <Sparkles className="w-3 h-3" /> Suggested:
                </span>
                {suggestions
                  .filter((s) => !selectedTopics.some((t) => t.toLowerCase() === s.toLowerCase()))
                  .map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addTopic(s)}
                      className="px-2 py-0.5 text-xs rounded-full bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100"
                    >
                      + {s}
                    </button>
                  ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={create.isPending || !url}
              className="flex-1 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {create.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
