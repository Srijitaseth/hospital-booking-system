
export interface OperatingRoom {
    id: number;
    name: string;
    capacity: number;
}

export interface Equipment {
    id: number;
    name: string;
    total_units: number;
}


export interface SlotEquipmentNeeds {
    slot_id: number;
    equipment_id: number;
    quantity_required: number;
   
    Equipment?: Equipment; 
}


export interface ORSlot {
    id: number;
    room_id: number;
    doctor_name: string;
    procedure_type: string;
    start_time: string;
    end_time: string;
   
    room: OperatingRoom; 
    requiredEquipment?: SlotEquipmentNeeds[];
}


export interface ORBooking {
    id: number;
    status: 'PENDING' | 'CONFIRMED' | 'FAILED';
    slot_id: number;
}


export interface ORContextType {
    slots: ORSlot[];
    loading: boolean;
    error: string | null;
    fetchSlots: () => Promise<void>;
}