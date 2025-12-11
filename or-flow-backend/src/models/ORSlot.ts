import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export class ORSlot extends Model {
    public id!: number;
    public room_id!: number;
    public doctor_name!: string;
    public procedure_type!: string;
    public start_time!: Date;
    public end_time!: Date;
}

ORSlot.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    room_id: { type: DataTypes.INTEGER, allowNull: false },
    doctor_name: { type: DataTypes.STRING, allowNull: false },
    start_time: { type: DataTypes.DATE, allowNull: false },
    end_time: { type: DataTypes.DATE, allowNull: false },
    procedure_type: { type: DataTypes.STRING, allowNull: false }
}, { 
    sequelize, 
    tableName: 'or_slots', 
    timestamps: true 
});

export default ORSlot;