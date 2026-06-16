import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Map', icon: 'map' },
  { to: '/mustVisit', label: 'Must Visit', icon: 'bookmark' },
  { to: '/visited', label: 'Diary', icon: 'book_5' },
];

function NavBar() {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      zIndex: 50,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '8px 16px 20px',
      backgroundColor: 'var(--cn-surface)',
      boxShadow: '0 -4px 12px rgba(0,0,0,0.08)',
    }}>
      {navItems.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            padding: '6px 16px',
            borderRadius: '999px',
            backgroundColor: isActive ? '#e8eedf' : 'transparent',
            color: isActive ? 'var(--cn-primary)' : 'var(--cn-on-surface-variant)',
            fontFamily: 'var(--cn-font-body)',
            fontSize: '12px',
            fontWeight: 500,
            gap: '2px',
            transition: 'background-color 0.15s, color 0.15s',
          })}
        >
          {({ isActive }) => (
            <>
              <span
                className={`material-symbols-outlined${isActive ? ' icon-filled' : ''}`}
                style={{ fontSize: '24px' }}
              >
                {icon}
              </span>
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export default NavBar;
