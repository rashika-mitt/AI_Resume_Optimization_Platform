import React from "react";
import { Link, useNavigate } from "react-router";
import "../auth.form.scss";
import { useAuth } from "../hooks/useAuth.js";

const Login = () => {
    const { loading, handleLogin } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = await handleLogin(email, password);

        if (data) {
            navigate("/");
        }
    };

    if (loading) {
        return (
            <main className="login-page login-loading">
                <h1>Loading.....</h1>
            </main>
        );
    }

    return (
        <main className="login-page">
            <div className="login-orbit login-orbit-left" aria-hidden="true" />
            <div className="login-orbit login-orbit-right" aria-hidden="true" />

            <div className="form-container login-card">
                <div className="login-heading">
                    <span className="login-eyebrow">AI INTERVIEW PREP</span>
                    <h1>Welcome Back</h1>
                    <p>Continue your personalized interview preparation.</p>
                </div>

                <form onSubmit={handleSubmit}>

                    <div className="input-group">
                        <label htmlFor="email">Email</label>

                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter Email Address"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>

                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter Password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="button primary-button"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                <p>
                    Don't have an account?{" "}
                    <Link to="/register">Register</Link>
                </p>
            </div>
        </main>
    );
};

export default Login;