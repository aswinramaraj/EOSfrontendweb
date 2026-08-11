export type HostelWing = "boys" | "girls";

export interface HostelWardenRef {
  id: number;
  email: string;
}

export interface Hostel {
  id: number;
  name: string;
  code: string;
  wing: HostelWing;
  warden: HostelWardenRef | null;
  phone: string | null;
  mess_type: string | null;
  established_year: number | null;
  room_count: number;
  capacity: number;
  occupied: number;
  vacant: number;
  occupancy_pct: number;
}

export interface HostelListParams {
  q?: string;
  wing?: HostelWing;
}

export interface CreateHostelInput {
  name: string;
  code: string;
  wing: HostelWing;
  warden_user_id?: number;
  phone?: string;
  mess_type?: string;
  established_year?: number;
}

export type UpdateHostelInput = Partial<CreateHostelInput>;
