import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Swords, Trophy, UserPlus, BarChart3, Menu, X } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

export default function Navbar() {
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const stats = useQuery(api.moggers?.getStats) || { totalVotes: 0 };

    const links = [
        { to: '/', label: 'Battle', icon: <Swords size={16} /> },
        { to: '/leaderboard', label: 'Leaderboard', icon: <Trophy size={16} /> },
        { to: '/submit', label: 'Add Mogger', icon: <UserPlus size={16} /> },
        { to: '/stats', label: 'Stats', icon: <BarChart3 size={16} /> },
    ];

    return (
        <nav className="navbar">
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to="/" className="nav-logo" onClick={() => setMobileOpen(false)}>
                    <img src="/logo.png" alt="PSL Rank Logo" className="nav-logo-icon" style={{ objectFit: 'cover', background: 'transparent', padding: 0 }} />
                    <span>PSL RANK</span>
                </Link>

                <ul className={`nav-links ${mobileOpen ? 'open' : ''}`}>
                    {links.map(link => (
                        <li key={link.to}>
                            <Link
                                to={link.to}
                                className={location.pathname === link.to ? 'active' : ''}
                                onClick={() => setMobileOpen(false)}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                {link.icon}
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Battles
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', lineHeight: 1 }}>
                            {(stats.totalVotes || 0).toLocaleString()}
                        </div>
                    </div>
                    <button
                        className="nav-mobile-toggle"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>
        </nav>
    );
}
