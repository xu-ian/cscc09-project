import { createContext, useState, useContext } from "react";

const UserContext = createContext({
    user: {},
    updateUser: (user) => {},
})

export function useUserContext() { 
    return useContext(UserContext);
  }

export const UserContextProvider = ({ children }) => {
    const [user, updateUser] = useState({})

    return (
        <UserContext.Provider
            value={{ user, updateUser }}
        >
            {children}
        </UserContext.Provider>
    )
}