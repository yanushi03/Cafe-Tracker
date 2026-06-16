import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Cafe } from '../types/cafe';
import { getCafesByLocation, formatCafeType, applyFilters, FILTER_CATEGORIES } from '../services/cafeServices';
import { useCafes } from '../hooks/useCafes';

function Discover() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { cafes: savedCafes, addCafe, deleteCafe } = useCafes();

  function toggleSave(cafe: Cafe, e: React.MouseEvent) {
    e.stopPropagation();
    if (savedCafes.some((c) => c.id === cafe.id)) {
      deleteCafe(cafe.id);
    } else {
      addCafe(cafe);
    }
  }

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        getCafesByLocation(latitude, longitude)
          .then((data) => { setCafes(data); setLoading(false); })
          .catch((err) => { setError(err.message); setLoading(false); });
      },
      (err) => { setError(err.message); setLoading(false); }
    );
  }, []);

  function toggleFilter(id: string) {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  const visible = applyFilters(cafes, activeFilters);

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: 'var(--cn-surface)', fontFamily: 'var(--cn-font-body)', paddingBottom: '88px' }}>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        backgroundColor: 'var(--cn-surface)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        padding: '16px 20px 0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--cn-primary)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>arrow_back</span>
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'var(--cn-font-headline)', fontSize: '22px', fontWeight: 600, color: 'var(--cn-primary)', margin: 0 }}>
              Cafes Near You
            </h1>
            {!loading && !error && (
              <p style={{ color: 'var(--cn-on-surface-variant)', fontSize: '13px', margin: '2px 0 0', fontWeight: 500 }}>
                {visible.length}{activeFilters.size > 0 ? ` of ${cafes.length}` : ''} spots found
              </p>
            )}
          </div>
        </div>

        {/* Filter chips */}
        <div className="cn-scroll-hide" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px' }}>
          {FILTER_CATEGORIES.map((cat) => {
            const active = activeFilters.has(cat.id);
            return (
              <button key={cat.id} onClick={() => toggleFilter(cat.id)} style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '6px 12px', borderRadius: '999px', border: 'none', cursor: 'pointer', flexShrink: 0,
                backgroundColor: active ? 'var(--cn-primary)' : 'var(--cn-surface-container)',
                color: active ? '#ffffff' : 'var(--cn-on-surface-variant)',
                fontSize: '12px', fontWeight: 600, fontFamily: 'var(--cn-font-body)',
                transition: 'all 0.15s',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>{cat.icon}</span>
                {cat.label}
              </button>
            );
          })}
          {activeFilters.size > 0 && (
            <button onClick={() => setActiveFilters(new Set())} style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '6px 12px', borderRadius: '999px', border: '1px solid rgba(197,200,188,0.5)', cursor: 'pointer', flexShrink: 0,
              backgroundColor: 'transparent', color: 'var(--cn-on-surface-variant)',
              fontSize: '12px', fontWeight: 600, fontFamily: 'var(--cn-font-body)',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
              Clear
            </button>
          )}
        </div>
      </header>

      <div style={{ padding: '12px 20px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="cn-skeleton" style={{ height: '80px', borderRadius: '14px' }} />
            ))}
          </div>
        ) : error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '16px', color: 'var(--cn-on-surface-variant)', textAlign: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--cn-primary)', opacity: 0.5 }}>location_off</span>
            <p style={{ margin: 0, fontSize: '15px' }}>{error}</p>
          </div>
        ) : visible.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '16px', color: 'var(--cn-on-surface-variant)', textAlign: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--cn-primary)', opacity: 0.5 }}>local_cafe</span>
            <p style={{ margin: 0, fontSize: '15px' }}>{activeFilters.size > 0 ? 'No places match your filters.' : 'No places found nearby.'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {visible.map((cafe) => (
              <DiscoverCafeCard
                key={cafe.id}
                cafe={cafe}
                isSaved={savedCafes.some((c) => c.id === cafe.id)}
                onPress={() => navigate(`/cafe/${cafe.id}`, { state: { cafe } })}
                onToggleSave={(e) => toggleSave(cafe, e)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DiscoverCafeCard({ cafe, isSaved, onPress, onToggleSave }: { cafe: Cafe; isSaved: boolean; onPress: () => void; onToggleSave: (e: React.MouseEvent) => void }) {
  const tag = formatCafeType(cafe.cuisine, cafe.amenity);
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(cafe.name + ' ' + tag)}`;

  return (
    <div onClick={onPress} style={{
      backgroundColor: '#ffffff', borderRadius: '14px',
      border: '1px solid rgba(197,200,188,0.4)', padding: '14px 16px',
      cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '10px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ minWidth: 0 }}>
          <h3 style={{ fontFamily: 'var(--cn-font-headline)', fontSize: '15px', fontWeight: 700, color: 'var(--cn-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cafe.name}</h3>
          {cafe.address && (
            <p style={{ fontSize: '12px', color: 'var(--cn-on-surface-variant)', margin: '3px 0 0', lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cafe.address}</p>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', flexShrink: 0 }}>
          <button onClick={onToggleSave} style={{ width: '34px', height: '34px', borderRadius: '999px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isSaved ? 'rgba(52,69,38,0.12)' : 'rgba(0,0,0,0.05)', color: isSaved ? 'var(--cn-primary)' : 'var(--cn-on-surface-variant)', flexShrink: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: isSaved ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>bookmark</span>
          </button>
          {cafe.distance != null && (
            <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--cn-on-surface-variant)' }}>{cafe.distance}m</span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }} onClick={(e) => e.stopPropagation()}>
        <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--cn-on-surface-variant)', backgroundColor: 'var(--cn-surface-container)', padding: '3px 8px', borderRadius: '6px' }}>{tag}</span>
        <span style={{ color: 'var(--cn-outline-variant)', fontSize: '12px' }}>·</span>
        {cafe.instagram && (
          <a href={cafe.instagram} target="_blank" rel="noopener noreferrer" style={linkStyle}>
            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>photo_camera</span>Instagram
          </a>
        )}
        {cafe.website && (
          <a href={cafe.website} target="_blank" rel="noopener noreferrer" style={linkStyle}>
            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>language</span>Website
          </a>
        )}
        <a href={googleUrl} target="_blank" rel="noopener noreferrer" style={linkStyle}>
          <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>search</span>Search
        </a>
      </div>
    </div>
  );
}

const linkStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '3px',
  color: 'var(--cn-primary)', fontSize: '12px', fontWeight: 600, textDecoration: 'none',
};

export default Discover;
