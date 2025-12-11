import React, { useEffect, useState } from 'react';
import { useORContext } from '../context/ORContext';
import { Link } from 'react-router-dom';

const SlotList: React.FC = () => {
    const { slots, loading, fetchSlots } = useORContext();
    const [filter, setFilter] = useState('');

    useEffect(() => { fetchSlots(); }, []);

 
    const filteredSlots = slots.filter(s => 
        s.doctor_name.toLowerCase().includes(filter.toLowerCase()) || 
        s.procedure_type.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Find a Doctor</h1>
                    <p className="page-subtitle">Book appointments with top specialists in your area.</p>
                </div>
                <div className="text-muted">{slots.length} Doctors Available</div>
            </div>

            {/* Patient Requirement Form (Search) */}
            <div className="search-bar">
                <input 
                    type="text" 
                    className="search-input" 
                    placeholder="Search by Doctor Name, Specialty (e.g., Cardiac, Neuro)..." 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
                <button className="btn btn-primary">Search</button>
            </div>

            {loading ? <p>Loading directory...</p> : (
                <div className="doc-list">
                    {filteredSlots.length === 0 && <p className="text-muted">No doctors found matching your criteria.</p>}
                    
                    {filteredSlots.map(slot => (
                        <div key={slot.id} className="doc-card">
                            <div className="doc-info">
                                <div className="avatar">{slot.doctor_name.charAt(4)}</div>
                                <div className="doc-details">
                                    <h3>{slot.doctor_name}</h3>
                                    <div style={{display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px'}}>
                                        <span className="specialty">{slot.procedure_type}</span>
                                        <span className="text-muted">• {slot.room?.name || 'Main Hospital'}</span>
                                    </div>
                                    <div style={{color: '#f59e0b', fontSize: '0.9rem'}}>★★★★★ 4.9 (High Rated)</div>
                                </div>
                            </div>
                            <div style={{textAlign: 'right'}}>
                                <div style={{fontWeight: '600', marginBottom: '8px', color: '#0f766e'}}>
                                    {new Date(slot.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                                <Link to={`/booking/${slot.id}`} className="btn btn-primary">
                                    Book Appointment
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SlotList;