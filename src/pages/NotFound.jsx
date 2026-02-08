import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="container page-block">
      <section className="section section-tight">
        <h1>404</h1>
        <p className="section-intro">Cette page n&apos;existe pas (ou plus).</p>
        <Link to="/" className="btn btn-primary">
          Retour à l&apos;accueil
        </Link>
      </section>
    </div>
  );
}

export default NotFound;
