import { useState } from "react";
import { Outlet } from "react-router-dom";
import { resetWelcomeSeen } from "../i18n";
import Footer from "./Footer";
import Header from "./Header";
import WelcomeModal from "./WelcomeModal";

function Layout() {
  const [welcomeNonce, setWelcomeNonce] = useState(0);

  const handleReopenWelcome = () => {
    resetWelcomeSeen();
    setWelcomeNonce((currentNonce) => currentNonce + 1);
  };

  return (
    <div className="app-shell">
      <WelcomeModal openNonce={welcomeNonce} />
      <Header />
      <main className="page-shell">
        <Outlet />
      </main>
      <Footer onReopenWelcome={handleReopenWelcome} />
    </div>
  );
}

export default Layout;
