import { Link } from 'react-router-dom'
import { Compass, ArrowRight, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="page not-found-page">
      <div className="container">
        <main className="not-found-shell glass-panel" aria-labelledby="not-found-title">
          <div className="not-found-orb" aria-hidden="true">
            <Compass size={34} />
          </div>

          <div className="not-found-copy">
            <p className="not-found-kicker">404 / Route Miss</p>
            <h1 id="not-found-title">Page not found</h1>
            <p>
              The page you requested does not exist or the link is outdated. Use one of
              the shortcuts below to continue browsing the ranking platform.
            </p>

            <div className="not-found-actions">
              <Link className="btn btn-primary" to="/">
                Back to Vote Arena <ArrowRight size={16} />
              </Link>
              <Link className="btn btn-secondary" to="/leaderboard">
                <Search size={16} />
                Open Leaderboard
              </Link>
              <Link className="btn btn-secondary" to="/faq">
                FAQ
              </Link>
            </div>
          </div>

          <aside className="not-found-panel" aria-label="Helpful links">
            <p className="not-found-panel-title">Popular destinations</p>
            <ul>
              <li>
                <Link to="/stats">Statistics overview</Link>
              </li>
              <li>
                <Link to="/how-it-works">How the rankings work</Link>
              </li>
              <li>
                <Link to="/submit">Submit a contender</Link>
              </li>
            </ul>
          </aside>
        </main>
      </div>
    </div>
  )
}

