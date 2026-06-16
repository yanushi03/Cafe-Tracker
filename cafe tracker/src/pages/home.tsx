import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Cafe, DiaryEntry } from '../types/cafe';
import { getCafesByLocation, formatCafeType, applyFilters, FILTER_CATEGORIES } from '../services/cafeServices';
import { useCafes } from '../hooks/useCafes';

const VIBES = [
  { value: 'chill' as const,         label: 'Chill',        icon: 'self_improvement' },
  { value: 'work-friendly' as const, label: 'Work-friendly', icon: 'laptop_mac' },
  { value: 'lively' as const,        label: 'Lively',        icon: 'groups' },
];

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

const MRT_STATIONS = [
  { name: 'Orchard',       lat: 1.3048, lng: 103.8318 },
  { name: 'Bugis',         lat: 1.3009, lng: 103.8566 },
  { name: 'City Hall',     lat: 1.2931, lng: 103.8519 },
  { name: 'Dhoby Ghaut',   lat: 1.2997, lng: 103.8458 },
  { name: 'Clarke Quay',   lat: 1.2882, lng: 103.8464 },
  { name: 'Chinatown',     lat: 1.2841, lng: 103.8443 },
  { name: 'Toa Payoh',     lat: 1.3322, lng: 103.8480 },
  { name: 'Bishan',        lat: 1.3510, lng: 103.8484 },
  { name: 'Ang Mo Kio',    lat: 1.3699, lng: 103.8496 },
  { name: 'Serangoon',     lat: 1.3497, lng: 103.8733 },
  { name: 'Paya Lebar',    lat: 1.3178, lng: 103.8925 },
  { name: 'Tampines',      lat: 1.3530, lng: 103.9451 },
  { name: 'Bedok',         lat: 1.3240, lng: 103.9296 },
  { name: 'Clementi',      lat: 1.3151, lng: 103.7650 },
  { name: 'Jurong East',   lat: 1.3330, lng: 103.7422 },
  { name: 'Woodlands',     lat: 1.4370, lng: 103.7867 },
  { name: 'Yishun',        lat: 1.4296, lng: 103.8348 },
  { name: 'Little India',  lat: 1.3066, lng: 103.8496 },
  { name: 'HarbourFront',  lat: 1.2654, lng: 103.8204 },
  { name: 'Novena',        lat: 1.3203, lng: 103.8437 },
];

type Suggestion = { display_name: string; lat: string; lon: string; type: string; class: string };

