import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Mail, Lock, AlertCircle } from 'lucide-react';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [formError, setFormError] = useState("");
    const { loginWithGoogle, loginWithEmail, error } = useAuth();
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            navigate('/dashboard');
        } catch (err) {
            console.error("Google login failed:", err);
        }
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setFormError("");
        try {
            await loginWithEmail(email, password);
            navigate('/dashboard');
        } catch (err) {
            setFormError(err.message);
        }
    };

    return (
        <div className="login-container">
            <div className="login-visual">
                <div className="visual-content">
                    <h1>Empowering the next generation of learners.</h1>
                    <p>A unified platform for academic excellence and seamless collaboration.</p>
                </div>
            </div>

            <div className="login-form-side">
                <div className="login-card glass-card animate-fade-in">
                    <div className="login-header">
                        <GraduationCap size={48} className="login-logo" />
                        <h2>Welcome Back</h2>
                        <p>Please sign in to your account</p>
                    </div>

                    {(formError || error) && (
                        <div className="error-message">
                            <AlertCircle size={18} />
                            <span>{formError || error}</span>
                        </div>
                    )}

                    <form onSubmit={handleEmailLogin} className="auth-form">
                        <div className="input-group">
                            <Mail size={20} />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <Lock size={20} />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-block">
                            Sign In
                        </button>
                    </form>

                    <div className="auth-separator">
                        <span>OR</span>
                    </div>

                    <button onClick={handleGoogleLogin} className="btn-google">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/layout/google.svg" alt="google" />
                        Continue with Google
                    </button>

                    <div className="auth-divider">
                        <span>Don't have an account?</span>
                        <Link to="/signup" className="text-link">Create one</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
