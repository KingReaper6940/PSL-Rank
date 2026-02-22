import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Swords, Trophy, UserPlus, BarChart3, Menu, X } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

export default function Navbar() {
    const location = useLocation()
    const [mobileOpen, setMobileOpen] = useState(false)
    const stats = useQuery(api.moggers?.getStats) || { totalVotes: 0 }

    useEffect(() => {
        setMobileOpen(false)
    }, [location.pathname])

    const links = [
        { to: '/', label: 'Battle', icon: <Swords size={16} /> },
        { to: '/leaderboard', label: 'Leaderboard', icon: <Trophy size={16} /> },
        { to: '/submit', label: 'Add Mogger', icon: <UserPlus size={16} /> },
        { to: '/stats', label: 'Stats', icon: <BarChart3 size={16} /> },
    ]

    return (
        <nav className="navbar" aria-label="Primary navigation">
            <div className="container navbar-inner">
                <Link to="/" className="nav-logo" onClick={() => setMobileOpen(false)}>
                    <img
                        src="/logo.png"
                        alt="PSL Rank Logo"
                        className="nav-logo-icon"
                    />
                    <span className="nav-logo-stack">
                        <span className="nav-logo-title">PSL RANK</span>
                        <span className="nav-logo-subtitle">Global Leaderboard</span>
                    </span>
                </Link>

                <ul id="primary-nav-links" className={`nav-links ${mobileOpen ? 'open' : ''}`}>
                    {links.map(link => (
                        <li key={link.to}>
                            <Link
                                to={link.to}
                                className={location.pathname === link.to ? 'active' : ''}
                                aria-current={location.pathname === link.to ? 'page' : undefined}
                            >
                                <span className="nav-link-inner">
                                    {link.icon}
                                    {link.label}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="nav-right">
                    <div className="nav-kpi" aria-label="Total battles">
                        <div className="nav-kpi-label">
                            Battles
                        </div>
                        <div className="nav-kpi-value">
                            {(stats.totalVotes || 0).toLocaleString()}
                        </div>
                    </div>
                    <button
                        className="nav-mobile-toggle"
                        type="button"
                        aria-controls="primary-nav-links"
                        aria-expanded={mobileOpen}
                        aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>
        </nav>
    )
}
