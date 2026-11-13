import { NavLink } from 'react-router-dom';

export default function HireNavigation() {
  return <nav className="hire-navigation" aria-label="Hire us navigation">
    <NavLink to="/hire-us" end>Hire us</NavLink>
    <NavLink to="/hire-us/corporate">Corporate</NavLink>
    <NavLink to="/hire-us/packages">Packages</NavLink>
  </nav>;
}
