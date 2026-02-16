import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { GoogleMap, LoadScript, Marker, Autocomplete } from "@react-google-maps/api";
import { useState, useRef } from "react";

const API_KEY = "AIzaSyDlh1W55TRYAqcOClLUF5oCyCABCbJirtc";
const mapContainerStyle = { width: "100%", height: "400px" };
const defaultCenter = { lat: -12.0464, lng: -77.0428 };
const libraries = ["places"];

export default function Cart() {
  const { state } = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const cart = state?.cart || [];
  const [marker, setMarker] = useState(null);
  const [center, setCenter] = useState(defaultCenter);
  const [address, setAddress] = useState("");
  const autocompleteRef = useRef(null);

  const handleMapClick = (e) => {
    setMarker({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    setAddress(`Lat: ${e.latLng.lat().toFixed(4)}, Lng: ${e.latLng.lng().toFixed(4)}`);
  };

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (!place.geometry) return;
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    setMarker({ lat, lng });
    setCenter({ lat, lng });
    setAddress(place.formatted_address);
  };

  const placeOrder = async () => {
    if (cart.length === 0) return alert("El carrito está vacío");
    if (!marker) return alert("Selecciona tu ubicación en el mapa");
    await addDoc(collection(db, "orders"), {
      userId: user.uid,
      userName: user.displayName,
      items: cart,
      status: "pending",
      address,
      location: { lat: marker.lat, lng: marker.lng },
      createdAt: new Date(),
    });
    alert("Pedido realizado con éxito");
    navigate("/");
  };

  return (
    <div>
      <h1>Carrito</h1>
      {cart.length === 0 && <p>No hay productos en el carrito</p>}
      {cart.map((item) => (
        <div key={item.id}>
          <p>{item.name} x{item.quantity} - S/. {item.price * item.quantity}</p>
        </div>
      ))}

      <h2>Selecciona tu ubicación de entrega</h2>
      <p>Dirección: {address || "Ninguna seleccionada"}</p>

      <LoadScript googleMapsApiKey={API_KEY} libraries={libraries}>
        <Autocomplete
          onLoad={(ref) => (autocompleteRef.current = ref)}
          onPlaceChanged={handlePlaceChanged}
        >
          <input placeholder="Busca tu dirección..." style={{ width: "100%", padding: "8px" }} />
        </Autocomplete>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={13}
          onClick={handleMapClick}
        >
          {marker && <Marker position={marker} />}
        </GoogleMap>
      </LoadScript>

      <button onClick={placeOrder}>Realizar pedido</button>
    </div>
  );
}