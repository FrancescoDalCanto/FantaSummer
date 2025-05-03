import { useState } from "react";
import Popup from "./Popup";
import "./css/App.css";

export default function App() {

  const [popupMode, setPopupMode] = useState(null);

  const handleOpen = (mode) => {
    setPopupMode(mode);
  };

  const handleClose = () => {
    setPopupMode(null);
  };

  return (
    <div className="app-container">

      <h1 className="app-title">Fanta Summer</h1>

      <div className="logo-container">
        <img
          src="/IMG_5394.jpeg"
          alt="Logo Fanta Summer"
          className="logo-image"
        />
      </div>

      <div className="buttons-container">
        <button
          onClick={() => handleOpen("Register")}
          className="button register-button"
        >
          Registrati
        </button>
        <button
          onClick={() => handleOpen("Login")}
          className="button login-button"
        >
          Login
        </button>
      </div>

      <div className="footer">
        <span>Creato da </span>
        <a
          href="https://instagram.com/antonio.ciuffo"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          @antonio.ciuffo
        </a>
        <span> e </span>
        <a
          href="https://instagram.com/francesco.dalcanto"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          @francesco.dalcanto
        </a>
      </div>

      {popupMode && (
        <Popup
          type={popupMode}
          onClose={handleClose}
        />
      )}
    </div>
  )
}