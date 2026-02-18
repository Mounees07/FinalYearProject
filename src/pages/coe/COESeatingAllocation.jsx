import React, { useState, useEffect } from 'react';
import {
    Users,
    Upload,
    Calendar,
    MapPin,
    FileText,
    CheckCircle,
    AlertCircle,
    Download
} from 'lucide-react';
import api from '../../utils/api';
import './COESeatingAllocation.css';

const COESeatingAllocation = () => {
    const [exams, setExams] = useState([]);
    const [allocations, setAllocations] = useState([]);

    const [selectedExam, setSelectedExam] = useState('');
    const [csvFile, setCsvFile] = useState(null);

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedExam) {
            fetchAllocations(selectedExam);
        }
    }, [selectedExam]);

    const fetchInitialData = async () => {
        try {
            const examsRes = await api.get('/schedules'); // We filter for exams

            const examList = (examsRes.data || []).filter(s =>
                s.type === 'INTERNAL_EXAM' || s.type === 'SEMESTER_EXAM'
            );

            setExams(examList);
        } catch (error) {
            console.error("Failed to fetch initial data", error);
        }
    };

    const fetchAllocations = async (examId) => {
        setLoading(true);
        try {
            let res;
            if (examId === 'ALL') {
                res = await api.get('/exam-seating/all');
            } else {
                res = await api.get(`/exam-seating/exam/${examId}`);
            }
            setAllocations(res.data || []);
        } catch (error) {
            console.error("Failed to fetch allocations", error);
            setAllocations([]);
        } finally {
            setLoading(false);
        }
    };

    // ... (downloadTemplate stays same)

    // ... (drag drop stays same)

    // ... (handleFileChange stays same)



    // Actually, I can't easily replace just the check inside handleAllocate without replacing the whole function or using multi-replace.
    // I will use multi-replace to minimize disruption.

    // Let's just update the dropdown and the fetchAllocations logic first.

    // ...

    // Wait, the ReplacementContent above is getting messy. I will use MultiReplace.


    const downloadTemplate = () => {
        const headers = "Roll Number,Venue Name,Seat Number (Optional)";
        const sample = "22IT001,Hall A,A1\n22IT002,Hall A,A2\n22IT003,Library Block,";
        const content = headers + "\n" + sample;

        const blob = new Blob([content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "seating_allocation_template.csv";
        a.click();
    };

    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.name.endsWith('.csv')) {
                setCsvFile(file);
            } else {
                alert("Please upload a CSV file.");
            }
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setCsvFile(e.target.files[0]);
        }
    };

    const handleAllocate = async (e) => {
        e.preventDefault();
        if (!selectedExam || selectedExam === 'ALL' || !csvFile) {
            alert("Please select a specific exam (not 'All') and upload a CSV file.");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('examId', selectedExam);
        formData.append('file', csvFile);

        try {
            await api.post('/exam-seating/allocate', formData);
            alert("Seating allocation successful!");
            setCsvFile(null);
            fetchAllocations(selectedExam); // Refresh list
        } catch (error) {
            console.error("Allocation failed", error);
            console.log("Error Response Data:", error.response?.data);

            let errorMsg = "Failed to allocate seats.";
            if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            } else if (typeof error.response?.data === 'string') {
                errorMsg = error.response.data;
            } else {
                errorMsg = JSON.stringify(error.response?.data || error.message);
            }
            alert(errorMsg);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="coe-seating-container">
            <div className="seating-header">
                <h1>Seating Allocation</h1>
                <p>Assign examination venues to students via bulk CSV upload</p>
            </div>

            <div className="seating-grid">
                {/* Left Panel: Allocation Form */}
                <div className="allocation-card">
                    <h3><Users size={20} className="text-indigo-500" /> Allocate Seats</h3>

                    <form onSubmit={handleAllocate}>
                        <div className="form-group">
                            <label>Select Examination</label>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <select
                                    className="premium-select pl-10"
                                    value={selectedExam}
                                    onChange={(e) => setSelectedExam(e.target.value)}
                                    required
                                >
                                    <option value="">-- Choose Exam --</option>
                                    <option value="ALL">All Allocations</option>
                                    {exams.map(exam => (
                                        <option key={exam.id} value={exam.id}>
                                            {exam.subjectName || exam.title} ({exam.date ? new Date(exam.date).toLocaleDateString() : 'Date TBD'})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="flex justify-between items-center mb-2">
                                <label style={{ marginBottom: 0 }}>Upload Allocation CSV</label>
                                <button
                                    type="button"
                                    onClick={downloadTemplate}
                                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                                >
                                    <Download size={14} /> Download Template
                                </button>
                            </div>
                            <label
                                className={`file-drop-area ${dragActive ? 'drag-active' : ''}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <input
                                    type="file"
                                    hidden
                                    accept=".csv"
                                    onChange={handleFileChange}
                                />
                                <div className="file-label">
                                    <Upload size={32} className="text-indigo-500 mb-2" />
                                    <span>Click or Drag to upload CSV</span>
                                    <span style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '5px' }}>
                                        Format: <code>Roll Number, Venue Name, [Seat No]</code>
                                    </span>
                                </div>
                                {csvFile && (
                                    <div className="file-name animate-fade-in">
                                        <FileText size={14} />
                                        {csvFile.name}
                                    </div>
                                )}
                            </label>
                        </div>

                        <button type="submit" className="btn-allocate" disabled={uploading}>
                            {uploading ? (
                                <>Allocating...</>
                            ) : (
                                <><CheckCircle size={20} /> Allocate Seats</>
                            )}
                        </button>
                    </form>
                </div>

                {/* Right Panel: Current Allocations */}
                <div className="allocation-card view-card">
                    <h3>
                        <FileText size={20} className="text-emerald-500" />
                        Allocations for {
                            selectedExam === 'ALL'
                                ? 'All Students'
                                : (exams.find(e => e.id.toString() === selectedExam)?.subjectName || 'Selected Exam')
                        }
                    </h3>

                    {!selectedExam ? (
                        <div className="empty-placeholder">
                            <AlertCircle size={48} className="opacity-20 mb-4" />
                            <p>Select an exam to view current allocations</p>
                        </div>
                    ) : loading ? (
                        <div className="text-center py-10">Loading allocations...</div>
                    ) : allocations.length === 0 ? (
                        <div className="empty-placeholder">
                            <Users size={48} className="opacity-20 mb-4" />
                            <p>No students allocated yet.</p>
                        </div>
                    ) : (
                        <div className="allocations-table-container">
                            <table className="clean-table">
                                <thead>
                                    <tr>
                                        <th>Exam</th>
                                        <th>Student Name</th>
                                        <th>Roll Number</th>
                                        <th>Venue</th>
                                        <th>Seat</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allocations.map((alloc, idx) => (
                                        <tr key={alloc.id || idx}>
                                            <td>
                                                <div className="font-semibold text-sm">
                                                    {alloc.exam?.subjectName || alloc.exam?.title || 'Unknown Exam'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {alloc.exam?.date ? new Date(alloc.exam.date).toLocaleDateString() : ''}
                                                </div>
                                            </td>
                                            <td>{alloc.student?.fullName}</td>
                                            <td className="font-mono text-xs">{alloc.student?.rollNumber}</td>
                                            <td>{alloc.venue?.name}</td>
                                            <td>{alloc.seatNumber || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default COESeatingAllocation;
