import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiShield, FiGlobe, FiMail, FiBell, FiDatabase } from 'react-icons/fi';
import toast from 'react-hot-toast';

type Tab = 'general' | 'security' | 'email' | 'notifications' | 'system';

const inputS: React.CSSProperties = {
  width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9,
  color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box',
};

const TABS: { id: Tab; icon: any; label: string }[] = [
  { id: 'general',       icon: FiGlobe,    label: 'General' },
  { id: 'security',      icon: FiShield,   label: 'Security' },
  { id: 'email',         icon: FiMail,     label: 'Email' },
  { id: 'notifications', icon: FiBell,     label: 'Notifications' },
  { id: 'system',        icon: FiDatabase, label: 'System' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h4 style={{ fontSize: 13, fontWeight: 600, color: '#818cf8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>{title}</h4>
      <div style={{ display: 'grid', gap: 14 }}>{children}</div>
    </div>
  );
}

function Field({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 16, alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        {description && <div style={{ fontSize: 11, color: '#a0a0b8', marginTop: 2 }}>{description}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} style={{
      width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
      background: checked ? 'linear-gradient(135deg,#4F46E5,#7C3AED)' : 'rgba(255,255,255,0.1)',
      position: 'relative', transition: 'background 0.2s',
    }}>
      <div style={{
        position: 'absolute', top: 3, left: checked ? 23 : 3, width: 18, height: 18,
        borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
      }} />
    </button>
  );
}

export default function AdminSettings() {
  const [tab, setTab] = useState<Tab>('general');

  const [general, setGeneral] = useState({ siteName: 'EventNexus', siteUrl: 'https://eventnexus.com', supportEmail: 'support@eventnexus.com', timezone: 'UTC', currency: 'USD' });
  const [security, setSecurity] = useState({ twoFactor: false, sessionTimeout: 60, maxLoginAttempts: 5, enforceHttps: true });
  const [email, setEmail]       = useState({ fromName: 'EventNexus', fromEmail: 'no-reply@eventnexus.com', smtpHost: 'smtp.gmail.com', smtpPort: '587', smtpUser: '', smtpPass: '' });
  const [notif, setNotif]       = useState({ newBooking: true, newUser: true, eventCancelled: true, lowCapacity: false, dailyReport: false });
  const [system, setSystem]     = useState({ maintenanceMode: false, debugMode: false, cacheEnabled: true, logLevel: 'info' });

  const save = () => toast.success('Settings saved (UI demo — connect backend to persist)');

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px',
              borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
              background: tab === t.id ? 'rgba(79,70,229,0.2)' : 'rgba(255,255,255,0.05)',
              color: tab === t.id ? '#818cf8' : '#a0a0b8',
            }}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        style={{ padding: 28, background: 'rgba(255,255,255,0.03)', borderRadius: 18, border: '1px solid rgba(255,255,255,0.06)' }}>

        {tab === 'general' && (
          <>
            <Section title="Site Information">
              <Field label="Site Name" description="Displayed in emails and browser tabs">
                <input value={general.siteName} onChange={e => setGeneral(p=>({...p,siteName:e.target.value}))} style={inputS} />
              </Field>
              <Field label="Site URL">
                <input value={general.siteUrl} onChange={e => setGeneral(p=>({...p,siteUrl:e.target.value}))} style={inputS} />
              </Field>
              <Field label="Support Email">
                <input value={general.supportEmail} onChange={e => setGeneral(p=>({...p,supportEmail:e.target.value}))} style={inputS} />
              </Field>
            </Section>
            <Section title="Locale">
              <Field label="Timezone">
                <select value={general.timezone} onChange={e => setGeneral(p=>({...p,timezone:e.target.value}))} style={inputS}>
                  {['UTC','America/New_York','America/Los_Angeles','Europe/London','Asia/Kolkata','Asia/Dubai'].map(tz => (
                    <option key={tz} value={tz} style={{ background: '#0d0d1f' }}>{tz}</option>
                  ))}
                </select>
              </Field>
              <Field label="Currency">
                <select value={general.currency} onChange={e => setGeneral(p=>({...p,currency:e.target.value}))} style={inputS}>
                  {['USD','EUR','GBP','INR','AED'].map(c => <option key={c} value={c} style={{ background: '#0d0d1f' }}>{c}</option>)}
                </select>
              </Field>
            </Section>
          </>
        )}

        {tab === 'security' && (
          <Section title="Security Settings">
            <Field label="Two-Factor Auth" description="Require 2FA for admin logins">
              <Toggle checked={security.twoFactor} onChange={v => setSecurity(p=>({...p,twoFactor:v}))} />
            </Field>
            <Field label="Session Timeout" description="Minutes before auto-logout">
              <input type="number" value={security.sessionTimeout} onChange={e => setSecurity(p=>({...p,sessionTimeout:Number(e.target.value)}))} style={{ ...inputS, width: 100 }} min={5} />
            </Field>
            <Field label="Max Login Attempts" description="Lock after N failed attempts">
              <input type="number" value={security.maxLoginAttempts} onChange={e => setSecurity(p=>({...p,maxLoginAttempts:Number(e.target.value)}))} style={{ ...inputS, width: 100 }} min={1} />
            </Field>
            <Field label="Enforce HTTPS" description="Redirect all HTTP to HTTPS">
              <Toggle checked={security.enforceHttps} onChange={v => setSecurity(p=>({...p,enforceHttps:v}))} />
            </Field>
          </Section>
        )}

        {tab === 'email' && (
          <Section title="Email / SMTP Configuration">
            <Field label="From Name"><input value={email.fromName} onChange={e => setEmail(p=>({...p,fromName:e.target.value}))} style={inputS} /></Field>
            <Field label="From Email"><input value={email.fromEmail} onChange={e => setEmail(p=>({...p,fromEmail:e.target.value}))} style={inputS} /></Field>
            <Field label="SMTP Host"><input value={email.smtpHost} onChange={e => setEmail(p=>({...p,smtpHost:e.target.value}))} style={inputS} /></Field>
            <Field label="SMTP Port"><input value={email.smtpPort} onChange={e => setEmail(p=>({...p,smtpPort:e.target.value}))} style={{ ...inputS, width: 100 }} /></Field>
            <Field label="SMTP User"><input value={email.smtpUser} onChange={e => setEmail(p=>({...p,smtpUser:e.target.value}))} style={inputS} placeholder="username" /></Field>
            <Field label="SMTP Password"><input type="password" value={email.smtpPass} onChange={e => setEmail(p=>({...p,smtpPass:e.target.value}))} style={inputS} placeholder="••••••••" /></Field>
          </Section>
        )}

        {tab === 'notifications' && (
          <Section title="Admin Alert Preferences">
            {([
              ['newBooking',     'New Booking',      'Alert when a user books a ticket'],
              ['newUser',        'New User',         'Alert when a new user registers'],
              ['eventCancelled', 'Event Cancelled',  'Alert when an event is cancelled'],
              ['lowCapacity',    'Low Capacity',     'Alert when event is 90% full'],
              ['dailyReport',    'Daily Report',     'Receive daily summary email'],
            ] as [keyof typeof notif, string, string][]).map(([key, label, desc]) => (
              <Field key={key} label={label} description={desc}>
                <Toggle checked={notif[key] as boolean} onChange={v => setNotif(p=>({...p,[key]:v}))} />
              </Field>
            ))}
          </Section>
        )}

        {tab === 'system' && (
          <Section title="System Configuration">
            <Field label="Maintenance Mode" description="Temporarily take the site offline">
              <Toggle checked={system.maintenanceMode} onChange={v => setSystem(p=>({...p,maintenanceMode:v}))} />
            </Field>
            <Field label="Debug Mode" description="Enable verbose error logging">
              <Toggle checked={system.debugMode} onChange={v => setSystem(p=>({...p,debugMode:v}))} />
            </Field>
            <Field label="Cache Enabled" description="Enable Redis/memory caching">
              <Toggle checked={system.cacheEnabled} onChange={v => setSystem(p=>({...p,cacheEnabled:v}))} />
            </Field>
            <Field label="Log Level">
              <select value={system.logLevel} onChange={e => setSystem(p=>({...p,logLevel:e.target.value}))} style={{ ...inputS, width: 140 }}>
                {['debug','info','warn','error'].map(l => <option key={l} value={l} style={{ background: '#0d0d1f' }}>{l}</option>)}
              </select>
            </Field>
          </Section>
        )}

        <div style={{ paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={save} className="btn btn-primary" style={{ padding: '10px 24px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 7 }}>
            <FiSave size={14} /> Save Settings
          </button>
        </div>
      </motion.div>
    </div>
  );
}
