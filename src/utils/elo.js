// Standard ELO Rating System
const K_FACTOR = 32;

export function calculateExpectedScore(ratingA, ratingB) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

export function calculateElo(winnerRating, loserRating) {
  const expectedWinner = calculateExpectedScore(winnerRating, loserRating);
  const expectedLoser = calculateExpectedScore(loserRating, winnerRating);

  const newWinnerRating = Math.round(winnerRating + K_FACTOR * (1 - expectedWinner));
  const newLoserRating = Math.round(loserRating + K_FACTOR * (0 - expectedLoser));

  return { newWinnerRating, newLoserRating };
}

export function getTier(elo) {
  if (elo >= 1600) return { tier: 'S', label: 'S Tier', color: '#FFD700' };
  if (elo >= 1400) return { tier: 'A', label: 'A Tier', color: '#C0C0C0' };
  if (elo >= 1200) return { tier: 'B', label: 'B Tier', color: '#CD7F32' };
  if (elo >= 1000) return { tier: 'C', label: 'C Tier', color: '#6B7280' };
  return { tier: 'D', label: 'D Tier', color: '#4B5563' };
}

export function getTierGradient(tier) {
  switch (tier) {
    case 'S': return 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
    case 'A': return 'linear-gradient(135deg, #E8E8E8 0%, #A8A8A8 100%)';
    case 'B': return 'linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)';
    case 'C': return 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)';
    case 'D': return 'linear-gradient(135deg, #374151 0%, #1F2937 100%)';
    default: return 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)';
  }
}
