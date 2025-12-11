import Queue from 'bull';
import dotenv from 'dotenv';

dotenv.config();

const expiryQueue = new Queue('booking-expiry', process.env.REDIS_URL || 'redis://127.0.0.1:6379');


export const scheduleExpiryJob = async (bookingId: number) => {

    await expiryQueue.add({ bookingId }, { delay: 120000 });
    console.log(`[Queue] Scheduled expiry check for booking ${bookingId} in 2 minutes.`);
};

export default expiryQueue;