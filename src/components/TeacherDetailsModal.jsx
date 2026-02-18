import React, { useState, useEffect } from 'react';
import { X, Save, User, BookOpen, Activity, MapPin, Briefcase } from 'lucide-react';
import './StudentDetailsModal.css'; // Re-use the same CSS for consistency

// Re-use component definitions to maintain style consistency
const InputField = ({ label, name, type = "text", required = false, formData, onChange, placeholder = "" }) => (
    <div className="sdm-form-group">
        <label className="sdm-label">{label}</label>
        <input
            type={type}
            name={name}
            value={formData[name] || ''}
            onChange={onChange}
            required={required}
            className="sdm-input"
            placeholder={placeholder}
        />
    </div>
);

const TextAreaField = ({ label, name, required = false, formData, onChange }) => (
    <div className="sdm-form-group sdm-full-width">
        <label className="sdm-label">{label}</label>
        <textarea
            name={name}
            value={formData[name] || ''}
            onChange={onChange}
            required={required}
            className="sdm-textarea"
            rows="3"
        />
    </div>
);

const Section = ({ title, icon: Icon, children }) => (
    <div className="sdm-section">
        <div className="sdm-section-header">
            <div className="sdm-section-icon">
                <Icon size={20} />
            </div>
            <h3 className="sdm-section-title">{title}</h3>
        </div>
        <div className="sdm-grid">
            {children}
        </div>
    </div>
);

const TeacherDetailsModal = ({ teacher, mode, onClose, onSave }) => {
    // Default to 'Personal' tab
    const [activeTab, setActiveTab] = useState('Personal');
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (teacher && (mode === 'edit' || mode === 'view')) {
            setFormData(teacher);
        } else {
            // "add" mode default state
            setFormData({
                role: 'TEACHER', // Default role
                fullName: '',
                email: '',
                password: 'password123',
                mobileNumber: '',
                department: '',
                designation: '',
                address: '',
                dateOfBirth: '',
                gender: '',
                qualification: '',
                experience: '',
                joiningDate: ''
            });
        }
    }, [teacher, mode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (mode === 'view') {
            return;
        }
        onSave(formData);
    };

    const tabs = [
        { id: 'Personal', label: 'Personal', icon: User },
        { id: 'Professional', label: 'Professional', icon: Briefcase },
        { id: 'Address', label: 'Address', icon: MapPin },
    ];

    const isViewMode = mode === 'view';

    return (
        <div className="sdm-overlay">
            <div className="sdm-content">
                <div className="sdm-header">
                    <h2 className="sdm-title">
                        {mode === 'add' ? 'Add New Faculty' :
                            mode === 'edit' ? 'Edit Faculty Details' : 'Faculty Details'}
                    </h2>
                    <button onClick={onClose} className="sdm-close-btn">
                        <X size={24} />
                    </button>
                </div>

                <div className="sdm-tabs-container">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`sdm-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="forms-container" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '16px' }}>
                    <form id="teacher-form" onSubmit={handleSubmit}>
                        <fieldset disabled={isViewMode} style={{ border: 'none', padding: 0, margin: 0 }}>
                            {activeTab === 'Personal' && (
                                <Section title="Personal Details" icon={User}>
                                    <div className="sdm-form-group">
                                        <label className="sdm-label">Role</label>
                                        <select
                                            name="role"
                                            value={formData.role || 'TEACHER'}
                                            onChange={handleChange}
                                            required
                                            className="sdm-input"
                                        >
                                            <option value="TEACHER">Teacher</option>
                                            <option value="MENTOR">Mentor</option>
                                            <option value="HOD">HOD</option>
                                            <option value="PRINCIPAL">Principal</option>
                                        </select>
                                    </div>
                                    <InputField label="Full Name" name="fullName" required formData={formData} onChange={handleChange} />
                                    <InputField label="Email" name="email" type="email" required formData={formData} onChange={handleChange} />
                                    {mode === 'add' && (
                                        <InputField label="Password" name="password" type="password" required formData={formData} onChange={handleChange} />
                                    )}
                                    <InputField label="Mobile Number" name="mobileNumber" formData={formData} onChange={handleChange} />
                                    <InputField label="Date of Birth" name="dateOfBirth" type="date" formData={formData} onChange={handleChange} />
                                    <InputField label="Gender" name="gender" formData={formData} onChange={handleChange} />
                                </Section>
                            )}

                            {activeTab === 'Professional' && (
                                <Section title="Professional Details" icon={Briefcase}>
                                    <InputField label="Department" name="department" formData={formData} onChange={handleChange} />
                                    <InputField label="Designation" name="designation" formData={formData} onChange={handleChange} placeholder="e.g. Professor" />
                                    <InputField label="Qualification" name="qualification" formData={formData} onChange={handleChange} />
                                    <InputField label="Experience (Years)" name="experience" formData={formData} onChange={handleChange} />
                                    <InputField label="Joining Date" name="joiningDate" type="date" formData={formData} onChange={handleChange} />
                                </Section>
                            )}

                            {activeTab === 'Address' && (
                                <Section title="Address & Contact" icon={MapPin}>
                                    <TextAreaField label="Address" name="address" formData={formData} onChange={handleChange} />
                                </Section>
                            )}
                        </fieldset>
                    </form>
                </div>

                <div className="sdm-footer">
                    <button type="button" onClick={onClose} className="sdm-btn-cancel">
                        {isViewMode ? 'Close' : 'Cancel'}
                    </button>
                    {!isViewMode && (
                        <button type="submit" form="teacher-form" className="sdm-btn-save">
                            <Save size={18} />
                            Save Faculty
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherDetailsModal;
