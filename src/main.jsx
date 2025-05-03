import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./App";
import User from "./User";
import GroupPage from "./GroupPage";
import QuestSubmitPage from "./QuestSubmitPage";
import { RedirectProvider } from "./RedirectContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <RedirectProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/user" element={<User />} />
          <Route path="/group/:id" element={<GroupPage />} />
          <Route path="/questsubmit/:groupId/:questId" element={<QuestSubmitPage />} />
        </Routes>
      </RedirectProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Service Worker (opzionale se vuoi tenerlo)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered:', registration);
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  });
}