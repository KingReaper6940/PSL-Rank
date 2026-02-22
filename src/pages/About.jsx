import { Link } from 'react-router-dom'
import SeoPageLayout from '../components/SeoPageLayout'

export default function About() {
  return (
    <SeoPageLayout
      eyebrow="About PSL Rank"
      title="A head-to-head ranking board built around ELO voting."
      description="PSL Rank is a voting-driven leaderboard where users compare contenders, submit match outcomes, and track ranking movement over time."
    >
      <section>
        <h2>What PSL Rank is</h2>
        <p>
          PSL Rank is a community-facing leaderboard that uses head-to-head voting and an
          ELO-style scoring model to rank contenders. Users can vote in live matchups,
          explore the leaderboard, and review individual profile performance.
        </p>
      </section>

      <section>
        <h2>What you can do</h2>
        <ul>
          <li>Vote on live matchups to influence rankings.</li>
          <li>Browse the leaderboard with search, sorting, and tier filters.</li>
          <li>Submit new contenders with supporting images.</li>
          <li>Review platform-wide statistics and ranking movement.</li>
        </ul>
      </section>

      <section>
        <h2>How ranking movement works</h2>
        <p>
          Each matchup updates two contenders. The winner gains rating points and the
          loser loses points based on the current rating gap. This makes the board
          responsive to new votes while still rewarding consistent results over time.
        </p>
        <p>
          For a deeper breakdown of the process, see the{' '}
          <Link to="/how-it-works">How It Works</Link> page and the{' '}
          <Link to="/faq">FAQ</Link>.
        </p>
      </section>
    </SeoPageLayout>
  )
}

