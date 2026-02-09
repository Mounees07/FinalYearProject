import React, { useState } from 'react';
import {
    Save,
    Server,
    Shield,
    Mail,
    Database,
    Bell,
    Globe,
    ToggleLeft,
    ToggleRight
} from 'lucide-react';
import './Admin.css';

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        siteName: 'AcaSync Platform',
        adminEmail: 'admin@acasync.edu',
        maintenanceMode: false,
        allowRegistration: true,
        emailNotifications: true,
        defaultLanguage: 'English',
        sessionTimeout: '30',
        // New settings for features, security, environment, and policies
        'feature.leave.enabled': true,
        'feature.result.enabled': true,
        'feature.messaging.enabled': true,
        'feature.analytics.enabled': true,
        'security.captcha.enabled': false,
        'env.debugMode': false,
        'report.export.enabled': true,
        'policy.password.minLength': 8,
        'security.login.maxAttempts': 5,
        'policy.attendance.threshold': 75,
        'policy.dataRetention': 365,
        'env.label': 'Production'
    });

    const [activeTab, setActiveTab] = useState('general');

    const [loading, setLoading] = useState(false);

    // Fetch settings on mount
    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('user')).token;
                const response = await fetch('http://localhost:8080/api/admin/settings', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setSettings(prev => ({
                        ...prev,
                        ...data,
                        // Convert string booleans back to booleans for the UI
                        maintenanceMode: data.maintenanceMode === 'true',
                        allowRegistration: data.allowRegistration === 'true',
                        emailNotifications: data.emailNotifications === 'true',

                        // New Features mapping
                        'feature.leave.enabled': data['feature.leave.enabled'] === 'true',
                        'feature.result.enabled': data['feature.result.enabled'] === 'true',
                        'feature.messaging.enabled': data['feature.messaging.enabled'] === 'true',
                        'feature.analytics.enabled': data['feature.analytics.enabled'] === 'true',
                        'security.captcha.enabled': data['security.captcha.enabled'] === 'true',
                        'env.debugMode': data['env.debugMode'] === 'true',
                        'report.export.enabled': data['report.export.enabled'] === 'true'
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch settings", error);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const token = JSON.parse(localStorage.getItem('user')).token;
            // Convert booleans to strings for backend storage
            const payload = {
                ...settings,
                maintenanceMode: String(settings.maintenanceMode),
                allowRegistration: String(settings.allowRegistration),
                emailNotifications: String(settings.emailNotifications),

                'feature.leave.enabled': String(settings['feature.leave.enabled']),
                'feature.result.enabled': String(settings['feature.result.enabled']),
                'feature.messaging.enabled': String(settings['feature.messaging.enabled']),
                'feature.analytics.enabled': String(settings['feature.analytics.enabled']),
                'security.captcha.enabled': String(settings['security.captcha.enabled']),
                'env.debugMode': String(settings['env.debugMode']),
                'report.export.enabled': String(settings['report.export.enabled'])
            };

            const response = await fetch('http://localhost:8080/api/admin/settings', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("Settings saved successfully!");
            } else {
                alert("Failed to save settings");
            }
        } catch (error) {
            console.error(error);
            alert("Error saving settings");
        } finally {
            setLoading(false);
        }
    };

    const ToggleSwitch = ({ name, checked, onChange }) => (
        <button
            className={`toggle-switch-btn ${checked ? 'active' : ''}`}
            onClick={() => onChange({ target: { name, type: 'checkbox', checked: !checked } })}
        >
            {checked ? <ToggleRight size={28} color="#10b981" /> : <ToggleLeft size={28} color="#64748b" />}
        </button>
    );

    const tabs = [
        { id: 'general', label: 'General', icon: <Globe size={18} /> },
        { id: 'security', label: 'Security & Access', icon: <Shield size={18} /> },
        { id: 'features', label: 'Features', icon: <Database size={18} /> },
        { id: 'env', label: 'Environment', icon: <Server size={18} /> },
        { id: 'logs', label: 'Audit Logs', icon: <Database size={18} /> }
    ];

    return (
        <div className="admin-page-container fade-in">
            <header className="page-header">
                <div>
                    <h1>System Configuration</h1>
                    <p>Manage platform-wide settings, governance, and environment controls.</p>
                </div>
                <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                    <Save size={18} />
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </header>

            {/* Tabs */}
            <div className="settings-tabs-container">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`settings-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="settings-content">

                {/* GENERAL TAB */}
                {activeTab === 'general' && (
                    <div className="settings-grid">
                        <div className="glass-card settings-card">
                            <div className="settings-header">
                                <Globe className="text-primary" size={24} />
                                <h3>Platform Identity</h3>
                            </div>
                            <div className="settings-form-group">
                                <label>Platform Name</label>
                                <input type="text" name="siteName" className="admin-input" value={settings.siteName} onChange={handleChange} />
                            </div>
                            <div className="settings-form-group">
                                <label>Admin Contact Email</label>
                                <input type="email" name="adminEmail" className="admin-input" value={settings.adminEmail} onChange={handleChange} />
                            </div>
                            <div className="settings-form-group">
                                <label>Default Language</label>
                                <select name="defaultLanguage" className="admin-select" value={settings.defaultLanguage} onChange={handleChange}>
                                    <option>English</option>
                                    <option>Spanish</option>
                                    <option>French</option>
                                </select>
                            </div>
                        </div>

                        <div className="glass-card settings-card">
                            <div className="settings-header">
                                <Bell className="text-accent" size={24} color="#ec4899" />
                                <h3>Notifications</h3>
                            </div>
                            <div className="setting-row">
                                <div className="setting-info">
                                    <label>Email Notifications</label>
                                    <p className="text-muted">Send system alerts via email.</p>
                                </div>
                                <ToggleSwitch name="emailNotifications" checked={settings.emailNotifications} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                )}

                {/* SECURITY TAB */}
                {activeTab === 'security' && (
                    <div className="settings-grid">
                        <div className="glass-card settings-card">
                            <div className="settings-header">
                                <Shield className="text-secondary" size={24} color="#f59e0b" />
                                <h3>Access Control</h3>
                            </div>
                            <div className="setting-row">
                                <div className="setting-info">
                                    <label>Allow Registration</label>
                                    <p className="text-muted">Public user signup.</p>
                                </div>
                                <ToggleSwitch name="allowRegistration" checked={settings.allowRegistration} onChange={handleChange} />
                            </div>
                            <div className="setting-row">
                                <div className="setting-info">
                                    <label>Maintenance Mode</label>
                                    <p className="text-muted">Restrict access to admins.</p>
                                </div>
                                <ToggleSwitch name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleChange} />
                            </div>
                            <div className="settings-form-group mt-4">
                                <label>Session Timeout (min)</label>
                                <input type="number" name="sessionTimeout" className="admin-input" value={settings.sessionTimeout} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="glass-card settings-card">
                            <div className="settings-header">
                                <Shield className="text-primary" size={24} />
                                <h3>Governance Policies</h3>
                            </div>
                            <div className="settings-form-group">
                                <label>Min Password Length</label>
                                <input type="number" name="policy.password.minLength" className="admin-input"
                                    value={settings['policy.password.minLength'] || 8} onChange={handleChange} />
                            </div>
                            <div className="settings-form-group">
                                <label>Login Max Attempts</label>
                                <input type="number" name="security.login.maxAttempts" className="admin-input"
                                    value={settings['security.login.maxAttempts'] || 5} onChange={handleChange} />
                            </div>
                            <div className="setting-row">
                                <div className="setting-info">
                                    <label>Enforce CAPTCHA</label>
                                    <p className="text-muted">On login page.</p>
                                </div>
                                <ToggleSwitch name="security.captcha.enabled" checked={settings['security.captcha.enabled']} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                )}

                {/* FEATURES TAB */}
                {activeTab === 'features' && (
                    <div className="settings-grid">
                        <div className="glass-card settings-card">
                            <div className="settings-header">
                                <Database className="text-success" size={24} color="#10b981" />
                                <h3>Module Management</h3>
                            </div>
                            {['feature.leave.enabled', 'feature.result.enabled', 'feature.analytics.enabled', 'feature.messaging.enabled'].map(feat => (
                                <div className="setting-row" key={feat}>
                                    <div className="setting-info">
                                        <label>{feat.split('.')[1].toUpperCase()} Module</label>
                                        <p className="text-muted">Enable {feat.split('.')[1]} functionality.</p>
                                    </div>
                                    <ToggleSwitch name={feat} checked={settings[feat]} onChange={handleChange} />
                                </div>
                            ))}
                        </div>
                        <div className="glass-card settings-card">
                            <div className="settings-header">
                                <Globe className="text-blue-400" size={24} />
                                <h3>Academic Policies</h3>
                            </div>
                            <div className="settings-form-group">
                                <label>Attendance Threshold (%)</label>
                                <input type="number" name="policy.attendance.threshold" className="admin-input"
                                    value={settings['policy.attendance.threshold'] || 75} onChange={handleChange} />
                            </div>
                            <div className="settings-form-group">
                                <label>Data Retention (Days)</label>
                                <input type="number" name="policy.dataRetention" className="admin-input"
                                    value={settings['policy.dataRetention'] || 365} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                )}

                {/* ENV TAB */}
                {activeTab === 'env' && (
                    <div className="settings-grid">
                        <div className="glass-card settings-card">
                            <div className="settings-header">
                                <Server className="text-warning" size={24} color="#f59e0b" />
                                <h3>Environment</h3>
                            </div>
                            <div className="settings-form-group">
                                <label>Environment Label</label>
                                <select name="env.label" className="admin-select" value={settings['env.label'] || 'Production'} onChange={handleChange}>
                                    <option>Development</option>
                                    <option>Testing</option>
                                    <option>Staging</option>
                                    <option>Production</option>
                                </select>
                            </div>
                            <div className="setting-row">
                                <div className="setting-info">
                                    <label>Debug Mode</label>
                                    <p className="text-muted">Verbose logging (Admin Only).</p>
                                </div>
                                <ToggleSwitch name="env.debugMode" checked={settings['env.debugMode']} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                )}

                {/* LOGS TAB */}
                {activeTab === 'logs' && (
                    <div className="glass-card p-6 mt-4">
                        <div className="settings-header">
                            <Shield className="text-primary" size={24} />
                            <h3>Audit Trail</h3>
                        </div>
                        <AuditLogViewer />
                    </div>
                )}

            </div>
        </div>
    );
};

const AuditLogViewer = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchLogs = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('user')).token;
                const response = await fetch('http://localhost:8080/api/admin/auditlogs', { // Corrected URL
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setLogs(data);
                }
            } catch (err) {
                console.error("Error fetching logs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    if (loading) return <div>Loading activity logs...</div>;

    if (logs.length === 0) return <div className="text-muted">No recent activity found.</div>;

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-white/5 uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3">Action</th>
                        <th className="px-4 py-3">User</th>
                        <th className="px-4 py-3">Details</th>
                        <th className="px-4 py-3">IP</th>
                        <th className="px-4 py-3">Time</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {logs.map(log => (
                        <tr key={log.id} className="hover:bg-white/5">
                            <td className="px-4 py-3 font-medium text-white">{log.action}</td>
                            <td className="px-4 py-3">{log.actorEmail}</td>
                            <td className="px-4 py-3">{log.details}</td>
                            <td className="px-4 py-3 font-mono text-xs">{log.ipAddress}</td>
                            <td className="px-4 py-3 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminSettings;
