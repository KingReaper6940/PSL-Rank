import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { getTier } from '../utils/elo'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

export default function Leaderboard() {
    const [search, setSearch] = useState('');
    const [tierFilter, setTierFilter] = useState('ALL');
    const [sortBy, setSortBy] = useState('elo');

    const allMoggersData = useQuery(api.moggers?.getMoggers);
    const allMoggers = allMoggersData || [];

    const sorted = useMemo(() => {
        let list = [...allMoggers];

        // Filter by search
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(m =>
                m.name.toLowerCase().includes(q) ||
                (m.alias && m.alias.toLowerCase().includes(q))
            );
        }

        // Filter by tier
        if (tierFilter !== 'ALL') {
            list = list.filter(m => getTier(m.elo).tier === tierFilter);
        }

        // Sort
        list.sort((a, b) => {
            if (sortBy === 'elo') return b.elo - a.elo;
            if (sortBy === 'wins') return b.wins - a.wins;
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'winrate') {
                const wrA = a.wins + a.losses > 0 ? a.wins / (a.wins + a.losses) : 0;
                const wrB = b.wins + b.losses > 0 ? b.wins / (b.wins + b.losses) : 0;
                return wrB - wrA;
            }
            return b.elo - a.elo;
        });

        return list;
    }, [allMoggers, search, tierFilter, sortBy]);

    // Top 3 for podium (only when no filters active)
    const showPodium = !search && tierFilter === 'ALL' && sortBy === 'elo';
    const top3 = showPodium ? sorted.slice(0, 3) : [];
    const rest = showPodium ? sorted.slice(3) : sorted;

    const handleImageError = (e) => {
        e.target.style.display = 'none';
        const fallback = e.target.nextElementSibling;
        if (fallback) fallback.style.display = 'flex';
    };

    const getTrend = (mogger) => {
        if (!mogger.eloHistory || mogger.eloHistory.length < 2) return 'neutral';
        const last = mogger.eloHistory[mogger.eloHistory.length - 1];
        const prev = mogger.eloHistory[mogger.eloHistory.length - 2];
        if (last > prev) return 'up';
        if (last < prev) return 'down';
        return 'neutral';
    };

    if (allMoggersData === undefined) {
        return <div className="page"><div className="page-loader"><div className="spinner"></div></div></div>;
    }

    return (
        <div className="page">
            <div className="container">
                <div className="page-header animate-fade-in">
                    <h1 className="page-title text-gradient">LEADERBOARD</h1>
                    <p className="page-subtitle">The definitive ranking of every contender.</p>
                </div>

                {/* Podium for Top 3 */}
                {showPodium && top3.length >= 3 && (
                    <div className="podium-section animate-fade-in stagger-2">
                        {/* 2nd place */}
                        <Link to={`/profile/${top3[1]._id}`} className="podium-card rank-2 animate-slide-up stagger-1" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="podium-rank-badge">#2</div>
                            <div className="podium-avatar-wrap">
                                <img src={top3[1].image} alt={top3[1].name} className="podium-avatar" onError={handleImageError} />
                                <div className="avatar-fallback" style={{ display: 'none', width: '100%', height: '100%', position: 'absolute', inset: 0, borderRadius: 'var(--radius-full)', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface-elevated)', fontSize: '2rem', fontWeight: 'bold' }}>
                                    {top3[1].name.charAt(0)}
                                </div>
                            </div>
                            <div className="podium-name">{top3[1].name}</div>
                            <div className="podium-elo">{top3[1].elo} ELO</div>
                        </Link>

                        {/* 1st place */}
                        <Link to={`/profile/${top3[0]._id}`} className="podium-card rank-1 animate-slide-up" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="podium-rank-badge">#1</div>
                            <div className="podium-avatar-wrap" style={{ transform: 'scale(1.1)', marginBottom: '24px' }}>
                                <img src={top3[0].image} alt={top3[0].name} className="podium-avatar" onError={handleImageError} />
                                <div className="avatar-fallback" style={{ display: 'none', width: '100%', height: '100%', position: 'absolute', inset: 0, borderRadius: 'var(--radius-full)', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface-elevated)', fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--gold-primary)', border: '2px solid var(--gold-primary)' }}>
                                    {top3[0].name.charAt(0)}
                                </div>
                            </div>
                            <div className="podium-name text-gradient-gold">{top3[0].name}</div>
                            <div className="podium-elo">{top3[0].elo} ELO</div>
                        </Link>

                        {/* 3rd place */}
                        <Link to={`/profile/${top3[2]._id}`} className="podium-card rank-3 animate-slide-up stagger-3" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="podium-rank-badge">#3</div>
                            <div className="podium-avatar-wrap">
                                <img src={top3[2].image} alt={top3[2].name} className="podium-avatar" onError={handleImageError} />
                                <div className="avatar-fallback" style={{ display: 'none', width: '100%', height: '100%', position: 'absolute', inset: 0, borderRadius: 'var(--radius-full)', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface-elevated)', fontSize: '2rem', fontWeight: 'bold' }}>
                                    {top3[2].name.charAt(0)}
                                </div>
                            </div>
                            <div className="podium-name">{top3[2].name}</div>
                            <div className="podium-elo">{top3[2].elo} ELO</div>
                        </Link>
                    </div>
                )}

                {/* Controls */}
                <div className="leaderboard-controls animate-fade-in stagger-4">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search contenders..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <select
                            value={tierFilter}
                            onChange={(e) => setTierFilter(e.target.value)}
                            style={{
                                padding: '10px 16px',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-subtle)',
                                background: 'var(--bg-surface)',
                                color: 'var(--text-primary)',
                                fontFamily: 'var(--font-body)',
                                fontSize: '0.9rem',
                                outline: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            <option value="ALL">All Tiers</option>
                            <option value="S">S Tier</option>
                            <option value="A">A Tier</option>
                            <option value="B">B Tier</option>
                            <option value="C">C Tier</option>
                            <option value="D">D Tier</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{
                                padding: '10px 16px',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-subtle)',
                                background: 'var(--bg-surface)',
                                color: 'var(--text-primary)',
                                fontFamily: 'var(--font-body)',
                                fontSize: '0.9rem',
                                outline: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            <option value="elo">Sort by ELO</option>
                            <option value="wins">Sort by Wins</option>
                            <option value="winrate">Sort by Win Rate</option>
                            <option value="name">Sort by Name</option>
                        </select>
                    </div>
                </div>

                {/* Table Header */}
                <div className="leaderboard-row header animate-fade-in stagger-5">
                    <div className="col-rank"><span>#</span></div>
                    <div className="col-mogger"><span>Contender</span></div>
                    <div className="col-elo"><span>ELO</span></div>
                    <div className="col-tier"><span>Tier</span></div>
                    <div className="col-record"><span>Record</span></div>
                    <div style={{ width: '40px', textAlign: 'center' }}><span></span></div>
                </div>

                {/* Table Rows */}
                <div className="leaderboard-table">
                    {rest.map((mogger, index) => {
                        const globalRank = showPodium ? index + 4 : index + 1;
                        const tier = getTier(mogger.elo);
                        const trend = getTrend(mogger);
                        const winRate = mogger.wins + mogger.losses > 0
                            ? Math.round((mogger.wins / (mogger.wins + mogger.losses)) * 100)
                            : 0;

                        return (
                            <Link
                                to={`/profile/${mogger._id}`}
                                key={mogger._id}
                                className="leaderboard-row animate-slide-up"
                                style={{ animationDelay: `${Math.min(index * 0.02, 0.3)}s` }}
                            >
                                <div className="col-rank">
                                    <span className="rank-number">{globalRank}</span>
                                </div>

                                <div className="col-mogger">
                                    <div style={{ position: 'relative', width: 40, height: 40 }}>
                                        <img
                                            src={mogger.image}
                                            alt={mogger.name}
                                            className="mogger-avatar-sm"
                                            onError={handleImageError}
                                        />
                                        <div className="avatar-fallback" style={{ display: 'none', position: 'absolute', inset: 0, borderRadius: 'var(--radius-full)', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface-elevated)', fontSize: '1rem', fontWeight: 'bold' }}>
                                            {mogger.name.charAt(0)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="mogger-name">{mogger.name}</div>
                                        {mogger.alias && <div className="mogger-alias-small">@{mogger.alias}</div>}
                                    </div>
                                </div>

                                <div className="col-elo text-gradient">
                                    {mogger.elo}
                                </div>

                                <div className="col-tier">
                                    <span className={`tier-badge`}>
                                        {tier.label}
                                    </span>
                                </div>

                                <div className="col-record">
                                    <span className="win-loss">
                                        <span className="wins">{mogger.wins}</span> - <span className="losses">{mogger.losses}</span>
                                    </span>
                                    <div style={{ fontSize: '0.75rem', marginTop: 2 }}>{winRate}% WR</div>
                                </div>

                                <div style={{ width: '40px', textAlign: 'center', color: trend === 'up' ? 'var(--accent-success)' : trend === 'down' ? 'var(--accent-danger)' : 'var(--text-tertiary)' }}>
                                    {trend === 'up' && <TrendingUp size={16} />}
                                    {trend === 'down' && <TrendingDown size={16} />}
                                    {trend === 'neutral' && <Minus size={16} />}
                                </div>
                            </Link>
                        );
                    })
                    }

                    {
                        sorted.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-tertiary)' }}>
                                <Search size={32} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                                <p>No contenders found</p>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
}
