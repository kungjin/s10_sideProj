// src/context/AuthContext.jsx
import { createContext, useState } from "react";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [member, setMember] = useState(
    JSON.parse(localStorage.getItem("member") || "null")
  );

  const login = (memberInfo) => {
    localStorage.setItem("member", JSON.stringify(memberInfo));
    setMember(memberInfo);
  };

  const logout = () => {
    localStorage.removeItem("member");
    setMember(null);
  };

  return (
    <AuthContext.Provider value={{ member, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

 