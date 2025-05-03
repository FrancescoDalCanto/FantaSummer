import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db, auth } from "./firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import "./css/GroupPage.css";

export default function GroupPage() {
    const { id } = useParams();
    const [group, setGroup] = useState(null);
    const [participants, setParticipants] = useState([]);

    useEffect(() => {
        const fetchGroup = async () => {
            const groupRef = doc(db, "groups", id);
            const groupDoc = await getDoc(groupRef);

            if (groupDoc.exists()) {
                setGroup(groupDoc.data());
            } else {
                setGroup(null);
            }
        };

        const fetchParticipants = async () => {
            const usersRef = collection(db, "groups", id, "users");
            const usersSnapshot = await getDocs(usersRef);

            const users = await Promise.all(
                usersSnapshot.docs.map(async (docSnap) => {
                    const userId = docSnap.id;

                    // Leggi i dati aggiornati dal documento globale dell'utente
                    const userRef = doc(db, "users", userId);
                    const userDoc = await getDoc(userRef);

                    return {
                        id: userId,
                        name: docSnap.data().name, // Nome preso dal gruppo (se vuoi puoi prenderlo anche da userDoc)
                        punti: userDoc.exists() ? userDoc.data().punti : 0 // Punti aggiornati da USER
                    };
                })
            );

            // Ordina i partecipanti per punti decrescenti
            users.sort((a, b) => b.punti - a.punti);

            setParticipants(users);
        };

        fetchGroup();
        fetchParticipants();
    }, [id]);

    if (group === null) return <p>Gruppo non trovato o caricamento...</p>;

    return (
        <div className="group-page">
            <h1 className="group-title">{group.name}</h1>
            <h2 className="group-subtitle">Classifica dei partecipanti</h2>

            <div className="group-ranking">
                <ol>
                    {participants.map((user, index) => (
                        <li key={user.id} className={`group-item ${user.id === auth.currentUser.uid ? "me" : ""}`}>
                            <div className="group-left">
                                <span className="group-position">#{index + 1}</span>
                                <span className="group-user">{user.name ? user.name : `Utente ${user.id}`}</span>
                            </div>
                            <span className="group-score">{user.punti} punti</span>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
}