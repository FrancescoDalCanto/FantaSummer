import React, { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import "./css/MyQuestDashboard.css";

export default function MyQuestDashboard() {
    const [quests, setQuests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuests = async () => {
            if (!auth.currentUser) return;

            const groupsSnapshot = await getDocs(collection(db, "groups"));
            const allQuests = [];

            for (const groupDoc of groupsSnapshot.docs) {
                const questsSnapshot = await getDocs(collection(db, "groups", groupDoc.id, "quests"));

                questsSnapshot.forEach(docQuest => {
                    const quest = docQuest.data();
                    if (quest.userId === auth.currentUser.uid) {
                        allQuests.push({
                            id: docQuest.id,
                            groupId: groupDoc.id,
                            ...quest
                        });
                    }
                });
            }

            setQuests(allQuests);
            setLoading(false);
        };

        fetchQuests();
    }, []);

    if (loading) return <p>Caricamento...</p>;

    return (
        <div className="my-quest-dashboard">
            <h1>Le mie Quest inviate</h1>
            {quests.length === 0 ? (
                <p>Non hai ancora inviato nessuna quest.</p>
            ) : (
                quests.map(quest => (
                    <div key={quest.id} className={`quest-item ${quest.status}`}>
                        <h3>Quest ID: {quest.id}</h3>
                        <p><strong>Gruppo:</strong> {quest.groupId}</p>
                        <p><strong>Status:</strong> {quest.status}</p>
                        <p><strong>Punti assegnati:</strong> {quest.points || 0}</p>
                        <img src={quest.photoURL || quest.proofImageUrl} alt="Prova" />
                    </div>
                ))
            )}
        </div>
    );
}