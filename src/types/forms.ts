export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface EventFormData {
  title: string;
  description: string;
  venue: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  ticket_price: number;
  max_capacity: number;
  category: string;
  image_url?: string;
}
