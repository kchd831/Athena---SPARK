import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CrossIndustry from './pages/CrossIndustry'
import CoBranding from './pages/CoBranding'
import Campaign from './pages/Campaign'
import CaseLibrary from './pages/CaseLibrary'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cross" element={<CrossIndustry />} />
        <Route path="/cobrand" element={<CoBranding />} />
        <Route path="/campaign" element={<Campaign />} />
        <Route path="/cases" element={<CaseLibrary />} />
      </Routes>
    </BrowserRouter>
  )
}
