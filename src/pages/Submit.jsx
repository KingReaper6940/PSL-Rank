import { useState } from 'react'
import { UserPlus, Eye } from 'lucide-react'
import { getTier } from '../utils/elo'
import Toast from '../components/Toast'
import { useMutation, useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'

export default function Submit() {
    const mutateAddMogger = useMutation(api.moggers?.addMogger);
    const generateUploadUrl = useMutation(api.upload?.generateUploadUrl);

    const [name, setName] = useState('');
    const [alias, setAlias] = useState('');
    const [tagline, setTagline] = useState('');
    const [image, setImage] = useState(''); // Still used for preview/fallback url
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [toast, setToast] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        if (!image.trim() && !selectedFile) {
            setToast({ type: 'error', message: 'An image is required.' });
            return;
        }

        setIsUploading(true);
        try {
            let storageId = undefined;

            if (selectedFile) {
                // Generate short-lived upload URL
                const postUrl = await generateUploadUrl();
                // Post the file directly to Convex storage
                const result = await fetch(postUrl, {
                    method: "POST",
                    headers: { "Content-Type": selectedFile.type },
                    body: selectedFile,
                });
                const { storageId: uploadedStorageId } = await result.json();
                storageId = uploadedStorageId;
            }

            await mutateAddMogger({
                name: name.trim(),
                alias: alias.trim() || name.trim().split(' ')[0],
                tagline: tagline.trim() || 'New challenger enters the arena.',
                image: image.trim() || '',
                storageId,
            });

            setToast({ type: 'success', message: `${name.trim()} has entered the leaderboard at 1200 ELO!` });
            setSubmitted(true);

            // Reset after delay
            setTimeout(() => {
                setName('');
                setAlias('');
                setTagline('');
                setImage('');
                setSelectedFile(null);
                setSubmitted(false);
            }, 3000);
        } catch (error) {
            console.error("Failed to add mogger:", error);
            setToast({ type: 'error', message: "Failed to add to database." });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            setImage(URL.createObjectURL(file)); // local preview
        } else {
            setToast({ type: 'error', message: 'Please drop a valid image file.' });
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            setImage(URL.createObjectURL(file)); // local preview
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
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Mogger Image *</label>

                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                style={{
                                    border: `2px dashed ${isDragging ? 'var(--accent-primary)' : 'var(--border-strong)'}`,
                                    borderRadius: 'var(--radius-lg)',
                                    padding: '32px 20px',
                                    textAlign: 'center',
                                    background: isDragging ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer',
                                    marginBottom: '12px'
                                }}
                                onClick={() => document.getElementById('file-upload').click()}
                            >
                                <input
                                    type="file"
                                    id="file-upload"
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                {selectedFile ? (
                                    <div style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                                        ✓ {selectedFile.name} selected
                                    </div>
                                ) : (
                                    <div>
                                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📸</div>
                                        <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '4px' }}>Drag & Drop an image here</div>
                                        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>or click to browse files</div>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                                <hr style={{ flex: 1, borderColor: 'var(--border-subtle)' }} />
                                <span style={{ padding: '0 12px' }}>OR</span>
                                <hr style={{ flex: 1, borderColor: 'var(--border-subtle)' }} />
                            </div>

                            <input
                                type="url"
                                className="form-input"
                                placeholder="Paste image URL directly (fallback)"
                                value={!selectedFile ? image : ''}
                                onChange={(e) => {
                                    setImage(e.target.value);
                                    setSelectedFile(null); // Clear file if they type a URL
                                }}
                            />
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

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px 24px', fontSize: '1rem' }} disabled={!name.trim() || submitted || isUploading}>
                            <UserPlus size={18} />
                            {isUploading ? 'Uploading...' : submitted ? 'Added Successfully!' : 'Add to Leaderboard'}
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
