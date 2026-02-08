import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import WelcomeModal from "./WelcomeModal";

function Layout() {
  return (
    <div className="app-shell">
      <WelcomeModal />
      <Header />
      <main className="page-shell">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
