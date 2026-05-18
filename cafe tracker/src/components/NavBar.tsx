import { NavLink } from 'react-router-dom'

function NavBar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <NavLink className="navbar-brand" to='/home'>CafeTrail</NavLink>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarText">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to='/discover'>Discover</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to='/mustVisit'>Must Visit</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to='/visited'>Visited</NavLink>
            </li>
          </ul>
          <NavLink className="nav-link" to='/profile'>
            <span className="navbar-text">Profile</span>
          </NavLink>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
