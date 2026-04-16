import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Overview from './pages/Overview'
import Analysis from './pages/Analysis'
import Managers from './pages/Managers'
import Funds from './pages/Funds'
import Workflow from './pages/Workflow'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Overview />} />
        <Route path="analysis" element={<Analysis />} />
        <Route path="managers" element={<Managers />} />
        <Route path="funds" element={<Funds />} />
        <Route path="workflow" element={<Workflow />} />
      </Route>
    </Routes>
  )
}
