import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- PASO CLAVE 1: Importar hook

// Cambié el nombre de la función a Home
function Home() { 
    const [serverStatus, setServerStatus] = useState('Checking...');
    const navigate = useNavigate(); // <-- PASO CLAVE 2: Inicializar hook

    // ----------------------------------------------------
    // NUEVA FUNCIÓN: Maneja el click del botón
    const handleSearchClick = () => {
        // Redirige a la ruta donde se listarán los restaurantes
        navigate('/restaurants'); 
    };
    // ----------------------------------------------------

    useEffect(() => {
        // Usamos la ruta proxy (mejor práctica)
        fetch('/api/health') 
            .then(res => res.json())
            .then(data => setServerStatus(data.message))
            .catch(err => {
                console.error(err);
                setServerStatus('Error connecting to server');
            });
    }, []);

    return (
        // ... (Tu JSX de la landing page)

        <div className="space-y-3">
          <button 
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            onClick={handleSearchClick} // <-- PASO CLAVE 3: Conectar la función
          >
            Buscar Restaurantes
          </button>
          
          {/* El botón de Iniciar Sesión también necesita un onClick */}
          <button className="w-full border-2 border-indigo-600 text-indigo-600 py-3 px-6 rounded-xl hover:bg-indigo-50 transition-all duration-300 font-semibold">
            Iniciar Sesión
          </button>
        </div>

        // ...
    );
}

export default Home; // Asegúrate de exportar 'Home'