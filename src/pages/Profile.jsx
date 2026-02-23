import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Trophy, Target, TrendingUp, Percent, ImagePlus } from 'lucide-react'
import { getTier } from '../utils/elo'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import Toast from '../components/Toast'

export default function Profile() {
    const { id } = useParams();
    const [showImageForm, setShowImageForm] = useState(false);
    const [newImage, setNewImage] = useState('');
    const [toast, setToast] = useState(null);

    const proposeImage = useMutation(api.images?.proposeImage);
    const mogger = useQuery(api.moggers?.getMoggerById, { id: id });
    const allMoggersData = useQuery(api.moggers?.getMoggers);
    const allMoggers = allMoggersData || [];
    const moggerMatchesData = useQuery(api.moggers?.getMatchesByMogger, { id: id });
    const moggerMatches = moggerMatchesData || [];

    if (mogger === undefined) return null; // loading state

    if (!mogger) {
        return (
            <div className="page">
                <div className="container">
                    <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-tertiary)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>😵</div>
                        <div>Mogger not found</div>
                        <Link to="/leaderboard" style={{ color: 'var(--text-primary)', marginTop: 24, display: 'inline-block', textDecoration: 'underline' }}>
                            Back to Leaderboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const tier = getTier(mogger.elo);
    const rank = [...allMoggers].sort((a, b) => b.elo - a.elo).findIndex(m => m._id === mogger._id) + 1;
    const totalMatches = mogger.wins + mogger.losses;
    const winRate = totalMatches > 0 ? Math.round((mogger.wins / totalMatches) * 100) : 0;

    const eloHistory = mogger.eloHistory || [];
    const minElo = Math.min(...eloHistory) - 20;
    const maxElo = Math.max(...eloHistory) + 20;
    const eloRange = maxElo - minElo || 1;

    const sparklinePoints = eloHistory.map((elo, i) => {
        const x = (i / (eloHistory.length - 1 || 1)) * 100;
        const y = 100 - ((elo - minElo) / eloRange) * 100;
        return `${x},${y}`;
    }).join(' ');

    const areaPoints = `0,100 ${sparklinePoints} 100,100`;

    const handleImageError = (e) => {
        e.target.style.display = 'none';
        const fallback = e.target.nextElementSibling;
        if (fallback) fallback.style.display = 'flex';
    };

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '800px' }}>
                <Link to="/leaderboard" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    marginBottom: 40,
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    transition: 'color 0.2s',
                }}>
                    <ArrowLeft size={16} /> Back to Leaderboard
                </Link>

                {/* Profile Header */}
                <div className="glass-panel" style={{
                    display: 'flex',
                    gap: '40px',
                    alignItems: 'center',
                    padding: '40px',
                    borderRadius: 'var(--radius-xl)',
                    marginBottom: '40px',
                    animation: 'slideInUp 0.4s ease-out'
                }}>
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ position: 'relative', width: 160, height: 160, margin: '0 auto 16px' }}>
                            <img
                                src={mogger.image}
                                alt={mogger.name}
                                onError={handleImageError}
                                style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-full)', objectFit: 'cover', border: '2px solid var(--border-strong)' }}
                            />
                            <div className="avatar-fallback" style={{ display: 'none', position: 'absolute', inset: 0, borderRadius: 'var(--radius-full)', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface-elevated)', fontSize: '4rem', fontWeight: 'bold' }}>
                                {mogger.name.charAt(0)}
                            </div>
                        </div>
                        <span className="tier-badge" style={{ marginTop: 16, marginBottom: 16 }}>
                            {tier.label}
                        </span>

                        {!showImageForm ? (
                            <button onClick={() => setShowImageForm(true)} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem', padding: '8px' }}>
                                <ImagePlus size={14} /> Suggest Better Image
                            </button>
                        ) : (
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                if (!newImage) return;
                                try {
                                    await proposeImage({ moggerId: mogger._id, imageUrl: newImage });
                                    setToast({ type: 'success', message: 'Image sent to Gemini for review. This page will update if approved.' });
                                    setShowImageForm(false);
                                    setNewImage('');
                                } catch (err) {
                                    setToast({ type: 'error', message: 'Failed to submit.' });
                                }
                            }} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} className="animate-fade-in">
                                <input
                                    type="url"
                                    className="form-input"
                                    placeholder="Paste Image URL"
                                    value={newImage}
                                    onChange={e => setNewImage(e.target.value)}
                                    style={{ padding: '8px', fontSize: '0.8rem' }}
                                    required
                                />
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '6px', fontSize: '0.8rem' }}>Submit</button>
                                    <button type="button" onClick={() => setShowImageForm(false)} className="btn btn-secondary" style={{ padding: '6px', fontSize: '0.8rem' }}>Cancel</button>
                                </div>
                            </form>
                        )}
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
                            <h1 className="page-title" style={{ margin: 0, fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>{mogger.name}</h1>
                            <div style={{
                                background: '#ffffff',
                                color: '#000000',
                                borderRadius: '6px',
                                padding: '4px 10px',
                                fontFamily: 'var(--font-display)',
                                fontWeight: 800,
                                fontSize: '0.85rem',
                            }}>
                                Rank #{rank}
                            </div>
                        </div>
                        {mogger.alias && <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: 16 }}>@{mogger.alias}</div>}
                        {mogger.tagline && <div style={{ color: 'var(--text-tertiary)', fontSize: '0.95rem', fontStyle: 'italic', marginBottom: 24 }}>"{mogger.tagline}"</div>}

                        {/* Top Group: ELO, Matches, Wins */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(100px, 1fr))', gap: '16px', marginBottom: '16px', maxWidth: '440px' }}>
                            <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ marginBottom: 12, color: 'var(--text-tertiary)' }}><Trophy size={18} style={{ margin: '0 auto' }} /></div>
                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', color: 'var(--text-primary)', marginBottom: 4 }}>{mogger.elo}</div>
                                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>ELO</div>
                            </div>
                            <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ marginBottom: 12, color: 'var(--text-tertiary)' }}><Target size={18} style={{ margin: '0 auto' }} /></div>
                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', color: 'var(--text-primary)', marginBottom: 4 }}>{totalMatches}</div>
                                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Matches</div>
                            </div>
                            <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ marginBottom: 12, color: 'var(--accent-success)' }}><TrendingUp size={18} style={{ margin: '0 auto' }} /></div>
                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', color: 'var(--accent-success)', marginBottom: 4 }}>{mogger.wins}</div>
                                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Wins</div>
                            </div>
                        </div>

                        {/* Bottom Group: Win Rate */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(100px, 136px)', gap: '16px', maxWidth: '440px' }}>
                            <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ marginBottom: 12, color: 'var(--text-tertiary)' }}><Percent size={18} style={{ margin: '0 auto' }} /></div>
                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', color: 'var(--text-primary)', marginBottom: 4 }}>{winRate}%</div>
                                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Win Rate</div>
                            </div>
                        </div>

                        <div style={{
                            marginTop: 18,
                            textAlign: 'right',
                            color: 'var(--text-tertiary)',
                            fontSize: '0.7rem',
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            opacity: 0.85,
                            userSelect: 'none',
                        }}>
                            pslranked.com
                        </div>
                    </div>
                </div>

                {/* ELO History Chart */}
                {eloHistory.length > 1 && (
                    <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-xl)', marginBottom: '40px' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '24px', fontSize: '1.2rem' }}>ELO History</div>
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '120px', overflow: 'visible' }}>
                            <defs>
                                <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
                                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <polygon points={areaPoints} fill="url(#sparklineGrad)" />
                            <polyline points={sparklinePoints} fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '12px' }}>
                            <span>{eloHistory[0]}</span>
                            <span>{eloHistory[eloHistory.length - 1]}</span>
                        </div>
                    </div>
                )}

                {/* Match History */}
                <div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '20px', fontSize: '1.5rem' }}>
                        Recent Matches
                    </h2>

                    {moggerMatches.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {moggerMatches.map((match) => {
                                const isWin = match.winnerId === mogger._id;
                                const opponentId = isWin ? match.loserId : match.winnerId;
                                const opponent = allMoggers.find(m => m._id === opponentId);
                                const opponentName = opponent ? opponent.name : 'Unknown';
                                const eloChange = isWin ? match.winnerEloChange : match.loserEloChange;

                                return (
                                    <div key={match._id} className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', borderRadius: 'var(--radius-md)' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: 'var(--radius-sm)',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            background: isWin ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: isWin ? 'var(--accent-success)' : 'var(--accent-danger)'
                                        }}>
                                            {isWin ? 'WIN' : 'LOSS'}
                                        </span>
                                        <span style={{ flex: 1, color: 'var(--text-secondary)' }}>vs <strong style={{ color: 'var(--text-primary)' }}>{opponentName}</strong></span>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.65rem',
                                            fontWeight: 800,
                                            background: 'rgba(255,255,255,0.05)',
                                            color: 'var(--text-tertiary)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            PSL Battle
                                        </span>
                                        <span style={{ fontWeight: 600, color: isWin ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                                            {eloChange ? (eloChange > 0 ? `+${eloChange}` : eloChange) : ''}
                                        </span>
                                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                                            {new Date(match.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
                            <div style={{ color: 'var(--text-tertiary)' }}>No matches yet — vote on battles to generate history</div>
                        </div>
                    )}
                </div>
            </div>

            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </div>
    );
}
