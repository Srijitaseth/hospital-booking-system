import { Router, Request, Response } from 'express';
import { attemptBooking } from '../services/ConcurrencyService';
import { ORSlot, OperatingRoom, Equipment, ORBooking, SlotEquipmentNeeds } from '../models'; 
import { Op } from 'sequelize';

const router = Router();

// --- PRO SEEDING ROUTE ---
router.post('/seed', async (req, res) => {
    try {
        await OperatingRoom.bulkCreate([
            {id:1, name:'Apollo Room 101'}, {id:2, name:'Fortis Room 202'}, 
            {id:3, name:'Max Care 303'}, {id:4, name:'City Hospital 404'}
        ], {ignoreDuplicates:true});
        
        await Equipment.bulkCreate([
            {id:1, name:'Ventilator', total_units:5}, {id:2, name:'MRI Machine', total_units:2}, 
            {id:3, name:'ECG Monitor', total_units:10}, {id:4, name:'Dialysis Unit', total_units:3}
        ], {ignoreDuplicates:true});
        
        const today = new Date();
        const slotsData = [
            {room:1, doc:'Dr. Rajesh Koothrappali', proc:'Neuro Surgery', time:9, eq:1},
            {room:1, doc:'Dr. Meredith Grey', proc:'General Surgery', time:11, eq:3},
            {room:2, doc:'Dr. Stephen Strange', proc:'Hand Surgery', time:10, eq:2},
            {room:2, doc:'Dr. Gregory House', proc:'Diagnostics', time:14, eq:3},
            {room:3, doc:'Dr. Shaun Murphy', proc:'Cardiology', time:9, eq:1},
            {room:3, doc:'Dr. Derek Shepherd', proc:'Brain Tumor', time:13, eq:2},
            {room:4, doc:'Dr. John Dorian', proc:'Internal Med', time:8, eq:3},
            {room:4, doc:'Dr. Cristina Yang', proc:'Heart Transplant', time:15, eq:1}
        ];

        for(const s of slotsData) {
            const start = new Date(today); start.setHours(s.time,0,0,0);
            const end = new Date(start); end.setHours(s.time+2);
            
            const slot = await ORSlot.create({
                room_id: s.room, doctor_name: s.doc, procedure_type: s.proc, 
                start_time: start, end_time: end
            });
            
            await SlotEquipmentNeeds.create({
                slot_id: slot.id, equipment_id: s.eq, quantity_required: 1
            });
        }

        res.json({ message: 'Database Seeded with 8 Professional Doctor Profiles' });
    } catch(e:any) { res.status(500).json({error: e.message}); }
});

router.get('/slots', async (req, res) => {
    const slots = await ORSlot.findAll({ 
        include: [
            { model: ORBooking, as: 'booking', where: { status: { [Op.in]: ['PENDING','CONFIRMED'] } }, required: false },
            { model: OperatingRoom, as: 'room' },
            { model: SlotEquipmentNeeds, as: 'requiredEquipment', include: [{ model: Equipment }] }
        ],
        where: { '$booking.id$': null }
    });
    res.json(slots);
});

router.post('/bookings', async (req, res) => {
    try {
        const booking = await attemptBooking(req.body.slotId, req.body.patientId);
        res.status(201).json({ booking });
    } catch(e:any) {
        if(e.message.includes('Conflict')) return res.status(409).json({ message: e.message });
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/bookings/:id', async (req, res) => {
    const b = await ORBooking.findByPk(req.params.id);
    b ? res.json(b) : res.status(404).json({message: 'Not found'});
});

// Admin Routes for Dashboard
router.get('/admin/bookings', async (req, res) => {
    const b = await ORBooking.findAll({ include: [{model:ORSlot, as:'slot'}], order: [['createdAt', 'DESC']] });
    res.json(b);
});
router.post('/admin/slots', async (req, res) => {
    const s = await ORSlot.create(req.body);
    res.json(s);
});

export default router;