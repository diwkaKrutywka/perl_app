import http from '../utils/https';

export interface CreateAppointmentRequest {
  date: string;
  doctor_id: number;
  patient_code: number;
  time: string;
}

export interface AppointmentResponse {
  id: number;
  date: string;
  time: string;
  doctor_id: number;
  patient_code: number;
  status: string;
  created_at: string;
}

export interface GetScheduleSlotsParams {
  begin_reception_time: string; // ISO date-time string
  end_reception_time: string; // ISO date-time string
  iin: string; // 12 digits
  org_healthcare_id: string;
  post_id: number; // Doctor post ID
  price_list_service_id: number;
  region: string; // e.g., 'ast', 'alm'
  h_post_id?: number;
  is_pmsp?: boolean;
  is_self_registration_payable?: boolean;
  page_index?: number;
  page_size?: number;
}

export interface ScheduleSlot {
  time: string;
  is_available: boolean;
  [key: string]: any; // For any additional fields from API
}

export interface ScheduleGridCell {
  reception_time?: string;
  date_time_recept?: string; // Время начала приема
  date_time_end_recept?: string; // Время окончания приема
  is_available?: boolean;
  time?: string;
  [key: string]: any;
}

export interface Schedule {
  clinic_id: number;
  post_id: number;
  specialist_name: string;
  price_list_service_id: number;
  price_list_service_name: string;
  price_list_service_public_code: string;
  typical_tarificator_id: number;
  org_health_care_id: string;
  grid_schedule_id: number;
  h_post_id: number;
  address_name: string;
  non_work_days: boolean;
  cabinet_id: number;
  cabinet: string;
  calendar_name: string;
  is_allow_visit_remotely: boolean;
  is_allow_visit: boolean;
  is_self_registration_referral: boolean;
  is_self_registration_payable_referral: boolean;
  schedule_grid_cell: ScheduleGridCell[] | null;
  [key: string]: any;
}

export interface ScheduleResponse {
  success: boolean;
  key: string;
  code: number;
  message: string;
  data: {
    schedules: Schedule[];
    total: number;
  };
}

export interface ScheduleSlotsResponse {
  slots?: ScheduleSlot[];
  items?: ScheduleSlot[];
  data?: ScheduleSlot[];
  [key: string]: any; // For any additional fields from API
}

export interface ScheduleWithSlots {
  schedule: Schedule;
  slots: ScheduleSlot[];
}

export const getScheduleSlots = async (params: GetScheduleSlotsParams): Promise<ScheduleWithSlots[]> => {
  try {
    const response = await http.get('/appointment/schedules/', { params });
    
    const data = response.data;
    
    // Handle the new response structure: { success, data: { schedules: [...], total: ... } }
    if (data?.success && data?.data?.schedules && Array.isArray(data.data.schedules)) {
      const schedules: Schedule[] = data.data.schedules;
      
      // Transform schedules to include extracted time slots
      return schedules.map((schedule: Schedule) => {
        let slots: ScheduleSlot[] = [];
        
        // Extract time slots from schedule_grid_cell
        if (schedule.schedule_grid_cell && Array.isArray(schedule.schedule_grid_cell)) {
          slots = schedule.schedule_grid_cell.map((cell: ScheduleGridCell) => {
            // Try to extract time from different possible fields
            let time = '';
            // Используем date_time_recept (новый формат) или reception_time (старый формат)
            const receptionTime = cell.date_time_recept || cell.reception_time;
            if (receptionTime) {
              // Parse ISO date-time string to HH:mm format
              const date = new Date(receptionTime);
              time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            } else if (cell.time) {
              time = cell.time;
            }
            
            return {
              time: time || '00:00',
              is_available: cell.is_available !== false, // Default to available if not specified
              date_time_recept: cell.date_time_recept,
              date_time_end_recept: cell.date_time_end_recept,
            };
          });
        } else if (schedule.schedule_grid_cell === null) {
          // schedule_grid_cell is null - no time slots available for this schedule
          console.log('schedule_grid_cell is null for schedule:', schedule.grid_schedule_id);
        }
        
        return {
          schedule,
          slots,
        };
      });
    }
    
    // Fallback: Handle old response structures for backward compatibility
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        schedule: {} as Schedule,
        slots: [item],
      }));
    } else if (data?.slots && Array.isArray(data.slots)) {
      return [{
        schedule: {} as Schedule,
        slots: data.slots,
      }];
    } else if (data?.items && Array.isArray(data.items)) {
      return [{
        schedule: {} as Schedule,
        slots: data.items,
      }];
    } else if (data?.data && Array.isArray(data.data)) {
      return [{
        schedule: {} as Schedule,
        slots: data.data,
      }];
    }
    
    // If response structure is different, return empty array
    console.warn('Unexpected schedule slots response structure:', data);
    return [];
  } catch (error) {
    console.error('Error fetching schedule slots:', error);
    throw error;
  }
};

export const createAppointment = async (appointmentData: CreateAppointmentRequest): Promise<AppointmentResponse> => {
  try {
   
    const response = await http.post('/appointment/schedules/', appointmentData);
   
    return response.data;
  } catch (error) {
  
    throw error;
  }
};
