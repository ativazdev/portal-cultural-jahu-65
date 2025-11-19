export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      projetos: {
        Row: {
          status: Database["public"]["Enums"]["status_projeto"]
          [key: string]: any
        }
        Insert: {
          status?: Database["public"]["Enums"]["status_projeto"]
          [key: string]: any
        }
        Update: {
          status?: Database["public"]["Enums"]["status_projeto"]
          [key: string]: any
        }
      }
      [key: string]: any
    }
    Enums: {
      status_projeto:
        | "rascunho"
        | "aguardando_parecerista"
        | "aguardando_avaliacao"
        | "recebido"
        | "em_avaliacao"
        | "avaliado"
        | "aprovado"
        | "rejeitado"
        | "em_execucao"
        | "concluido"
      [key: string]: any
    }
    [key: string]: any
  }
}
