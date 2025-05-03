import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import quests from "./quests.json";
import QuestPopup from "./QuestPopup";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";

//TODO: quando accettata o rifiutata deve modificare i punti.

export default function DailyQuestManager() {
    const [showQuest, setShowQuest] = useState(false);
    const [selectedQuest, setSelectedQuest] = useState(null);
    const [user, loading] = useAuthState(auth);
    const navigate = useNavigate();

    // Modalità debug per test (disattivata in produzione)
    const debugMode = false;

    useEffect(() => {
        console.log("[DailyQuestManager] Component mounted");

        if (loading) {
            console.log("[DailyQuestManager] Waiting for user loading...");
            return;
        }

        if (!user) {
            console.log("[DailyQuestManager] No user logged in → skipping quest.");
            return;
        }

        const checkQuest = async () => {
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);
            const today = new Date().toISOString().split("T")[0];
            let lastQuestDate = "";

            if (!userDoc.exists()) {
                console.log("[DailyQuestManager] User document does not exist → creating.");
                await setDoc(userRef, {
                    punti: 0,
                    lastQuestDate: ""
                });
            } else {
                lastQuestDate = userDoc.data().lastQuestDate || "";
            }

            console.log("[DailyQuestManager] Last quest date:", lastQuestDate, "Today:", today);

            if (!debugMode && lastQuestDate === today) {
                console.log("[DailyQuestManager] Quest already shown today → skipping.");
                return;
            }

            const quest = quests[Math.floor(Math.random() * quests.length)];
            setSelectedQuest(quest);
            setShowQuest(true);

            await setDoc(userRef, {
                lastQuestDate: today
            }, { merge: true });

            console.log("[DailyQuestManager] Showing quest:", quest.text);
        };

        checkQuest();
    }, [user, loading]);

    const handleAccept = async () => {
        setShowQuest(false);

        const groupsSnapshot = await getDocs(collection(db, "groups"));
        let userGroupId = null;

        for (const groupDoc of groupsSnapshot.docs) {
            const userDoc = await getDoc(doc(db, "groups", groupDoc.id, "users", auth.currentUser.uid));
            if (userDoc.exists()) {
                userGroupId = groupDoc.id;
                break;
            }
        }

        if (!userGroupId) {
            alert("Nessun gruppo trovato! Non puoi accettare la quest.");
            return;
        }

        navigate(`/questsubmit/${userGroupId}/${selectedQuest.id}`);
    };

    const handleReject = async () => {
        setShowQuest(false);

        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        const currentPoints = userDoc.exists() ? userDoc.data().punti || 0 : 0;

        await setDoc(userRef, {
            punti: currentPoints - 5
        }, { merge: true });

        console.log("[DailyQuestManager] Quest rejected → -5 punti");
    };

    if (loading) return null;
    if (!showQuest || !selectedQuest) return null;

    return (
        <QuestPopup
            quest={selectedQuest}
            onAccept={handleAccept}
            onReject={handleReject}
        />
    );
}