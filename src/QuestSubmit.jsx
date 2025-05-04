import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "./firebase";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import "./css/QuestSubmit.css";

export default function QuestSubmit() {
    const { groupId, questId } = useParams();
    const navigate = useNavigate();
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [existingProofUrl, setExistingProofUrl] = useState(null);

    const storage = getStorage();

    // Carica la prova esistente (se c'è)
    useEffect(() => {
        const fetchProof = async () => {
            if (!auth.currentUser) return;

            const questRef = doc(db, "users", auth.currentUser.uid, "quests", questId);
            const questSnap = await getDoc(questRef);
            if (questSnap.exists()) {
                setExistingProofUrl(questSnap.data().proofImageUrl);
            }
        };

        fetchProof();
    }, [questId]);

    const handleSubmit = async () => {
        if (!image || !auth.currentUser) return;

        setUploading(true);

        try {
            const storageRef = ref(storage, `quest_proofs/${groupId}/${questId}/${auth.currentUser.uid}.jpg`);
            await uploadBytes(storageRef, image);
            const downloadUrl = await getDownloadURL(storageRef);

            const questRef = doc(db, "users", auth.currentUser.uid, "quests", questId);
            await setDoc(questRef, {
                questId,
                groupId,
                proofImageUrl: downloadUrl,
                status: "pending",
                uploadedAt: new Date(),
                uploadedBy: auth.currentUser.uid,
                imageName: image.name,
                imageSize: image.size,
                imageType: image.type
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

    const handleRemoveProof = async () => {
        if (!existingProofUrl || !auth.currentUser) return;

        const storageRef = ref(storage, `quest_proofs/${groupId}/${questId}/${auth.currentUser.uid}.jpg`);
        await deleteObject(storageRef);

        const questRef = doc(db, "users", auth.currentUser.uid, "quests", questId);
        await deleteDoc(questRef);

        setExistingProofUrl(null);
        alert("Prova rimossa. Ora puoi caricarne una nuova.");
    };

    return (
        <div className="quest-submit-page">
            <h1>Carica la prova della quest</h1>

            {existingProofUrl ? (
                <div>
                    <h3>Prova già inviata:</h3>
                    <img src={existingProofUrl} alt="Prova inviata" style={{ maxWidth: "300px" }} />
                    <br />
                    <button onClick={handleRemoveProof}>Rimuovi prova</button>
                </div>
            ) : (
                <>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                    />
                    {image && (
                        <div>
                            <h3>Anteprima:</h3>
                            <img src={URL.createObjectURL(image)} alt="Anteprima" style={{ maxWidth: "300px" }} />
                        </div>
                    )}
                    <br />
                    <button onClick={handleSubmit} disabled={!image || uploading}>
                        {uploading ? "Caricamento..." : "Invia prova"}
                    </button>
                </>
            )}
        </div>
    );
}