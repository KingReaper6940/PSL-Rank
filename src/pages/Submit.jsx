import { useState } from 'react'
import { UserPlus, Eye } from 'lucide-react'
import { getTier } from '../utils/elo'
import Toast from '../components/Toast'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

export default function Submit() {
    const mutateAddMogger = useMutation(api.moggers?.addMogger);

    const [name, setName] = useState('');
    const [alias, setAlias] = useState('');
    const [tagline, setTagline] = useState('');
    const [image, setImage] = useState('');
    const [toast, setToast] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        try {
            await mutateAddMogger({
                name: name.trim(),
                alias: alias.trim() || name.trim().split(' ')[0],
                tagline: tagline.trim() || 'New challenger enters the arena.',
                image: image.trim() || '',
            });

            setToast({ type: 'success', message: `${name.trim()} has entered the leaderboard at 1200 ELO!` });
            setSubmitted(true);

            // Reset after delay
            setTimeout(() => {
                setName('');
                setAlias('');
                setTagline('');
                setImage('');
                setSubmitted(false);
            }, 3000);
        } catch (error) {
            console.error("Failed to add mogger:", error);
            setToast({ type: 'error', message: "Failed to add to database." });
        }
    };

    const handleImageError = (e) => {
        e.target.style.display = 'none';
        const fallback = e.target.nextElementSibling;
        if (fallback) fallback.style.display = 'flex';
    };

    const tier = getTier(1200);

    return (
        <div className="page">
            <div className="container">
                <div className="page-header animate-fade-in">
                    <h1 className="page-title text-gradient">SUBMIT</h1>
                    <p className="page-subtitle">Add a high-tier contender to the rankings.</p>
                </div>

                <div style={{ display: 'flex', gap: '48px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ flex: '1', maxWidth: '480px' }} className="animate-slide-up">
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Name *</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. Francisco Lachowski"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={50}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Alias / Nickname</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. Chico"
                                value={alias}
                                onChange={(e) => setAlias(e.target.value)}
                                maxLength={30}
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Image URL</label>
                            <input
                                type="url"
                                className="form-input"
                                placeholder="https://example.com/photo.jpg"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                            />
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '8px', display: 'block' }}>
                                Paste a direct link to a portrait photo
                            </span>
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Tagline</label>
                            <textarea
                                className="form-input"
                                placeholder="What makes this mogger legendary?"
                                value={tagline}
                                onChange={(e) => setTagline(e.target.value)}
                                maxLength={120}
                                rows={3}
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px 24px', fontSize: '1rem' }} disabled={!name.trim() || submitted}>
                            <UserPlus size={18} />
                            {submitted ? 'Added Successfully!' : 'Add to Leaderboard'}
                        </button>
                    </form>

                    {/* Live Preview */}
                    <div style={{ flex: '0 0 320px', animationDelay: '0.1s' }} className="animate-slide-up">
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '16px',
                            color: 'var(--text-secondary)',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                        }}>
                            <Eye size={16} />
                            Live Preview
                        </div>

                        <div className="glass-panel" style={{ padding: '32px 24px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 20px' }}>
                                {image ? (
                                    <>
                                        <img
                                            src={image}
                                            alt="Preview"
                                            style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-full)', objectFit: 'cover', border: '2px solid var(--border-strong)' }}
                                            onError={handleImageError}
                                        />
                                        <div className="avatar-fallback" style={{ display: 'none', position: 'absolute', inset: 0, borderRadius: 'var(--radius-full)', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface-elevated)', fontSize: '2rem', fontWeight: 'bold' }}>
                                            {(name || '?').charAt(0)}
                                        </div>
                                    </>
                                ) : (
                                    <div className="avatar-fallback" style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface-elevated)', fontSize: '2.5rem', fontWeight: 'bold', border: '1px solid var(--border-subtle)' }}>
                                        {(name || '?').charAt(0)}
                                    </div>
                                )}
                            </div>

                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                                {name || 'Contender Name'}
                            </div>
                            {alias && (
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>
                                    @{alias}
                                </div>
                            )}
                            <div style={{
                                color: 'var(--text-tertiary)',
                                fontSize: '0.85rem',
                                fontStyle: 'italic',
                                marginTop: '12px',
                                marginBottom: '24px'
                            }}>
                                {tagline || 'New challenger enters the arena.'}
                            </div>

                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'var(--bg-base)', padding: '8px 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
                                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                                    {name ? '1200' : '??'}
                                </span>
                                <span className={`tier-badge`} style={{ color: 'var(--text-primary)' }}>
                                    {name ? tier.label : '?? Tier'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </div>
    );
}
