import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SavedCafe, DiaryEntry } from '../types/cafe';
import { useCafes } from '../hooks/useCafes';
import { formatCafeType } from '../services/cafeServices';

const AVATAR_COLORS = [
  { bg: '#4b5d3b', text: '#c0d5aa' },
  { bg: '#f4dfcb', text: '#716252' },
  { bg: '#c8c6c2', text: '#1b1c19' },
];

function avatarColor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

const VIBES = [
  { value: 'chill' as const,         label: 'Chill',        icon: 'self_improvement' },
  { value: 'work-friendly' as const, label: 'Work-friendly', icon: 'laptop_mac' },
  { value: 'lively' as const,        label: 'Lively',        icon: 'groups' },
];

type SortMode = 'recent' | 'nearest';

function MustVisit() {
  const { cafes, deleteCafe, diaryEntries, addDiaryEntry } = useCafes();
  const [sort, setSort] = useState<SortMode>('recent');
  const navigate = useNavigate();

  const [markingCafe, setMarkingCafe] = useState<SavedCafe | null>(null);
  const [selectedVibe, setSelectedVibe] = useState<DiaryEntry['vibe'] | null>(null);
  const [note, setNote] = useState('');
  const [rating, setRating] = useState(0);
  const [willVisitAgain, setWillVisitAgain] = useState<boolean | undefined>(undefined);

  function handleMarkVisited(cafe: SavedCafe, e: React.MouseEvent) {
    e.stopPropagation();
    const isLogged = diaryEntries.some(d => d.id === cafe.id);
    if (isLogged) { navigate('/visited'); return; }
    setMarkingCafe(cafe);
  }

  function handleSubmitVisit() {
    if (!markingCafe || !selectedVibe) return;
    addDiaryEntry({ ...markingCafe, vibe: selectedVibe, rating: rating || undefined, note: note.trim() || undefined, willVisitAgain, visitedAt: new Date().toISOString() });
    setMarkingCafe(null);
    setSelectedVibe(null);
    setNote('');
    setRating(0);
    setWillVisitAgain(undefined);
  }

  const displayed = sort === 'recent'
    ? [...cafes].reverse()
    : [...cafes].sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: 'var(--cn-surface)', fontFamily: 'var(--cn-font-body)', paddingBottom: '88px' }}>

      <header style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--cn-surface)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '12px 20px' }}>
        <h1 style={{ fontFamily: 'var(--cn-font-headline)', fontSize: '20px', fontWeight: 600, color: 'var(--cn-primary)', margin: 0 }}>Cozy Nooks</h1>
      </header>

      <div style={{ padding: '20px 20px 8px' }}>
        <h2 style={{ fontFamily: 'var(--cn-font-headline)', fontSize: '28px', fontWeight: 600, color: 'var(--cn-primary)', margin: '0 0 4px' }}>Must Visit</h2>
        <p style={{ color: 'var(--cn-on-surface-variant)', fontSize: '14px', margin: '0 0 20px' }}>
          Your curated list of upcoming adventures.
        </p>
        {cafes.length > 0 && (
          <div style={{ display: 'inline-flex', padding: '4px', backgroundColor: 'var(--cn-surface-container)', borderRadius: '999px', marginBottom: '8px' }}>
            {(['recent', 'nearest'] as SortMode[]).map((mode) => (
              <button key={mode} onClick={() => setSort(mode)} style={{ padding: '7px 20px', borderRadius: '999px', border: 'none', cursor: 'pointer', backgroundColor: sort === mode ? 'var(--cn-primary)' : 'transparent', color: sort === mode ? '#ffffff' : 'var(--cn-on-surface-variant)', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--cn-font-body)', transition: 'all 0.15s' }}>
                {mode === 'recent' ? 'Recently Added' : 'Nearest'}
              </button>
            ))}
          </div>
        )}
      </div>

      {cafes.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 32px', textAlign: 'center', gap: '14px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'var(--cn-surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--cn-primary)', opacity: 0.35 }}>bookmark</span>
          </div>
          <h3 style={{ fontFamily: 'var(--cn-font-headline)', fontSize: '20px', fontWeight: 600, color: 'var(--cn-primary)', margin: 0 }}>Nothing saved yet</h3>
          <p style={{ color: 'var(--cn-on-surface-variant)', fontSize: '14px', margin: 0, lineHeight: 1.6 }}>Tap the bookmark on any place to add it here.</p>
          <button onClick={() => navigate('/')} style={{ marginTop: '8px', padding: '11px 24px', borderRadius: '999px', border: 'none', backgroundColor: 'var(--cn-primary)', color: '#ffffff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--cn-font-body)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>explore</span>
            Discover Places
          </button>
        </div>
      ) : (
        <div style={{ padding: '4px 12px' }}>
          {displayed.map((cafe) => (
            <MustVisitRow
              key={cafe.id}
              cafe={cafe}
              isLogged={diaryEntries.some(d => d.id === cafe.id)}
              onPress={() => navigate(`/cafe/${cafe.id}`, { state: { cafe } })}
              onUnsave={(e) => { e.stopPropagation(); deleteCafe(cafe.id); }}
              onMarkVisited={(e) => handleMarkVisited(cafe, e)}
            />
          ))}
        </div>
      )}

      {/* Log visit modal */}
      {markingCafe && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={() => { setMarkingCafe(null); setSelectedVibe(null); setNote(''); setRating(0); setWillVisitAgain(undefined); }} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(52,69,38,0.25)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', zIndex: 70, width: '100%', maxWidth: '480px', backgroundColor: '#ffffff', borderRadius: '24px 24px 0 0', padding: '28px 24px 40px', boxShadow: '0 -8px 40px rgba(0,0,0,0.12)' }}>
            <div style={{ width: '40px', height: '4px', backgroundColor: 'var(--cn-outline-variant)', borderRadius: '2px', margin: '0 auto 20px' }} />
            <h2 style={{ fontFamily: 'var(--cn-font-headline)', fontSize: '20px', fontWeight: 600, color: 'var(--cn-primary)', margin: '0 0 2px' }}>Log a visit</h2>
            <p style={{ color: 'var(--cn-on-surface-variant)', fontSize: '13px', margin: '0 0 20px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{markingCafe.name}</p>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cn-on-surface-variant)', margin: '0 0 10px' }}>What was the vibe?</p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {VIBES.map((v) => (
                <button key={v.value} onClick={() => setSelectedVibe(v.value)} style={{ flex: 1, padding: '12px 8px', border: 'none', borderRadius: '12px', cursor: 'pointer', backgroundColor: selectedVibe === v.value ? 'var(--cn-primary)' : 'var(--cn-surface-container-low)', color: selectedVibe === v.value ? '#ffffff' : 'var(--cn-on-surface-variant)', fontFamily: 'var(--cn-font-body)', fontSize: '12px', fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>{v.icon}</span>
                  {v.label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cn-on-surface-variant)', margin: '0 0 10px' }}>Rating</p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {[1,2,3,4,5].map((n) => (
                <button key={n} onClick={() => setRating(n)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: n <= rating ? 'var(--cn-primary)' : 'var(--cn-outline-variant)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '28px', fontVariationSettings: n <= rating ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>coffee</span>
                </button>
              ))}
            </div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cn-on-surface-variant)', margin: '0 0 10px' }}>Would you come back?</p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {([{ val: true, label: 'Yes!', icon: 'thumb_up' }, { val: false, label: 'Nah', icon: 'thumb_down' }] as const).map(({ val, label, icon }) => (
                <button key={label} onClick={() => setWillVisitAgain(val)} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '12px', cursor: 'pointer', backgroundColor: willVisitAgain === val ? (val ? 'var(--cn-primary)' : '#c0392b') : 'var(--cn-surface-container-low)', color: willVisitAgain === val ? '#ffffff' : 'var(--cn-on-surface-variant)', fontFamily: 'var(--cn-font-body)', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{icon}</span>
                  {label}
                </button>
              ))}
            </div>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any notes? (optional)" rows={3} style={{ width: '100%', backgroundColor: 'var(--cn-surface-container-low)', border: 'none', borderRadius: '12px', padding: '12px 14px', fontFamily: 'var(--cn-font-body)', fontSize: '14px', color: 'var(--cn-on-surface)', resize: 'none', outline: 'none', boxSizing: 'border-box', marginBottom: '16px' }} />
            <button onClick={handleSubmitVisit} disabled={!selectedVibe} style={{ width: '100%', padding: '14px', border: 'none', borderRadius: '999px', backgroundColor: selectedVibe ? 'var(--cn-primary)' : 'var(--cn-outline-variant)', color: '#ffffff', fontSize: '14px', fontWeight: 600, cursor: selectedVibe ? 'pointer' : 'not-allowed', fontFamily: 'var(--cn-font-body)' }}>
              Save to Diary
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MustVisitRow({ cafe, isLogged, onPress, onUnsave, onMarkVisited }: {
  cafe: SavedCafe;
  isLogged: boolean;
  onPress: () => void;
  onUnsave: (e: React.MouseEvent) => void;
  onMarkVisited: (e: React.MouseEvent) => void;
}) {
  const color = avatarColor(cafe.id);
  const type = formatCafeType(cafe.cuisine, cafe.amenity);
  const distLabel = cafe.distance != null
    ? cafe.distance < 1000 ? `${cafe.distance}m` : `${(cafe.distance / 1000).toFixed(1)}km`
    : null;

  return (
    <div
      onClick={onPress}
      style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 8px', borderRadius: '12px', cursor: 'pointer', transition: 'background-color 0.15s' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--cn-surface-container-low)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0, backgroundColor: color.bg, color: color.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--cn-font-headline)', fontSize: '20px', fontWeight: 700 }}>
        {cafe.name.charAt(0).toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ fontFamily: 'var(--cn-font-headline)', fontSize: '16px', fontWeight: 700, color: 'var(--cn-primary)', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {cafe.name}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {cafe.address && (
            <span style={{ fontSize: '12px', color: 'var(--cn-on-surface-variant)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
              {cafe.address.split(',')[0]}
            </span>
          )}
          {cafe.address && <span style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: 'var(--cn-outline-variant)', flexShrink: 0 }} />}
          <span style={{ fontSize: '11px', fontWeight: 600, backgroundColor: 'var(--cn-secondary-container)', color: 'var(--cn-on-secondary-container)', padding: '2px 8px', borderRadius: '999px', whiteSpace: 'nowrap' }}>
            {type}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '2px' }}>
          <button onClick={onMarkVisited} title={isLogged ? 'View in diary' : 'Log visit'} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: isLogged ? 'var(--cn-primary)' : 'var(--cn-on-surface-variant)', display: 'flex' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '22px', fontVariationSettings: isLogged ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>check_circle</span>
          </button>
          <button onClick={onUnsave} title="Remove" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--cn-primary)', display: 'flex' }}>
            <span className="material-symbols-outlined icon-filled" style={{ fontSize: '22px' }}>bookmark</span>
          </button>
        </div>
        {distLabel && (
          <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--cn-on-surface-variant)' }}>{distLabel}</span>
        )}
      </div>
    </div>
  );
}

export default MustVisit;
