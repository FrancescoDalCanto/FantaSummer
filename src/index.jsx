// Viene chiamato in maniera automatica da firebase quando viene caricata una immagine

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const vision = require("@google-cloud/vision");

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();

// Crea client Vision
const client = new vision.ImageAnnotatorClient();

exports.validateQuestImage = functions.storage.object().onFinalize(async (object) => {
    const filePath = object.name;

    console.log("Nuova immagine caricata:", filePath);

    if (!filePath.startsWith("quest_proofs/")) {
        console.log("Non è un'immagine di quest → ignoro");
        return null;
    }

    // Estrai dati dal path (quest_proofs/{groupId}/{questId}/{userId}.jpg)
    const pathParts = filePath.split("/");
    const groupId = pathParts[1];
    const questId = pathParts[2];
    const userIdWithExt = pathParts[3];
    const userId = userIdWithExt.replace(".jpg", "");

    const bucket = storage.bucket(object.bucket);
    const file = bucket.file(filePath);

    // Ottieni URL temporaneo
    const [url] = await file.getSignedUrl({
        action: "read",
        expires: Date.now() + 5 * 60 * 1000, // 5 minuti
    });

    console.log("Analizzo immagine via Vision AI:", url);

    // Analizza immagine
    const [result] = await client.labelDetection(url);
    const labels = result.labelAnnotations.map(label => label.description.toLowerCase());

    console.log("Label trovate:", labels);

    // Esempio → se contiene "pizza" → approvato
    const isApproved = labels.includes("pizza") || labels.includes("microphone");

    const questRef = db.collection("users").doc(userId).collection("quests").doc(questId);

    const questSnap = await questRef.get();

    if (!questSnap.exists) {
        console.log("Quest non trovata");
        return null;
    }

    const questData = questSnap.data();

    // Calcola punti (esempio base)
    const difficulty = questData.difficulty || "medium";
    let points = 0;

    if (isApproved) {
        if (difficulty === "easy") points = 5;
        else if (difficulty === "medium") points = 10;
        else if (difficulty === "hard") points = 20;
    }

    await questRef.set({
        ...questData,
        status: isApproved ? "approved" : "rejected",
        points
    });

    // Aggiorna punti utente se approvata
    if (isApproved) {
        const userRef = db.collection("users").doc(userId);
        const userSnap = await userRef.get();
        const userPoints = userSnap.exists ? (userSnap.data().punti || 0) : 0;

        await userRef.set({
            punti: userPoints + points
        }, { merge: true });
    }

    console.log("Quest aggiornata:", isApproved ? "Approved" : "Rejected");

    return null;
});