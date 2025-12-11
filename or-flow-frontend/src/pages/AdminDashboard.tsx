import React, { useEffect, useState } from 'react';
import { fetchAllBookings, seedDatabase } from '../api/or-flow-api';

const AdminDashboard: React.FC = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    
    const loadData = async () => {
        const res = await fetchAllBookings();
        setBookings(res.data);
    };

    useEffect(() => { loadData(); }, []);

    const handleSeed = async () => {
        if(confirm("Reset System? This will clear all current bookings.")) {
            await seedDatabase();
            window.location.reload();
        }
    }

    return (
        <div className="container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Admin Portal</h1>
                    <p className="page-subtitle">Manage hospital schedule and patient bookings.</p>
                </div>
                <button onClick={handleSeed} className="btn" style={{background: '#cbd5e1'}}>Reset System Data</button>
            </div>

            <div className="card-bg" style={{background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0'}}>
                <h3 style={{marginBottom: '20px', fontSize: '1.2rem'}}>Recent Appointments</h3>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Patient ID</th>
                            <th>Doctor</th>
                            <th>Procedure</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((b: any) => (
                            <tr key={b.id}>
                                <td>
                                    <span style={{
                                        background: b.status === 'CONFIRMED' ? '#dcfce7' : b.status === 'FAILED' ? '#fee2e2' : '#e0f2fe',
                                        color: b.status === 'CONFIRMED' ? '#166534' : b.status === 'FAILED' ? '#991b1b' : '#075985',
                                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700'
                                    }}>
                                        {b.status}
                                    </span>
                                </td>
                                <td>#{b.patient_id}</td>
                                <td>{b.slot?.doctor_name}</td>
                                <td>{b.slot?.procedure_type}</td>
                                <td>{new Date(b.createdAt).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {bookings.length === 0 && <p style={{padding: '20px', textAlign: 'center', color: '#64748b'}}>No bookings found.</p>}
            </div>
        </div>
    );
};

export default AdminDashboard;