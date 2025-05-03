import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyEmailWithGhostMail } from "./GhostMail";
import {
    auth,
    signInWithEmailAndPassword,
    signInWithGoogle,
    createUserWithEmailAndPassword,
    updateProfile,
    db
} from "./firebase.jsx";
import { doc, setDoc } from "firebase/firestore";
import { useRedirect } from "./RedirectContext";
import "./css/Popup.css";

const Popup = ({ type, onClose }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formType, setFormType] = useState(type);
    const navigate = useNavigate();
    const { redirectSessionId, setRedirectSessionId } = useRedirect();

    const handleAuthAction = async (authFunction) => {
        setLoading(true);
        setError("");
        try {
            await authFunction();
            if (redirectSessionId) {
                navigate(`/session/${redirectSessionId}`);
                setRedirectSessionId(null);
            } else {
                navigate("/user");
            }
            onClose();
        } catch (err) {
            handleFirebaseError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFirebaseError = (error) => {
        const errorMessages = {
            'auth/invalid-email': "Email non valida.",
            'auth/user-not-found': "Utente non trovato.",
            'auth/wrong-password': "Password errata.",
            'auth/email-already-in-use': "Email già in uso.",
            'auth/weak-password': "Password troppo debole.",
            'auth/network-request-failed': "Errore di rete.",
            'auth/too-many-requests': "Troppi tentativi. Riprova più tardi.",
        };

        setError(errorMessages[error.code] || `Errore: ${error.message || error.code}`);
    };

    const handleRegister = async () => {
        setLoading(true);
        setError("");

        const whitelist = ["test@gmail.com"];

        try {
            const isWhitelisted = whitelist.includes(email) || email.startsWith("test");

            if (!isWhitelisted) {
                const check = await verifyEmailWithGhostMail(email);
                if (!check.valid) {
                    setError("Email non valida o temporanea.");
                    setLoading(false);
                    return;
                }
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });

            // ✅ CREA IL DOCUMENTO FIRESTORE PER IL NUOVO UTENTE
            await setDoc(doc(db, "users", userCredential.user.uid), {
                punti: 0,
                lastQuestDate: ""
            });

            if (redirectSessionId) {
                navigate(`/session/${redirectSessionId}`);
                setRedirectSessionId(null);
            } else {
                navigate("/user");
            }

            onClose();
        } catch (err) {
            handleFirebaseError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup-container">
                <div className="popup-content">
                    <div className="popup-header">
                        <h2 className="popup-title">
                            {formType === "Login" ? "Accedi" : "Registrati"}
                        </h2>
                        <button onClick={onClose} className="popup-close">✕</button>
                    </div>

                    {error && <div className="popup-error">{error}</div>}

                    {formType === "Login" ? (
                        <form
                            className="popup-form"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleAuthAction(() =>
                                    signInWithEmailAndPassword(auth, email, password)
                                );
                            }}
                        >
                            <div className="popup-field">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tua@email.com"
                                    disabled={loading}
                                />
                            </div>

                            <div className="popup-field">
                                <label>Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="La tua password"
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`popup-button ${loading ? "disabled" : ""}`}
                            >
                                {loading ? "Accesso in corso..." : "Accedi"}
                            </button>
                        </form>
                    ) : (
                        <div className="popup-form">
                            <div className="popup-field">
                                <label>Nome</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Il tuo nome"
                                    disabled={loading}
                                />
                            </div>

                            <div className="popup-field">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tua@email.com"
                                    disabled={loading}
                                />
                            </div>

                            <div className="popup-field">
                                <label>Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min. 6 caratteri"
                                    disabled={loading}
                                />
                            </div>

                            <button
                                onClick={handleRegister}
                                disabled={loading}
                                className={`popup-button ${loading ? "disabled" : ""}`}
                            >
                                {loading ? "Registrazione in corso..." : "Registrati"}
                            </button>
                        </div>
                    )}

                    <div className="popup-divider">oppure</div>

                    <button
                        onClick={() => handleAuthAction(() => signInWithGoogle())}
                        disabled={loading}
                        className="popup-google-button"
                    >
                        <img
                            src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_48dp.png"
                            alt="Google"
                            className="popup-google-logo"
                        />
                        Continua con Google
                    </button>
                </div>

                <div className="popup-footer">
                    <p>
                        {formType === "Login" ? "Non hai un account? " : "Hai già un account? "}
                        <button
                            onClick={() => {
                                setError("");
                                setFormType(formType === "Login" ? "Register" : "Login");
                            }}
                            className="popup-footer-link"
                        >
                            {formType === "Login" ? "Registrati" : "Accedi"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Popup;