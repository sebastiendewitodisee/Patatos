import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p>© {new Date().getFullYear()} Team Patates Patatos · Opération Récolte 🥔</p>
        <Link to="/legal" className="footer-link">
          Mentions légales
        </Link>
      </div>
    </footer>
  );
}

export default Footer;
