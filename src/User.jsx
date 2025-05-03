import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";
import CreateGroupPopup from "./CreateGroupPopup";
import JoinGroupPopup from "./JoinGroupPopup";
import DailyQuestManager from "./DailyQuestManager";
import "./css/User.css";



export default function User() {
    const [groups, setGroups] = useState([]);
    const [showCreatePopup, setShowCreatePopup] = useState(false);
    const [showJoinPopup, setShowJoinPopup] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const groupsRef = collection(db, "groups");

        const unsubscribe = onSnapshot(groupsRef, async (snapshot) => {
            const groupsData = [];

            for (const groupDoc of snapshot.docs) {
                const group = groupDoc.data();
                const groupId = groupDoc.id;

                const isCreator = group.createdBy === auth.currentUser.uid;
                const userDoc = await getDoc(doc(db, "groups", groupId, "users", auth.currentUser.uid));
                const isParticipant = userDoc.exists();

                let userPunti = 0;

                if (isParticipant) {
                    // Prendi i punti aggiornati da USER (users/{userId})
                    const userGlobalDoc = await getDoc(doc(db, "users", auth.currentUser.uid));

                    if (userGlobalDoc.exists()) {
                        userPunti = userGlobalDoc.data().punti;
                    }
                }

                if (isCreator || isParticipant) {
                    groupsData.push({
                        id: groupId,
                        name: group.name,
                        score: userPunti
                    });
                }
            }

            setGroups(groupsData);
        });

        return () => unsubscribe();
    }, []);

    const handleGroupClick = (groupId) => {
        navigate(`/group/${groupId}`);
    };

    return (
        <div className="user-page">
            {/* QUEST MANAGER (IMPORTANTISSIMO!) */}
            <DailyQuestManager />

            <h1 className="user-title">I tuoi gruppi</h1>

            <div className="user-actions">
                <button
                    className="user-button create-button"
                    onClick={() => setShowCreatePopup(true)}
                >
                    Crea nuovo gruppo
                </button>
                <button
                    className="user-button join-button"
                    onClick={() => setShowJoinPopup(true)}
                >
                    Unisciti a un gruppo
                </button>
            </div>

            <div className="user-group-container">
                <ul className="user-group-list">
                    {groups.map((group) => (
                        <li
                            key={group.id}
                            className="user-group-item"
                            onClick={() => handleGroupClick(group.id)}
                            style={{ cursor: "pointer" }}
                        >
                            <div className="group-info">
                                <h3 className="group-name">{group.name}</h3>
                            </div>
                            <div className="group-score">{group.score} punti</div>
                        </li>
                    ))}
                </ul>
            </div>

            {showCreatePopup && <CreateGroupPopup onClose={() => setShowCreatePopup(false)} />}
            {showJoinPopup && <JoinGroupPopup onClose={() => setShowJoinPopup(false)} />}
        </div>
    );
}