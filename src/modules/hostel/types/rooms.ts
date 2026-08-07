export interface RoomType {
  id: number;
  name: string;
}

export interface Room {
  id: number;
  hostel_id: number;
  room_number: string;
  room_type_id: number;
  capacity: number;
  occupied: number;
  vacant: number;
}

export interface CreateRoomInput {
  hostel_id: number;
  room_number: string;
  room_type_id: number;
  capacity: number;
}

export type UpdateRoomInput = Partial<CreateRoomInput>;
