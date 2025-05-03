import React, { useState } from "react";
import "./css/Crete-Join.css";
import { collection, query, where, getDocs, addDoc, doc, setDoc } from "firebase/firestore";
import { db, auth } from "./firebase";

export default function CreateGroupPopup({ onClose }) {
    const [groupName, setGroupName] = useState("");
    const [error, setError] = useState("");

    const handleCreate = async () => {
        if (groupName.trim() === "") {
            setError("Inserisci un nome valido");
            return;
        }

        const groupsRef = collection(db, "groups");
        const q = query(groupsRef, where("name", "==", groupName));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            setError("Il nome del gruppo esiste già. Scegline un altro.");
            return;
        }

        try {
            const newGroupRef = await addDoc(groupsRef, {
                name: groupName,
                createdBy: auth.currentUser.uid,
                createdAt: new Date()
            });

            const userRef = doc(db, "groups", newGroupRef.id, "users", auth.currentUser.uid);
            await setDoc(userRef, {
                punti: 0,
                name: auth.currentUser.displayName || auth.currentUser.email,
                joinedAt: new Date()
            });

            onClose();
        } catch (err) {
            console.error("Errore nella creazione del gruppo:", err);
            setError("Errore durante la creazione. Riprova.");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Blocca il reload della pagina
        handleCreate();
    };

    return (
        <div className="popup-overlay">
            <div className="popup-container">
                <h2 className="popup-title">Crea un nuovo gruppo</h2>

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
                        <button type="submit" className="popup-button confirm">Crea</button>
                    </div>
                </form>
            </div>
        </div>
    );
}