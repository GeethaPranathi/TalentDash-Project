"use client";

import { createContext, useContext, useState } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [globalSearch, setGlobalSearch] = useState("");

  return (
    <AppContext.Provider value={{ globalSearch, setGlobalSearch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
