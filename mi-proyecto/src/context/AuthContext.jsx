import { createContext, useContext, useEffect, useState } from "react";
import { auth, provider, db } from "../firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, getDocs, collection } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

const login = async () => {
  const result = await signInWithPopup(auth, provider);
  const userRef = doc(db, "users", result.user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    // Verificar si el admin ya registró su email como empleado
    const employeesSnap = await getDocs(collection(db, "employees"));
    const employees = employeesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const found = employees.find((e) => e.email === result.user.email);

    await setDoc(userRef, {
      name: result.user.displayName,
      email: result.user.email,
      role: found ? found.role : "client",
    });
  }
};

  const logout = () => signOut(auth);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        setRole(userSnap.data()?.role || "client");
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}