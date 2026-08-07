export interface Rack {
  id: number;
  rack_code: string;
  shelves: number | null;
  subject_range: string | null;
}

export interface RackInput {
  rack_code: string;
  shelves?: number;
  subject_range?: string;
}
