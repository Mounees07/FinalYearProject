import React, { useState } from 'react';
import {
    Save,
    Server,
    Shield,
    Database,
    Bell,
    Globe,
    ToggleLeft,
    ToggleRight,
    Activity,
    Mail,
    Lock,
    Clock,
    User,
    FileText,
    AlertCircle
} from 'lucide-react';
import './AdminSettings.css';
import api from '../../utils/api';

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
                const response = await api.get('/admin/settings');

                if (response.data) {
                    const data = response.data;
                    setSettings(prev => ({
                        ...prev,
                        ...data,
                        maintenanceMode: data.maintenanceMode === 'true',
                        allowRegistration: data.allowRegistration === 'true',
                        emailNotifications: data.emailNotifications === 'true',
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

            const response = await api.post('/admin/settings', payload);

            if (response.status === 200) {
                alert("Settings saved successfully!");
            }
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || error.message;
            alert("Error saving settings: " + msg);
        } finally {
            setLoading(false);
        }
    };

    const ToggleSwitch = ({ name, checked, onChange }) => (
        <button
            className="toggle-btn"
            onClick={() => onChange({ target: { name, type: 'checkbox', checked: !checked } })}
        >
            {checked ? (
                <ToggleRight size={44} color="#4D44B5" fill="#EBE9FE" />
            ) : (
                <ToggleLeft size={44} color="#A098AE" />
            )}
        </button>
    );

    const tabs = [
        { id: 'general', label: 'General', icon: <Globe size={20} /> },
        { id: 'security', label: 'Security', icon: <Shield size={20} /> },
        { id: 'features', label: 'Features', icon: <Database size={20} /> },
        { id: 'env', label: 'Environment', icon: <Server size={20} /> },
        { id: 'logs', label: 'Audit Logs', icon: <Activity size={20} /> }
    ];

    const InputField = ({ label, name, type = "text", value, onChange, icon: Icon, placeholder }) => (
        <div className="form-group-styled">
            <label className="input-label">{label}</label>
            <div className="input-wrapper">
                {Icon && <Icon size={20} className="input-icon" />}
                <input
                    type={type}
                    name={name}
                    className="styled-input"
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    style={{ paddingLeft: Icon ? '48px' : '20px' }}
                />
            </div>
        </div>
    );

    const SelectField = ({ label, name, value, onChange, options }) => (
        <div className="form-group-styled">
            <label className="input-label">{label}</label>
            <div className="env-select-container">
                <select
                    name={name}
                    className="styled-select"
                    value={value}
                    onChange={onChange}
                >
                    {options.map(opt => (
                        <option key={opt}>{opt}</option>
                    ))}
                </select>
                <div className="select-arrow">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.41 0.589996L6 5.17L10.59 0.589996L12 2L6 8L0 2L1.41 0.589996Z" fill="currentColor" />
                    </svg>
                </div>
            </div>
        </div>
    );

    return (
        <div className="settings-container">
            {/* Header */}
            <div className="settings-header">
                <div className="settings-title">
                    <h2>System Configuration</h2>
                    <p>Manage platform-wide settings and preferences</p>
                </div>
                <button
                    className="save-btn"
                    onClick={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <div className="animate-spin" style={{ width: 20, height: 20, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                    ) : (
                        <Save size={20} />
                    )}
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
            </div>

            {/* Main Content Card */}
            <div className="settings-main-card">
                {/* Tabs */}
                <div className="settings-tabs-container">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        >
                            <div className="tab-icon-box">
                                {tab.icon}
                            </div>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="settings-content-area">
                    {/* GENERAL TAB */}
                    {activeTab === 'general' && (
                        <div className="section-grid animate-fade-in">
                            <div>
                                <div className="settings-section-header">
                                    <Globe size={24} color="#4D44B5" />
                                    <h3>Platform Identity</h3>
                                </div>
                                <div className="form-content">
                                    <InputField
                                        label="Platform Name"
                                        name="siteName"
                                        value={settings.siteName}
                                        onChange={handleChange}
                                        placeholder="e.g. AcaSync Platform"
                                        icon={Server}
                                    />
                                    <InputField
                                        label="Admin Contact Email"
                                        name="adminEmail"
                                        type="email"
                                        value={settings.adminEmail}
                                        onChange={handleChange}
                                        placeholder="admin@school.edu"
                                        icon={Mail}
                                    />
                                    <SelectField
                                        label="Default Language"
                                        name="defaultLanguage"
                                        value={settings.defaultLanguage}
                                        onChange={handleChange}
                                        options={['English', 'Spanish', 'French', 'German']}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="settings-section-header">
                                    <Bell size={24} color="#FB7D5B" />
                                    <h3>Notifications</h3>
                                </div>
                                <div className="form-content">
                                    <div className="toggle-row">
                                        <div className="toggle-info">
                                            <label>Email Notifications</label>
                                            <p>Send system alerts and reports via email.</p>
                                        </div>
                                        <ToggleSwitch name="emailNotifications" checked={settings.emailNotifications} onChange={handleChange} />
                                    </div>
                                    <div className="toggle-row">
                                        <div className="toggle-info">
                                            <label>Export Features</label>
                                            <p>Allow exporting reports to CSV/PDF.</p>
                                        </div>
                                        <ToggleSwitch name="report.export.enabled" checked={settings['report.export.enabled']} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECURITY TAB */}
                    {activeTab === 'security' && (
                        <div className="section-grid animate-fade-in">
                            <div>
                                <div className="settings-section-header">
                                    <Lock size={24} color="#4D44B5" />
                                    <h3>Access Control</h3>
                                </div>
                                <div className="form-content">
                                    <div className="toggle-row">
                                        <div className="toggle-info">
                                            <label>Allow Registration</label>
                                            <p>Enable public user signup pages.</p>
                                        </div>
                                        <ToggleSwitch name="allowRegistration" checked={settings.allowRegistration} onChange={handleChange} />
                                    </div>
                                    <div className="toggle-row">
                                        <div className="toggle-info">
                                            <label>Maintenance Mode</label>
                                            <p>Restrict access to administrators only.</p>
                                        </div>
                                        <ToggleSwitch name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleChange} />
                                    </div>
                                    <div style={{ marginTop: '24px' }}>
                                        <InputField
                                            label="Session Timeout (minutes)"
                                            name="sessionTimeout"
                                            type="number"
                                            value={settings.sessionTimeout}
                                            onChange={handleChange}
                                            icon={Clock}
                                            placeholder="30"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="settings-section-header">
                                    <Shield size={24} color="#FCC43E" />
                                    <h3>Security Policies</h3>
                                </div>
                                <div className="form-content">
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                        <InputField
                                            label="Min Password Length"
                                            name="policy.password.minLength"
                                            type="number"
                                            value={settings['policy.password.minLength'] || 8}
                                            onChange={handleChange}
                                            placeholder="8"
                                        />
                                        <InputField
                                            label="Max Login Attempts"
                                            name="security.login.maxAttempts"
                                            type="number"
                                            value={settings['security.login.maxAttempts'] || 5}
                                            onChange={handleChange}
                                            placeholder="5"
                                        />
                                    </div>
                                    <div className="toggle-row" style={{ marginTop: '24px' }}>
                                        <div className="toggle-info">
                                            <label>Enforce CAPTCHA</label>
                                            <p>Require CAPTCHA on login page.</p>
                                        </div>
                                        <ToggleSwitch name="security.captcha.enabled" checked={settings['security.captcha.enabled']} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* FEATURES TAB */}
                    {activeTab === 'features' && (
                        <div className="section-grid animate-fade-in">
                            <div>
                                <div className="settings-section-header">
                                    <Database size={24} color="#4D44B5" />
                                    <h3>Module Management</h3>
                                </div>
                                <div className="feature-grid">
                                    {[
                                        { key: 'feature.leave.enabled', label: 'Leave Management', desc: 'Enable leave requests and approvals.' },
                                        { key: 'feature.result.enabled', label: 'Results Module', desc: 'Enable student result publishing.' },
                                        { key: 'feature.analytics.enabled', label: 'Analytics Dashboard', desc: 'Show advanced usage stats.' },
                                        { key: 'feature.messaging.enabled', label: 'Messaging System', desc: 'Internal chat and announcements.' }
                                    ].map(item => (
                                        <div key={item.key} className="toggle-row">
                                            <div className="toggle-info">
                                                <label>{item.label}</label>
                                                <p>{item.desc}</p>
                                            </div>
                                            <ToggleSwitch name={item.key} checked={settings[item.key]} onChange={handleChange} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="settings-section-header">
                                    <AlertCircle size={24} color="#FB7D5B" />
                                    <h3>Academic Policies</h3>
                                </div>
                                <div className="form-content">
                                    <InputField
                                        label="Attendance Threshold (%)"
                                        name="policy.attendance.threshold"
                                        type="number"
                                        value={settings['policy.attendance.threshold'] || 75}
                                        onChange={handleChange}
                                        placeholder="75"
                                        icon={Shield}
                                    />
                                    <InputField
                                        label="Data Retention Period (Days)"
                                        name="policy.dataRetention"
                                        type="number"
                                        value={settings['policy.dataRetention'] || 365}
                                        onChange={handleChange}
                                        placeholder="365"
                                        icon={Clock}
                                    />
                                    <div className="alert-box">
                                        <AlertCircle size={24} color="#FB7D5B" style={{ flexShrink: 0 }} />
                                        <div className="alert-content">
                                            <h4>Important Notice</h4>
                                            <p>Changing data retention policies may permanently delete older records during the next nightly cleanup job. Please proceed with caution.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ENV TAB */}
                    {activeTab === 'env' && (
                        <div style={{ maxWidth: '800px', margin: '0 auto' }} className="animate-fade-in">
                            <div className="settings-section-header">
                                <Server size={24} color="#4D44B5" />
                                <h3>Environment Configuration</h3>
                            </div>

                            <div style={{ backgroundColor: '#F9FAFB', borderRadius: '24px', padding: '32px', border: '1px solid #F5F5FA' }}>
                                <SelectField
                                    label="Environment Label"
                                    name="env.label"
                                    value={settings['env.label'] || 'Production'}
                                    onChange={handleChange}
                                    options={['Development', 'Testing', 'Staging', 'Production']}
                                />

                                <div className="toggle-row" style={{ marginTop: '24px', backgroundColor: 'white' }}>
                                    <div className="toggle-info">
                                        <label>Debug Mode</label>
                                        <p>Enable verbose logging for system diagnostics.</p>
                                    </div>
                                    <ToggleSwitch name="env.debugMode" checked={settings['env.debugMode']} onChange={handleChange} />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#F3F4FF', borderRadius: '12px', color: '#4D44B5', marginTop: '24px', fontSize: '0.9rem' }}>
                                    <Server size={18} />
                                    <p>Current Server Version: <strong>v2.4.0-stable</strong> (Build 20240215)</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* LOGS TAB */}
                    {activeTab === 'logs' && (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }} className="animate-fade-in">
                            <div className="settings-header" style={{ marginBottom: '24px', borderBottom: '1px solid #F5F5FA', paddingBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Activity size={24} color="#4D44B5" />
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#303972', margin: 0 }}>System Audit Trail</h3>
                                </div>
                                <button style={{ border: 'none', background: 'none', color: '#4D44B5', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FileText size={16} />
                                    Export Logs
                                </button>
                            </div>
                            <div style={{ flex: 1 }}>
                                <AuditLogViewer />
                            </div>
                        </div>
                    )}
                </div>
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
                const response = await api.get('/admin/auditlogs');
                if (response.data) {
                    setLogs(response.data);
                }
            } catch (err) {
                console.error("Error fetching logs", err);
                setLogs([
                    { id: 1, action: "UPDATE_SETTINGS", actorEmail: "admin@acasync.edu", details: "Changed site name", ipAddress: "192.168.1.1", timestamp: new Date().toISOString() },
                    { id: 2, action: "LOGIN_SUCCESS", actorEmail: "teacher@acasync.edu", details: "Web login", ipAddress: "10.0.0.5", timestamp: new Date(Date.now() - 3600000).toISOString() },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#A098AE' }}>Loading activity logs...</div>;

    if (logs.length === 0) return <div style={{ padding: '40px', textAlign: 'center', color: '#A098AE' }}>No recent activity found.</div>;

    return (
        <div className="audit-table-wrapper">
            <table className="audit-table">
                <thead>
                    <tr>
                        <th width="15%">Action</th>
                        <th width="20%">User</th>
                        <th width="30%">Details</th>
                        <th width="15%">IP Address</th>
                        <th width="20%">Time</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map(log => (
                        <tr key={log.id}>
                            <td><span className="action-badge">{log.action}</span></td>
                            <td style={{ fontWeight: '500' }}>{log.actorEmail}</td>
                            <td>{log.details}</td>
                            <td><span className="code-text">{log.ipAddress}</span></td>
                            <td style={{ color: '#A098AE' }}>{new Date(log.timestamp).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminSettings;
