// ✅ QUESTPOPUP COMPONENT
import React from "react";
import "./css/QuestPopup.css";

export default function QuestPopup({ quest, onAccept, onReject }) {
    return (
        <div className="quest-popup-overlay">
            <div className="quest-popup-container">
                <h2 className="quest-popup-title">Quest del giorno</h2>
                <p className="quest-popup-text">{quest.text}</p>

                <div className="quest-popup-actions">
                    <button onClick={onReject} className="quest-popup-button reject">Rifiuta (-5 punti)</button>
                    <button onClick={onAccept} className="quest-popup-button accept">Accetta</button>
                </div>
            </div>
        </div>
    );
}