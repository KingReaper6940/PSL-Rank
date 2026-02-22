import { Link } from 'react-router-dom'
import SeoPageLayout from '../components/SeoPageLayout'

const faqs = [
  {
    q: 'How are rankings calculated?',
    a: 'Rankings use an ELO-style rating system. Each vote updates the winner and loser based on their current ratings.',
  },
  {
    q: 'How often does the leaderboard update?',
    a: 'Leaderboard ordering updates as results are recorded. New votes and data refreshes are reflected in the app as the underlying data changes.',
  },
  {
    q: 'Can I submit a new contender?',
    a: 'Yes. Use the Submit page to add a contender name, optional alias/tagline, and an image or upload.',
  },
  {
    q: 'Why do some profiles have limited history?',
    a: 'Newer contenders may have fewer recorded matchups, so profile trends and records can be shorter until more votes accumulate.',
  },
  {
    q: 'What happens if there are not enough contenders?',
    a: 'The vote page will show an empty state until enough contenders are available for a matchup.',
  },
  {
    q: 'Can ranking positions move quickly?',
    a: 'Yes. Recent voting volume and rating gaps can produce faster movement, especially for contenders with fewer total matches.',
  },
  {
    q: 'Does PSL Rank guarantee accuracy or fairness?',
    a: 'No ranking system is perfect. PSL Rank reflects recorded votes and platform logic, and rankings should be viewed as a dynamic community-driven result.',
  },
  {
    q: 'Where can I learn more about the process?',
    a: 'See About and How It Works for the product overview and ranking flow.',
  },
]

export default function Faq() {
  return (
    <SeoPageLayout
      eyebrow="FAQ"
      title="Frequently asked questions about PSL Rank."
      description="Answers to common questions about voting, ELO scoring, leaderboard updates, submissions, and profile pages."
    >
      <section>
        <h2>Quick answers</h2>
        <div className="faq-list">
          {faqs.map((item) => (
            <details key={item.q} className="faq-item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section>
        <h2>Related pages</h2>
        <p>
          Start with <Link to="/about">About</Link> for the overview, then visit{' '}
          <Link to="/how-it-works">How It Works</Link> for the ranking workflow. You can
          also jump directly to the <Link to="/leaderboard">leaderboard</Link>.
        </p>
      </section>
    </SeoPageLayout>
  )
}

