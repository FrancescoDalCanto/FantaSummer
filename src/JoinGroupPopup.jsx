import React, { useState } from "react";
import "./css/Crete-Join.css";
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import { db, auth } from "./firebase";

export default function JoinGroupPopup({ onClose }) {
    const [groupName, setGroupName] = useState("");
    const [error, setError] = useState("");

    const handleJoin = async () => {
        if (groupName.trim() === "") {
            setError("Inserisci il nome del gruppo");
            return;
        }

        const groupsRef = collection(db, "groups");
        const q = query(groupsRef, where("name", "==", groupName));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            setError("Gruppo non trovato");
            return;
        }

        try {
            const groupDoc = querySnapshot.docs[0];
            const groupId = groupDoc.id;

            const userRef = doc(db, "groups", groupId, "users", auth.currentUser.uid);
            await setDoc(userRef, {
                punti: 0,
                name: auth.currentUser.displayName || auth.currentUser.email,
                joinedAt: new Date()
            });

            onClose();
        } catch (err) {
            console.error("Errore nell'unione al gruppo:", err);
            setError("Errore durante l'unione. Riprova.");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleJoin();
    };

    return (
        <div className="popup-overlay">
            <div className="popup-container">
                <h2 className="popup-title">Unisciti a un gruppo</h2>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Nome del gruppo"
                        value={groupName}
                        onChange={(e) => {
                            setGroupName(e.target.value);
                            setError("");
                        }}
                        className="popup-input"
                    />

                    {error && <p className="popup-error">{error}</p>}

                    <div className="popup-actions">
                        <button type="button" onClick={onClose} className="popup-button cancel">Annulla</button>
                        <button type="submit" className="popup-button confirm">Unisciti</button>
                    </div>
                </form>
            </div>
        </div>
    );
}