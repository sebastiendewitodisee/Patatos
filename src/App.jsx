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
const AdminPosts = lazy(() => import("./pages/AdminPosts"));
const AdminComments = lazy(() => import("./pages/AdminComments"));
const AdminAdmins = lazy(() => import("./pages/AdminAdmins"));
const Posts = lazy(() => import("./pages/Posts"));
const Post = lazy(() => import("./pages/Post"));

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="planning" element={<Planning />} />
        <Route
          path="posts"
          element={
            <Suspense fallback={null}>
              <Posts />
            </Suspense>
          }
        />
        <Route
          path="posts/:slug"
          element={
            <Suspense fallback={null}>
              <Post />
            </Suspense>
          }
        />
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
          path="admin/posts"
          element={
            <Suspense fallback={null}>
              <AdminPosts />
            </Suspense>
          }
        />
        <Route
          path="admin/comments"
          element={
            <Suspense fallback={null}>
              <AdminComments />
            </Suspense>
          }
        />
        <Route
          path="admin/admins"
          element={
            <Suspense fallback={null}>
              <AdminAdmins />
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
