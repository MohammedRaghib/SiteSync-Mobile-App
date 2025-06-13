import React, { createContext, useState, useContext } from 'react';

// Create context
const UserContext = createContext();

// Export this for use in components
export function useUser() {
  return useContext(UserContext);
}

// Provider component
export function UserProvider({ children }) {
  const [user, setUser] = useState(null); // default: not logged in

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}
