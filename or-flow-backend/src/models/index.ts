import sequelize from '../config/database';
import { DataTypes, Model } from 'sequelize';

class OperatingRoom extends Model { public id!: number; public name!: string; }
OperatingRoom.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, unique: true },
    capacity: { type: DataTypes.INTEGER, defaultValue: 1 }
}, { sequelize, tableName: 'operating_rooms', timestamps: false });

class Equipment extends Model { public id!: number; public name!: string; public total_units!: number; }
Equipment.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, unique: true },
    total_units: { type: DataTypes.INTEGER, allowNull: false }
}, { sequelize, tableName: 'equipment', timestamps: false });

class ORSlot extends Model { public id!: number; public start_time!: Date; public end_time!: Date; public booking?: ORBooking; public room!: OperatingRoom; public procedure_type!: string; public doctor_name!: string; }
ORSlot.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    room_id: { type: DataTypes.INTEGER, allowNull: false },
    doctor_name: { type: DataTypes.STRING, allowNull: false },
    start_time: { type: DataTypes.DATE, allowNull: false },
    end_time: { type: DataTypes.DATE, allowNull: false },
    procedure_type: { type: DataTypes.STRING, allowNull: false }
}, { sequelize, tableName: 'or_slots', timestamps: true });

class SlotEquipmentNeeds extends Model { public slot_id!: number; public equipment_id!: number; public quantity_required!: number; public Equipment?: Equipment; }
SlotEquipmentNeeds.init({
    slot_id: { type: DataTypes.INTEGER, primaryKey: true },
    equipment_id: { type: DataTypes.INTEGER, primaryKey: true },
    quantity_required: { type: DataTypes.INTEGER, allowNull: false }
}, { sequelize, tableName: 'slot_equipment_needs', timestamps: false });

const BookingStatus = DataTypes.ENUM('PENDING', 'CONFIRMED', 'FAILED');
class ORBooking extends Model { public id!: number; public status!: string; public slot_id!: number; public patient_id!: number; }
ORBooking.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    slot_id: { type: DataTypes.INTEGER, unique: true },
    patient_id: { type: DataTypes.INTEGER },
    status: { type: BookingStatus, defaultValue: 'PENDING' }
}, { sequelize, tableName: 'or_bookings', timestamps: true });


ORSlot.belongsTo(OperatingRoom, { foreignKey: 'room_id', as: 'room' });
ORSlot.hasOne(ORBooking, { foreignKey: 'slot_id', as: 'booking' });
ORBooking.belongsTo(ORSlot, { foreignKey: 'slot_id', as: 'slot' });


ORSlot.hasMany(SlotEquipmentNeeds, { foreignKey: 'slot_id', as: 'requiredEquipment' });
SlotEquipmentNeeds.belongsTo(ORSlot, { foreignKey: 'slot_id' });
SlotEquipmentNeeds.belongsTo(Equipment, { foreignKey: 'equipment_id' }); 

export { OperatingRoom, Equipment, ORSlot, ORBooking, SlotEquipmentNeeds };