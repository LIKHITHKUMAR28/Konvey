import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  CheckCircle2,
  Boxes,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';
import styles from './AuthPage.module.css';

interface AuthPageProps {
  onOpenMetaPage?: (page: 'brand' | 'security' | 'privacy' | 'terms' | 'sitemap') => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onOpenMetaPage }) => {
  const { login, signup, loginAsPersona, users } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingSecs = Math.ceil((lockoutUntil - Date.now()) / 1000);
      showToast({
        type: 'error',
        title: 'Sign-In Temporarily Locked',
        message: `Too many failed attempts. Please wait ${remainingSecs}s before attempting to sign in again.`,
      });
      return;
    }

    if (!email.trim() || !password) {
      showToast({ type: 'warning', title: 'Credentials Required', message: 'Please enter your work email and password.' });
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      setFailedAttempts(0);
      setLockoutUntil(null);
      showToast({ type: 'success', title: 'Welcome back!', message: 'Signed in successfully.' });
    } catch (err: any) {
      const nextCount = failedAttempts + 1;
      setFailedAttempts(nextCount);
      if (nextCount >= 5) {
        setLockoutUntil(Date.now() + 30000); // 30s lockout
        showToast({
          type: 'error',
          title: 'Brute-Force Lockout Engaged',
          message: 'Too many consecutive failed attempts. Sign-in locked for 30 seconds.',
        });
      } else {
        showToast({
          type: 'error',
          title: 'Sign In Failed',
          message: err?.message || 'Invalid email or password.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      showToast({ type: 'warning', title: 'Required Fields', message: 'Please provide your name, email, and password.' });
      return;
    }
    if (password.length < 6) {
      showToast({ type: 'warning', title: 'Password Too Short', message: 'Password must be at least 6 characters.' });
      return;
    }
    setLoading(true);
    try {
      await signup(name.trim(), email.trim(), 'member', title || 'Team Member', password);
      showToast({ type: 'success', title: 'Account Created', message: `Welcome to Konvey, ${name}!` });
    } catch (err: any) {
      showToast({ type: 'error', title: 'Sign Up Failed', message: err?.message || 'Could not create account.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePersonaSelect = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    loginAsPersona(userId);
    showToast({
      type: 'success',
      title: 'Demo Session Started',
      message: `Signed in as ${user?.name} (${user?.role.toUpperCase()}).`,
    });
  };

  return (
    <div className={styles.authContainer}>
      {/* Background ambient accents */}
      <div className={styles.ambientGlow} />

      <div className={styles.authCardWrapper}>
        {/* Left Form Column */}
        <div className={styles.formColumn}>
          {/* Brand Header with /logo.png */}
          <div className={styles.brandHeader}>
            <div className={styles.logoFrame}>
              <img src="/logo.png" alt="Konvey Logo" className={styles.brandLogoImg} />
            </div>
            <div className={styles.brandTitleRow}>
              <span className={styles.brandName}>Konvey</span>
            </div>
          </div>

          <div className={styles.headerTextGroup}>
            <h1 className={styles.title}>
              {mode === 'signin' ? 'Welcome back' : 'Create your workspace'}
            </h1>
            <p className={styles.subtitle}>
              {mode === 'signin'
                ? 'Sign in to access your projects, team tasks, and discussions.'
                : 'Get started in seconds. No credit card required.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className={styles.tabToggle}>
            <button
              type="button"
              className={`${styles.tabBtn} ${mode === 'signin' ? styles.tabActive : ''}`}
              onClick={() => setMode('signin')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${mode === 'signup' ? styles.tabActive : ''}`}
              onClick={() => setMode('signup')}
            >
              Create Account
            </button>
          </div>

          {/* Quick Demo Persona Login Strip */}
          <div className={styles.demoPersonaSection}>
            <div className={styles.demoSectionLabel}>
              <Sparkles size={13} color="#2563eb" />
              <span>1-Click Persona Access (All Roles)</span>
            </div>
            <div className={styles.personaCardsList}>
              {users.map((u) => {
                const roleTag =
                  u.role === 'admin'
                    ? 'ADMIN'
                    : u.role === 'manager'
                    ? 'MANAGER'
                    : u.role === 'client'
                    ? 'CLIENT PORTAL'
                    : 'MEMBER';
                const roleBg =
                  u.role === 'admin'
                    ? '#e0e7ff'
                    : u.role === 'manager'
                    ? '#fef3c7'
                    : u.role === 'client'
                    ? '#dbeafe'
                    : '#f1f5f9';
                const roleColor =
                  u.role === 'admin'
                    ? '#3730a3'
                    : u.role === 'manager'
                    ? '#92400e'
                    : u.role === 'client'
                    ? '#1e40af'
                    : '#475569';
                const avatar =
                  u.avatarUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';

                return (
                  <button
                    key={u.id}
                    type="button"
                    className={styles.personaCardBtn}
                    onClick={() => handlePersonaSelect(u.id)}
                    title={`Open workspace as ${u.name} (${roleTag})`}
                  >
                    <img src={avatar} alt={u.name} className={styles.personaAvatar} />
                    <div className={styles.personaDetails}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', minWidth: 0 }}>
                        <span className={styles.personaName}>{u.name}</span>
                        <span
                          className={styles.personaRoleBadge}
                          style={{ backgroundColor: roleBg, color: roleColor }}
                        >
                          {roleTag}
                        </span>
                      </div>
                      <span className={styles.personaRole}>{u.title || (u.role === 'admin' ? 'Administrator' : u.role === 'manager' ? 'Project Manager' : u.role === 'client' ? 'Client Executive' : 'Team Member')}</span>
                    </div>
                    <ArrowRight size={13} className={styles.personaArrow} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.dividerRow}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>or continue with email</span>
            <span className={styles.dividerLine} />
          </div>

          {/* Form */}
          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className={styles.authForm}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel} htmlFor="email-input">
                  Work Email
                </label>
                <div className={styles.inputWrapper}>
                  <Mail size={16} className={styles.inputIcon} />
                  <input
                    id="email-input"
                    type="email"
                    required
                    placeholder="rahul@roytech.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.textInput}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <div className={styles.labelRow}>
                  <label className={styles.inputLabel} htmlFor="password-input">
                    Password
                  </label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); showToast({ type: 'info', title: 'Demo Mode', message: 'Use 1-click persona login above for instant demo testing.' }); }} className={styles.forgotLink}>
                    Forgot password?
                  </a>
                </div>
                <div className={styles.inputWrapper}>
                  <Lock size={16} className={styles.inputIcon} />
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.textInput}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggleBtn}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={styles.submitBtn}
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
                <ArrowRight size={15} />
              </button>

              <div style={{ marginTop: '12px', fontSize: '11.5px', color: '#64748b', textAlign: 'center', lineHeight: '1.4' }}>
                Teammate sign-in password: <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#0f172a', fontWeight: 600 }}>konvey123</code> (or assigned by Admin)
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className={styles.authForm}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel} htmlFor="name-input">
                  Full Name
                </label>
                <div className={styles.inputWrapper}>
                  <UserIcon size={16} className={styles.inputIcon} />
                  <input
                    id="name-input"
                    type="text"
                    required
                    placeholder="Aarav Patel"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={styles.textInput}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel} htmlFor="signup-email">
                  Work Email
                </label>
                <div className={styles.inputWrapper}>
                  <Mail size={16} className={styles.inputIcon} />
                  <input
                    id="signup-email"
                    type="email"
                    required
                    placeholder="aarav@roytech.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.textInput}
                  />
                </div>
              </div>

              <div style={{
                background: 'var(--bg-surface-elevated, #f8fafc)',
                border: '1px solid var(--border-subtle, #e2e8f0)',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.785rem',
                color: 'var(--text-secondary, #64748b)',
                lineHeight: 1.4,
              }}>
                <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px', color: 'var(--primary-600)' }} />
                New accounts register as <strong>Team Member</strong>. Role elevations (Admin, Manager, Client) are granted by workspace administrators.
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel} htmlFor="title-input">
                  Job Title
                </label>
                <input
                  id="title-input"
                  type="text"
                  placeholder="Lead Frontend Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={styles.textInputSolo}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={styles.submitBtn}
              >
                <span>{loading ? 'Setting up workspace...' : 'Create Account & Continue'}</span>
                <ArrowRight size={15} />
              </button>
            </form>
          )}

          {/* SSO Options */}
          <div className={styles.ssoGroup}>
            <button
              type="button"
              className={styles.ssoBtn}
              onClick={() => handlePersonaSelect('user-rahul')}
            >
              <span>Google Workspace SSO</span>
            </button>
            <button
              type="button"
              className={styles.ssoBtn}
              onClick={() => handlePersonaSelect('user-alex')}
            >
              <span>GitHub Enterprise</span>
            </button>
          </div>

          <div className={styles.securityFooter}>
            <ShieldCheck size={14} color="#16a34a" />
            <span>SOC2 Type II Certified • 256-bit TLS Encryption • ROY Tech solutions</span>
          </div>

          <div className={styles.metaLinksRow}>
            <button type="button" className={styles.metaLinkBtn} onClick={() => onOpenMetaPage?.('brand')}>
              Brand & Favicon
            </button>
            <span>•</span>
            <button type="button" className={styles.metaLinkBtn} onClick={() => onOpenMetaPage?.('security')}>
              Security Audit
            </button>
            <span>•</span>
            <button type="button" className={styles.metaLinkBtn} onClick={() => onOpenMetaPage?.('privacy')}>
              Privacy Policy
            </button>
            <span>•</span>
            <button type="button" className={styles.metaLinkBtn} onClick={() => onOpenMetaPage?.('terms')}>
              Terms
            </button>
            <span>•</span>
            <button type="button" className={styles.metaLinkBtn} onClick={() => onOpenMetaPage?.('sitemap')}>
              Sitemap
            </button>
          </div>

          <div className={styles.creatorRow}>
            <span>❤️ Created by <strong className={styles.creatorHighlight}>LIKHITH</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
