import { useState, useEffect } from 'react';

function App() {
  const [serverStatus, setServerStatus] = useState('Checking...');

  useEffect(() => {
    fetch('http://localhost:5000/api/health')
      .then(res => res.json())
      .then(data => setServerStatus(data.message))
      .catch(err => setServerStatus('❌ Error connecting to server'));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-100">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🍽️</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Restaurant Booking
          </h1>
          <p className="text-gray-500">
            Sistema de Reservas para Restaurantes
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-6">
          <p className="text-sm text-gray-600 font-medium mb-2">
            Estado del servidor:
          </p>
          <p className="text-lg text-indigo-700 font-bold">
            {serverStatus}
          </p>
        </div>

        <div className="space-y-3">
          <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            Buscar Restaurantes
          </button>
          <button className="w-full border-2 border-indigo-600 text-indigo-600 py-3 px-6 rounded-xl hover:bg-indigo-50 transition-all duration-300 font-semibold">
            Iniciar Sesión
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Proyecto Individual - 2 Semanas
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;