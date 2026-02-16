import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Delivery from "./pages/Delivery";
import Navbar from "./components/Navbar";
import Cart from "./pages/Cart";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Admin />
            </PrivateRoute>
          } />
          <Route path="/delivery" element={
            <PrivateRoute allowedRoles={["delivery"]}>
              <Delivery />
            </PrivateRoute>
          } />
          <Route path="/cart" element={
  <PrivateRoute>
    <Cart />
  </PrivateRoute>
} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}