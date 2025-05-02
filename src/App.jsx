import { useState } from "react";
import Popup from "./Popup";

export default function App() {

  const [popupMode, setPopupMode] = useState(null);

  const handleOpen = (mode) => {
    setPopupMode(mode);
  };

  const handleClose = () => {
    setPopupMode(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex flex-col items-center justify-center space-y-8 p-6 relative">

      {/* Titolo della webApp */}
      <h1 className="text-4xl font-extrabold text-blue-700">Fanta Summer</h1>

      {/* Immagine del logo */}
      <div className="w-40 h-40 rounded-full overflow-hidden shadow-lg">
        <img
          src="/IMG_5394.jpeg"
          alt="Logo Fanta Summer"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Due pulsanti affiancati */}
      <div className="flex space-x-4">
        <button
          onClick={() => handleOpen("Register")}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition"
        >
          Registrati
        </button>
        <button
          onClick={() => handleOpen("Login")}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition"
        >
          Login
        </button>
      </div>

      {/* Footer con i nomi e link Instagram */}
      <div className="mt-auto text-gray-500 text-sm space-x-2">
        <span>Creato da</span>
        <a
          href="https://instagram.com/antonio.ciuffo"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          @antonio.ciuffo
        </a>
        <span>e</span>
        <a
          href="https://instagram.com/francesco.dalcanto"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          @francesco.dalcanto
        </a>
      </div>

      {/* Popup */}
      {popupMode && (
        <Popup
          type={popupMode}
          onClose={handleClose}
        />
      )}
    </div>
  )
}