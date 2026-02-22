import { useState, useCallback, useEffect } from 'react'
import { Swords, SkipForward, TrendingUp, TrendingDown } from 'lucide-react'
import Toast from '../components/Toast'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

export default function Vote() {
    const matchupFromDb = useQuery(api.moggers.getRandomMatchup);
    const castVote = useMutation(api.moggers.vote);

    const [matchup, setMatchup] = useState(null)
    const [selected, setSelected] = useState(null)
    const [result, setResult] = useState(null)
    const [toast, setToast] = useState(null)
    const [isTransitioning, setIsTransitioning] = useState(false)

    useEffect(() => {
        if (!matchup && matchupFromDb && !isTransitioning) {
            setMatchup(matchupFromDb);
        }
    }, [matchupFromDb, matchup, isTransitioning]);

    const loadNewMatchup = useCallback(() => {
        setIsTransitioning(true);
        setMatchup(null);
        setSelected(null);
        setResult(null);
        setIsTransitioning(false);
    }, []);

    const handleVote = async (winnerId) => {
        if (selected || isTransitioning || !matchup) return;

        setSelected(winnerId);
        const loser = matchup.find(m => m._id !== winnerId);
        const winner = matchup.find(m => m._id === winnerId);

        try {
            const resultData = await castVote({ winnerId: winner._id, loserId: loser._id });

            setResult({
                winner,
                loser,
                eloGain: resultData.eloGained,
                eloLoss: resultData.eloGained, // Symmetric in basic ELO
                newWinnerRating: resultData.newWinnerElo,
                newLoserRating: resultData.newLoserElo
            });

            setToast({
                type: 'success',
                message: `Match recorded.`,
                duration: 1500
            });

            setTimeout(() => {
                loadNewMatchup();
            }, 300); // Super fast 0.3s flash of result before instant switch
        } catch (e) {
            console.error("Vote failed", e);
        }
    };

    const handleImageError = (e) => {
        e.target.style.display = 'none';
        const fallback = e.target.nextElementSibling;
        if (fallback) fallback.style.display = 'flex';
    };

    if (matchupFromDb === undefined) {
        return <div className="page"><div className="page-loader"><div className="spinner"></div></div></div>;
    }

    if (!matchup) {
        return (
            <div className="page">
                <div className="container">
                    <div className="empty-state empty-state-polished">
                        <div className="empty-state-icon-shell" aria-hidden="true">
                            <Swords size={26} />
                        </div>
                        <div>
                            <h2 className="empty-state-title">No matchup available yet</h2>
                            <div className="empty-state-text">
                                Not enough contenders for a face-off. Add some first.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                <section className="vote-hero-grid animate-fade-in" aria-label="Voting arena intro">
                    <div className="page-header vote-page-header">
                        <p className="section-kicker">Live Voting Arena</p>
                        <h1 className="page-title text-gradient">GLOBAL MATCHUPS</h1>
                        <p className="page-subtitle">
                            Select the superior contender to shape the worldwide rankings.
                        </p>
                    </div>

                    <aside className="vote-hero-panel glass-panel">
                        <p className="vote-hero-panel-label">How voting affects rankings</p>
                        <ul className="vote-hero-list">
                            <li>Each result updates both contenders immediately.</li>
                            <li>Upsets create stronger ELO swings than expected wins.</li>
                            <li>Use Skip if the matchup is not useful.</li>
                        </ul>
                    </aside>
                </section>

                <div className="vote-arena">
                    {matchup.map((mogger, idx) => {
                        const isWinner = result && result.winner._id === mogger._id;
                        const isLoser = result && result.loser._id === mogger._id;

                        return (
                            <div key={mogger._id + '-' + idx} style={{ display: 'flex', alignItems: 'center' }}>
                                {idx === 1 && (
                                    <div className="vs-divider animate-fade-in" style={{ animationDelay: '0.2s' }}>
                                        <div className="vs-text">VS</div>
                                    </div>
                                )}
                                <div
                                    key={`card-slot-${idx}`}
                                    className={`vote-card ${selected === mogger._id ? 'selected' : ''}`}
                                    onClick={() => handleVote(mogger._id)}
                                    style={{
                                        opacity: isLoser ? 0.4 : 1,
                                    }}
                                >
                                    <div className="mogger-avatar-wrap">
                                        <img
                                            src={mogger.image}
                                            alt={mogger.name}
                                            className="mogger-avatar"
                                            onError={handleImageError}
                                        />
                                        <div className="avatar-fallback" style={{ display: 'none', position: 'absolute', inset: 0 }}>
                                            {mogger.name.charAt(0)}
                                        </div>
                                    </div>

                                    <div className="mogger-name">{mogger.name}</div>
                                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                                        {mogger.wins + (isWinner ? 1 : 0)}W - {mogger.losses + (isLoser ? 1 : 0)}L
                                    </div>

                                    <div className="elo-container">
                                        <span className="elo-label">ELO</span>
                                        <span className="elo-score">
                                            {isWinner ? result.newWinnerRating : isLoser ? result.newLoserRating : mogger.elo}
                                        </span>
                                        {isWinner && (
                                            <span style={{ color: 'var(--accent-success)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <TrendingUp size={14} /> {result.eloGain}
                                            </span>
                                        )}
                                        {isLoser && (
                                            <span style={{ color: 'var(--accent-danger)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <TrendingDown size={14} /> {result.eloLoss}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="vote-actions animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <button className="btn btn-secondary" onClick={loadNewMatchup} disabled={isTransitioning || selected}>
                        <SkipForward size={16} />
                        Skip Face-off
                    </button>
                </div>
            </div>

        </div>
    );
}
