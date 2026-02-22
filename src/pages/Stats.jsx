import { Users, Swords, Award, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import { getTier } from '../utils/elo'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

export default function Stats() {
    const moggersData = useQuery(api.moggers?.getMoggers);
    const moggers = moggersData || [];
    const statsData = useQuery(api.moggers?.getStats);
    const stats = statsData || { totalVotes: 0 };
    const matchesData = useQuery(api.moggers?.getMatches);
    const matches = matchesData || [];

    const totalMoggers = moggers.length;
    const totalVotes = (stats.localVotes || 0) + (stats.externalVotes || 0);
    const avgElo = totalMoggers > 0 ? Math.round(moggers.reduce((s, m) => s + m.elo, 0) / totalMoggers) : 0;
    const highestElo = totalMoggers > 0 ? Math.max(...moggers.map(m => m.elo)) : 0;
    const lowestElo = totalMoggers > 0 ? Math.min(...moggers.map(m => m.elo)) : 0;

    // Tier distribution
    const tierCounts = { S: 0, A: 0, B: 0, C: 0, D: 0 };
    moggers.forEach(m => {
        const t = getTier(m.elo).tier;
        tierCounts[t]++;
    });

    const tierColors = {
        S: 'var(--gold-primary)',
        A: 'var(--silver-primary)',
        B: 'var(--bronze-primary)',
        C: 'var(--text-secondary)',
        D: 'var(--text-tertiary)',
    };

    // Top risers & fallers (based on eloHistory)
    const moggersWithChange = moggers
        .filter(m => m.eloHistory && m.eloHistory.length >= 2)
        .map(m => ({
            ...m,
            change: m.eloHistory[m.eloHistory.length - 1] - m.eloHistory[m.eloHistory.length - 2],
        }));

    const topRisers = [...moggersWithChange].sort((a, b) => b.change - a.change).slice(0, 5).filter(m => m.change > 0);
    const topFallers = [...moggersWithChange].sort((a, b) => a.change - b.change).slice(0, 5).filter(m => m.change < 0);

    // Most voted (by total matches)
    const mostVoted = [...moggers].sort((a, b) => (b.wins + b.losses) - (a.wins + a.losses)).slice(0, 5);

    if (moggersData === undefined || statsData === undefined) {
        return <div className="page"><div className="page-loader"><div className="spinner"></div></div></div>;
    }

    return (
        <div className="page">
            <div className="container">
                <div className="page-header animate-fade-in">
                    <h1 className="page-title text-gradient">STATISTICS</h1>
                    <p className="page-subtitle">Data and analytics across all contenders.</p>
                </div>

                {/* Overview Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    <div className="glass-panel animate-slide-up stagger-1" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}><Users size={24} /></div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2.2rem', marginBottom: '4px', color: 'var(--text-primary)' }}>{totalMoggers}</div>
                        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', fontWeight: 600 }}>Total Global Contenders</div>
                    </div>
                    <div className="glass-panel animate-slide-up stagger-2" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ marginBottom: '12px', color: 'var(--accent-success)' }}><Users size={24} /></div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2.2rem', marginBottom: '4px', color: 'var(--text-primary)' }}>{stats.authenticMoggers || 0}</div>
                        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', fontWeight: 600 }}>Submitted by Real Users</div>
                    </div>
                    <div className="glass-panel animate-slide-up stagger-3" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}><Swords size={24} /></div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2.2rem', marginBottom: '4px', color: 'var(--text-primary)' }}>{totalVotes.toLocaleString()}</div>
                        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', fontWeight: 600 }}>Total Battles</div>
                    </div>
                    <div className="glass-panel animate-slide-up stagger-3" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}><BarChart3 size={24} /></div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2.2rem', marginBottom: '4px', color: 'var(--text-primary)' }}>{avgElo}</div>
                        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', fontWeight: 600 }}>Average ELO</div>
                    </div>
                    <div className="glass-panel animate-slide-up stagger-5" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}><Award size={24} /></div>
                        <div className="text-gradient-gold" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2.2rem', marginBottom: '4px' }}>{highestElo}</div>
                        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', fontWeight: 600 }}>Highest ELO</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                    {/* Tier Distribution */}
                    <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-lg)' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '24px', fontSize: '1.25rem' }}>
                            Tier Distribution
                        </h3>
                        {Object.entries(tierCounts).map(([tier, count]) => (
                            <div key={tier} style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                                    <span style={{ color: tierColors[tier] }}>{tier} Tier</span>
                                    <span style={{ color: 'var(--text-tertiary)' }}>{count} {count !== 1 ? 'Contenders' : 'Contender'}</span>
                                </div>
                                <div style={{ height: '10px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                                    <div
                                        style={{
                                            height: '100%',
                                            width: `${totalMoggers > 0 ? (count / totalMoggers) * 100 : 0}%`,
                                            background: tierColors[tier],
                                            borderRadius: 'var(--radius-full)',
                                            transition: 'width 1s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Most Active */}
                    <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-lg)' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '24px', fontSize: '1.25rem' }}>
                            Most Battled
                        </h3>
                        {mostVoted.map((m, i) => (
                            <div key={m._id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                padding: '12px 0',
                                borderBottom: i < mostVoted.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                            }}>
                                <span style={{ color: 'var(--text-tertiary)', fontWeight: 700, width: '24px' }}>#{i + 1}</span>
                                <span style={{ flex: 1, fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</span>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                    {m.wins + m.losses} matches
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
                    {/* Top Risers */}
                    <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-lg)' }}>
                        <h3 style={{
                            fontFamily: 'var(--font-display)',
                            fontWeight: 700,
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '1.25rem'
                        }}>
                            <TrendingUp size={20} style={{ color: 'var(--accent-success)' }} />
                            Top Risers
                        </h3>
                        {topRisers.length > 0 ? topRisers.map((m, i) => (
                            <div key={m._id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                padding: '12px 0',
                                borderBottom: i < topRisers.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                            }}>
                                <span style={{ flex: 1, fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</span>
                                <span style={{ color: 'var(--accent-success)', fontWeight: 700 }}>+{m.change}</span>
                            </div>
                        )) : (
                            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>Vote to see trends</div>
                        )}
                    </div>

                    {/* Top Fallers */}
                    <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-lg)' }}>
                        <h3 style={{
                            fontFamily: 'var(--font-display)',
                            fontWeight: 700,
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '1.25rem'
                        }}>
                            <TrendingDown size={20} style={{ color: 'var(--accent-danger)' }} />
                            Biggest Fallers
                        </h3>
                        {topFallers.length > 0 ? topFallers.map((m, i) => (
                            <div key={m._id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                padding: '12px 0',
                                borderBottom: i < topFallers.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                            }}>
                                <span style={{ flex: 1, fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</span>
                                <span style={{ color: 'var(--accent-danger)', fontWeight: 700 }}>{m.change}</span>
                            </div>
                        )) : (
                            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>Vote to see trends</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
