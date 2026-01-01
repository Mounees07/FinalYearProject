import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    googleProvider,
    auth
} from '../firebase/firebase';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loginWithGoogle = async () => {
        setError("");
        try {
            const result = await signInWithPopup(auth, googleProvider);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const loginWithEmail = async (email, password) => {
        setError("");
        try {
            return await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const signupWithEmail = async (email, password, fullName, role = 'STUDENT') => {
        setError("");
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            const regData = {
                firebaseUid: result.user.uid,
                email: email,
                fullName: fullName,
                role: role
            };
            await api.post('/users/register', regData);
            setUserData(regData);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const logout = () => {
        setError("");
        return signOut(auth);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                try {
                    // Fetch user details from backend using our interceptor-enabled api
                    const response = await api.get(`/users/${user.uid}`);
                    setUserData(response.data);
                } catch (err) {
                    console.error("User not found in database, might need registration", err);
                    // Auto-registration for Google users if not in DB
                    if (user.providerData[0].providerId === 'google.com') {
                        try {
                            const regRes = await api.post('/users/register', {
                                firebaseUid: user.uid,
                                email: user.email,
                                fullName: user.displayName,
                                profilePictureUrl: user.photoURL,
                                role: 'STUDENT'
                            });
                            setUserData(regRes.data);
                        } catch (regErr) {
                            console.error("Google auto-registration failed", regErr);
                        }
                    }
                }
            } else {
                setUserData(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userData,
        loading,
        error,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
