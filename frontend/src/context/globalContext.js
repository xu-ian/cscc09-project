import { UserContextProvider } from "./userContext";


export default function GlobalContextProvider({ children }) {
	return (
        <UserContextProvider>
            {children}
        </UserContextProvider>
	);
}