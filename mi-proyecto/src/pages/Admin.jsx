import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection, getDocs, addDoc, deleteDoc, updateDoc, doc, query, where, setDoc
} from "firebase/firestore";

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [editing, setEditing] = useState(null);
  const [empName, setEmpName] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empRole, setEmpRole] = useState("delivery");
  const [editingEmp, setEditingEmp] = useState(null);
  const [section, setSection] = useState("products");

  const fetchProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const fetchUsers = async () => {
    const snap = await getDocs(collection(db, "users"));
    setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const fetchOrders = async () => {
    const snap = await getDocs(collection(db, "orders"));
    setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchProducts();
    fetchUsers();
    fetchOrders();
  }, []);

  const handleSubmitProduct = async () => {
    if (!name || !price) return alert("Completa todos los campos");
    if (editing) {
      await updateDoc(doc(db, "products", editing), { name, price: Number(price) });
      setEditing(null);
    } else {
      await addDoc(collection(db, "products"), { name, price: Number(price) });
    }
    setName("");
    setPrice("");
    fetchProducts();
  };

  const handleEditProduct = (product) => {
    setEditing(product.id);
    setName(product.name);
    setPrice(product.price);
  };

  const handleDeleteProduct = async (id) => {
    await deleteDoc(doc(db, "products", id));
    fetchProducts();
  };

  const handleSubmitEmployee = async () => {
    if (!empName || !empEmail) return alert("Completa todos los campos");
    if (editingEmp) {
      await updateDoc(doc(db, "users", editingEmp), { name: empName, email: empEmail, role: empRole });
      setEditingEmp(null);
    } else {
      // Verificar si ya existe el email en users
      const exists = users.find((u) => u.email === empEmail);
      if (exists) {
        await updateDoc(doc(db, "users", exists.id), { role: empRole });
      } else {
        await addDoc(collection(db, "users"), { name: empName, email: empEmail, role: empRole });
      }
    }
    setEmpName("");
    setEmpEmail("");
    setEmpRole("delivery");
    fetchUsers();
  };

  const handleEditEmployee = (emp) => {
    setEditingEmp(emp.id);
    setEmpName(emp.name);
    setEmpEmail(emp.email);
    setEmpRole(emp.role);
  };

  const handleDeleteEmployee = async (id) => {
    await updateDoc(doc(db, "users", id), { role: "client" });
    fetchUsers();
  };

  return (
    <div>
      <h1>Panel Admin</h1>
      <button onClick={() => setSection("products")}>Productos</button>
      <button onClick={() => setSection("employees")}>Empleados</button>
      <button onClick={() => setSection("orders")}>Pedidos</button>

      {section === "products" && (
        <div>
          <h2>Productos</h2>
          <input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
          <input placeholder="Precio" value={price} onChange={(e) => setPrice(e.target.value)} />
          <button onClick={handleSubmitProduct}>{editing ? "Actualizar" : "Agregar"}</button>
          {editing && <button onClick={() => { setEditing(null); setName(""); setPrice(""); }}>Cancelar</button>}
          <h3>Lista de Productos</h3>
          {products.map((p) => (
            <div key={p.id}>
              <span>{p.name} - S/. {p.price}</span>
              <button onClick={() => handleEditProduct(p)}>Editar</button>
              <button onClick={() => handleDeleteProduct(p.id)}>Eliminar</button>
            </div>
          ))}
        </div>
      )}

      {section === "employees" && (
        <div>
          <h2>Empleados</h2>
          <input placeholder="Nombre" value={empName} onChange={(e) => setEmpName(e.target.value)} />
          <input placeholder="Email" value={empEmail} onChange={(e) => setEmpEmail(e.target.value)} />
          <select value={empRole} onChange={(e) => setEmpRole(e.target.value)}>
            <option value="delivery">Delivery</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={handleSubmitEmployee}>{editingEmp ? "Actualizar" : "Agregar"}</button>
          {editingEmp && <button onClick={() => { setEditingEmp(null); setEmpName(""); setEmpEmail(""); }}>Cancelar</button>}
          <h3>Lista de Empleados</h3>
          {users.filter((u) => u.role !== "client").map((emp) => (
            <div key={emp.id}>
              <span>{emp.name} - {emp.email} - {emp.role}</span>
              <button onClick={() => handleEditEmployee(emp)}>Editar</button>
              <button onClick={() => handleDeleteEmployee(emp.id)}>Quitar rol</button>
            </div>
          ))}
        </div>
      )}

      {section === "orders" && (
        <div>
          <h2>Pedidos</h2>
          {orders.map((order) => (
            <div key={order.id}>
              <p>Cliente: {order.userName}</p>
              <p>Estado: {order.status}</p>
              <p>Dirección: {order.address || "Sin dirección"}</p>
              <p>Productos: {order.items.map((i) => i.name).join(", ")}</p>
              <p>Delivery asignado: {order.deliveryName || "Sin asignar"}</p>
<select
  onChange={async (e) => {
    const selected = users.find((u) => u.id === e.target.value);
    if (!selected) return;
    await updateDoc(doc(db, "orders", order.id), {
      status: "assigned",
      deliveryId: selected.id,
      deliveryEmail: selected.email,
      deliveryName: selected.email, // usamos email para identificar
    });
    fetchOrders();
  }}
>
  <option value="">Asignar delivery</option>
{users.filter((u) => u.role === "delivery").map((emp) => (
  <option key={emp.id} value={emp.id}>{emp.name}</option>
))}
</select>
              <select
                value={order.status}
                onChange={async (e) => {
                  await updateDoc(doc(db, "orders", order.id), { status: e.target.value });
                  fetchOrders();
                }}
              >
                <option value="pending">Pendiente</option>
                <option value="assigned">Asignado</option>
                <option value="delivered">Entregado</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}