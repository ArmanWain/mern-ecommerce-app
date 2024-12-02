import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import getUserRoutes from "./components/routes/UserRoutes";
import getAdminRoutes from "./components/routes/AdminRoutes";
import NotFound from "./components/layout/NotFound";
import { Toaster } from "react-hot-toast";

function App() {
  const userRoutes = getUserRoutes();
  const adminRoutes = getAdminRoutes();

  return (
    <Router>
      <div className="App">
        <Toaster position="top-center" toastOptions={{ duration: 15000 }} />
        <Header />

        <div className="container">
          <Routes>
            {userRoutes}
            {adminRoutes}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
