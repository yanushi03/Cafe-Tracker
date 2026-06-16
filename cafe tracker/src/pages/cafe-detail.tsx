import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Cafe, DiaryEntry } from '../types/cafe';
import { cafeGradient, formatCafeType } from '../services/cafeServices';
import { useCafes } from '../hooks/useCafes';

const detailLinkStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '6px',
  backgroundColor: 'var(--cn-secondary-container)', color: 'var(--cn-on-secondary-container)',
  fontSize: '13px', fontWeight: 600, padding: '8px 14px',
  borderRadius: '999px', textDecoration: 'none',
};

const VIBES = [
  { value: 'chill', label: 'Chill', icon: 'self_improvement' },
  { value: 'work-friendly', label: 'Work-friendly', icon: 'laptop_mac' },
  { value: 'lively', label: 'Lively', icon: 'groups' },
] as const;

function CafeDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const cafe = location.state?.cafe as Cafe | undefined;

  const { cafes: savedCafes, addCafe, deleteCafe, diaryEntries, addDiaryEntry, deleteDiaryEntry } = useCafes();
  const [showModal, setShowModal] = useState(false);
  const [selectedVibe, setSelectedVibe] = useState<DiaryEntry['vibe'] | null>(null);
  const [note, setNote] = useState('');
  const [rating, setRating] = useState(0);
  const [willVisitAgain, setWillVisitAgain] = useState<boolean | undefined>(undefined);

  if (!cafe) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100dvh', gap: '16px',
        fontFamily: 'var(--cn-font-body)', color: 'var(--cn-on-surface-variant)',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--cn-primary)', opacity: 0.4 }}>local_cafe</span>
        <p style={{ margin: 0, fontSize: '15px' }}>Cafe not found.</p>
        <button onClick={() => navigate(-1)} style={{
          background: 'none', border: '1px solid var(--cn-outline-variant)',
          borderRadius: '999px', padding: '8px 20px', cursor: 'pointer',
          color: 'var(--cn-primary)', fontFamily: 'var(--cn-font-body)', fontSize: '14px', fontWeight: 600,
        }}>Go back</button>
      </div>
    );
  }

  const isSaved = savedCafes.some((c) => c.id === cafe.id);
  const isLogged = diaryEntries.some((e) => e.id === cafe.id);
  const tag = formatCafeType(cafe.cuisine, cafe.amenity);
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${cafe.lat},${cafe.lng}`;

  function handleSubmit() {
    if (!selectedVibe || !cafe) return;
    addDiaryEntry({ ...cafe, vibe: selectedVibe, rating: rating || undefined, note: note.trim() || undefined, willVisitAgain, visitedAt: new Date().toISOString() });
    setShowModal(false);
    setSelectedVibe(null);
    setNote('');
    setRating(0);
    setWillVisitAgain(undefined);
  }

  return (
    <div style={{ backgroundColor: 'var(--cn-surface)', fontFamily: 'var(--cn-font-body)', minHeight: '100dvh', paddingBottom: '96px' }}>

      {/* Top bar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: 'var(--cn-surface)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--cn-primary)', padding: '4px', display: 'flex', alignItems: 'center',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>arrow_back</span>
          </button>
          <h1 style={{
            fontFamily: 'var(--cn-font-headline)', fontSize: '22px', fontWeight: 600,
            color: 'var(--cn-primary)', margin: 0,
          }}>Cozy Nooks</h1>
        </div>
        <button onClick={() => isSaved ? deleteCafe(cafe.id) : addCafe(cafe)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: isSaved ? 'var(--cn-primary)' : 'var(--cn-on-surface-variant)',
          padding: '4px', display: 'flex', alignItems: 'center',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '26px', fontVariationSettings: isSaved ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>bookmark</span>
        </button>
      </header>

      {/* Hero gradient */}
      <section style={{
        position: 'relative', width: '100%', height: '320px', overflow: 'hidden',
        background: cafeGradient(cafe.name),
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}>
        {/* Large decorative letter */}
        <span style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -60%)',
          fontFamily: 'var(--cn-font-headline)', fontSize: '220px', fontWeight: 700,
          color: 'rgba(255,255,255,0.12)', lineHeight: 1, userSelect: 'none',
          pointerEvents: 'none',
        }}>{cafe.name.charAt(0).toUpperCase()}</span>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)',
        }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '0 20px 24px' }}>
          {/* Tags */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <span style={{
              backgroundColor: 'rgba(52,69,38,0.85)', color: '#ffffff',
              fontSize: '12px', fontWeight: 600, padding: '4px 10px',
              borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>local_cafe</span>
              {tag}
            </span>
            {cafe.website && (
              <span style={{
                backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                color: '#ffffff', fontSize: '12px', fontWeight: 600, padding: '4px 10px',
                borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>language</span>
                Has Website
              </span>
            )}
            {cafe.instagram && (
              <span style={{
                backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                color: '#ffffff', fontSize: '12px', fontWeight: 600, padding: '4px 10px',
                borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>photo_camera</span>
                Instagram
              </span>
            )}
          </div>
          <h2 style={{
            fontFamily: 'var(--cn-font-headline)', fontSize: '32px', fontWeight: 700,
            color: '#ffffff', margin: '0 0 6px', lineHeight: 1.2,
          }}>{cafe.name}</h2>
          {cafe.address && (
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '15px', margin: 0 }}>{cafe.address}</p>
          )}
        </div>
      </section>

      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Details card */}
        <div style={{
          backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px',
          boxShadow: '0 4px 20px rgba(52,69,38,0.07)',
        }}>
          <h3 style={{
            fontFamily: 'var(--cn-font-headline)', fontSize: '20px', fontWeight: 600,
            color: 'var(--cn-primary)', margin: '0 0 12px',
          }}>Details</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingTop: '12px', borderTop: '1px solid rgba(197,200,188,0.3)' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--cn-on-surface-variant)', display: 'block', marginBottom: '4px' }}>Opening Hours</span>
              <span style={{ fontSize: '14px', color: 'var(--cn-on-surface)' }}>
                {cafe.openingHours ?? 'Not listed'}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--cn-on-surface-variant)', display: 'block', marginBottom: '4px' }}>Distance</span>
              <span style={{ fontSize: '14px', color: 'var(--cn-on-surface)' }}>
                {cafe.distance != null ? `${cafe.distance}m away` : '—'}
              </span>
            </div>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(197,200,188,0.3)', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {cafe.instagram && (
              <a href={cafe.instagram} target="_blank" rel="noopener noreferrer" style={detailLinkStyle}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>photo_camera</span>
                Instagram
              </a>
            )}
            {cafe.website && (
              <a href={cafe.website} target="_blank" rel="noopener noreferrer" style={detailLinkStyle}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>language</span>
                Website
              </a>
            )}
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(cafe.name + ' cafe')}`}
              target="_blank" rel="noopener noreferrer" style={detailLinkStyle}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>search</span>
              Google
            </a>
          </div>
        </div>

        {/* Been Here? card */}
        <div style={{
          backgroundColor: 'var(--cn-primary)', borderRadius: '16px', padding: '20px',
          boxShadow: '0 4px 20px rgba(52,69,38,0.2)', position: 'relative', overflow: 'hidden',
        }}>
          <h3 style={{
            fontFamily: 'var(--cn-font-headline)', fontSize: '20px', fontWeight: 600,
            color: '#ffffff', margin: '0 0 8px',
          }}>{isLogged ? 'Visit Logged!' : 'Been Here?'}</h3>
          <p style={{ color: 'rgba(192,213,170,0.9)', fontSize: '14px', margin: '0 0 20px', lineHeight: 1.5 }}>
            {isLogged
              ? 'Your visit is saved in your diary.'
              : 'Log your visit and keep track of your coffee journey.'}
          </p>
          <button
            onClick={() => isLogged ? deleteDiaryEntry(cafe.id) : setShowModal(true)}
            style={{
              width: '100%', backgroundColor: '#d4eabe', color: 'var(--cn-primary)',
              border: 'none', borderRadius: '999px', padding: '14px',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontFamily: 'var(--cn-font-body)',
            }}
          >
            <span className="material-symbols-outlined icon-filled" style={{ fontSize: '20px' }}>
              {isLogged ? 'delete' : 'check_circle'}
            </span>
            {isLogged ? 'Remove from Diary' : 'Log a Visit'}
          </button>
        </div>

        {/* Map preview */}
        <div style={{
          backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px',
          boxShadow: '0 4px 20px rgba(52,69,38,0.07)',
        }}>
          <div style={{ height: '180px', borderRadius: '12px', overflow: 'hidden', marginBottom: '14px', position: 'relative' }}>
            <iframe
              title="Cafe location"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${cafe.lng - 0.004},${cafe.lat - 0.003},${cafe.lng + 0.004},${cafe.lat + 0.003}&layer=mapnik&marker=${cafe.lat},${cafe.lng}`}
              style={{ width: '100%', height: '100%', border: 'none', filter: 'grayscale(20%) opacity(0.85)' }}
            />
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              width: '100%', padding: '12px',
              border: '1px solid rgba(197,200,188,0.5)', borderRadius: '999px',
              color: 'var(--cn-primary)', fontSize: '14px', fontWeight: 600,
              textDecoration: 'none', boxSizing: 'border-box',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>directions_walk</span>
            Get Directions
          </a>
        </div>
      </div>

      {/* Vibe modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 60,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}>
          <div
            onClick={() => { setShowModal(false); setSelectedVibe(null); setNote(''); setRating(0); setWillVisitAgain(undefined); }}
            style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(52,69,38,0.25)', backdropFilter: 'blur(4px)' }}
          />
          <div style={{
            position: 'relative', zIndex: 70, width: '100%', maxWidth: '480px',
            backgroundColor: '#ffffff', borderRadius: '24px 24px 0 0',
            padding: '28px 24px 40px', boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
          }}>
            <div style={{ width: '40px', height: '4px', backgroundColor: 'var(--cn-outline-variant)', borderRadius: '2px', margin: '0 auto 24px' }} />
            <h2 style={{
              fontFamily: 'var(--cn-font-headline)', fontSize: '22px', fontWeight: 600,
              color: 'var(--cn-primary)', margin: '0 0 6px',
            }}>Log your visit</h2>
            <p style={{ color: 'var(--cn-on-surface-variant)', fontSize: '14px', margin: '0 0 20px' }}>
              What was the vibe like?
            </p>

            {/* Vibe picker */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              {VIBES.map((v) => (
                <button
                  key={v.value}
                  onClick={() => setSelectedVibe(v.value)}
                  style={{
                    flex: 1, padding: '12px 8px', border: 'none', borderRadius: '12px', cursor: 'pointer',
                    backgroundColor: selectedVibe === v.value ? 'var(--cn-primary)' : 'var(--cn-surface-container-low)',
                    color: selectedVibe === v.value ? '#ffffff' : 'var(--cn-on-surface-variant)',
                    fontFamily: 'var(--cn-font-body)', fontSize: '12px', fontWeight: 600,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                    transition: 'all 0.15s',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>{v.icon}</span>
                  {v.label}
                </button>
              ))}
            </div>

            {/* Rating */}
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cn-on-surface-variant)', margin: '0 0 10px' }}>Rate your experience</p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                  color: n <= rating ? 'var(--cn-primary)' : 'var(--cn-outline-variant)',
                }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '28px', fontVariationSettings: n <= rating ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                  >coffee</span>
                </button>
              ))}
            </div>

            {/* Would you come back? */}
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cn-on-surface-variant)', margin: '0 0 10px' }}>Would you come back?</p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {([{ val: true, label: 'Yes!', icon: 'thumb_up' }, { val: false, label: 'Nah', icon: 'thumb_down' }] as const).map(({ val, label, icon }) => (
                <button key={label} onClick={() => setWillVisitAgain(val)} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '12px', cursor: 'pointer', backgroundColor: willVisitAgain === val ? (val ? 'var(--cn-primary)' : '#c0392b') : 'var(--cn-surface-container-low)', color: willVisitAgain === val ? '#ffffff' : 'var(--cn-on-surface-variant)', fontFamily: 'var(--cn-font-body)', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{icon}</span>
                  {label}
                </button>
              ))}
            </div>

            {/* Note */}
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a quick note... (optional)"
              rows={3}
              style={{
                width: '100%', backgroundColor: 'var(--cn-surface-container-low)',
                border: 'none', borderRadius: '12px', padding: '12px 14px',
                fontFamily: 'var(--cn-font-body)', fontSize: '14px', color: 'var(--cn-on-surface)',
                resize: 'none', outline: 'none', boxSizing: 'border-box', marginBottom: '20px',
              }}
            />

            <button
              onClick={handleSubmit}
              disabled={!selectedVibe}
              style={{
                width: '100%', padding: '14px', border: 'none', borderRadius: '999px',
                backgroundColor: selectedVibe ? 'var(--cn-primary)' : 'var(--cn-outline-variant)',
                color: '#ffffff', fontSize: '14px', fontWeight: 600, cursor: selectedVibe ? 'pointer' : 'not-allowed',
                fontFamily: 'var(--cn-font-body)',
              }}
            >
              Save Visit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CafeDetail;
