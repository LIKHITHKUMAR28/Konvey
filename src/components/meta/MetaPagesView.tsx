import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  FileText,
  Lock,
  Sparkles,
  Map,
  Copy,
  Download,
  CheckCircle2,
  ExternalLink,
  Layers,
  Globe,
  Users,
  Compass,
  Check,
} from 'lucide-react';
import { useToast } from '../ui/Toast';
import { Badge } from '../ui/Badge';
import styles from './MetaPagesView.module.css';

export type MetaTab = 'brand' | 'security' | 'privacy' | 'terms' | 'sitemap';

interface MetaPagesViewProps {
  initialTab?: MetaTab;
  onBack: () => void;
}

export const MetaPagesView: React.FC<MetaPagesViewProps> = ({
  initialTab = 'brand',
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<MetaTab>(initialTab);
  const [copiedSvg, setCopiedSvg] = useState(false);
  const { showToast } = useToast();

  const handleCopySvg = async () => {
    try {
      const response = await fetch('/favicon.svg');
      const text = await response.text();
      await navigator.clipboard.writeText(text);
      setCopiedSvg(true);
      showToast({
        type: 'success',
        title: 'Favicon SVG Copied',
        message: 'Raw vector markup copied to clipboard.',
      });
      setTimeout(() => setCopiedSvg(false), 2000);
    } catch {
      showToast({
        type: 'info',
        title: 'Favicon Vector',
        message: 'Favicon available at /favicon.svg',
      });
    }
  };

  return (
    <div className={styles.metaContainer}>
      {/* Top Navigation */}
      <nav className={styles.topNav}>
        <div className={styles.brandGroup} onClick={onBack} role="button" tabIndex={0}>
          <img src="/logo.png" alt="Konvey" className={styles.brandLogoImg} />
          <span className={styles.brandName}>Konvey</span>
          <Badge variant="default" size="sm">Docs & Meta</Badge>
        </div>

        {/* Tab Strip */}
        <div className={styles.navTabs}>
          <button
            type="button"
            className={`${styles.navTabBtn} ${activeTab === 'brand' ? styles.navTabActive : ''}`}
            onClick={() => setActiveTab('brand')}
          >
            <Sparkles size={14} />
            <span>Favicon & Brand</span>
          </button>
          <button
            type="button"
            className={`${styles.navTabBtn} ${activeTab === 'security' ? styles.navTabActive : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <ShieldCheck size={14} />
            <span>Security</span>
          </button>
          <button
            type="button"
            className={`${styles.navTabBtn} ${activeTab === 'privacy' ? styles.navTabActive : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            <Lock size={14} />
            <span>Privacy</span>
          </button>
          <button
            type="button"
            className={`${styles.navTabBtn} ${activeTab === 'terms' ? styles.navTabActive : ''}`}
            onClick={() => setActiveTab('terms')}
          >
            <FileText size={14} />
            <span>Terms</span>
          </button>
          <button
            type="button"
            className={`${styles.navTabBtn} ${activeTab === 'sitemap' ? styles.navTabActive : ''}`}
            onClick={() => setActiveTab('sitemap')}
          >
            <Map size={14} />
            <span>Sitemap</span>
          </button>
        </div>

        {/* Back Button */}
        <button type="button" className={styles.backBtn} onClick={onBack}>
          <ArrowLeft size={14} />
          <span>Back to Workspace</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className={styles.contentArea}>
        {/* TAB 1: BRAND & FAVICON PAGE */}
        {activeTab === 'brand' && (
          <div>
            <div className={styles.heroHeader}>
              <span className={styles.heroTag}>
                <Sparkles size={13} />
                <span>Brand Identity System</span>
              </span>
              <h1 className={styles.heroTitle}>Favicon & Brand Assets</h1>
              <p className={styles.heroSubtitle}>
                The visual language of forward momentum. High-contrast precision geometry inspired by continuous conveyors and rapid task resolution.
              </p>
            </div>

            {/* Interactive Browser Tab Mockup */}
            <div className={styles.browserMockup}>
              <div className={styles.browserHeader}>
                <div className={styles.windowButtons}>
                  <div className={styles.windowDot} style={{ backgroundColor: '#ef4444' }} />
                  <div className={styles.windowDot} style={{ backgroundColor: '#f59e0b' }} />
                  <div className={styles.windowDot} style={{ backgroundColor: '#10b981' }} />
                </div>
                <div className={styles.tabPill}>
                  <img src="/favicon.svg" alt="Konvey Favicon" className={styles.tabFaviconImg} />
                  <span>KONVEY — Keep work moving</span>
                  <span className={styles.tabClose}>×</span>
                </div>
              </div>
              <div className={styles.browserAddressBar}>
                <Lock size={12} color="#10b981" />
                <span>https://konvey-a357d.web.app</span>
              </div>
              <div className={styles.browserCanvas}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                  <img src="/favicon.svg" alt="Konvey Icon" style={{ width: '64px', height: '64px', filter: 'drop-shadow(0 4px 12px rgba(134, 59, 255, 0.45))' }} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>Konvey</div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Vector Dynamic Favicon Specification</div>
                  </div>
                </div>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', maxWidth: '440px', margin: 0 }}>
                  Crafted for high legibility at 16×16px browser tab scales and sharp contrast on both light and dark operating systems.
                </p>
              </div>
            </div>

            {/* Icon Specifications Grid */}
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '2rem 0 1rem' }}>Icon Asset Variants</h2>
            <div className={styles.iconSpecsGrid}>
              <div className={styles.iconSpecCard}>
                <div className={styles.iconSpecFrame}>
                  <img src="/favicon.svg" alt="16x16 Favicon" style={{ width: '16px', height: '16px' }} />
                </div>
                <div className={styles.iconSpecTitle}>Standard Favicon</div>
                <div className={styles.iconSpecSub}>16×16 / 32×32 (.svg / .ico)</div>
                <Badge variant="primary" size="sm">Live in Tab</Badge>
              </div>

              <div className={styles.iconSpecCard}>
                <div className={styles.iconSpecFrame}>
                  <img src="/favicon.svg" alt="Apple Touch Icon" style={{ width: '48px', height: '48px', borderRadius: '10px' }} />
                </div>
                <div className={styles.iconSpecTitle}>Apple Touch Icon</div>
                <div className={styles.iconSpecSub}>180×180 PNG Maskable</div>
                <Badge variant="success" size="sm">iOS Ready</Badge>
              </div>

              <div className={styles.iconSpecCard}>
                <div className={styles.iconSpecFrame}>
                  <img src="/favicon.svg" alt="PWA App Icon" style={{ width: '64px', height: '64px' }} />
                </div>
                <div className={styles.iconSpecTitle}>Web App Manifest</div>
                <div className={styles.iconSpecSub}>192×192 / 512×512 PWA</div>
                <Badge variant="intel" size="sm">PWA Installable</Badge>
              </div>

              <div className={styles.iconSpecCard}>
                <div className={styles.iconSpecFrame}>
                  <img src="/logo.png" alt="Brand Logo Mark" style={{ width: '48px', height: '48px', borderRadius: '8px' }} />
                </div>
                <div className={styles.iconSpecTitle}>Master Brandmark</div>
                <div className={styles.iconSpecSub}>High-Res Square PNG</div>
                <Badge variant="warning" size="sm">Master Asset</Badge>
              </div>
            </div>

            {/* Design Tokens & Palette */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIconBox}><Layers size={18} /></div>
                <h3 className={styles.cardTitle}>Color Palette & Brand Tokens</h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 1rem' }}>
                Curated palette designed for executive legibility, enterprise dark mode, and high-energy sprint focus.
              </p>
              <div className={styles.colorPaletteRow}>
                <div className={styles.colorSwatch}>
                  <div className={styles.colorBox} style={{ backgroundColor: '#863bff' }} />
                  <div className={styles.colorInfo}>
                    <span className={styles.colorName}>Electric Indigo</span>
                    <span className={styles.colorHex}>#863BFF</span>
                  </div>
                </div>
                <div className={styles.colorSwatch}>
                  <div className={styles.colorBox} style={{ backgroundColor: '#2563eb' }} />
                  <div className={styles.colorInfo}>
                    <span className={styles.colorName}>Conveyor Blue</span>
                    <span className={styles.colorHex}>#2563EB</span>
                  </div>
                </div>
                <div className={styles.colorSwatch}>
                  <div className={styles.colorBox} style={{ backgroundColor: '#47bfff' }} />
                  <div className={styles.colorInfo}>
                    <span className={styles.colorName}>Velocity Cyan</span>
                    <span className={styles.colorHex}>#47BFFF</span>
                  </div>
                </div>
                <div className={styles.colorSwatch}>
                  <div className={styles.colorBox} style={{ backgroundColor: '#090d16' }} />
                  <div className={styles.colorInfo}>
                    <span className={styles.colorName}>Deep Void</span>
                    <span className={styles.colorHex}>#090D16</span>
                  </div>
                </div>
                <div className={styles.colorSwatch}>
                  <div className={styles.colorBox} style={{ backgroundColor: '#10b981' }} />
                  <div className={styles.colorInfo}>
                    <span className={styles.colorName}>Resolution Green</span>
                    <span className={styles.colorHex}>#10B981</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className={styles.actionBtnRow}>
                <button type="button" className={styles.primaryActionBtn} onClick={handleCopySvg}>
                  {copiedSvg ? <Check size={15} /> : <Copy size={15} />}
                  <span>{copiedSvg ? 'Copied SVG Markup!' : 'Copy Vector SVG Markup'}</span>
                </button>
                <a
                  href="/favicon.svg"
                  download="konvey-favicon.svg"
                  className={styles.secondaryActionBtn}
                  style={{ textDecoration: 'none' }}
                >
                  <Download size={15} />
                  <span>Download favicon.svg</span>
                </a>
                <a
                  href="/site.webmanifest"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.secondaryActionBtn}
                  style={{ textDecoration: 'none' }}
                >
                  <ExternalLink size={15} />
                  <span>View Web Manifest</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SECURITY & PRE-LAUNCH AUDIT */}
        {activeTab === 'security' && (
          <div className={styles.proseSection}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <div className={styles.cardIconBox}><ShieldCheck size={20} /></div>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 800 }}>Pre-Launch Security Audit Attestation</h1>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                  Verified compliance across 11 OWASP Top 10, Cloud Identity, and Multi-Tenant Isolation controls.
                </p>
              </div>
            </div>

            <h2>1. Security Controls & Audit Summary</h2>
            <table className={styles.auditTable}>
              <thead>
                <tr>
                  <th>Audit Category</th>
                  <th>Status</th>
                  <th>Remediation Implementation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Authentication & Session Handling</strong></td>
                  <td><Badge variant="success" size="sm">VERIFIED</Badge></td>
                  <td>Eliminated default fallback logins; enforced credential validation; anti-user enumeration protections.</td>
                </tr>
                <tr>
                  <td><strong>Multi-Tenant Data Isolation</strong></td>
                  <td><Badge variant="success" size="sm">VERIFIED</Badge></td>
                  <td>Firestore & Cloud Storage security rules locked to authenticated user organization boundaries.</td>
                </tr>
                <tr>
                  <td><strong>Privilege Escalation Prevention</strong></td>
                  <td><Badge variant="success" size="sm">VERIFIED</Badge></td>
                  <td>Firestore rules block non-admin writes to <code>role</code> or <code>organizationIds</code>. Self-registration defaults strictly to member.</td>
                </tr>
                <tr>
                  <td><strong>Input Sanitization & Injection Defense</strong></td>
                  <td><Badge variant="success" size="sm">VERIFIED</Badge></td>
                  <td>Enforced <code>sanitizeTitle</code> (≤180 chars) and <code>sanitizeDescription</code> (≤4,000 chars) on all workspace inputs.</td>
                </tr>
                <tr>
                  <td><strong>Brute-Force & Rate Limiting</strong></td>
                  <td><Badge variant="success" size="sm">VERIFIED</Badge></td>
                  <td>Client-side 5-attempt threshold with mandatory 30-second lockout timer and exponential backoff.</td>
                </tr>
                <tr>
                  <td><strong>HTTP Security Headers</strong></td>
                  <td><Badge variant="success" size="sm">VERIFIED</Badge></td>
                  <td>Injected <code>X-Frame-Options: DENY</code>, <code>nosniff</code>, <code>HSTS</code>, and restrictive <code>Content-Security-Policy</code>.</td>
                </tr>
                <tr>
                  <td><strong>Dependency Vulnerability Mitigation</strong></td>
                  <td><Badge variant="success" size="sm">VERIFIED</Badge></td>
                  <td>Pinned stable Vite v6.4.4; 0 known vulnerabilities in production bundle.</td>
                </tr>
              </tbody>
            </table>

            <h2>2. Role-Based Access Control (RBAC) Matrix</h2>
            <p>
              KONVEY enforces strict least-privilege role boundaries across all internal workspaces and the external client executive portal:
            </p>
            <ul>
              <li><strong>Administrator:</strong> Organization settings, member role assignment, user transfers, security configurations, AI context recovery engine.</li>
              <li><strong>Project Manager:</strong> Project creation, sprint target dates, milestone roadmap, blocker resolution assignment, client change approval.</li>
              <li><strong>Team Member:</strong> Task execution, Kanban transitions, blocker reporting, distraction-free focus sessions, decision log view.</li>
              <li><strong>Client Executive:</strong> Isolated portal access for project progress monitoring, delivery delay inquiries, change suggestions, and requirement updates. Internal tooling (Kanban, Search, Settings) is strictly inaccessible.</li>
            </ul>

            <h2>3. Vulnerability Reporting</h2>
            <p>
              To report a vulnerability or inquire about enterprise penetration testing reports, please contact our security team at <code>security@konvey.io</code> with PGP-encrypted details.
            </p>
          </div>
        )}

        {/* TAB 3: PRIVACY POLICY */}
        {activeTab === 'privacy' && (
          <div className={styles.proseSection}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <div className={styles.cardIconBox}><Lock size={20} /></div>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 800 }}>Privacy Policy</h1>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                  Effective Date: October 7, 2026 • Enterprise Data Governance
                </p>
              </div>
            </div>

            <h2>1. Information We Collect</h2>
            <p>
              KONVEY collects information strictly necessary to provide intelligent workforce and project operations services:
            </p>
            <ul>
              <li><strong>Identity Data:</strong> Name, work email address, job title, and workspace avatar.</li>
              <li><strong>Workspace Content:</strong> Projects, tasks, milestone dates, blocker classifications, and architectural decision records.</li>
              <li><strong>Telemetry & Session Data:</strong> Timestamps of task modifications and session activity used solely to calculate 60-second Context Recovery summaries.</li>
            </ul>

            <h2>2. Zero Customer Data AI Training</h2>
            <p>
              We maintain an immutable commitment to enterprise data sovereignty: <strong>Your workspace data, project roadmaps, and decision logs are never used to train public machine learning models.</strong> All context catch-up processing occurs in transient, isolated memory without persistent model fine-tuning.
            </p>

            <h2>3. Data Storage & Encryption Standards</h2>
            <p>
              All customer data is encrypted in transit using <strong>TLS 1.3 with 256-bit AES encryption</strong> and encrypted at rest using industry-standard AES-256 in Google Cloud Platform / Firebase multi-region instances.
            </p>

            <h2>4. Your Rights (GDPR & CCPA)</h2>
            <p>
              As a workspace participant, you have the right to inspect, export, or request immediate erasure of your personal data. Workspace administrators can export a full JSON backup of all organizational state at any time via the Settings console.
            </p>
          </div>
        )}

        {/* TAB 4: TERMS OF SERVICE */}
        {activeTab === 'terms' && (
          <div className={styles.proseSection}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <div className={styles.cardIconBox}><FileText size={20} /></div>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 800 }}>Terms of Service</h1>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                  Standard Enterprise Terms • Version 2.4
                </p>
              </div>
            </div>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using the KONVEY platform, you agree to be bound by these Terms of Service. If you are entering into these terms on behalf of a company or organization, you represent that you have the authority to bind such entity.
            </p>

            <h2>2. Multi-Tenant Organizational Governance</h2>
            <p>
              Each workspace operates under a dedicated organization boundary. Organization administrators are responsible for designating user roles, maintaining active account authorization, and reviewing client portal collaborations.
            </p>

            <h2>3. Uptime Commitment (SLA)</h2>
            <p>
              KONVEY targets 99.9% monthly service availability for core task management, blocker tracking, and client portal operations, excluding scheduled maintenance windows announced at least 48 hours in advance.
            </p>

            <h2>4. Intellectual Property</h2>
            <p>
              You retain all right, title, and interest in and to all workspace data, project deliverables, and technical decisions submitted to KONVEY. We claim no intellectual property rights over any materials uploaded to the service.
            </p>
          </div>
        )}

        {/* TAB 5: SITEMAP & ARCHITECTURE */}
        {activeTab === 'sitemap' && (
          <div>
            <div className={styles.heroHeader}>
              <span className={styles.heroTag}>
                <Map size={13} />
                <span>Information Architecture</span>
              </span>
              <h1 className={styles.heroTitle}>System Sitemap & Route Matrix</h1>
              <p className={styles.heroSubtitle}>
                A complete map of KONVEY’s information architecture, user journeys, and role-gated access routes.
              </p>
            </div>

            <div className={styles.gridTwoCol}>
              {/* Public & Entry Routes */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIconBox}><Globe size={18} /></div>
                  <h3 className={styles.cardTitle}>Public & Launchpad Routes</h3>
                </div>
                <ul style={{ paddingLeft: '1.25rem', margin: 0, lineHeight: 1.8, fontSize: '0.9rem', color: '#475569' }}>
                  <li><strong>/ (Root URL):</strong> Primary Auth Page, 1-Click Persona Launchpad, SSO</li>
                  <li><strong>/sitemap.xml:</strong> Standard XML search engine crawler index</li>
                  <li><strong>/robots.txt:</strong> Search robot crawling directives</li>
                  <li><strong>/site.webmanifest:</strong> PWA installation configuration</li>
                  <li><strong>/favicon.svg & /favicon.ico:</strong> Responsive vector brand icon</li>
                </ul>
              </div>

              {/* Admin Workspace */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIconBox}><Users size={18} /></div>
                  <h3 className={styles.cardTitle}>Executive & Admin Console</h3>
                </div>
                <ul style={{ paddingLeft: '1.25rem', margin: 0, lineHeight: 1.8, fontSize: '0.9rem', color: '#475569' }}>
                  <li><strong>Dashboard:</strong> Velocity metrics, blocker severity breakdown, health</li>
                  <li><strong>Teams & Members:</strong> Role assignment, member reassignment, transfers</li>
                  <li><strong>Context Recovery:</strong> 60-second cross-project catch-up engine</li>
                  <li><strong>Settings & Security:</strong> Organization config, data backup & restore</li>
                </ul>
              </div>

              {/* Project Manager Workspace */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIconBox}><Compass size={18} /></div>
                  <h3 className={styles.cardTitle}>Project Manager Workspace</h3>
                </div>
                <ul style={{ paddingLeft: '1.25rem', margin: 0, lineHeight: 1.8, fontSize: '0.9rem', color: '#475569' }}>
                  <li><strong>Project Workspace:</strong> Sprint milestones, progress calculation, target dates</li>
                  <li><strong>Blocker Radar:</strong> Critical path blocker chains & resolution owners</li>
                  <li><strong>Decision Memory:</strong> Architectural rationale & ADR registry</li>
                  <li><strong>Client Approvals:</strong> Review and accept/reject client change requests</li>
                </ul>
              </div>

              {/* Client Executive Portal */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIconBox}><Sparkles size={18} /></div>
                  <h3 className={styles.cardTitle}>Client Executive Portal</h3>
                </div>
                <ul style={{ paddingLeft: '1.25rem', margin: 0, lineHeight: 1.8, fontSize: '0.9rem', color: '#475569' }}>
                  <li><strong>Progress Monitoring:</strong> Live milestone roadmap, completed deliverables</li>
                  <li><strong>Question Delay:</strong> Inquire on schedule slips with PM response log</li>
                  <li><strong>Suggest Changes:</strong> Propose feature updates for PM triage</li>
                  <li><strong>Modify Requirements:</strong> Submit scope modifications with impact tracking</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={styles.metaFooter}>
        <div className={styles.metaFooterLinks}>
          <span className={styles.metaFooterLink} onClick={() => setActiveTab('brand')}>Brand & Favicon</span>
          <span>•</span>
          <span className={styles.metaFooterLink} onClick={() => setActiveTab('security')}>Security Audit</span>
          <span>•</span>
          <span className={styles.metaFooterLink} onClick={() => setActiveTab('privacy')}>Privacy Policy</span>
          <span>•</span>
          <span className={styles.metaFooterLink} onClick={() => setActiveTab('terms')}>Terms of Service</span>
          <span>•</span>
          <span className={styles.metaFooterLink} onClick={() => setActiveTab('sitemap')}>XML Sitemap</span>
        </div>
        <p style={{ margin: 0 }}>
          © {new Date().getFullYear()} KONVEY Technologies Inc. Keep work moving. All rights reserved.
        </p>
      </footer>
    </div>
  );
};
