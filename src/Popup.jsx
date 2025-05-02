import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyEmailWithGhostMail } from "./GhostMail";
import {
    auth,
    signInWithEmailAndPassword,
    signInWithGoogle,
    createUserWithEmailAndPassword,
    updateProfile,
} from "./firebase.jsx";
import { useRedirect } from "./RedirectContext";

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

        const whitelist = ["test@gmail.com", "test12"];

        try {
            if (!whitelist.includes(email)) {
                const check = await verifyEmailWithGhostMail(email);
                if (!check.valid) {
                    setError("Email non valida o temporanea.");
                    setLoading(false);
                    return;
                }
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full border-2 border-blue-300 shadow-lg">
                <div className="p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-blue-500">
                            {formType === "Login" ? "Accedi" : "Registrati"}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-blue-400 hover:text-blue-600 transition"
                            aria-label="Chiudi"
                        >
                            ✕
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-600 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {formType === "Login" ? (
                        <form
                            className="space-y-4"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleAuthAction(() =>
                                    signInWithEmailAndPassword(auth, email, password)
                                );
                            }}
                        >
                            <div>
                                <label className="block text-blue-600 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-blue-50 text-blue-900 p-3 rounded-lg focus:ring-2 focus:ring-blue-400"
                                    placeholder="tua@email.com"
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-blue-600 mb-2">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-blue-50 text-blue-900 p-3 rounded-lg focus:ring-2 focus:ring-blue-400"
                                    placeholder="La tua password"
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${loading
                                        ? 'bg-blue-300 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600'
                                    }`}
                            >
                                {loading ? "Accesso in corso..." : "Accedi"}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-blue-600 mb-2">Nome</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-blue-50 text-blue-900 p-3 rounded-lg focus:ring-2 focus:ring-blue-400"
                                    placeholder="Il tuo nome"
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-blue-600 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-blue-50 text-blue-900 p-3 rounded-lg focus:ring-2 focus:ring-blue-400"
                                    placeholder="tua@email.com"
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-blue-600 mb-2">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-blue-50 text-blue-900 p-3 rounded-lg focus:ring-2 focus:ring-blue-400"
                                    placeholder="Min. 6 caratteri"
                                    disabled={loading}
                                />
                            </div>

                            <button
                                onClick={handleRegister}
                                disabled={loading}
                                className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${loading
                                        ? 'bg-blue-300 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600'
                                    }`}
                            >
                                {loading ? "Registrazione in corso..." : "Registrati"}
                            </button>
                        </div>
                    )}

                    <div className="flex items-center my-6">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="px-4 text-gray-500">oppure</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    <button
                        onClick={() => handleAuthAction(() => signInWithGoogle())}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-blue-100 hover:bg-blue-200 text-blue-800 py-3 px-4 rounded-lg font-semibold transition"
                    >
                        <img
                            src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_48dp.png"
                            alt="Google"
                            className="h-5 w-5"
                        />
                        Continua con Google
                    </button>
                </div>

                <div className="bg-blue-50 px-6 py-4 text-center rounded-b-xl">
                    <p className="text-blue-600">
                        {formType === "Login" ? "Non hai un account? " : "Hai già un account? "}
                        <button
                            onClick={() => {
                                setError("");
                                setFormType(formType === "Login" ? "Register" : "Login");
                            }}
                            className="text-green-600 hover:underline font-semibold"
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