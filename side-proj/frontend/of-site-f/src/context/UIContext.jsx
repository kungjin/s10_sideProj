import { createContext, useContext, useState } from "react";

const UIContext = createContext(null);
export const useUI = () => useContext(UIContext);

export default function UIProvider({ children }) {
  const [keyword, setKeyword] = useState("");
  const [deadlineOnly, setDeadlineOnly] = useState(false); // 마감 임박만

  return (
    <UIContext.Provider value={{ keyword, setKeyword, deadlineOnly, setDeadlineOnly }}>
      {children}
    </UIContext.Provider>
  );
}
