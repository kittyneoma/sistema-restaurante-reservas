// src/pages/RestaurantList.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Asumo que usas axios
// Si no usas axios, cambia las llamadas por fetch, pero axios es más limpio.

const RestaurantList = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                // Llama al endpoint de tu API. El proxy de Vite se encarga de dirigirlo a :5000
                const response = await axios.get('/api/restaurants');
                
                // Asumo que tu backend devuelve { count: N, restaurants: [...] }
                setRestaurants(response.data.restaurants || response.data); 
                setError(null);

            } catch (err) {
                console.error("Error fetching restaurants:", err);
                // Muestra el error de conexión
                setError("No se pudieron cargar los restaurantes. Verifica que el backend esté activo.");
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, []);

    // --- Renderizado de Estados ---
    
    if (loading) {
        return <div className="text-center p-8 text-indigo-600 text-xl">Cargando restaurantes disponibles...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-600 text-xl">⚠️ Error de Conexión: {error}</div>;
    }
    
    if (restaurants.length === 0) {
        return <div className="text-center p-8 text-gray-600 text-xl">No hay restaurantes registrados en este momento.</div>;
    }

    // --- Renderizado de la Lista ---
    return (
        <div className="container mx-auto p-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-8 border-b pb-2">
                Explorar Restaurantes ({restaurants.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {restaurants.map(restaurant => (
                    <div 
                        key={restaurant.id} 
                        className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:scale-[1.02] overflow-hidden"
                    >
                        <div className="p-5">
                            <h3 className="text-2xl font-semibold text-indigo-700 mb-2">{restaurant.name}</h3>
                            <p className="text-gray-600 mb-3 line-clamp-2">{restaurant.description}</p>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Tipo: <span className="font-medium text-purple-600">{restaurant.cuisine_type}</span></span>
                                <span>Rango: <span className="font-medium text-green-600">{restaurant.price_range}</span></span>
                            </div>
                            <p className="mt-2 text-sm text-gray-500">📍 {restaurant.city}</p>
                            
                            <button 
                                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition duration-200"
                                onClick={() => console.log(`Go to reservation for ${restaurant.id}`)}
                            >
                                Reservar Mesa
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RestaurantList;