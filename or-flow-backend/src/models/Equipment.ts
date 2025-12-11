import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export class Equipment extends Model {
    public id!: number;
    public name!: string;
    public total_units!: number;
}

Equipment.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, unique: true },
    total_units: { type: DataTypes.INTEGER, allowNull: false }
}, { 
    sequelize, 
    tableName: 'equipment', 
    timestamps: false 
});

export default Equipment;