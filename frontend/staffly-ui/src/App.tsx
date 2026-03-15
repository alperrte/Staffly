import { BrowserRouter, Routes, Route } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import TestPage from "./pages/TestPage"

function App() {

  return (

      <BrowserRouter>

        <Routes>

          <Route path="/" element={<LoginPage />} />

          <Route path="/test" element={<TestPage />} />

        </Routes>

      </BrowserRouter>

  )

}

export default App