import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User, AlertCircle, Users } from 'lucide-react';
import './Login.css';

const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState("STUDENT");
    const [formError, setFormError] = useState("");
    const { signupWithEmail, error } = useAuth();
    const navigate = useNavigate();

    const roles = [
        { value: 'STUDENT', label: 'Student' },
        { value: 'TEACHER', label: 'Teacher' },
        { value: 'MENTOR', label: 'Mentor' },
        { value: 'HOD', label: 'HOD' },
        { value: 'PRINCIPAL', label: 'Principal' }
    ];

    const handleSignup = async (e) => {
        e.preventDefault();
        setFormError("");
        try {
            await signupWithEmail(email, password, fullName, role);
            navigate('/dashboard');
        } catch (err) {
            setFormError(err.message);
        }
    };

    return (
        <div className="login-container">
            <div className="login-visual">
                <div className="visual-content">
                    <h1>Join the Future of Learning.</h1>
                    <p>Create your account and start your academic journey with AcaSync.</p>
                </div>
            </div>

            <div className="login-form-side">
                <div className="login-card glass-card animate-fade-in">
                    <div className="login-header">
                        <GraduationCap size={48} className="login-logo" />
                        <h2>Create Account</h2>
                        <p>Enter your details to register</p>
                    </div>

                    {(formError || error) && (
                        <div className="error-message">
                            <AlertCircle size={18} />
                            <span>{formError || error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="auth-form">
                        <div className="input-group">
                            <User size={20} />
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>
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
                            <Users size={20} />
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="role-select"
                                required
                            >
                                {roles.map(r => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </select>
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
                            Create Account
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span>Already have an account?</span>
                        <Link to="/login" className="text-link">Sign In</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
