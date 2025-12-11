import expiryQueue from '../config/queue';
import { ORBooking, ORSlot, Equipment, SlotEquipmentNeeds } from '../models';
import { connectDB } from '../config/database';

const processQueue = async () => {
    await connectDB();
    console.log("🟢 Expiry Worker Started...");

    expiryQueue.process(async (job) => {
        const { bookingId } = job.data;
        console.log(`[Worker] Checking expiry for booking ${bookingId}...`);

        try {
            const booking = await ORBooking.findByPk(bookingId);

            if (booking && booking.status === 'PENDING') {
                // Mark as FAILED if still pending after 2 mins
                booking.status = 'FAILED';
                await booking.save();
                console.log(`❌ Booking ${bookingId} expired and marked as FAILED.`);
            } else {
                console.log(`✅ Booking ${bookingId} is already processed or confirmed.`);
            }
        } catch (error) {
            console.error(`[Worker] Error processing booking ${bookingId}:`, error);
        }
    });
};

processQueue();