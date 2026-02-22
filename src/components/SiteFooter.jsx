import { Link } from 'react-router-dom'

const productLinks = [
  { to: '/', label: 'Vote' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/submit', label: 'Submit' },
  { to: '/stats', label: 'Stats' },
]

const seoLinks = [
  { to: '/about', label: 'About' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/faq', label: 'FAQ' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
]

export default function SiteFooter() {
  return (
    <footer className="site-footer" aria-label="Footer">
      <div className="site-footer-backdrop" aria-hidden="true" />
      <div className="container site-footer-inner">
        <div className="site-footer-brand">
          <p className="site-footer-kicker">PSL Rank</p>
          <h2>Global ELO rankings for head-to-head voting.</h2>
          <p>
            Track rankings, vote on matchups, and browse supporting pages that explain
            how the platform works.
          </p>
        </div>

        <nav className="site-footer-nav" aria-label="Product links">
          <p className="site-footer-heading">Product</p>
          <ul>
            {productLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="site-footer-nav" aria-label="Site information">
          <p className="site-footer-heading">Site</p>
          <ul>
            {seoLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}

