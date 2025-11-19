import http from '../utils/https';

export interface CreateAppointmentRequest {
  "iin": string,
  "desired_time_reception": string,
  "problem": string,
  "grid_schedule_id": string,
  "post_id": number,
  "price_list_service_id": number,
  "org_healthcare_id": string,
  "region": string
}

export interface AppointmentResponse {
 "provisional_appointment_id": number,
  "grid_schedule_id": string,
  "message": string,
  "success": boolean
}

export const createAppointment = async (appointmentData: CreateAppointmentRequest): Promise<AppointmentResponse> => {
  try {
   
    const response = await http.post('/appointment/', appointmentData);
   
    // Проверяем статус ответа - должен быть 201 для успешного создания
    if (response.status !== 201) {
      throw new Error(`Failed to create appointment. Status: ${response.status}`);
    }
   
    return response.data;
  } catch (error) {
  
    throw error;
  }
};
