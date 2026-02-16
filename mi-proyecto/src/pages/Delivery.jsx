import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const API_KEY = "AIzaSyDlh1W55TRYAqcOClLUF5oCyCABCbJirtc";
const mapContainerStyle = { width: "100%", height: "300px" };

export default function Delivery() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const snap = await getDocs(collection(db, "orders"));
    const allOrders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setOrders(allOrders.filter((o) => o.status === "assigned" && o.deliveryId === user.uid));
  };

  useEffect(() => { fetchOrders(); }, []);

  const markDelivered = async (id) => {
    await updateDoc(doc(db, "orders", id), { status: "delivered" });
    fetchOrders();
  };

  return (
    <div>
      <h1>Panel Delivery</h1>
      {orders.length === 0 && <p>No hay pedidos asignados</p>}
      <LoadScript googleMapsApiKey={API_KEY}>
        {orders.map((order) => (
          <div key={order.id}>
            <p>Cliente: {order.userName}</p>
            <p>Dirección: {order.address}</p>
            <p>Productos: {order.items.map((i) => i.name).join(", ")}</p>
            <p>Estado: {order.status}</p>
            {order.location && (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={order.location}
                zoom={15}
              >
                <Marker position={order.location} />
              </GoogleMap>
            )}
            <button onClick={() => markDelivered(order.id)}>Marcar como entregado</button>
          </div>
        ))}
      </LoadScript>
    </div>
  );
}