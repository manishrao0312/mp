import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import your two pages
import Home from './Home';
import TryOn from './tryon';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Route 1: The Landing Page (Home) */}
        <Route path="/" element={<Home />} />
        
        {/* Route 2: The Try-On Tool */}
        <Route path="/tryon" element={<TryOn />} />
      </Routes>
    </Router>
  );
};

export default App;