import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import SiteFooter from './components/SiteFooter'
import RouteSeo from './components/RouteSeo'
import Leaderboard from './pages/Leaderboard'
import Vote from './pages/Vote'
import Submit from './pages/Submit'
import Profile from './pages/Profile'
import Stats from './pages/Stats'
import { Analytics } from '@vercel/analytics/react'
import About from './pages/About'
import HowItWorks from './pages/HowItWorks'
import Faq from './pages/Faq'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import NotFound from './pages/NotFound'

function withSeo(element, seo) {
  return (
    <>
      <RouteSeo {...seo} />
      {element}
    </>
  )
}

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={withSeo(<Vote />, {
            title: 'PSL Rank - Vote on Live Matchups',
            description:
              'Vote on live head-to-head matchups to shape the PSL Rank global leaderboard.',
            path: '/',
          })}
        />
        <Route
          path="/leaderboard"
          element={withSeo(<Leaderboard />, {
            title: 'PSL Rank - Global Leaderboard',
            description:
              'Browse the PSL Rank leaderboard with filters, search, and tier-based ranking views.',
            path: '/leaderboard',
          })}
        />
        <Route
          path="/submit"
          element={withSeo(<Submit />, {
            title: 'PSL Rank - Submit a Contender',
            description:
              'Add a new contender to PSL Rank with image support and basic profile details.',
            path: '/submit',
          })}
        />
        <Route
          path="/profile/:id"
          element={withSeo(<Profile />, {
            title: 'PSL Rank - Contender Profile',
            description:
              'View contender record, ELO history, and recent ranking performance on PSL Rank.',
            robots: 'noindex,follow',
          })}
        />
        <Route
          path="/stats"
          element={withSeo(<Stats />, {
            title: 'PSL Rank - Platform Statistics',
            description:
              'Explore PSL Rank platform statistics including battles, tier distribution, and rating trends.',
            path: '/stats',
          })}
        />
        <Route
          path="/about"
          element={withSeo(<About />, {
            title: 'About PSL Rank',
            description:
              'Learn what PSL Rank is, how the leaderboard works, and what users can do on the platform.',
            path: '/about',
          })}
        />
        <Route
          path="/how-it-works"
          element={withSeo(<HowItWorks />, {
            title: 'How PSL Rank Works',
            description:
              'Understand the PSL Rank voting flow, ELO-style ranking updates, and leaderboard behavior.',
            path: '/how-it-works',
          })}
        />
        <Route
          path="/faq"
          element={withSeo(<Faq />, {
            title: 'PSL Rank FAQ',
            description:
              'Common questions about PSL Rank, including voting, submissions, rankings, and profiles.',
            path: '/faq',
          })}
        />
        <Route
          path="/privacy"
          element={withSeo(<Privacy />, {
            title: 'PSL Rank Privacy Policy',
            description:
              'Read the PSL Rank privacy policy for platform submissions, data usage, and service handling.',
            path: '/privacy',
          })}
        />
        <Route
          path="/terms"
          element={withSeo(<Terms />, {
            title: 'PSL Rank Terms of Use',
            description:
              'Review PSL Rank terms of use, acceptable use requirements, and ranking disclaimers.',
            path: '/terms',
          })}
        />
        <Route
          path="*"
          element={withSeo(<NotFound />, {
            title: 'PSL Rank - Page Not Found',
            description:
              'The requested page could not be found on PSL Rank. Browse the leaderboard, FAQ, or vote arena.',
            robots: 'noindex,follow',
          })}
        />
      </Routes>
      <Analytics />
      <SiteFooter />
    </>
  )
}

export default App
