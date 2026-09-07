import { useContext } from "react";
import { AuthContext } from "../auth.context.jsx";

import {
    login,
    register,
    logout,
} from "../services/auth.api.js";

export const useAuth = () => {

    const context = useContext(AuthContext);

    const {
        user,
        setUser,
        loading,
        setLoading
    } = context;

    const handleLogin = async (email, password) => {
        setLoading(true);

        try {
            const data = await login({
                email,
                password
            });

            console.log("LOGIN RESPONSE:", data);

            if (data?.user) {
                setUser(data.user);
                return true;
            }

            return false;

        } catch (error) {
            console.error("Login failed:", error);
            return false;

        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (username, email, password) => {
        setLoading(true);

        try {
            const data = await register({
                username,
                email,
                password
            });

            console.log("REGISTER RESPONSE:", data);

            if (data?.user) {
                setUser(data.user);
                return { success: true };
            }

            return { success: false, error: "Registration failed. Please try again." };

        } catch (error) {
            console.error("Registration failed:", error);
            return {
                success: false,
                error: error.response?.data?.message ||
                    "Registration failed. Please try again."
            };

        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);

        try {
            await logout();
            setUser(null);
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return {
        user,
        loading,
        handleLogin,
        handleRegister,
        handleLogout
    };
};