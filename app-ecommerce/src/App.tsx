// import { useState } from 'react'

// Ejemplo de import de la libreria React Router Dom
import { HashRouter, Routes } from "react-router-dom";
//Route
import './App.css'

function App() {


  return (
    <>
      <h1>Pagina principal</h1>
      <HashRouter>
        <Routes>
          {/* <Route path="/" element={<Home />} /> */}
        </Routes>

      </HashRouter>
    </>
  )
}

export default App
