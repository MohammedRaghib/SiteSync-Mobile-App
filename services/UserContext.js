import { createContext, useContext, useState } from "react";

const CheckInfo = createContext(null);

export function CheckInfoProvider({ children }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState({
    id: "",
    role: "",
    access: "",
    refresh: "",
  });
  const BACKEND_API_URL = "https://django.angelightrading.com/home/angeligh/djangoapps/api/";
  
  const hasAccess = ({ requiresLogin = true, allowedRoles = [] }) => {
    if (requiresLogin && !loggedIn) return false;
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) return false;
    return true;
  };

  const refreshAccessToken = async () => {
    try {
      const refresh = user.refresh;
      if (!refresh) {
        throw new Error("No refresh token found");
      }
      const response = await fetch(`${BACKEND_API_URL}token/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refresh }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh access token");
      }

      const data = await response.json();
      setUser((prevUser) => ({
        ...prevUser,
        access: data.access,
      }));
      return data.access;
    } catch (error) {
      console.error("Error refreshing access token:", error);
      return null;
    }
  };


  return (
    <CheckInfo.Provider
      value={{ user, setUser, loggedIn, setLoggedIn, hasAccess, refreshAccessToken }}
    >
      {children}
    </CheckInfo.Provider>
  );
}

export default function useCheckInfo() {
  return useContext(CheckInfo);
}
