import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export class ORBooking extends Model {
    public id!: number;
    public status!: 'PENDING' | 'CONFIRMED' | 'FAILED';
    public slot_id!: number;
    public patient_id!: number;
}

ORBooking.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    slot_id: { type: DataTypes.INTEGER, unique: true },
    patient_id: { type: DataTypes.INTEGER },
    status: { 
        type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'FAILED'), 
        defaultValue: 'PENDING' 
    }
}, { 
    sequelize, 
    tableName: 'or_bookings', 
    timestamps: true 
});

export default ORBooking;