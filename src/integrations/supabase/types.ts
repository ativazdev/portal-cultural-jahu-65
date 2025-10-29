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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      anexos_comunicacao: {
        Row: {
          comunicacao_id: string
          created_at: string | null
          id: string
          nome: string
          tamanho: number | null
          tipo_mime: string | null
          url: string
        }
        Insert: {
          comunicacao_id: string
          created_at?: string | null
          id?: string
          nome: string
          tamanho?: number | null
          tipo_mime?: string | null
          url: string
        }
        Update: {
          comunicacao_id?: string
          created_at?: string | null
          id?: string
          nome?: string
          tamanho?: number | null
          tipo_mime?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "anexos_comunicacao_comunicacao_id_fkey"
            columns: ["comunicacao_id"]
            isOneToOne: false
            referencedRelation: "comunicacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      arquivos_edital: {
        Row: {
          created_at: string | null
          edital_id: string
          id: string
          nome: string
          tamanho: number | null
          tipo_mime: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          edital_id: string
          id?: string
          nome: string
          tamanho?: number | null
          tipo_mime?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          edital_id?: string
          id?: string
          nome?: string
          tamanho?: number | null
          tipo_mime?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "arquivos_edital_edital_id_fkey"
            columns: ["edital_id"]
            isOneToOne: false
            referencedRelation: "editais"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes: {
        Row: {
          created_at: string | null
          data_avaliacao: string | null
          id: string
          nota_final: number | null
          nota_impacto: number | null
          nota_inovacao: number | null
          nota_orcamento: number | null
          nota_relevancia: number | null
          nota_sustentabilidade: number | null
          nota_viabilidade: number | null
          parecer_tecnico: string | null
          parecerista_id: string
          prefeitura_id: string
          projeto_id: string
          recomendacao: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_avaliacao?: string | null
          id?: string
          nota_final?: number | null
          nota_impacto?: number | null
          nota_inovacao?: number | null
          nota_orcamento?: number | null
          nota_relevancia?: number | null
          nota_sustentabilidade?: number | null
          nota_viabilidade?: number | null
          parecer_tecnico?: string | null
          parecerista_id: string
          prefeitura_id: string
          projeto_id: string
          recomendacao?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_avaliacao?: string | null
          id?: string
          nota_final?: number | null
          nota_impacto?: number | null
          nota_inovacao?: number | null
          nota_orcamento?: number | null
          nota_relevancia?: number | null
          nota_sustentabilidade?: number | null
          nota_viabilidade?: number | null
          parecer_tecnico?: string | null
          parecerista_id?: string
          prefeitura_id?: string
          projeto_id?: string
          recomendacao?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_parecerista_id_fkey"
            columns: ["parecerista_id"]
            isOneToOne: false
            referencedRelation: "pareceristas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_prefeitura_id_fkey"
            columns: ["prefeitura_id"]
            isOneToOne: false
            referencedRelation: "prefeituras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      comunicacoes: {
        Row: {
          assunto: string
          created_at: string | null
          data_resposta: string | null
          destinatario_id: string | null
          destinatario_tipo: string | null
          id: string
          mensagem: string
          prefeitura_id: string
          prioridade: string | null
          projeto_id: string | null
          remetente_id: string
          remetente_tipo: string
          respondido_por_id: string | null
          respondido_por_tipo: string | null
          resposta: string | null
          status: Database["public"]["Enums"]["status_comunicacao"] | null
          tipo: Database["public"]["Enums"]["tipo_comunicacao"]
          updated_at: string | null
        }
        Insert: {
          assunto: string
          created_at?: string | null
          data_resposta?: string | null
          destinatario_id?: string | null
          destinatario_tipo?: string | null
          id?: string
          mensagem: string
          prefeitura_id: string
          prioridade?: string | null
          projeto_id?: string | null
          remetente_id: string
          remetente_tipo: string
          respondido_por_id?: string | null
          respondido_por_tipo?: string | null
          resposta?: string | null
          status?: Database["public"]["Enums"]["status_comunicacao"] | null
          tipo: Database["public"]["Enums"]["tipo_comunicacao"]
          updated_at?: string | null
        }
        Update: {
          assunto?: string
          created_at?: string | null
          data_resposta?: string | null
          destinatario_id?: string | null
          destinatario_tipo?: string | null
          id?: string
          mensagem?: string
          prefeitura_id?: string
          prioridade?: string | null
          projeto_id?: string | null
          remetente_id?: string
          remetente_tipo?: string
          respondido_por_id?: string | null
          respondido_por_tipo?: string | null
          resposta?: string | null
          status?: Database["public"]["Enums"]["status_comunicacao"] | null
          tipo?: Database["public"]["Enums"]["tipo_comunicacao"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comunicacoes_prefeitura_id_fkey"
            columns: ["prefeitura_id"]
            isOneToOne: false
            referencedRelation: "prefeituras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comunicacoes_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      contas_monitoradas: {
        Row: {
          agencia: string | null
          banco: string
          consentimento_ativo: boolean | null
          consentimento_id: string | null
          conta: string | null
          created_at: string | null
          data_consentimento: string | null
          data_expiracao_consentimento: string | null
          id: string
          prefeitura_id: string
          projeto_id: string
          proponente_id: string
          saldo_atual: number | null
          status: string | null
          tipo_conta: string | null
          ultima_atualizacao: string | null
          updated_at: string | null
          valor_total_gasto: number | null
          valor_total_recebido: number | null
        }
        Insert: {
          agencia?: string | null
          banco: string
          consentimento_ativo?: boolean | null
          consentimento_id?: string | null
          conta?: string | null
          created_at?: string | null
          data_consentimento?: string | null
          data_expiracao_consentimento?: string | null
          id?: string
          prefeitura_id: string
          projeto_id: string
          proponente_id: string
          saldo_atual?: number | null
          status?: string | null
          tipo_conta?: string | null
          ultima_atualizacao?: string | null
          updated_at?: string | null
          valor_total_gasto?: number | null
          valor_total_recebido?: number | null
        }
        Update: {
          agencia?: string | null
          banco?: string
          consentimento_ativo?: boolean | null
          consentimento_id?: string | null
          conta?: string | null
          created_at?: string | null
          data_consentimento?: string | null
          data_expiracao_consentimento?: string | null
          id?: string
          prefeitura_id?: string
          projeto_id?: string
          proponente_id?: string
          saldo_atual?: number | null
          status?: string | null
          tipo_conta?: string | null
          ultima_atualizacao?: string | null
          updated_at?: string | null
          valor_total_gasto?: number | null
          valor_total_recebido?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contas_monitoradas_prefeitura_id_fkey"
            columns: ["prefeitura_id"]
            isOneToOne: false
            referencedRelation: "prefeituras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_monitoradas_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_monitoradas_proponente_id_fkey"
            columns: ["proponente_id"]
            isOneToOne: false
            referencedRelation: "proponentes"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos_habilitacao: {
        Row: {
          arquivo_nome: string | null
          arquivo_tamanho: number | null
          arquivo_url: string | null
          created_at: string | null
          data_solicitacao: string | null
          data_upload: string | null
          descricao: string | null
          id: string
          nome: string
          obrigatorio: boolean | null
          projeto_id: string
          status: Database["public"]["Enums"]["status_documento"] | null
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          arquivo_nome?: string | null
          arquivo_tamanho?: number | null
          arquivo_url?: string | null
          created_at?: string | null
          data_solicitacao?: string | null
          data_upload?: string | null
          descricao?: string | null
          id?: string
          nome: string
          obrigatorio?: boolean | null
          projeto_id: string
          status?: Database["public"]["Enums"]["status_documento"] | null
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          arquivo_nome?: string | null
          arquivo_tamanho?: number | null
          arquivo_url?: string | null
          created_at?: string | null
          data_solicitacao?: string | null
          data_upload?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          obrigatorio?: boolean | null
          projeto_id?: string
          status?: Database["public"]["Enums"]["status_documento"] | null
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documentos_habilitacao_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      editais: {
        Row: {
          codigo: string
          created_at: string | null
          created_by: string | null
          data_abertura: string
          data_final_envio_projeto: string
          descricao: string | null
          horario_final_envio_projeto: string
          id: string
          modalidades:
            | Database["public"]["Enums"]["modalidade_cultural"][]
            | null
          nome: string
          prazo_avaliacao: number | null
          prefeitura_id: string
          status: Database["public"]["Enums"]["status_edital"]
          total_projetos: number | null
          updated_at: string | null
          valor_maximo: number | null
        }
        Insert: {
          codigo: string
          created_at?: string | null
          created_by?: string | null
          data_abertura: string
          data_final_envio_projeto: string
          descricao?: string | null
          horario_final_envio_projeto: string
          id?: string
          modalidades?:
            | Database["public"]["Enums"]["modalidade_cultural"][]
            | null
          nome: string
          prazo_avaliacao?: number | null
          prefeitura_id: string
          status?: Database["public"]["Enums"]["status_edital"]
          total_projetos?: number | null
          updated_at?: string | null
          valor_maximo?: number | null
        }
        Update: {
          codigo?: string
          created_at?: string | null
          created_by?: string | null
          data_abertura?: string
          data_final_envio_projeto?: string
          descricao?: string | null
          horario_final_envio_projeto?: string
          id?: string
          modalidades?:
            | Database["public"]["Enums"]["modalidade_cultural"][]
            | null
          nome?: string
          prazo_avaliacao?: number | null
          prefeitura_id?: string
          status?: Database["public"]["Enums"]["status_edital"]
          total_projetos?: number | null
          updated_at?: string | null
          valor_maximo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "editais_prefeitura_id_fkey"
            columns: ["prefeitura_id"]
            isOneToOne: false
            referencedRelation: "prefeituras"
            referencedColumns: ["id"]
          },
        ]
      }
      equipe_projeto: {
        Row: {
          cpf_cnpj: string | null
          created_at: string | null
          deficiencia: boolean | null
          funcao: string
          id: string
          indigena: boolean | null
          lgbtqiapn: boolean | null
          mini_curriculo: string | null
          nome: string
          preto_pardo: boolean | null
          projeto_id: string
        }
        Insert: {
          cpf_cnpj?: string | null
          created_at?: string | null
          deficiencia?: boolean | null
          funcao: string
          id?: string
          indigena?: boolean | null
          lgbtqiapn?: boolean | null
          mini_curriculo?: string | null
          nome: string
          preto_pardo?: boolean | null
          projeto_id: string
        }
        Update: {
          cpf_cnpj?: string | null
          created_at?: string | null
          deficiencia?: boolean | null
          funcao?: string
          id?: string
          indigena?: boolean | null
          lgbtqiapn?: boolean | null
          mini_curriculo?: string | null
          nome?: string
          preto_pardo?: boolean | null
          projeto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipe_projeto_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      metas_projeto: {
        Row: {
          created_at: string | null
          descricao: string
          id: string
          ordem: number
          projeto_id: string
        }
        Insert: {
          created_at?: string | null
          descricao: string
          id?: string
          ordem: number
          projeto_id: string
        }
        Update: {
          created_at?: string | null
          descricao?: string
          id?: string
          ordem?: number
          projeto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "metas_projeto_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      movimentacoes_financeiras: {
        Row: {
          categoria_despesa: string | null
          created_at: string | null
          data_movimentacao: string
          descricao: string
          documento_fiscal: string | null
          id: string
          metodo_pagamento: string | null
          observacao: string | null
          origem_destino: string | null
          prefeitura_id: string
          prestacao_id: string | null
          projeto_id: string
          status_validacao: string | null
          tipo: string
          valor: number
        }
        Insert: {
          categoria_despesa?: string | null
          created_at?: string | null
          data_movimentacao: string
          descricao: string
          documento_fiscal?: string | null
          id?: string
          metodo_pagamento?: string | null
          observacao?: string | null
          origem_destino?: string | null
          prefeitura_id: string
          prestacao_id?: string | null
          projeto_id: string
          status_validacao?: string | null
          tipo: string
          valor: number
        }
        Update: {
          categoria_despesa?: string | null
          created_at?: string | null
          data_movimentacao?: string
          descricao?: string
          documento_fiscal?: string | null
          id?: string
          metodo_pagamento?: string | null
          observacao?: string | null
          origem_destino?: string | null
          prefeitura_id?: string
          prestacao_id?: string | null
          projeto_id?: string
          status_validacao?: string | null
          tipo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_financeiras_prefeitura_id_fkey"
            columns: ["prefeitura_id"]
            isOneToOne: false
            referencedRelation: "prefeituras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_financeiras_prestacao_id_fkey"
            columns: ["prestacao_id"]
            isOneToOne: false
            referencedRelation: "prestacoes_contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_financeiras_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      pareceristas: {
        Row: {
          area_atuacao: string | null
          cep: string | null
          cidade: string | null
          cpf: string
          created_at: string | null
          data_ativacao: string | null
          data_nascimento: string | null
          email: string
          endereco: string | null
          especialidade:
            | Database["public"]["Enums"]["modalidade_cultural"][]
            | null
          estado: string | null
          experiencia_anos: number | null
          formacao_academica: string | null
          id: string
          mini_curriculo: string | null
          nome: string
          prefeitura_id: string
          projetos_em_analise: number | null
          rg: string | null
          senha_hash: string
          status: string | null
          telefone: string | null
          total_avaliacoes: number | null
          ultimo_acesso: string | null
          updated_at: string | null
        }
        Insert: {
          area_atuacao?: string | null
          cep?: string | null
          cidade?: string | null
          cpf: string
          created_at?: string | null
          data_ativacao?: string | null
          data_nascimento?: string | null
          email: string
          endereco?: string | null
          especialidade?:
            | Database["public"]["Enums"]["modalidade_cultural"][]
            | null
          estado?: string | null
          experiencia_anos?: number | null
          formacao_academica?: string | null
          id?: string
          mini_curriculo?: string | null
          nome: string
          prefeitura_id: string
          projetos_em_analise?: number | null
          rg?: string | null
          senha_hash: string
          status?: string | null
          telefone?: string | null
          total_avaliacoes?: number | null
          ultimo_acesso?: string | null
          updated_at?: string | null
        }
        Update: {
          area_atuacao?: string | null
          cep?: string | null
          cidade?: string | null
          cpf?: string
          created_at?: string | null
          data_ativacao?: string | null
          data_nascimento?: string | null
          email?: string
          endereco?: string | null
          especialidade?:
            | Database["public"]["Enums"]["modalidade_cultural"][]
            | null
          estado?: string | null
          experiencia_anos?: number | null
          formacao_academica?: string | null
          id?: string
          mini_curriculo?: string | null
          nome?: string
          prefeitura_id?: string
          projetos_em_analise?: number | null
          rg?: string | null
          senha_hash?: string
          status?: string | null
          telefone?: string | null
          total_avaliacoes?: number | null
          ultimo_acesso?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pareceristas_prefeitura_id_fkey"
            columns: ["prefeitura_id"]
            isOneToOne: false
            referencedRelation: "prefeituras"
            referencedColumns: ["id"]
          },
        ]
      }
      planilha_orcamentaria: {
        Row: {
          categoria: string
          created_at: string | null
          descricao: string | null
          id: string
          item: string
          justificativa: string | null
          projeto_id: string
          quantidade: number | null
          updated_at: string | null
          valor_total: number | null
          valor_unitario: number | null
        }
        Insert: {
          categoria: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          item: string
          justificativa?: string | null
          projeto_id: string
          quantidade?: number | null
          updated_at?: string | null
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Update: {
          categoria?: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          item?: string
          justificativa?: string | null
          projeto_id?: string
          quantidade?: number | null
          updated_at?: string | null
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "planilha_orcamentaria_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      prefeituras: {
        Row: {
          ativo: boolean | null
          cep: string | null
          cnpj: string
          created_at: string | null
          email: string
          endereco: string | null
          estado: string
          id: string
          municipio: string
          nome: string
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cep?: string | null
          cnpj: string
          created_at?: string | null
          email: string
          endereco?: string | null
          estado: string
          id?: string
          municipio: string
          nome: string
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cep?: string | null
          cnpj?: string
          created_at?: string | null
          email?: string
          endereco?: string | null
          estado?: string
          id?: string
          municipio?: string
          nome?: string
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      prestacoes_contas: {
        Row: {
          analisado_por: string | null
          comprovantes_url: string | null
          created_at: string | null
          data_analise: string | null
          data_entrega: string | null
          id: string
          parecer_analise: string | null
          prazo_entrega: string | null
          prefeitura_id: string
          projeto_id: string
          proponente_id: string
          relatorio_atividades: string | null
          relatorio_financeiro: string | null
          status: Database["public"]["Enums"]["status_prestacao"] | null
          status_open_banking:
            | Database["public"]["Enums"]["status_open_banking"]
            | null
          tipo: string | null
          updated_at: string | null
          valor_executado: number | null
        }
        Insert: {
          analisado_por?: string | null
          comprovantes_url?: string | null
          created_at?: string | null
          data_analise?: string | null
          data_entrega?: string | null
          id?: string
          parecer_analise?: string | null
          prazo_entrega?: string | null
          prefeitura_id: string
          projeto_id: string
          proponente_id: string
          relatorio_atividades?: string | null
          relatorio_financeiro?: string | null
          status?: Database["public"]["Enums"]["status_prestacao"] | null
          status_open_banking?:
            | Database["public"]["Enums"]["status_open_banking"]
            | null
          tipo?: string | null
          updated_at?: string | null
          valor_executado?: number | null
        }
        Update: {
          analisado_por?: string | null
          comprovantes_url?: string | null
          created_at?: string | null
          data_analise?: string | null
          data_entrega?: string | null
          id?: string
          parecer_analise?: string | null
          prazo_entrega?: string | null
          prefeitura_id?: string
          projeto_id?: string
          proponente_id?: string
          relatorio_atividades?: string | null
          relatorio_financeiro?: string | null
          status?: Database["public"]["Enums"]["status_prestacao"] | null
          status_open_banking?:
            | Database["public"]["Enums"]["status_open_banking"]
            | null
          tipo?: string | null
          updated_at?: string | null
          valor_executado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prestacoes_contas_prefeitura_id_fkey"
            columns: ["prefeitura_id"]
            isOneToOne: false
            referencedRelation: "prefeituras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prestacoes_contas_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prestacoes_contas_proponente_id_fkey"
            columns: ["proponente_id"]
            isOneToOne: false
            referencedRelation: "proponentes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ativo: boolean | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          papel: Database["public"]["Enums"]["papel_usuario"] | null
          prefeitura_id: string | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          papel?: Database["public"]["Enums"]["papel_usuario"] | null
          prefeitura_id?: string | null
          updated_at?: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          papel?: Database["public"]["Enums"]["papel_usuario"] | null
          prefeitura_id?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: [
          {
            foreignKeyName: "profiles_prefeitura_id_fkey"
            columns: ["prefeitura_id"]
            isOneToOne: false
            referencedRelation: "prefeituras"
            referencedColumns: ["id"]
          },
        ]
      }
      projetos: {
        Row: {
          acessibilidade_arquitetonica: string[] | null
          acessibilidade_atitudinal: string[] | null
          acessibilidade_comunicacional: string[] | null
          categoria: string | null
          created_at: string | null
          data_final: string | null
          data_inicio: string | null
          data_submissao: string | null
          descricao: string
          detalhes_outras_fontes: string | null
          detalhes_venda_produtos: string | null
          edital_id: string
          estrategia_divulgacao: string | null
          id: string
          implementacao_acessibilidade: string | null
          local_execucao: string | null
          modalidade: Database["public"]["Enums"]["modalidade_cultural"]
          necessita_comprovante_residencia: boolean | null
          nome: string
          numero_inscricao: string | null
          objetivos: string
          outra_acessibilidade_arquitetonica: string | null
          outra_acessibilidade_comunicacional: string | null
          outras_fontes: boolean | null
          outro_publico_prioritario: string | null
          parecerista_id: string | null
          perfil_publico: string | null
          prefeitura_id: string
          proponente_id: string
          publico_prioritario: string[] | null
          status: Database["public"]["Enums"]["status_projeto"]
          tipos_outras_fontes: string[] | null
          updated_at: string | null
          valor_solicitado: number
          venda_produtos: boolean | null
        }
        Insert: {
          acessibilidade_arquitetonica?: string[] | null
          acessibilidade_atitudinal?: string[] | null
          acessibilidade_comunicacional?: string[] | null
          categoria?: string | null
          created_at?: string | null
          data_final?: string | null
          data_inicio?: string | null
          data_submissao?: string | null
          descricao: string
          detalhes_outras_fontes?: string | null
          detalhes_venda_produtos?: string | null
          edital_id: string
          estrategia_divulgacao?: string | null
          id?: string
          implementacao_acessibilidade?: string | null
          local_execucao?: string | null
          modalidade: Database["public"]["Enums"]["modalidade_cultural"]
          necessita_comprovante_residencia?: boolean | null
          nome: string
          numero_inscricao?: string | null
          objetivos: string
          outra_acessibilidade_arquitetonica?: string | null
          outra_acessibilidade_comunicacional?: string | null
          outras_fontes?: boolean | null
          outro_publico_prioritario?: string | null
          parecerista_id?: string | null
          perfil_publico?: string | null
          prefeitura_id: string
          proponente_id: string
          publico_prioritario?: string[] | null
          status?: Database["public"]["Enums"]["status_projeto"]
          tipos_outras_fontes?: string[] | null
          updated_at?: string | null
          valor_solicitado: number
          venda_produtos?: boolean | null
        }
        Update: {
          acessibilidade_arquitetonica?: string[] | null
          acessibilidade_atitudinal?: string[] | null
          acessibilidade_comunicacional?: string[] | null
          categoria?: string | null
          created_at?: string | null
          data_final?: string | null
          data_inicio?: string | null
          data_submissao?: string | null
          descricao?: string
          detalhes_outras_fontes?: string | null
          detalhes_venda_produtos?: string | null
          edital_id?: string
          estrategia_divulgacao?: string | null
          id?: string
          implementacao_acessibilidade?: string | null
          local_execucao?: string | null
          modalidade?: Database["public"]["Enums"]["modalidade_cultural"]
          necessita_comprovante_residencia?: boolean | null
          nome?: string
          numero_inscricao?: string | null
          objetivos?: string
          outra_acessibilidade_arquitetonica?: string | null
          outra_acessibilidade_comunicacional?: string | null
          outras_fontes?: boolean | null
          outro_publico_prioritario?: string | null
          parecerista_id?: string | null
          perfil_publico?: string | null
          prefeitura_id?: string
          proponente_id?: string
          publico_prioritario?: string[] | null
          status?: Database["public"]["Enums"]["status_projeto"]
          tipos_outras_fontes?: string[] | null
          updated_at?: string | null
          valor_solicitado?: number
          venda_produtos?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "projetos_edital_id_fkey"
            columns: ["edital_id"]
            isOneToOne: false
            referencedRelation: "editais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_parecerista_id_fkey"
            columns: ["parecerista_id"]
            isOneToOne: false
            referencedRelation: "pareceristas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_prefeitura_id_fkey"
            columns: ["prefeitura_id"]
            isOneToOne: false
            referencedRelation: "prefeituras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_proponente_id_fkey"
            columns: ["proponente_id"]
            isOneToOne: false
            referencedRelation: "proponentes"
            referencedColumns: ["id"]
          },
        ]
      }
      proponentes: {
        Row: {
          ano_coletivo: string | null
          cep: string | null
          cidade: string | null
          cnpj: string | null
          comunidade_tradicional: string | null
          concorre_cotas: boolean | null
          cpf: string | null
          cpf_representante: string | null
          created_at: string | null
          data_nascimento: string | null
          email: string
          email_representante: string | null
          endereco: string | null
          endereco_sede: string | null
          escolaridade: string | null
          escolaridade_representante: string | null
          estado: string | null
          funcao_artistica: string | null
          genero: string | null
          genero_representante: string | null
          id: string
          inscricao_estadual: string | null
          membros_coletivo: string | null
          mini_curriculo: string | null
          nome: string
          nome_artistico: string | null
          nome_coletivo: string | null
          nome_fantasia: string | null
          nome_representante: string | null
          numero_representantes: number | null
          outra_comunidade: string | null
          outra_deficiencia: string | null
          outra_deficiencia_representante: string | null
          outra_funcao_artistica: string | null
          outro_programa_social: string | null
          pcd: boolean | null
          pcd_representante: boolean | null
          prefeitura_id: string
          profissao: string | null
          programa_social: string | null
          quantidade_pessoas: number | null
          raca: string | null
          raca_representante: string | null
          razao_social: string | null
          renda_mensal: string | null
          representa_coletivo: boolean | null
          rg: string | null
          senha_hash: string
          status: string | null
          telefone: string | null
          telefone_representante: string | null
          tipo: Database["public"]["Enums"]["tipo_proponente"]
          tipo_cotas: string | null
          tipo_deficiencia: string | null
          tipo_deficiencia_representante: string | null
          ultimo_acesso: string | null
          updated_at: string | null
        }
        Insert: {
          ano_coletivo?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          comunidade_tradicional?: string | null
          concorre_cotas?: boolean | null
          cpf?: string | null
          cpf_representante?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          email: string
          email_representante?: string | null
          endereco?: string | null
          endereco_sede?: string | null
          escolaridade?: string | null
          escolaridade_representante?: string | null
          estado?: string | null
          funcao_artistica?: string | null
          genero?: string | null
          genero_representante?: string | null
          id?: string
          inscricao_estadual?: string | null
          membros_coletivo?: string | null
          mini_curriculo?: string | null
          nome: string
          nome_artistico?: string | null
          nome_coletivo?: string | null
          nome_fantasia?: string | null
          nome_representante?: string | null
          numero_representantes?: number | null
          outra_comunidade?: string | null
          outra_deficiencia?: string | null
          outra_deficiencia_representante?: string | null
          outra_funcao_artistica?: string | null
          outro_programa_social?: string | null
          pcd?: boolean | null
          pcd_representante?: boolean | null
          prefeitura_id: string
          profissao?: string | null
          programa_social?: string | null
          quantidade_pessoas?: number | null
          raca?: string | null
          raca_representante?: string | null
          razao_social?: string | null
          renda_mensal?: string | null
          representa_coletivo?: boolean | null
          rg?: string | null
          senha_hash: string
          status?: string | null
          telefone?: string | null
          telefone_representante?: string | null
          tipo: Database["public"]["Enums"]["tipo_proponente"]
          tipo_cotas?: string | null
          tipo_deficiencia?: string | null
          tipo_deficiencia_representante?: string | null
          ultimo_acesso?: string | null
          updated_at?: string | null
        }
        Update: {
          ano_coletivo?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          comunidade_tradicional?: string | null
          concorre_cotas?: boolean | null
          cpf?: string | null
          cpf_representante?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          email?: string
          email_representante?: string | null
          endereco?: string | null
          endereco_sede?: string | null
          escolaridade?: string | null
          escolaridade_representante?: string | null
          estado?: string | null
          funcao_artistica?: string | null
          genero?: string | null
          genero_representante?: string | null
          id?: string
          inscricao_estadual?: string | null
          membros_coletivo?: string | null
          mini_curriculo?: string | null
          nome?: string
          nome_artistico?: string | null
          nome_coletivo?: string | null
          nome_fantasia?: string | null
          nome_representante?: string | null
          numero_representantes?: number | null
          outra_comunidade?: string | null
          outra_deficiencia?: string | null
          outra_deficiencia_representante?: string | null
          outra_funcao_artistica?: string | null
          outro_programa_social?: string | null
          pcd?: boolean | null
          pcd_representante?: boolean | null
          prefeitura_id?: string
          profissao?: string | null
          programa_social?: string | null
          quantidade_pessoas?: number | null
          raca?: string | null
          raca_representante?: string | null
          razao_social?: string | null
          renda_mensal?: string | null
          representa_coletivo?: boolean | null
          rg?: string | null
          senha_hash?: string
          status?: string | null
          telefone?: string | null
          telefone_representante?: string | null
          tipo?: Database["public"]["Enums"]["tipo_proponente"]
          tipo_cotas?: string | null
          tipo_deficiencia?: string | null
          tipo_deficiencia_representante?: string | null
          ultimo_acesso?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proponentes_prefeitura_id_fkey"
            columns: ["prefeitura_id"]
            isOneToOne: false
            referencedRelation: "prefeituras"
            referencedColumns: ["id"]
          },
        ]
      }
      recuperacao_senha_parecerista: {
        Row: {
          created_at: string | null
          expira_em: string
          id: string
          parecerista_id: string
          token: string
          usado: boolean | null
        }
        Insert: {
          created_at?: string | null
          expira_em: string
          id?: string
          parecerista_id: string
          token: string
          usado?: boolean | null
        }
        Update: {
          created_at?: string | null
          expira_em?: string
          id?: string
          parecerista_id?: string
          token?: string
          usado?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "recuperacao_senha_parecerista_parecerista_id_fkey"
            columns: ["parecerista_id"]
            isOneToOne: false
            referencedRelation: "pareceristas"
            referencedColumns: ["id"]
          },
        ]
      }
      recuperacao_senha_proponente: {
        Row: {
          created_at: string | null
          expira_em: string
          id: string
          proponente_id: string
          token: string
          usado: boolean | null
        }
        Insert: {
          created_at?: string | null
          expira_em: string
          id?: string
          proponente_id: string
          token: string
          usado?: boolean | null
        }
        Update: {
          created_at?: string | null
          expira_em?: string
          id?: string
          proponente_id?: string
          token?: string
          usado?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "recuperacao_senha_proponente_proponente_id_fkey"
            columns: ["proponente_id"]
            isOneToOne: false
            referencedRelation: "proponentes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      atualizar_senha_parecerista: {
        Args: { p_id: string; p_senha: string }
        Returns: undefined
      }
      atualizar_senha_proponente: {
        Args: { p_id: string; p_senha: string }
        Returns: undefined
      }
      gerar_token_recuperacao_parecerista: {
        Args: { p_email: string }
        Returns: string
      }
      gerar_token_recuperacao_proponente: {
        Args: { p_email: string }
        Returns: string
      }
      redefinir_senha_parecerista: {
        Args: { p_nova_senha: string; p_token: string }
        Returns: boolean
      }
      redefinir_senha_proponente: {
        Args: { p_nova_senha: string; p_token: string }
        Returns: boolean
      }
      verificar_cpf_parecerista: {
        Args: { p_cpf: string }
        Returns: boolean
      }
      verificar_cpf_proponente: {
        Args: { p_cpf: string }
        Returns: boolean
      }
      verificar_email_parecerista: {
        Args: { p_email: string }
        Returns: boolean
      }
      verificar_email_proponente: {
        Args: { p_email: string }
        Returns: boolean
      }
      verificar_senha_parecerista: {
        Args: { p_id: string; p_senha: string }
        Returns: boolean
      }
      verificar_senha_proponente: {
        Args: { p_id: string; p_senha: string }
        Returns: boolean
      }
    }
    Enums: {
      modalidade_cultural:
        | "musica"
        | "teatro"
        | "danca"
        | "artes_visuais"
        | "literatura"
        | "cinema"
        | "cultura_popular"
        | "circo"
        | "outros"
      papel_usuario: "gestor" | "assistente" | "financeiro" | "administrador"
      status_comunicacao: "enviado" | "lido" | "em_analise" | "respondido"
      status_documento: "pendente" | "enviado" | "aprovado" | "rejeitado"
      status_edital: "ativo" | "arquivado" | "rascunho"
      status_open_banking:
        | "conforme"
        | "alerta"
        | "irregularidade"
        | "nao_monitorado"
      status_prestacao:
        | "pendente"
        | "em_analise"
        | "aprovado"
        | "rejeitado"
        | "exigencia"
      status_projeto:
        | "recebido"
        | "aguardando_avaliacao"
        | "em_avaliacao"
        | "avaliado"
        | "aprovado"
        | "rejeitado"
        | "em_execucao"
        | "concluido"
      tipo_comunicacao: "recurso" | "duvida" | "solicitacao" | "notificacao"
      tipo_proponente: "PF" | "PJ" | "Grupo" | "COOP"
      user_type: "prefeitura" | "proponente" | "parecerista"
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
      modalidade_cultural: [
        "musica",
        "teatro",
        "danca",
        "artes_visuais",
        "literatura",
        "cinema",
        "cultura_popular",
        "circo",
        "outros",
      ],
      papel_usuario: ["gestor", "assistente", "financeiro", "administrador"],
      status_comunicacao: ["enviado", "lido", "em_analise", "respondido"],
      status_documento: ["pendente", "enviado", "aprovado", "rejeitado"],
      status_edital: ["ativo", "arquivado", "rascunho"],
      status_open_banking: [
        "conforme",
        "alerta",
        "irregularidade",
        "nao_monitorado",
      ],
      status_prestacao: [
        "pendente",
        "em_analise",
        "aprovado",
        "rejeitado",
        "exigencia",
      ],
      status_projeto: [
        "recebido",
        "aguardando_avaliacao",
        "em_avaliacao",
        "avaliado",
        "aprovado",
        "rejeitado",
        "em_execucao",
        "concluido",
      ],
      tipo_comunicacao: ["recurso", "duvida", "solicitacao", "notificacao"],
      tipo_proponente: ["PF", "PJ", "Grupo", "COOP"],
      user_type: ["prefeitura", "proponente", "parecerista"],
    },
  },
} as const
