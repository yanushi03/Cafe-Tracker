import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DiaryEntry } from '../types/cafe';
import { useCafes } from '../hooks/useCafes';
import { formatCafeType, cafeGradient } from '../services/cafeServices';

const VIBE_CONFIG = {
  'chill':         { label: 'Chill',         icon: 'self_improvement' },
  'work-friendly': { label: 'Work-friendly',  icon: 'laptop_mac' },
  'lively':        { label: 'Lively',         icon: 'groups' },
} as const;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function Diary() {
  const { diaryEntries, deleteDiaryEntry } = useCafes();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const sorted = [...diaryEntries].sort(
    (a, b) => new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime()
  );

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: 'var(--cn-surface)', fontFamily: 'var(--cn-font-body)', paddingBottom: '88px' }}>

      <header style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--cn-surface)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '12px 20px' }}>
        <h1 style={{ fontFamily: 'var(--cn-font-headline)', fontSize: '20px', fontWeight: 600, color: 'var(--cn-primary)', margin: 0 }}>Cozy Nooks</h1>
      </header>

      <div style={{ padding: '20px 20px 8px' }}>
        <h2 style={{ fontFamily: 'var(--cn-font-headline)', fontSize: '28px', fontWeight: 600, color: 'var(--cn-primary)', margin: '0 0 4px' }}>My Diary</h2>
        <p style={{ color: 'var(--cn-on-surface-variant)', fontSize: '14px', margin: 0 }}>
          {diaryEntries.length === 0
            ? 'Your visit log will appear here.'
            : `${diaryEntries.length} visit${diaryEntries.length !== 1 ? 's' : ''} logged`}
        </p>
      </div>

      {sorted.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 32px', textAlign: 'center', gap: '14px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'var(--cn-surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--cn-primary)', opacity: 0.35 }}>book_5</span>
          </div>
          <h3 style={{ fontFamily: 'var(--cn-font-headline)', fontSize: '20px', fontWeight: 600, color: 'var(--cn-primary)', margin: 0 }}>No visits yet</h3>
          <p style={{ color: 'var(--cn-on-surface-variant)', fontSize: '14px', margin: 0, lineHeight: 1.6 }}>
            Tap the <span className="material-symbols-outlined" style={{ fontSize: '15px', verticalAlign: 'middle' }}>check_circle</span> on any cafe to log a visit.
          </p>
          <button onClick={() => navigate('/')} style={{ marginTop: '8px', padding: '11px 24px', borderRadius: '999px', border: 'none', backgroundColor: 'var(--cn-primary)', color: '#ffffff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--cn-font-body)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>explore</span>
            Discover Places
          </button>
        </div>
      ) : (
        <div style={{ padding: '8px 16px' }}>
          {sorted.map((entry) => (
            <DiaryCard
              key={entry.id}
              entry={entry}
              onDelete={() => setConfirmDelete(entry.id)}
              onPress={() => navigate(`/cafe/${entry.id}`, { state: { cafe: entry } })}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={() => setConfirmDelete(null)} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(52,69,38,0.25)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', zIndex: 70, backgroundColor: '#ffffff', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '320px', boxShadow: '0 8px 40px rgba(0,0,0,0.14)' }}>
            <h3 style={{ fontFamily: 'var(--cn-font-headline)', fontSize: '18px', fontWeight: 600, color: 'var(--cn-primary)', margin: '0 0 8px' }}>Remove entry?</h3>
            <p style={{ color: 'var(--cn-on-surface-variant)', fontSize: '14px', margin: '0 0 20px' }}>This will delete your visit log for this cafe.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: '12px', border: '1px solid rgba(197,200,188,0.5)', borderRadius: '999px', background: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--cn-on-surface-variant)', fontFamily: 'var(--cn-font-body)' }}>
                Cancel
              </button>
              <button onClick={() => { deleteDiaryEntry(confirmDelete); setConfirmDelete(null); }} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '999px', backgroundColor: '#c0392b', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#ffffff', fontFamily: 'var(--cn-font-body)' }}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DiaryCard({ entry, onDelete, onPress }: { entry: DiaryEntry; onDelete: () => void; onPress: () => void }) {
  const vibe = VIBE_CONFIG[entry.vibe];
  const type = formatCafeType(entry.cuisine, entry.amenity);

  return (
    <div
      onClick={onPress}
      style={{ backgroundColor: '#ffffff', borderRadius: '16px', marginBottom: '12px', boxShadow: '0 2px 12px rgba(52,69,38,0.08)', overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(197,200,188,0.2)' }}
    >
      <div style={{ height: '5px', background: cafeGradient(entry.name) }} />

      <div style={{ padding: '14px 16px 16px' }}>
        {/* Name + delete */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 style={{ fontFamily: 'var(--cn-font-headline)', fontSize: '17px', fontWeight: 700, color: 'var(--cn-primary)', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {entry.name}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--cn-on-surface-variant)', margin: 0 }}>
              {formatDate(entry.visitedAt)} · {type}
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cn-outline-variant)', padding: '2px', display: 'flex', flexShrink: 0, marginLeft: '8px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
          </button>
        </div>

        {/* Vibe + rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: (entry.note || entry.willVisitAgain !== undefined) ? '10px' : '0' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--cn-secondary-container)', color: 'var(--cn-on-secondary-container)', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>{vibe.icon}</span>
            {vibe.label}
          </span>
          {entry.rating && (
            <div style={{ display: 'flex', gap: '1px' }}>
              {[1,2,3,4,5].map((n) => (
                <span key={n} className="material-symbols-outlined" style={{ fontSize: '14px', color: n <= entry.rating! ? 'var(--cn-primary)' : 'var(--cn-outline-variant)', fontVariationSettings: n <= entry.rating! ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>coffee</span>
              ))}
            </div>
          )}
        </div>

        {/* Note */}
        {entry.note && (
          <p style={{ fontSize: '13px', color: 'var(--cn-on-surface-variant)', margin: `0 0 ${entry.willVisitAgain !== undefined ? '10px' : '0'}`, fontStyle: 'italic', lineHeight: 1.5 }}>
            "{entry.note}"
          </p>
        )}

        {/* Will visit again */}
        {entry.willVisitAgain !== undefined && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px', color: entry.willVisitAgain ? 'var(--cn-primary)' : 'var(--cn-on-surface-variant)' }}>
              {entry.willVisitAgain ? 'thumb_up' : 'thumb_down'}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: entry.willVisitAgain ? 'var(--cn-primary)' : 'var(--cn-on-surface-variant)' }}>
              {entry.willVisitAgain ? 'Would return' : 'Maybe not'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Diary;
