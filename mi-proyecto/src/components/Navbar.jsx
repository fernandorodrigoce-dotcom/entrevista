import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { user, role, logout } = useAuth();

  if (!user) return null;

  return (
    <nav>
      <Link to="/">Inicio</Link>
      {role === "admin" && <Link to="/admin"> | Admin</Link>}
      {role === "delivery" && <Link to="/delivery"> | Delivery</Link>}
      <span> | {user.displayName} ({role})</span>
      <button onClick={logout}>Cerrar sesión</button>
    </nav>
  );
}