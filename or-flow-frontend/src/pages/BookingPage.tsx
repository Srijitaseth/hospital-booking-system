import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useORContext } from '../context/ORContext';
import { createBooking } from '../api/or-flow-api';

const BookingPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { slots, fetchSlots } = useORContext();
    

    const slot = slots.find(s => s.id === parseInt(id!));

    const [status, setStatus] = useState<'IDLE' | 'PENDING' | 'CONFIRMED' | 'FAILED'>('IDLE');
    const [message, setMessage] = useState<string>("");

    useEffect(() => { if (!slot) fetchSlots(); }, [slot, fetchSlots]);

    const handleBook = async () => {
        if (!id) return;
        setStatus('PENDING');
        try {
            await createBooking(parseInt(id), Math.floor(Math.random() * 1000));
            setStatus('CONFIRMED');
            setMessage("Booking Successful!");
        } catch (e: any) {
            setStatus('FAILED');
            // Safe error handling
            if (e.response && e.response.status === 409) {
                setMessage(e.response.data.message);
            } else {
                setMessage("Server Error. Please try again.");
            }
        }
    };

    if (!slot) return <div className="container">Loading...</div>;

    return (
        <div className="container" style={{maxWidth: '600px', marginTop: '40px'}}>
            <button onClick={() => navigate('/')} className="btn btn-outline" style={{marginBottom: '20px'}}>← Back</button>
            <div className="card">
                <h2>Confirm Booking</h2>
                <div style={{background: '#f8fafc', padding: '15px', borderRadius: '8px', margin: '20px 0'}}>
                    <p><strong>Procedure:</strong> {slot.procedure_type}</p>
                    <p><strong>Room:</strong> {slot.room?.name || 'Unknown'}</p>
                    <p><strong>Doctor:</strong> {slot.doctor_name}</p>
                    <hr style={{border: '0', borderTop: '1px solid #e2e8f0', margin: '10px 0'}}/>
                    <p><strong>Required Equipment:</strong></p>
                    <ul style={{paddingLeft: '20px', color: '#64748b'}}>
                        {/* Safe mapping of equipment */}
                        {slot.requiredEquipment?.map((req, i) => (
                            <li key={i}>
                                {req.quantity_required}x {req.Equipment?.name || 'Item'} 
                                (Stock: {req.Equipment?.total_units || 0})
                            </li>
                        ))}
                    </ul>
                </div>

                {status === 'IDLE' ? (
                    <button onClick={handleBook} className="btn btn-primary" style={{width: '100%'}}>Confirm Booking</button>
                ) : (
                    <div style={{padding: '15px', borderRadius: '8px', textAlign: 'center', background: status === 'FAILED' ? '#fef2f2' : '#f0fdf4', color: status === 'FAILED' ? '#b91c1c' : '#15803d'}}>
                        <h3>{status === 'FAILED' ? 'Booking Failed' : 'Success!'}</h3>
                        <p>{message}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingPage;