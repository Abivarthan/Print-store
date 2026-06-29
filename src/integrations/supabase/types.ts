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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          contact_name: string
          contact_phone: string
          country: string
          created_at: string
          id: string
          is_default: boolean
          label: string
          line1: string
          line2: string | null
          pincode: string
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          city: string
          contact_name: string
          contact_phone: string
          country?: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string
          line1: string
          line2?: string | null
          pincode: string
          state: string
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          contact_name?: string
          contact_phone?: string
          country?: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string
          line1?: string
          line2?: string | null
          pincode?: string
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      artworks: {
        Row: {
          bleed_ok: boolean | null
          color_profile: string | null
          content_type: string
          created_at: string
          dpi_estimate: number | null
          file_size: number
          height_px: number | null
          id: string
          original_filename: string
          prepress_notes: Json
          product_slug: string | null
          status: Database["public"]["Enums"]["artwork_status"]
          storage_path: string
          updated_at: string
          user_id: string
          width_px: number | null
        }
        Insert: {
          bleed_ok?: boolean | null
          color_profile?: string | null
          content_type: string
          created_at?: string
          dpi_estimate?: number | null
          file_size: number
          height_px?: number | null
          id?: string
          original_filename: string
          prepress_notes?: Json
          product_slug?: string | null
          status?: Database["public"]["Enums"]["artwork_status"]
          storage_path: string
          updated_at?: string
          user_id: string
          width_px?: number | null
        }
        Update: {
          bleed_ok?: boolean | null
          color_profile?: string | null
          content_type?: string
          created_at?: string
          dpi_estimate?: number | null
          file_size?: number
          height_px?: number | null
          id?: string
          original_filename?: string
          prepress_notes?: Json
          product_slug?: string | null
          status?: Database["public"]["Enums"]["artwork_status"]
          storage_path?: string
          updated_at?: string
          user_id?: string
          width_px?: number | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          added_at: string
          artwork_id: string | null
          config: Json
          gst_paise: number
          id: string
          product_name: string
          product_slug: string
          qty: number
          subtotal_paise: number
          total_paise: number
          unit_paise: number
          user_id: string
        }
        Insert: {
          added_at?: string
          artwork_id?: string | null
          config?: Json
          gst_paise: number
          id?: string
          product_name: string
          product_slug: string
          qty: number
          subtotal_paise: number
          total_paise: number
          unit_paise: number
          user_id: string
        }
        Update: {
          added_at?: string
          artwork_id?: string | null
          config?: Json
          gst_paise?: number
          id?: string
          product_name?: string
          product_slug?: string
          qty?: number
          subtotal_paise?: number
          total_paise?: number
          unit_paise?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          active: boolean
          blurb: string | null
          created_at: string
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          blurb?: string | null
          created_at?: string
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          blurb?: string | null
          created_at?: string
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          expires_at: string | null
          id: string
          kind: Database["public"]["Enums"]["coupon_kind"]
          max_discount_paise: number | null
          min_subtotal_paise: number
          percent_bps: number | null
          starts_at: string | null
          updated_at: string
          usage_count: number
          usage_limit: number | null
          value_paise: number | null
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          kind: Database["public"]["Enums"]["coupon_kind"]
          max_discount_paise?: number | null
          min_subtotal_paise?: number
          percent_bps?: number | null
          starts_at?: string | null
          updated_at?: string
          usage_count?: number
          usage_limit?: number | null
          value_paise?: number | null
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["coupon_kind"]
          max_discount_paise?: number | null
          min_subtotal_paise?: number
          percent_bps?: number | null
          starts_at?: string | null
          updated_at?: string
          usage_count?: number
          usage_limit?: number | null
          value_paise?: number | null
        }
        Relationships: []
      }
      order_change_requests: {
        Row: {
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["change_request_kind"]
          message: string | null
          order_id: string
          payload: Json | null
          resolved_at: string | null
          resolved_by: string | null
          staff_note: string | null
          status: Database["public"]["Enums"]["change_request_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["change_request_kind"]
          message?: string | null
          order_id: string
          payload?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          staff_note?: string | null
          status?: Database["public"]["Enums"]["change_request_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["change_request_kind"]
          message?: string | null
          order_id?: string
          payload?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          staff_note?: string | null
          status?: Database["public"]["Enums"]["change_request_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_change_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          artwork_id: string | null
          config: Json
          created_at: string
          id: string
          line_total_paise: number
          order_id: string
          product_name: string
          product_slug: string
          qty: number
          unit_paise: number
        }
        Insert: {
          artwork_id?: string | null
          config?: Json
          created_at?: string
          id?: string
          line_total_paise: number
          order_id: string
          product_name: string
          product_slug: string
          qty: number
          unit_paise: number
        }
        Update: {
          artwork_id?: string | null
          config?: Json
          created_at?: string
          id?: string
          line_total_paise?: number
          order_id?: string
          product_name?: string
          product_slug?: string
          qty?: number
          unit_paise?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_events: {
        Row: {
          actor_user_id: string | null
          created_at: string
          id: string
          note: string | null
          order_id: string
          status: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          actor_user_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          order_id: string
          status: Database["public"]["Enums"]["order_status"]
        }
        Update: {
          actor_user_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          order_id?: string
          status?: Database["public"]["Enums"]["order_status"]
        }
        Relationships: [
          {
            foreignKeyName: "order_status_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          coupon_code: string | null
          discount_paise: number
          gst_paise: number
          id: string
          notes: string | null
          order_number: string
          placed_at: string
          shipping_address: Json | null
          shipping_paise: number
          status: Database["public"]["Enums"]["order_status"]
          subtotal_paise: number
          total_paise: number
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          coupon_code?: string | null
          discount_paise?: number
          gst_paise: number
          id?: string
          notes?: string | null
          order_number: string
          placed_at?: string
          shipping_address?: Json | null
          shipping_paise?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_paise: number
          total_paise: number
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          coupon_code?: string | null
          discount_paise?: number
          gst_paise?: number
          id?: string
          notes?: string | null
          order_number?: string
          placed_at?: string
          shipping_address?: Json | null
          shipping_paise?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_paise?: number
          total_paise?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          base_price_paise: number
          category_slug: string | null
          created_at: string
          description: string | null
          hero: string | null
          min_qty: number
          name: string
          slug: string
          sort_order: number
          tagline: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          base_price_paise?: number
          category_slug?: string | null
          created_at?: string
          description?: string | null
          hero?: string | null
          min_qty?: number
          name: string
          slug: string
          sort_order?: number
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          base_price_paise?: number
          category_slug?: string | null
          created_at?: string
          description?: string | null
          hero?: string | null
          min_qty?: number
          name?: string
          slug?: string
          sort_order?: number
          tagline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_slug_fkey"
            columns: ["category_slug"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["slug"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      order_is_modifiable_for: {
        Args: { _order_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "customer"
      artwork_status:
        | "uploading"
        | "analyzing"
        | "ready"
        | "failed"
        | "review_needed"
      change_request_kind: "cancel" | "edit_address" | "edit_items" | "other"
      change_request_status: "pending" | "approved" | "rejected" | "applied"
      coupon_kind: "percent" | "flat"
      order_status:
        | "pending_payment"
        | "paid"
        | "in_prepress"
        | "printing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded"
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
      app_role: ["admin", "staff", "customer"],
      artwork_status: [
        "uploading",
        "analyzing",
        "ready",
        "failed",
        "review_needed",
      ],
      change_request_kind: ["cancel", "edit_address", "edit_items", "other"],
      change_request_status: ["pending", "approved", "rejected", "applied"],
      coupon_kind: ["percent", "flat"],
      order_status: [
        "pending_payment",
        "paid",
        "in_prepress",
        "printing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
    },
  },
} as const
