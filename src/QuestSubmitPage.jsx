import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./css/QuestSubmitPage.css";

export default function QuestSubmitPage() {
    const { groupId, questId } = useParams();
    const navigate = useNavigate();
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);

    const storage = getStorage();

    const handleSubmit = async () => {
        if (!image) return;

        setUploading(true);

        try {
            const storageRef = ref(storage, `quest_proofs/${groupId}/${questId}/${auth.currentUser.uid}.jpg`);
            await uploadBytes(storageRef, image);
            const downloadUrl = await getDownloadURL(storageRef);

            // Salva su Firestore
            const questRef = doc(db, "users", auth.currentUser.uid, "quests", questId);
            await setDoc(questRef, {
                questId,
                groupId,
                proofImageUrl: downloadUrl,
                status: "pending",
                uploadedAt: new Date()
            });

            alert("Prova inviata con successo!");
            navigate("/user");
        } catch (err) {
            console.error("Errore durante l'invio:", err);
            alert("Errore durante l'invio. Riprova.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="quest-submit-page">
            <h1>Carica la prova della quest</h1>

            <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
            />

            <button onClick={handleSubmit} disabled={!image || uploading}>
                {uploading ? "Caricamento..." : "Invia prova"}
            </button>
        </div>
    );
}