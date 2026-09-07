import { createContext, useEffect, useState } from "react";
import { getMe } from "./services/auth.api.js";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getMe();

                if (data?.user) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.log("No logged-in user");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                loading,
                setLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};