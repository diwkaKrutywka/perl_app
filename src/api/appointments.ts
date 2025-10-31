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

export const createAppointment = async (appointmentData: CreateAppointmentRequest): Promise<AppointmentResponse> => {
  try {
   
    const response = await http.post('/appointments', appointmentData);
   
    return response.data;
  } catch (error) {
  
    throw error;
  }
};
