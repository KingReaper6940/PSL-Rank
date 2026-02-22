import { Link } from 'react-router-dom'
import SeoPageLayout from '../components/SeoPageLayout'

export default function HowItWorks() {
  return (
    <SeoPageLayout
      eyebrow="How It Works"
      title="How PSL Rank calculates rankings and updates the board."
      description="Learn how voting, ELO updates, contender submissions, and leaderboard refreshes work inside PSL Rank."
    >
      <section>
        <h2>1. Voting creates a result</h2>
        <p>
          The home page presents a head-to-head matchup. When a user selects a winner,
          the result is stored and both contenders are updated.
        </p>
      </section>

      <section>
        <h2>2. ELO adjusts after each matchup</h2>
        <p>
          PSL Rank uses an ELO-style model. Upsets generally move scores more than
          expected wins. This keeps the leaderboard competitive while preventing it from
          becoming static.
        </p>
      </section>

      <section>
        <h2>3. Leaderboard and profiles reflect the changes</h2>
        <p>
          The <Link to="/leaderboard">leaderboard</Link> updates ranking order based on
          current ELO, while profile pages display record and rating history so users can
          inspect performance over time.
        </p>
      </section>

      <section>
        <h2>4. Submissions expand the pool</h2>
        <p>
          Users can add new contenders from the <Link to="/submit">submit page</Link>.
          New entries start with a baseline rating and move as votes come in.
        </p>
      </section>

      <section>
        <h2>5. Statistics summarize platform activity</h2>
        <p>
          The <Link to="/stats">stats page</Link> aggregates totals such as battles,
          average ELO, tier distribution, and recent movement to provide a broader view
          of ranking activity.
        </p>
      </section>
    </SeoPageLayout>
  )
}

