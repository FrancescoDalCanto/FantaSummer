import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./App"; // La pagina principale con i pulsanti Registrati/Login
import User from "./User";
import { RedirectProvider } from "./RedirectContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <RedirectProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/user" element={<User />} />
        </Routes>
      </RedirectProvider>
    </BrowserRouter>
  </React.StrictMode>
);