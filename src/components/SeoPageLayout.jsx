import { Link } from 'react-router-dom'

const quickLinks = [
  { to: '/', label: 'Vote Arena' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/stats', label: 'Stats' },
  { to: '/about', label: 'About' },
  { to: '/faq', label: 'FAQ' },
]

export default function SeoPageLayout({ eyebrow, title, description, children }) {
  return (
    <div className="page seo-page-shell">
      <div className="container seo-page-container">
        <main className="seo-page-main" aria-labelledby="seo-page-title">
          <section className="seo-hero glass-panel animate-fade-in">
            <div>
              {eyebrow ? <p className="seo-eyebrow">{eyebrow}</p> : null}
              <h1 id="seo-page-title" className="seo-title">
                {title}
              </h1>
              <p className="seo-description">{description}</p>
            </div>

            <aside className="seo-quick-nav" aria-label="Quick links">
              <p className="seo-quick-nav-label">Explore PSL Rank</p>
              <ul className="seo-link-list">
                {quickLinks.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </aside>
          </section>

          <article className="seo-prose glass-panel animate-slide-up stagger-2">
            {children}
          </article>
        </main>
      </div>
    </div>
  )
}

