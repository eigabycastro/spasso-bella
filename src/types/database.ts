/**
 * Tipos do banco no formato gerado pelo Supabase.
 * Escrito à mão a partir de supabase/migrations (000001–000003).
 * Para regenerar: npx supabase gen types typescript --project-id <id> > src/types/database.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

type Timestamps = { created_at: string }

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: { user_id: string } & Timestamps
        Insert: { user_id: string; created_at?: string }
        Update: { user_id?: string; created_at?: string }
        Relationships: []
      }
      clients: {
        Row: { id: string; name: string; phone: string | null; birthday: string | null; notes: string | null } & Timestamps
        Insert: { id?: string; name: string; phone?: string | null; birthday?: string | null; notes?: string | null; created_at?: string }
        Update: { id?: string; name?: string; phone?: string | null; birthday?: string | null; notes?: string | null; created_at?: string }
        Relationships: []
      }
      services: {
        Row: {
          id: string
          name: string
          category: string | null
          description: string | null
          price: number
          duration_min: number
          is_active: boolean
          is_public: boolean
          sort_order: number
        } & Timestamps
        Insert: {
          id?: string
          name: string
          category?: string | null
          description?: string | null
          price: number
          duration_min: number
          is_active?: boolean
          is_public?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['services']['Insert']>
        Relationships: []
      }
      appointments: {
        Row: {
          id: string
          client_id: string
          start_at: string
          end_at: string
          status: Database['public']['Enums']['appointment_status']
          notes: string | null
          confirmation_sent_at: string | null
          reminder_sent_at: string | null
        } & Timestamps
        Insert: {
          id?: string
          client_id: string
          start_at: string
          end_at: string
          status?: Database['public']['Enums']['appointment_status']
          notes?: string | null
          confirmation_sent_at?: string | null
          reminder_sent_at?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['appointments']['Insert']>
        Relationships: [
          { foreignKeyName: 'appointments_client_id_fkey'; columns: ['client_id']; isOneToOne: false; referencedRelation: 'clients'; referencedColumns: ['id'] },
        ]
      }
      appointment_items: {
        Row: { id: string; appointment_id: string; service_id: string; service_name: string; price: number; duration_min: number }
        Insert: { id?: string; appointment_id: string; service_id: string; service_name: string; price: number; duration_min: number }
        Update: Partial<Database['public']['Tables']['appointment_items']['Insert']>
        Relationships: [
          { foreignKeyName: 'appointment_items_appointment_id_fkey'; columns: ['appointment_id']; isOneToOne: false; referencedRelation: 'appointments'; referencedColumns: ['id'] },
          { foreignKeyName: 'appointment_items_service_id_fkey'; columns: ['service_id']; isOneToOne: false; referencedRelation: 'services'; referencedColumns: ['id'] },
        ]
      }
      transactions: {
        Row: {
          id: string
          type: Database['public']['Enums']['transaction_type']
          amount: number
          category: string
          description: string | null
          payment_method: Database['public']['Enums']['payment_method'] | null
          status: Database['public']['Enums']['transaction_status']
          date: string
          appointment_id: string | null
          client_id: string | null
        } & Timestamps
        Insert: {
          id?: string
          type: Database['public']['Enums']['transaction_type']
          amount: number
          category: string
          description?: string | null
          payment_method?: Database['public']['Enums']['payment_method'] | null
          status?: Database['public']['Enums']['transaction_status']
          date?: string
          appointment_id?: string | null
          client_id?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>
        Relationships: [
          { foreignKeyName: 'transactions_appointment_id_fkey'; columns: ['appointment_id']; isOneToOne: false; referencedRelation: 'appointments'; referencedColumns: ['id'] },
          { foreignKeyName: 'transactions_client_id_fkey'; columns: ['client_id']; isOneToOne: false; referencedRelation: 'clients'; referencedColumns: ['id'] },
        ]
      }
      products: {
        Row: { id: string; name: string; unit: string; quantity: number; minimum_stock: number; cost: number | null; is_active: boolean } & Timestamps
        // quantity fica de fora de propósito: só muda por stock_movements (regra 8)
        Insert: { id?: string; name: string; unit?: string; minimum_stock?: number; cost?: number | null; is_active?: boolean; created_at?: string }
        Update: Partial<Database['public']['Tables']['products']['Insert']>
        Relationships: []
      }
      stock_movements: {
        Row: {
          id: string
          product_id: string
          movement_type: Database['public']['Enums']['movement_type']
          quantity: number
          reason: string | null
          appointment_id: string | null
        } & Timestamps
        Insert: {
          id?: string
          product_id: string
          movement_type: Database['public']['Enums']['movement_type']
          quantity: number
          reason?: string | null
          appointment_id?: string | null
          created_at?: string
        }
        Update: never // imutável (gatilho stock_movements_immutable)
        Relationships: [
          { foreignKeyName: 'stock_movements_product_id_fkey'; columns: ['product_id']; isOneToOne: false; referencedRelation: 'products'; referencedColumns: ['id'] },
        ]
      }
      business_settings: {
        Row: {
          id: number
          business_name: string
          phone: string | null
          whatsapp: string | null
          instagram: string | null
          address: string | null
          maps_url: string | null
          opening_hours: Json
          updated_at: string
          legal_name: string | null
          document_id: string | null
          contact_email: string | null
          message_templates: Json
        }
        Insert: {
          id?: number
          business_name?: string
          phone?: string | null
          whatsapp?: string | null
          instagram?: string | null
          address?: string | null
          maps_url?: string | null
          opening_hours?: Json
          updated_at?: string
          legal_name?: string | null
          document_id?: string | null
          contact_email?: string | null
          message_templates?: Json
        }
        Update: Partial<Database['public']['Tables']['business_settings']['Insert']>
        Relationships: []
      }
      gallery_images: {
        Row: { id: string; storage_path: string; caption: string | null; is_public: boolean; sort_order: number } & Timestamps
        Insert: { id?: string; storage_path: string; caption?: string | null; is_public?: boolean; sort_order?: number; created_at?: string }
        Update: Partial<Database['public']['Tables']['gallery_images']['Insert']>
        Relationships: []
      }
    }
    Views: {
      appointment_summary: {
        Row: {
          id: string
          client_id: string
          start_at: string
          end_at: string
          status: Database['public']['Enums']['appointment_status']
          total: number
          paid: number
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean }
      save_appointment: {
        Args: {
          p_client_id: string
          p_start_at: string
          p_service_ids: string[]
          p_notes?: string | null
          p_id?: string | null
          p_end_at?: string | null
        }
        Returns: string
      }
    }
    Enums: {
      appointment_status: 'agendado' | 'confirmado' | 'concluido' | 'cancelado' | 'faltou'
      transaction_type: 'entrada' | 'saida'
      payment_method: 'dinheiro' | 'pix' | 'debito' | 'credito'
      transaction_status: 'pago' | 'pendente'
      movement_type: 'entrada' | 'saida' | 'ajuste'
    }
    CompositeTypes: Record<string, never>
  }
}
