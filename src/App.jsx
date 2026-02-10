import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Contact from "./pages/Contact";
import Faq from "./pages/Faq";
import Home from "./pages/Home";
import Legal from "./pages/Legal";
import NotFound from "./pages/NotFound";
import Organisation from "./pages/Organisation";
import Planning from "./pages/Planning";
import Team from "./pages/Team";
import Varietes from "./pages/Varietes";

const Admin = lazy(() => import("./pages/Admin"));
const AdminPlanning = lazy(() => import("./pages/AdminPlanning"));

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="planning" element={<Planning />} />
        <Route path="equipe" element={<Team />} />
        <Route path="varietes" element={<Varietes />} />
        <Route path="organisation" element={<Organisation />} />
        <Route path="faq" element={<Faq />} />
        <Route path="contact" element={<Contact />} />
        <Route
          path="admin/planning"
          element={
            <Suspense fallback={null}>
              <AdminPlanning />
            </Suspense>
          }
        />
        <Route
          path="admin"
          element={
            <Suspense fallback={null}>
              <Admin />
            </Suspense>
          }
        />
        <Route path="legal" element={<Legal />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
