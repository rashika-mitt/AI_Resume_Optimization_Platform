import { useAuth } from "../hooks/useAuth.js";
import { Navigate } from "react-router";
import "../auth.form.scss";

const Protected = ({ children }) => {

    const { loading, user } = useAuth();

    if (loading) {
        return (
            <main className="login-page auth-loading" aria-live="polite">
                <div className="login-orbit login-orbit-left" aria-hidden="true" />
                <div className="login-orbit login-orbit-right" aria-hidden="true" />

                <div className="auth-loading-panel">
                    <span className="login-eyebrow">AI INTERVIEW PREP</span>
                    <div className="auth-loading-spinner" role="status" aria-label="Loading" />
                    <p>Preparing your workspace...</p>
                </div>
            </main>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default Protected;