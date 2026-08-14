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
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          reason: string | null
          reservation_type: string
        }
        Insert: {
          blocked_date: string
          car_id: string
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          reason?: string | null
          reservation_type?: string
        }
        Update: {
          blocked_date?: string
          car_id?: string
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          reason?: string | null
          reservation_type?: string
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
          deposit_amount: number
          fuel: string
          health_status: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          is_premium: boolean | null
          last_service_date: string | null
          license_plate: string | null
          name: string
          next_service_date: string | null
          notes: string | null
          passengers: number
          price_package_romantic: string | null
          price_package_wedding: string | null
          price_per_day: number
          price_tier1: number | null
          price_tier2: number | null
          price_tier3: number | null
          price_weekend: number | null
          service_interval_km: number | null
          transmission: string
          updated_at: string | null
          year: number
        }
        Insert: {
          category: string
          created_at?: string | null
          current_mileage?: number | null
          deposit_amount?: number
          fuel: string
          health_status?: string | null
          id: string
          image_url?: string | null
          is_available?: boolean | null
          is_premium?: boolean | null
          last_service_date?: string | null
          license_plate?: string | null
          name: string
          next_service_date?: string | null
          notes?: string | null
          passengers: number
          price_package_romantic?: string | null
          price_package_wedding?: string | null
          price_per_day: number
          price_tier1?: number | null
          price_tier2?: number | null
          price_tier3?: number | null
          price_weekend?: number | null
          service_interval_km?: number | null
          transmission: string
          updated_at?: string | null
          year: number
        }
        Update: {
          category?: string
          created_at?: string | null
          current_mileage?: number | null
          deposit_amount?: number
          fuel?: string
          health_status?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_premium?: boolean | null
          last_service_date?: string | null
          license_plate?: string | null
          name?: string
          next_service_date?: string | null
          notes?: string | null
          passengers?: number
          price_package_romantic?: string | null
          price_package_wedding?: string | null
          price_per_day?: number
          price_tier1?: number | null
          price_tier2?: number | null
          price_tier3?: number | null
          price_weekend?: number | null
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
      invoices: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          invoice_number: string
          invoice_prefix: string
          issue_date: string
          items: Json
          notes: string | null
          pdf_url: string | null
          reservation_id: string | null
          sent_at: string | null
          sequence_number: number
          status: string
          total_amount: number
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          invoice_number: string
          invoice_prefix?: string
          issue_date?: string
          items?: Json
          notes?: string | null
          pdf_url?: string | null
          reservation_id?: string | null
          sent_at?: string | null
          sequence_number: number
          status?: string
          total_amount?: number
          updated_at?: string
          year?: number
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          invoice_number?: string
          invoice_prefix?: string
          issue_date?: string
          items?: Json
          notes?: string | null
          pdf_url?: string | null
          reservation_id?: string | null
          sent_at?: string | null
          sequence_number?: number
          status?: string
          total_amount?: number
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
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
      pricing_extras: {
        Row: {
          active: boolean
          category: string
          code: string
          created_at: string
          name: string
          price: number
          unit: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category: string
          code: string
          created_at?: string
          name: string
          price: number
          unit: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          code?: string
          created_at?: string
          name?: string
          price?: number
          unit?: string
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
      promo_code_claims: {
        Row: {
          action: string
          admin_notes: string | null
          code: string
          created_at: string
          email: string | null
          id: string
          language: string
          name: string | null
          phone: string | null
          rating: number | null
          redeemed: boolean
          redeemed_at: string | null
          redeemed_reservation_id: string | null
          source: string
          updated_at: string
        }
        Insert: {
          action?: string
          admin_notes?: string | null
          code?: string
          created_at?: string
          email?: string | null
          id?: string
          language?: string
          name?: string | null
          phone?: string | null
          rating?: number | null
          redeemed?: boolean
          redeemed_at?: string | null
          redeemed_reservation_id?: string | null
          source?: string
          updated_at?: string
        }
        Update: {
          action?: string
          admin_notes?: string | null
          code?: string
          created_at?: string
          email?: string | null
          id?: string
          language?: string
          name?: string | null
          phone?: string | null
          rating?: number | null
          redeemed?: boolean
          redeemed_at?: string | null
          redeemed_reservation_id?: string | null
          source?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_code_claims_redeemed_reservation_id_fkey"
            columns: ["redeemed_reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          active: boolean
          code: string
          created_at: string
          description: string | null
          discount_percent: number
          min_rental_days: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          description?: string | null
          discount_percent?: number
          min_rental_days?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          description?: string | null
          discount_percent?: number
          min_rental_days?: number
          updated_at?: string
          valid_until?: string | null
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
          discount_amount: number
          driver_license_back_url: string | null
          driver_license_url: string | null
          end_date: string
          fuel_level_pickup: string | null
          fuel_level_return: string | null
          id: string
          language: string
          last_email_sent_status: string | null
          notes: string | null
          payment_completed_at: string | null
          payment_method: string | null
          payment_provider: string | null
          payment_transaction_id: string | null
          pickup_date: string | null
          pickup_time: string | null
          pricing_notes: string | null
          promo_code: string | null
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
          discount_amount?: number
          driver_license_back_url?: string | null
          driver_license_url?: string | null
          end_date: string
          fuel_level_pickup?: string | null
          fuel_level_return?: string | null
          id?: string
          language?: string
          last_email_sent_status?: string | null
          notes?: string | null
          payment_completed_at?: string | null
          payment_method?: string | null
          payment_provider?: string | null
          payment_transaction_id?: string | null
          pickup_date?: string | null
          pickup_time?: string | null
          pricing_notes?: string | null
          promo_code?: string | null
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
          discount_amount?: number
          driver_license_back_url?: string | null
          driver_license_url?: string | null
          end_date?: string
          fuel_level_pickup?: string | null
          fuel_level_return?: string | null
          id?: string
          language?: string
          last_email_sent_status?: string | null
          notes?: string | null
          payment_completed_at?: string | null
          payment_method?: string | null
          payment_provider?: string | null
          payment_transaction_id?: string | null
          pickup_date?: string | null
          pickup_time?: string | null
          pricing_notes?: string | null
          promo_code?: string | null
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
      check_car_availability: {
        Args: { p_car_id: string; p_end_date: string; p_start_date: string }
        Returns: Json
      }
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
      create_reservation:
        | {
            Args: {
              p_car_id: string
              p_customer_id: string
              p_delivery_fee?: number
              p_end_date: string
              p_insurance_code?: string
              p_language?: string
              p_package_code?: string
              p_payment_method?: string
              p_payment_provider?: string
              p_pickup_time: string
              p_pricing_notes?: string
              p_return_time: string
              p_service_codes?: string[]
              p_start_date: string
              p_status?: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_car_id: string
              p_customer_id: string
              p_delivery_fee?: number
              p_end_date: string
              p_insurance_code?: string
              p_language?: string
              p_package_code?: string
              p_payment_method?: string
              p_payment_provider?: string
              p_pickup_time: string
              p_pricing_notes?: string
              p_promo_code?: string
              p_return_time: string
              p_service_codes?: string[]
              p_start_date: string
              p_status?: string
            }
            Returns: Json
          }
      get_booked_ranges: {
        Args: { p_car_id?: string; p_end: string; p_start: string }
        Returns: {
          car_id: string
          end_date: string
          start_date: string
        }[]
      }
      get_next_invoice_number: {
        Args: { p_prefix?: string }
        Returns: {
          invoice_number: string
          sequence_number: number
          year: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_current_user_admin: { Args: never; Returns: boolean }
      validate_promo_code: {
        Args: { p_code: string; p_rental_days?: number }
        Returns: Json
      }
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