function Home() {
  const [cafes, setCafes]           = useState<Cafe[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [coords, setCoords]         = useState<{ lat: number; lng: number } | null>(null);
  const [locationLabel, setLocationLabel] = useState('');

  const [query, setQuery]             = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef                     = useRef<HTMLInputElement>(null);

  const [showFilter, setShowFilter]     = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [sheetExpanded, setSheetExpanded] = useState(true);

  const navigate = useNavigate();
  const { cafes: savedCafes, addCafe, deleteCafe, diaryEntries, addDiaryEntry } = useCafes();

  const [markingCafe, setMarkingCafe] = useState<Cafe | null>(null);
  const [selectedVibe, setSelectedVibe] = useState<DiaryEntry['vibe'] | null>(null);
  const [note, setNote] = useState('');
  const [rating, setRating] = useState(0);
  const [willVisitAgain, setWillVisitAgain] = useState<boolean | undefined>(undefined);

  function handleMarkVisited(cafe: Cafe, e: React.MouseEvent) {
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

  function fetchCafes(lat: number, lng: number) {
    setLoading(true);
    setError(null);
    getCafesByLocation(lat, lng)
      .then((data) => { setCafes(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }

  // Initial geolocation
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setCoords({ lat: latitude, lng: longitude });
        setLocationLabel('Current location');
        fetchCafes(latitude, longitude);
      },
      (err) => {
        const msg = err.code === 1
          ? 'Location access denied. Search for an MRT station or area above to find cafes near you.'
          : 'Unable to get your location. Try searching for an area above instead.';
        setError(msg);
        setLoading(false);
      }
    );
  }, []);

  // Debounced Nominatim search — only runs when query is long enough
  useEffect(() => {
    if (query.length < 2) return;
    const t = setTimeout(() => {
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ' Singapore')}&format=json&limit=6&countrycodes=sg`)
        .then((r) => r.json())
        .then((data: Suggestion[]) => setSuggestions(data))
        .catch(() => setSuggestions([]));
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  function selectLocation(lat: number, lng: number, label: string) {
    setCoords({ lat, lng });
    setLocationLabel(label);
    setQuery('');
    setSuggestions([]);
    setShowDropdown(false);
    fetchCafes(lat, lng);
  }

  function toggleFilter(id: string) {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  function toggleSave(cafe: Cafe, e: React.MouseEvent) {
    e.stopPropagation();
    if (savedCafes.some((c) => c.id === cafe.id)) {
      deleteCafe(cafe.id);
    } else {
      addCafe(cafe);
    }
  }

  const visible = applyFilters(cafes, activeFilters);

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'var(--cn-font-body)', backgroundColor: 'var(--cn-surface-dim)' }}>

      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', backgroundColor: 'var(--cn-surface)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', flexShrink: 0, zIndex: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #c0d5aa', backgroundColor: '#e8eedf', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined icon-filled" style={{ color: 'var(--cn-primary)', fontSize: '24px' }}>person</span>
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--cn-font-headline)', fontSize: '20px', fontWeight: 600, color: 'var(--cn-primary)', margin: 0, lineHeight: 1.2 }}>Cozy Nooks</h1>
            {locationLabel && (
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--cn-on-surface-variant)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>location_on</span>
                {locationLabel}
              </p>
            )}
          </div>
        </div>
        <button style={{ background: 'none', border: 'none', color: 'var(--cn-primary)', cursor: 'pointer', padding: '4px', display: 'flex' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>search</span>
        </button>
      </header>

      <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Map */}
        <div style={{ position: 'absolute', inset: 0 }}>
          {coords ? (
            <iframe key={`${coords.lat},${coords.lng}`} title="Nearby map"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.015},${coords.lat - 0.01},${coords.lng + 0.015},${coords.lat + 0.01}&layer=mapnik&marker=${coords.lat},${coords.lng}`}
              style={{ width: '100%', height: '100%', border: 'none', opacity: 0.65 }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(145deg, #d4e8c2 0%, #e5d8c5 35%, #c8dab8 65%, #dce9c8 100%)' }} />
          )}
        </div>

        {/* Search overlay */}
        <div style={{ position: 'absolute', top: '16px', left: '20px', right: '20px', zIndex: 20 }}>
          {/* Search bar */}
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: '999px', padding: '10px 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.14)', border: '1px solid rgba(197,200,188,0.3)' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--cn-primary)', marginRight: '8px', fontSize: '20px' }}>
              location_on
            </span>
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search by MRT station or area..."
              style={{ border: 'none', outline: 'none', flex: 1, background: 'transparent', fontSize: '15px', color: 'var(--cn-on-surface)', fontFamily: 'var(--cn-font-body)' }}
            />
            {query.length > 0 ? (
              <button onClick={() => { setQuery(''); setSuggestions([]); setShowDropdown(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cn-on-surface-variant)', display: 'flex', padding: '2px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
              </button>
            ) : (
              <button onClick={() => setShowFilter(true)} style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                backgroundColor: activeFilters.size > 0 ? 'var(--cn-primary)' : 'var(--cn-secondary-container)',
                color: activeFilters.size > 0 ? '#ffffff' : 'var(--cn-on-secondary-container)',
                border: 'none', borderRadius: '999px', padding: '6px 12px',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--cn-font-body)', flexShrink: 0,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>tune</span>
                Filter{activeFilters.size > 0 ? ` (${activeFilters.size})` : ''}
              </button>
            )}
          </div>

          {/* Dropdown: suggestions or MRT chips */}
          {showDropdown && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', marginTop: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.14)', overflow: 'hidden', border: '1px solid rgba(197,200,188,0.3)' }}>
              {query.length >= 2 && suggestions.length > 0 ? (
                // Nominatim results
                suggestions.map((s, i) => {
                  const name = s.display_name.split(',')[0].trim();
                  const isStation = s.class === 'railway' || s.type === 'station' || name.toLowerCase().includes('mrt') || name.toLowerCase().includes('station');
                  return (
                    <button key={i} onClick={() => selectLocation(parseFloat(s.lat), parseFloat(s.lon), name)} style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 16px', background: 'none', border: 'none',
                      cursor: 'pointer', textAlign: 'left', borderBottom: i < suggestions.length - 1 ? '1px solid rgba(197,200,188,0.2)' : 'none',
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--cn-primary)', flexShrink: 0 }}>
                        {isStation ? 'train' : 'location_on'}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--cn-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</p>
                        <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--cn-on-surface-variant)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {s.display_name.split(',').slice(1, 3).join(',').trim()}
                        </p>
                      </div>
                    </button>
                  );
                })
              ) : (
                // MRT quick picks
                <div style={{ padding: '12px 16px' }}>
                  <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 600, color: 'var(--cn-on-surface-variant)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '13px', verticalAlign: 'middle', marginRight: '4px' }}>train</span>
                    Quick pick — MRT stations
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {MRT_STATIONS.map((mrt) => (
                      <button key={mrt.name} onClick={() => selectLocation(mrt.lat, mrt.lng, `${mrt.name} MRT`)} style={{
                        padding: '5px 10px', borderRadius: '999px', border: '1px solid rgba(197,200,188,0.5)',
                        backgroundColor: 'var(--cn-surface-container-low)', color: 'var(--cn-primary)',
                        fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--cn-font-body)',
                      }}>
                        {mrt.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tap outside to close dropdown */}
        {showDropdown && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 15 }} onClick={() => setShowDropdown(false)} />
        )}

        {/* Bottom sheet */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 40, backgroundColor: '#ffffff', borderRadius: '32px 32px 0 0', boxShadow: '0 -8px 32px rgba(0,0,0,0.10)', borderTop: '1px solid rgba(197,200,188,0.3)', display: 'flex', flexDirection: 'column', maxHeight: sheetExpanded ? '52%' : undefined }}>
          <div onClick={() => setSheetExpanded(p => !p)} style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px', cursor: 'pointer' }}>
            <div style={{ width: '32px', height: '5px', backgroundColor: 'rgba(197,200,188,0.6)', borderRadius: '999px' }} />
          </div>
          <div onClick={() => setSheetExpanded(p => !p)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 16px', cursor: 'pointer' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--cn-font-headline)', fontSize: '22px', fontWeight: 600, color: 'var(--cn-primary)', margin: 0 }}>Nearby Gems</h2>
              {!loading && !error && cafes.length > 0 && (
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--cn-on-surface-variant)' }}>
                  {activeFilters.size > 0 ? `${visible.length} of ${cafes.length}` : cafes.length} places
                </p>
              )}
            </div>
            <span className="material-symbols-outlined" style={{ color: 'var(--cn-on-surface-variant)', fontSize: '24px', transition: 'transform 0.25s', transform: sheetExpanded ? 'rotate(0deg)' : 'rotate(180deg)' }}>expand_less</span>
          </div>

          {sheetExpanded && <div className="cn-scroll-hide" style={{ overflowY: 'auto', paddingBottom: '88px' }}>
            {loading ? (
              <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div className="cn-skeleton" style={{ width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0 }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div className="cn-skeleton" style={{ height: '14px', width: '60%', borderRadius: '6px' }} />
                      <div className="cn-skeleton" style={{ height: '11px', width: '40%', borderRadius: '6px' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div style={{ padding: '20px', color: 'var(--cn-on-surface-variant)', fontSize: '14px', textAlign: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px', display: 'block', marginBottom: '8px', color: 'var(--cn-primary)', opacity: 0.4 }}>location_off</span>
                {error}
              </div>
            ) : visible.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--cn-on-surface-variant)', fontSize: '14px' }}>
                {activeFilters.size > 0 ? 'No places match your filters.' : 'No places found nearby.'}
              </div>
            ) : (
              visible.map((cafe) => {
                const color = avatarColor(cafe.id);
                const isSaved = savedCafes.some((c) => c.id === cafe.id);
                const isLogged = diaryEntries.some((d) => d.id === cafe.id);
                return (
                  <div key={cafe.id}>
                    <div onClick={() => navigate(`/cafe/${cafe.id}`, { state: { cafe } })} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', cursor: 'pointer' }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: color.bg, color: color.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--cn-font-headline)', fontSize: '20px', fontWeight: 700 }}>
                          {cafe.name.charAt(0).toUpperCase()}
                        </div>
                        {(isSaved || isLogged) && (
                          <div style={{ position: 'absolute', bottom: '-3px', right: '-3px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: isLogged ? 'var(--cn-primary)' : '#7a9a5a', border: '2px solid #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '9px', color: '#ffffff', fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>{isLogged ? 'check' : 'bookmark'}</span>
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontFamily: 'var(--cn-font-headline)', fontSize: '16px', fontWeight: 700, color: 'var(--cn-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cafe.name}</h3>
                        <p style={{ fontSize: '12px', color: 'var(--cn-on-surface-variant)', margin: '3px 0 0', fontWeight: 500 }}>
                          {cafe.distance != null ? `${cafe.distance}m` : ''}{cafe.distance != null ? ' • ' : ''}{formatCafeType(cafe.cuisine, cafe.amenity)}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <button onClick={(e) => handleMarkVisited(cafe, e)} title="Log visit" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: isLogged ? 'var(--cn-primary)' : 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.15s' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: isLogged ? '#ffffff' : 'var(--cn-on-surface-variant)', fontVariationSettings: isLogged ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>check_circle</span>
                          </div>
                        </button>
                        <button onClick={(e) => toggleSave(cafe, e)} title="Save to Must Visit" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: isSaved ? 'rgba(52,69,38,0.12)' : 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.15s' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: isSaved ? 'var(--cn-primary)' : 'var(--cn-on-surface-variant)', fontVariationSettings: isSaved ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>bookmark</span>
                          </div>
                        </button>
                      </div>
                    </div>
                    <div style={{ height: '1px', backgroundColor: 'rgba(197,200,188,0.25)', margin: '0 20px' }} />
                  </div>
                );
              })
            )}
          </div>}
        </div>
      </main>

      {/* Filter sheet */}
      {showFilter && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 80, display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={() => setShowFilter(false)} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(52,69,38,0.2)', backdropFilter: 'blur(3px)' }} />
          <div style={{ position: 'relative', zIndex: 90, width: '100%', backgroundColor: '#ffffff', borderRadius: '28px 28px 0 0', padding: '20px 20px 40px', boxShadow: '0 -8px 40px rgba(0,0,0,0.12)' }}>
            <div style={{ width: '32px', height: '4px', backgroundColor: 'rgba(197,200,188,0.6)', borderRadius: '999px', margin: '0 auto 20px' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'var(--cn-font-headline)', fontSize: '20px', fontWeight: 600, color: 'var(--cn-primary)', margin: 0 }}>Filter by type</h3>
              {activeFilters.size > 0 && (
                <button onClick={() => setActiveFilters(new Set())} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'var(--cn-on-surface-variant)', fontFamily: 'var(--cn-font-body)' }}>Clear all</button>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
              {FILTER_CATEGORIES.map((cat) => {
                const active = activeFilters.has(cat.id);
                return (
                  <button key={cat.id} onClick={() => toggleFilter(cat.id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '14px', border: 'none', cursor: 'pointer', backgroundColor: active ? 'var(--cn-primary)' : 'var(--cn-surface-container-low)', color: active ? '#ffffff' : 'var(--cn-on-surface)', fontFamily: 'var(--cn-font-body)', fontSize: '14px', fontWeight: 600, transition: 'all 0.15s' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{cat.icon}</span>
                    {cat.label}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setShowFilter(false)} style={{ width: '100%', padding: '14px', border: 'none', borderRadius: '999px', backgroundColor: 'var(--cn-primary)', color: '#ffffff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--cn-font-body)' }}>
              Show {activeFilters.size === 0 ? 'all' : applyFilters(cafes, activeFilters).length} places
            </button>
          </div>
        </div>
      )}

      {/* Log visit modal */}
      {markingCafe && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 80, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={() => { setMarkingCafe(null); setSelectedVibe(null); setNote(''); setRating(0); setWillVisitAgain(undefined); }} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(52,69,38,0.25)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', zIndex: 90, width: '100%', maxWidth: '480px', backgroundColor: '#ffffff', borderRadius: '24px 24px 0 0', padding: '28px 24px 40px', boxShadow: '0 -8px 40px rgba(0,0,0,0.12)' }}>
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

export default Home;
