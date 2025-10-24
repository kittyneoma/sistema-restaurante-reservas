import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import RestaurantList from './pages/RestaurantList'; // Componente que creamos en el paso anterior

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta principal: Muestra el componente Home */}
        <Route path="/" element={<Home />} />
        
        {/* Nueva ruta: Muestra la lista de restaurantes */}
        <Route path="/restaurants" element={<RestaurantList />} />
        
        {/* Placeholder para otras rutas */}
        <Route path="/login" element={<div>Página de Login</div>} />
      </Routes>
    </Router>
  );
}

export default App;