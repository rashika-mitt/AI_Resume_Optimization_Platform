import React from "react";
import { useNavigate, Link } from "react-router";
import "../auth.form.scss";
import { useAuth } from "../hooks/useAuth.js";

const Register = () => {
    const { loading, handleRegister } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const result = await handleRegister(username, email, password);

        if (result?.success) {
            navigate("/login");
            return;
        }

        setError(result?.error || "Registration failed. Please try again.");
    };

  return (
    <main className="register-page">
            <div className="register-orbit register-orbit-left" aria-hidden="true" />
            <div className="register-orbit register-orbit-right" aria-hidden="true" />

            <div className="form-container register-card">
                <div className="register-heading">
                    <span className="register-eyebrow">AI INTERVIEW PREP</span>
                    <h1>Create Your Account</h1>
                    <p>Start building your personalized interview preparation plan.</p>
                </div>

                <form onSubmit={handleSubmit}>

                    <div className="input-group">
                        <label htmlFor="username">Username</label>

                        <input
                            onChange={(e) => setUsername(e.target.value)}
                            value={username}
                            type="text"
                            id="username"
                            name="username"
                            placeholder="Enter Username"
                            required
                        />
                    </div>

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
                        {loading ? "Creating account..." : "Register"}
                    </button>

                </form>
                {error && <p role="alert" className="register-error">{error}</p>}
                <p>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </main>
    )
}

export default Register
    