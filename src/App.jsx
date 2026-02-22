import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Leaderboard from './pages/Leaderboard'
import Vote from './pages/Vote'
import Submit from './pages/Submit'
import Profile from './pages/Profile'
import Stats from './pages/Stats'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Vote />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/submit" element={<Submit />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
    </>
  )
}

export default App
