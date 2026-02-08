import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

const navItems = [
  { to: "/", label: "Accueil" },
  { to: "/planning", label: "Planning" },
  { to: "/equipe", label: "Équipe" },
  { to: "/varietes", label: "Variétés" },
  { to: "/organisation", label: "Organisation" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
];

function Header() {
  const { pathname } = useLocation();
  const [openAtPath, setOpenAtPath] = useState(null);
  const isOpen = openAtPath === pathname;

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpenAtPath(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link
          to="/"
          className="brand"
          aria-label="Retour à l'accueil"
          onClick={() => setOpenAtPath(null)}
        >
          <span className="brand-mark" aria-hidden="true">
            🥔
          </span>
          <span>Team Patates Patatos</span>
        </Link>

        <button
          type="button"
          className={`burger-btn${isOpen ? " is-open" : ""}`}
          aria-expanded={isOpen}
          aria-controls="main-navigation"
          aria-label="Ouvrir le menu"
          onClick={() => setOpenAtPath(isOpen ? null : pathname)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav id="main-navigation" className={`site-nav${isOpen ? " is-open" : ""}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? " is-active" : ""}`}
              onClick={() => setOpenAtPath(null)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Header;
