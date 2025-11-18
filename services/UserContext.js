import { createContext, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import log from "../components/Logger";

const CheckInfo = createContext(null);

export function CheckInfoProvider({ children }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState({
    id: "",
    role: "",
    projectId: "",
    projectName: "",
  });
  
  const [BACKEND_API_URLS, setBACKEND_API_URLS] = useState({
    backend1: '',
    backend2: ''
  });
  const { t } = useTranslation();

  const hasAccess = ({ requiresLogin = true, allowedRoles = [] }) => {
    if (requiresLogin && !loggedIn) return false;
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role))
      return false;
    return true;
  };

  const refreshAccessToken = async () => {
    try {
      const refresh = user.refresh;
      if (!refresh) {
        throw new Error("No refresh token found");
      }
      const response = await fetch(`${BACKEND_API_URLS.backend1}token/refresh/`, {
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
      return null;
    }
  };

  const fetchUrls = async () => {
    try {
      const response = await fetch(`https://script.google.com/macros/s/AKfycbwcgKtPWBHEhDKbgTYsUijudFnyCElqTY74Nm0c8vmRcwQK37MnCWzHp2F8EVIqYofV/exec`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(t("errors.fetchUrlError"));
      }

      setBACKEND_API_URLS((prevURLs) => ({
        ...prevURLs,
        backend1: data.backend1,
        backend2: data.backend2
      }));

      log.info("Fetched backend URLs:", data);
    } catch (e) {
      log.error("Error fetching backend URLs:", e);
    }
  }

  useEffect(() => {
    fetchUrls();
  }, []);

  return (
    <CheckInfo.Provider
      value={{
        user,
        setUser,
        loggedIn,
        setLoggedIn,
        hasAccess,
        refreshAccessToken,
        BACKEND_API_URLS,
      }}
    >
      {children}
    </CheckInfo.Provider>
  );
}

export default function useCheckInfo() {
  return useContext(CheckInfo);
}
