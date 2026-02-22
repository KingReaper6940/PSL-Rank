import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import './index.css'
import App from './App.jsx'

const convexUrl = import.meta.env.VITE_CONVEX_URL;

if (!convexUrl) {
  createRoot(document.getElementById('root')).render(
    <div style={{ padding: '2rem', color: 'white', textAlign: 'center', fontFamily: 'system-ui', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1>Deployment Error: Missing Convex URL</h1>
      <p style={{ maxWidth: '600px', lineHeight: '1.6' }}>
        You need to add the <code>VITE_CONVEX_URL</code> environment variable to your Vercel project settings.
        <br /><br />
        Without it, the frontend cannot connect to the database. Go to Vercel &gt; Settings &gt; Environment Variables, paste your Convex URL, and <strong>redeploy</strong>.
      </p>
    </div>
  );
} else {
  const convex = new ConvexReactClient(convexUrl);

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <ConvexProvider client={convex}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConvexProvider>
    </StrictMode>,
  )
}
