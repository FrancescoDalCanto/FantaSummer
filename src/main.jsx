import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./App";
import User from "./User";
import GroupPage from "./GroupPage";
import QuestSubmit from "./QuestSubmit";
import MyQuestDashboard from "./MyQuestDashboard";
import AdminQuestApproval from "./AdminQuestApproval";
import { RedirectProvider } from "./RedirectContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <RedirectProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/user" element={<User />} />
          <Route path="/group/:id" element={<GroupPage />} />
          <Route path="/questsubmit/:groupId/:questId" element={<QuestSubmit />} />
          <Route path="/my-proofs" element={<MyQuestDashboard />} />
          <Route path="/admin/quests" element={<AdminQuestApproval />} />
        </Routes>
      </RedirectProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Service Worker (opzionale)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered:', registration);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}