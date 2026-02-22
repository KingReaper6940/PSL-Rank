import { useState, useCallback, useEffect } from 'react'
import { Zap, SkipForward, TrendingUp, TrendingDown } from 'lucide-react'
import { getRandomMatchup, getMoggers, saveMoggers, addMatch, getStats } from '../utils/storage'
import { calculateElo, getTier } from '../utils/elo'
import Toast from '../components/Toast'

export default function Vote() {
    const [matchup, setMatchup] = useState(null);
    const [selected, setSelected] = useState(null);
    const [result, setResult] = useState(null);
    const [toast, setToast] = useState(null);
    const [totalBattles, setTotalBattles] = useState(0);
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        loadMatchup();
        setTotalBattles(getStats().totalVotes || 0);
    }, []);

    const loadMatchup = useCallback(() => {
        setSelected(null);
        setResult(null);
        setAnimating(false);
        const m = getRandomMatchup();
        setMatchup(m);
    }, []);

    const handleVote = (winnerId) => {
        if (animating || !matchup) return;
        setAnimating(true);
        setSelected(winnerId);

        const winner = matchup.find(m => m.id === winnerId);
        const loser = matchup.find(m => m.id !== winnerId);

        const { newWinnerRating, newLoserRating } = calculateElo(winner.elo, loser.elo);
        const eloGain = newWinnerRating - winner.elo;
        const eloLoss = loser.elo - newLoserRating;

        // Update moggers in storage
        const allMoggers = getMoggers();
        const winnerIdx = allMoggers.findIndex(m => m.id === winner.id);
        const loserIdx = allMoggers.findIndex(m => m.id === loser.id);

        let finalWinnerElo = newWinnerRating;
        let finalLoserElo = newLoserRating;

        if (winnerIdx !== -1) {
            allMoggers[winnerIdx].elo = newWinnerRating;
            allMoggers[winnerIdx].wins += 1;
            allMoggers[winnerIdx].eloHistory.push(newWinnerRating);
            if (allMoggers[winnerIdx].eloHistory.length > 30) {
                allMoggers[winnerIdx].eloHistory = allMoggers[winnerIdx].eloHistory.slice(-30);
            }
            finalWinnerElo = allMoggers[winnerIdx].elo;
        }

        if (loserIdx !== -1) {
            allMoggers[loserIdx].elo = newLoserRating;
            allMoggers[loserIdx].losses += 1;
            allMoggers[loserIdx].eloHistory.push(newLoserRating);
            if (allMoggers[loserIdx].eloHistory.length > 30) {
                allMoggers[loserIdx].eloHistory = allMoggers[loserIdx].eloHistory.slice(-30);
            }
            finalLoserElo = allMoggers[loserIdx].elo;
        }

        saveMoggers(allMoggers);

        // Record match
        addMatch({
            winnerId: winner.id,
            winnerName: winner.name,
            loserId: loser.id,
            loserName: loser.name,
            winnerEloChange: eloGain,
            loserEloChange: -eloLoss,
            winnerNewElo: finalWinnerElo,
            loserNewElo: finalLoserElo,
        });

        setResult({ winner, loser, eloGain, eloLoss, newWinnerRating: finalWinnerElo, newLoserRating: finalLoserElo });
        setTotalBattles(prev => prev + 1);

        // Show toast
        setToast({
            type: 'success',
            message: `Match recorded.`,
            duration: 1500
        });

        setTimeout(() => {
            loadMatchup();
        }, 1600);
    };

    const handleImageError = (e) => {
        e.target.style.display = 'none';
        const fallback = e.target.nextElementSibling;
        if (fallback) fallback.style.display = 'flex';
    };

    if (!matchup) {
        return (
            <div className="page">
                <div className="container">
                    <div className="empty-state">
                        <div className="empty-state-icon">⚔️</div>
                        <div className="empty-state-text">Not enough contenders for a face-off. Add some first.</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                <div className="page-header animate-fade-in">
                    <h1 className="page-title text-gradient">WHO MOGS HARDER?</h1>
                    <p className="page-subtitle">Select the superior contender.</p>
                </div>

                <div className="vote-arena">
                    {matchup.map((mogger, idx) => {
                        const isWinner = result && result.winner.id === mogger.id;
                        const isLoser = result && result.loser.id === mogger.id;

                        return (
                            <div key={mogger.id + '-' + idx} style={{ display: 'flex', alignItems: 'center' }}>
                                {idx === 1 && (
                                    <div className="vs-divider animate-fade-in" style={{ animationDelay: '0.2s' }}>
                                        <div className="vs-text">VS</div>
                                    </div>
                                )}
                                <div
                                    key={`card-slot-${idx}`}
                                    className={`vote-card ${selected === mogger.id ? 'selected' : ''}`}
                                    onClick={() => handleVote(mogger.id)}
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
                    <button className="btn btn-secondary" onClick={loadMatchup}>
                        <SkipForward size={16} />
                        Skip Face-off
                    </button>
                </div>
            </div>

            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </div>
    );
}
