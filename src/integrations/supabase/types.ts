export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      car_blocked_dates: {
        Row: {
          blocked_date: string
          car_id: string
          created_at: string
          created_by: string | null
          id: string
          reason: string | null
        }
        Insert: {
          blocked_date: string
          car_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          reason?: string | null
        }
        Update: {
          blocked_date?: string
          car_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      car_service_records: {
        Row: {
          car_id: string
          cost: number | null
          created_at: string | null
          description: string | null
          id: string
          mileage_at_service: number
          next_service_due_date: string | null
          next_service_due_mileage: number | null
          notes: string | null
          performed_by: string | null
          service_date: string
          service_type: string
          updated_at: string | null
        }
        Insert: {
          car_id: string
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          mileage_at_service: number
          next_service_due_date?: string | null
          next_service_due_mileage?: number | null
          notes?: string | null
          performed_by?: string | null
          service_date: string
          service_type: string
          updated_at?: string | null
        }
        Update: {
          car_id?: string
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          mileage_at_service?: number
          next_service_due_date?: string | null
          next_service_due_mileage?: number | null
          notes?: string | null
          performed_by?: string | null
          service_date?: string
          service_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "car_service_records_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      cars: {
        Row: {
          category: string
          created_at: string | null
          current_mileage: number | null
          fuel: string
          health_status: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          last_service_date: string | null
          name: string
          next_service_date: string | null
          notes: string | null
          passengers: number
          price_per_day: number
          service_interval_km: number | null
          transmission: string
          updated_at: string | null
          year: number
        }
        Insert: {
          category: string
          created_at?: string | null
          current_mileage?: number | null
          fuel: string
          health_status?: string | null
          id: string
          image_url?: string | null
          is_available?: boolean | null
          last_service_date?: string | null
          name: string
          next_service_date?: string | null
          notes?: string | null
          passengers: number
          price_per_day: number
          service_interval_km?: number | null
          transmission: string
          updated_at?: string | null
          year: number
        }
        Update: {
          category?: string
          created_at?: string | null
          current_mileage?: number | null
          fuel?: string
          health_status?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          last_service_date?: string | null
          name?: string
          next_service_date?: string | null
          notes?: string | null
          passengers?: number
          price_per_day?: number
          service_interval_km?: number | null
          transmission?: string
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      contract_signatures: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown
          reservation_id: string
          signature_data: string
          signed_at: string
          signed_by: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: unknown
          reservation_id: string
          signature_data: string
          signed_at?: string
          signed_by: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown
          reservation_id?: string
          signature_data?: string
          signed_at?: string
          signed_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_signatures_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          company_code: string | null
          company_name: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          is_corporate: boolean | null
          last_name: string
          phone: string
          refund_account_number: string | null
          representative_email: string | null
          representative_name: string | null
          representative_phone: string | null
          vat_code: string | null
        }
        Insert: {
          address?: string | null
          company_code?: string | null
          company_name?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          is_corporate?: boolean | null
          last_name: string
          phone: string
          refund_account_number?: string | null
          representative_email?: string | null
          representative_name?: string | null
          representative_phone?: string | null
          vat_code?: string | null
        }
        Update: {
          address?: string | null
          company_code?: string | null
          company_name?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          is_corporate?: boolean | null
          last_name?: string
          phone?: string
          refund_account_number?: string | null
          representative_email?: string | null
          representative_name?: string | null
          representative_phone?: string | null
          vat_code?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          subscribed_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          identifier: string
          request_count: number | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          identifier: string
          request_count?: number | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          identifier?: string
          request_count?: number | null
          window_start?: string | null
        }
        Relationships: []
      }
      reservations: {
        Row: {
          additional_services: Json | null
          cancellation_deadline: string | null
          car_id: string
          car_name: string
          condition_pickup: string | null
          condition_return: string | null
          contract_pdf_url: string | null
          contract_signed_at: string | null
          created_at: string
          custom_deposit_amount: number | null
          custom_rental_price: number | null
          customer_id: string
          daily_rate: number
          deleted_at: string | null
          deleted_by: string | null
          deposit_amount: number
          deposit_payment_intent_id: string | null
          driver_license_back_url: string | null
          driver_license_url: string | null
          end_date: string
          fuel_level_pickup: string | null
          fuel_level_return: string | null
          id: string
          notes: string | null
          payment_completed_at: string | null
          payment_method: string | null
          payment_provider: string | null
          payment_transaction_id: string | null
          pickup_date: string | null
          pickup_time: string | null
          pricing_notes: string | null
          rental_days: number
          return_date: string | null
          return_notes: string | null
          return_time: string | null
          returned_at: string | null
          second_driver_license_back_url: string | null
          second_driver_license_url: string | null
          start_date: string
          status: string
          total_amount: number
          total_rental_cost: number
          updated_at: string
        }
        Insert: {
          additional_services?: Json | null
          cancellation_deadline?: string | null
          car_id: string
          car_name: string
          condition_pickup?: string | null
          condition_return?: string | null
          contract_pdf_url?: string | null
          contract_signed_at?: string | null
          created_at?: string
          custom_deposit_amount?: number | null
          custom_rental_price?: number | null
          customer_id: string
          daily_rate: number
          deleted_at?: string | null
          deleted_by?: string | null
          deposit_amount?: number
          deposit_payment_intent_id?: string | null
          driver_license_back_url?: string | null
          driver_license_url?: string | null
          end_date: string
          fuel_level_pickup?: string | null
          fuel_level_return?: string | null
          id?: string
          notes?: string | null
          payment_completed_at?: string | null
          payment_method?: string | null
          payment_provider?: string | null
          payment_transaction_id?: string | null
          pickup_date?: string | null
          pickup_time?: string | null
          pricing_notes?: string | null
          rental_days: number
          return_date?: string | null
          return_notes?: string | null
          return_time?: string | null
          returned_at?: string | null
          second_driver_license_back_url?: string | null
          second_driver_license_url?: string | null
          start_date: string
          status?: string
          total_amount: number
          total_rental_cost: number
          updated_at?: string
        }
        Update: {
          additional_services?: Json | null
          cancellation_deadline?: string | null
          car_id?: string
          car_name?: string
          condition_pickup?: string | null
          condition_return?: string | null
          contract_pdf_url?: string | null
          contract_signed_at?: string | null
          created_at?: string
          custom_deposit_amount?: number | null
          custom_rental_price?: number | null
          customer_id?: string
          daily_rate?: number
          deleted_at?: string | null
          deleted_by?: string | null
          deposit_amount?: number
          deposit_payment_intent_id?: string | null
          driver_license_back_url?: string | null
          driver_license_url?: string | null
          end_date?: string
          fuel_level_pickup?: string | null
          fuel_level_return?: string | null
          id?: string
          notes?: string | null
          payment_completed_at?: string | null
          payment_method?: string | null
          payment_provider?: string | null
          payment_transaction_id?: string | null
          pickup_date?: string | null
          pickup_time?: string | null
          pricing_notes?: string | null
          rental_days?: number
          return_date?: string | null
          return_notes?: string | null
          return_time?: string | null
          returned_at?: string | null
          second_driver_license_back_url?: string | null
          second_driver_license_url?: string | null
          start_date?: string
          status?: string
          total_amount?: number
          total_rental_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      reservation_availability: {
        Row: {
          car_id: string | null
          end_date: string | null
          start_date: string | null
        }
        Insert: {
          car_id?: string | null
          end_date?: string | null
          start_date?: string | null
        }
        Update: {
          car_id?: string | null
          end_date?: string | null
          start_date?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_user_is_admin: { Args: { user_email: string }; Returns: boolean }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      create_or_get_customer:
        | {
            Args: {
              p_email: string
              p_first_name: string
              p_last_name: string
              p_phone: string
            }
            Returns: string
          }
        | {
            Args: {
              p_address?: string
              p_email: string
              p_first_name: string
              p_last_name: string
              p_phone: string
            }
            Returns: string
          }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_current_user_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
