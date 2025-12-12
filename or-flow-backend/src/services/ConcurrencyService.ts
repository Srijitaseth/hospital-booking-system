import sequelize from '../config/database';
import { ORSlot, ORBooking, Equipment, SlotEquipmentNeeds } from '../models'; 
import { Transaction, QueryTypes, Op, UniqueConstraintError } from 'sequelize';
// import { scheduleExpiryJob } from '../config/queue'; // Uncomment if queue is set up

const calculateEquipmentUtilization = async (
    equipmentId: number, startTime: Date, endTime: Date, t: Transaction
): Promise<number> => {
    const result: any[] = await sequelize.query(`
        SELECT SUM(sne."quantity_required") AS "utilized_count"
        FROM "slot_equipment_needs" AS sne
        JOIN "or_slots" AS os ON sne."slot_id" = os.id
        JOIN "or_bookings" AS ob ON os.id = ob.slot_id
        WHERE sne.equipment_id = :equipmentId
        AND ob.status IN ('PENDING', 'CONFIRMED')
        AND os.start_time < :endTime
        AND os.end_time > :startTime
    `, {
        replacements: { equipmentId, startTime, endTime },
        type: QueryTypes.SELECT,
        transaction: t,
    });
    return parseInt(result[0]?.utilized_count || 0);
};

export const attemptBooking = async (slotId: number, patientId: number) => {
    let newBooking: ORBooking | null = null;
    let conflictReason: string = '';

    try {
        await sequelize.transaction(async (t) => {
            const slot = await ORSlot.findByPk(slotId, { transaction: t, lock: t.LOCK.UPDATE });
            if (!slot) { conflictReason = 'Slot not found.'; throw new Error('LOGIC_ERROR'); }

            const existing = await ORBooking.findOne({
                where: { slot_id: slotId, status: { [Op.in]: ['PENDING', 'CONFIRMED'] } },
                transaction: t
            });
            if (existing) { conflictReason = 'Room already reserved.'; throw new Error('LOGIC_ERROR'); }

            const needs = await SlotEquipmentNeeds.findAll({
                where: { slot_id: slotId },
                include: [{ model: Equipment }],
                transaction: t
            });

            for (const req of needs) {
                const item = (req as any).Equipment as Equipment; 
                const used = await calculateEquipmentUtilization(req.equipment_id, slot.start_time, slot.end_time, t);
                if (req.quantity_required > (item.total_units - used)) {
                    conflictReason = `Insufficient: ${item.name}`;
                    throw new Error('LOGIC_ERROR'); 
                }
            }

            newBooking = await ORBooking.create({ slot_id: slotId, patient_id: patientId, status: 'PENDING' }, { transaction: t });
        });
    } catch (e: any) {
        if (e.message === 'LOGIC_ERROR' && conflictReason) throw new Error(`409 Conflict: ${conflictReason}`);
        if (e instanceof UniqueConstraintError) throw new Error(`409 Conflict: Room already reserved.`);
        throw new Error(`500 Error: Database Transaction Failed`);
    }

    // if (newBooking) { try { await scheduleExpiryJob((newBooking as ORBooking).id); } catch(e){} }
    return newBooking;
};