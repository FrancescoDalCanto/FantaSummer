import React, { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import { collectionGroup, getDocs, doc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./css/AdminQuestApproval.css";

export default function AdminQuestApproval() {
    const [quests, setQuests] = useState([]);
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    // Controllo accesso admin
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                setAuthorized(false);
                setLoading(false);
                return;
            }

            // Controlla email o UID
            if (user.email === "admin@gmail.com" || user.uid === "admin123") {
                setAuthorized(true);
            } else {
                setAuthorized(false);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!authorized) return;

        const fetchQuests = async () => {
            const snapshot = await getDocs(collectionGroup(db, "quests"));
            const questList = snapshot.docs.map(doc => ({
                id: doc.id,
                ref: doc.ref,
                ...doc.data()
            }));

            const pendingQuests = questList.filter(q => q.status === "pending");
            setQuests(pendingQuests);
        };

        fetchQuests();
    }, [authorized]);

    if (loading) return <p>Caricamento...</p>;

    if (!authorized) return <p>Non sei autorizzato a visualizzare questa pagina.</p>;

    return (
        <div className="admin-quest-approval">
            <h1>Approvazione Quest (Admin)</h1>
            {quests.length === 0 ? (
                <p>Nessuna quest in attesa.</p>
            ) : (
                <div className="quests-grid">
                    {quests.map(quest => (
                        <div key={quest.id} className="quest-card">
                            <h3>Quest ID: {quest.questId}</h3>
                            <p><strong>Utente:</strong> {quest.uploadedBy}</p>
                            <p><strong>Gruppo:</strong> {quest.groupId}</p>
                            <p><strong>Difficoltà:</strong> {quest.difficulty || "medium"}</p>
                            <img src={quest.proofImageUrl || quest.photoURL} alt="Prova" />
                            <div className="buttons">
                                <button className="approve" onClick={() => handleDecision(quest, true)}>Approva</button>
                                <button className="reject" onClick={() => handleDecision(quest, false)}>Rifiuta</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    // Approva o rifiuta
    async function handleDecision(quest, approved) {
        const points = approved ? calculatePoints(quest.difficulty || "medium") : 0;

        await setDoc(quest.ref, {
            ...quest,
            status: approved ? "approved" : "rejected",
            points
        });

        if (approved) {
            const userRef = doc(db, "users", quest.uploadedBy);
            const userDoc = await getDocs(collection(db, "users", quest.uploadedBy));
            const currentPoints = userDoc.empty ? 0 : userDoc.docs[0].data().punti || 0;

            await setDoc(userRef, {
                punti: currentPoints + points
            }, { merge: true });
        }

        setQuests(quests.filter(q => q.id !== quest.id));
    }

    function calculatePoints(difficulty) {
        switch (difficulty) {
            case "easy": return 5;
            case "medium": return 10;
            case "hard": return 20;
            default: return 10;
        }
    }
}