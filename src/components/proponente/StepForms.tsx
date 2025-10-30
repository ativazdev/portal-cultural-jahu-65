import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface StepFormsProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  tipoRegistro: "PF" | "PJ";
  currentStep: number;
}

export const DadosBasicosPF = ({ formData, handleInputChange }: StepFormsProps) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold border-b pb-2">Dados Básicos</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="reg-nome">Nome Completo *</Label>
        <Input
          id="reg-nome"
          value={formData.nome}
          onChange={(e) => handleInputChange("nome", e.target.value)}
          placeholder="Nome completo"
        />
      </div>
      <div>
        <Label htmlFor="reg-nome-artistico">Nome artístico ou nome social (se houver)</Label>
        <Input
          id="reg-nome-artistico"
          value={formData.nomeArtistico}
          onChange={(e) => handleInputChange("nomeArtistico", e.target.value)}
          placeholder="Nome artístico ou social"
        />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="reg-cpf">CPF</Label>
        <Input
          id="reg-cpf"
          value={formData.cpf}
          onChange={(e) => handleInputChange("cpf", e.target.value)}
          placeholder="000.000.000-00"
        />
      </div>
      <div>
        <Label htmlFor="reg-rg">RG</Label>
        <Input
          id="reg-rg"
          value={formData.rg}
          onChange={(e) => handleInputChange("rg", e.target.value)}
          placeholder="00.000.000-0"
        />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="reg-nascimento">Data de nascimento</Label>
        <Input
          id="reg-nascimento"
          type="date"
          value={formData.dataNascimento}
          onChange={(e) => handleInputChange("dataNascimento", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="reg-telefone">Telefone</Label>
        <Input
          id="reg-telefone"
          value={formData.telefone}
          onChange={(e) => handleInputChange("telefone", e.target.value)}
          placeholder="(14) 99999-9999"
        />
      </div>
    </div>
  </div>
);

export const EnderecoPF = ({ formData, handleInputChange }: StepFormsProps) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold border-b pb-2">Endereço</h3>
    <div>
      <Label htmlFor="reg-cep">CEP</Label>
      <Input
        id="reg-cep"
        value={formData.cep}
        onChange={(e) => handleInputChange("cep", e.target.value)}
        placeholder="00000-000"
      />
    </div>
    <div>
      <Label htmlFor="reg-endereco">Logradouro *</Label>
      <Input
        id="reg-endereco"
        value={formData.endereco}
        onChange={(e) => handleInputChange("endereco", e.target.value)}
        placeholder="Rua, Avenida, etc."
      />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="reg-numero">Número</Label>
        <Input
          id="reg-numero"
          value={formData.numero}
          onChange={(e) => handleInputChange("numero", e.target.value)}
          placeholder="Número"
        />
      </div>
      <div>
        <Label htmlFor="reg-complemento">Complemento</Label>
        <Input
          id="reg-complemento"
          value={formData.complemento}
          onChange={(e) => handleInputChange("complemento", e.target.value)}
          placeholder="Apto, Bloco, etc."
        />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="reg-cidade">Cidade</Label>
        <Input
          id="reg-cidade"
          value={formData.cidade}
          onChange={(e) => handleInputChange("cidade", e.target.value)}
          placeholder="Cidade"
        />
      </div>
      <div>
        <Label htmlFor="reg-estado">Estado</Label>
        <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o estado" />
          </SelectTrigger>
          <SelectContent>
            {[
              { sigla: "AC", nome: "Acre" }, { sigla: "AL", nome: "Alagoas" }, { sigla: "AP", nome: "Amapá" },
              { sigla: "AM", nome: "Amazonas" }, { sigla: "BA", nome: "Bahia" }, { sigla: "CE", nome: "Ceará" },
              { sigla: "DF", nome: "Distrito Federal" }, { sigla: "ES", nome: "Espírito Santo" }, { sigla: "GO", nome: "Goiás" },
              { sigla: "MA", nome: "Maranhão" }, { sigla: "MT", nome: "Mato Grosso" }, { sigla: "MS", nome: "Mato Grosso do Sul" },
              { sigla: "MG", nome: "Minas Gerais" }, { sigla: "PA", nome: "Pará" }, { sigla: "PB", nome: "Paraíba" },
              { sigla: "PR", nome: "Paraná" }, { sigla: "PE", nome: "Pernambuco" }, { sigla: "PI", nome: "Piauí" },
              { sigla: "RJ", nome: "Rio de Janeiro" }, { sigla: "RN", nome: "Rio Grande do Norte" }, { sigla: "RS", nome: "Rio Grande do Sul" },
              { sigla: "RO", nome: "Rondônia" }, { sigla: "RR", nome: "Roraima" }, { sigla: "SC", nome: "Santa Catarina" },
              { sigla: "SP", nome: "São Paulo" }, { sigla: "SE", nome: "Sergipe" }, { sigla: "TO", nome: "Tocantins" }
            ].map((estado) => (
              <SelectItem key={estado.sigla} value={estado.sigla}>
                {estado.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
);

export const DadosPessoaisPF = ({ formData, handleInputChange }: StepFormsProps) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold border-b pb-2">Dados Pessoais</h3>
    
    {/* Comunidade Tradicional */}
    <div>
      <Label>Comunidade Tradicional</Label>
      <RadioGroup
        value={formData.comunidadeTradicional}
        onValueChange={(value) => handleInputChange("comunidadeTradicional", value)}
        className="mt-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="nao" id="com-nao" />
          <Label htmlFor="com-nao">Não pertenço a comunidade tradicional</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="extrativistas" id="com-ext" />
          <Label htmlFor="com-ext">Comunidades Extrativistas</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="ribeirinhas" id="com-rib" />
          <Label htmlFor="com-rib">Comunidades Ribeirinhas</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="rurais" id="com-rur" />
          <Label htmlFor="com-rur">Comunidades Rurais</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="indigenas" id="com-ind" />
          <Label htmlFor="com-ind">Indígenas</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="ciganos" id="com-cig" />
          <Label htmlFor="com-cig">Povos Ciganos</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="pescadores" id="com-pesc" />
          <Label htmlFor="com-pesc">Pescadores(as) Artesanais</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="terreiro" id="com-terr" />
          <Label htmlFor="com-terr">Povos de Terreiro</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="quilombolas" id="com-quil" />
          <Label htmlFor="com-quil">Quilombolas</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="outra" id="com-outra" />
          <Label htmlFor="com-outra">Outra comunidade tradicional</Label>
        </div>
      </RadioGroup>
      {formData.comunidadeTradicional === "outra" && (
        <Input
          value={formData.outraComunidade}
          onChange={(e) => handleInputChange("outraComunidade", e.target.value)}
          placeholder="Indique qual comunidade tradicional"
          className="mt-2"
        />
      )}
    </div>

    {/* Gênero */}
    <div className="mt-4">
      <Label>Identidade de Gênero</Label>
      <RadioGroup
        value={formData.genero}
        onValueChange={(value) => handleInputChange("genero", value)}
        className="mt-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="mulher-cis" id="gen-mcis" />
          <Label htmlFor="gen-mcis">Mulher cisgênero</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="homem-cis" id="gen-hcis" />
          <Label htmlFor="gen-hcis">Homem cisgênero</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="mulher-trans" id="gen-mtrans" />
          <Label htmlFor="gen-mtrans">Mulher Transgênero</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="homem-trans" id="gen-htrans" />
          <Label htmlFor="gen-htrans">Homem Transgênero</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="nao-binaria" id="gen-nb" />
          <Label htmlFor="gen-nb">Pessoa Não Binária</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="nao-informar" id="gen-ni" />
          <Label htmlFor="gen-ni">Não informar</Label>
        </div>
      </RadioGroup>
    </div>

    {/* Raça */}
    <div className="mt-4">
      <Label>Raça, Cor ou Etnia</Label>
      <RadioGroup
        value={formData.raca}
        onValueChange={(value) => handleInputChange("raca", value)}
        className="mt-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="branca" id="raca-branca" />
          <Label htmlFor="raca-branca">Branca</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="preta" id="raca-preta" />
          <Label htmlFor="raca-preta">Preta</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="parda" id="raca-parda" />
          <Label htmlFor="raca-parda">Parda</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="indigena" id="raca-indigena" />
          <Label htmlFor="raca-indigena">Indígena</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="amarela" id="raca-amarela" />
          <Label htmlFor="raca-amarela">Amarela</Label>
        </div>
      </RadioGroup>
    </div>
  </div>
);

export const PCDPF = ({ formData, handleInputChange }: StepFormsProps) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold border-b pb-2">Pessoa com Deficiência</h3>
    <div>
      <Label>Você é uma Pessoa com Deficiência - PCD? *</Label>
      <RadioGroup
        value={formData.pcd}
        onValueChange={(value) => handleInputChange("pcd", value)}
        className="mt-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="sim" id="pcd-sim" />
          <Label htmlFor="pcd-sim">Sim</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="nao" id="pcd-nao" />
          <Label htmlFor="pcd-nao">Não</Label>
        </div>
      </RadioGroup>
    </div>
    {formData.pcd === "sim" && (
      <div className="mt-4">
        <Label>Qual tipo de deficiência?</Label>
        <RadioGroup
          value={formData.tipoDeficiencia}
          onValueChange={(value) => handleInputChange("tipoDeficiencia", value)}
          className="mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="auditiva" id="def-aud" />
            <Label htmlFor="def-aud">Auditiva</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="fisica" id="def-fis" />
            <Label htmlFor="def-fis">Física</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="intelectual" id="def-int" />
            <Label htmlFor="def-int">Intelectual</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="multipla" id="def-mult" />
            <Label htmlFor="def-mult">Múltipla</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="visual" id="def-vis" />
            <Label htmlFor="def-vis">Visual</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="outro" id="def-outro" />
            <Label htmlFor="def-outro">Outro tipo</Label>
          </div>
        </RadioGroup>
        {formData.tipoDeficiencia === "outro" && (
          <Input
            value={formData.outraDeficiencia}
            onChange={(e) => handleInputChange("outraDeficiencia", e.target.value)}
            placeholder="Indique qual tipo de deficiência"
            className="mt-2"
          />
        )}
      </div>
    )}
  </div>
);

export const FormacaoPF = ({ formData, handleInputChange }: StepFormsProps) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold border-b pb-2">Formação</h3>
    
    {/* Escolaridade */}
    <div>
      <Label>Qual o seu grau de escolaridade? *</Label>
      <RadioGroup
        value={formData.escolaridade}
        onValueChange={(value) => handleInputChange("escolaridade", value)}
        className="mt-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="sem-educacao" id="esc-sem" />
          <Label htmlFor="esc-sem">Não tenho Educação Formal</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="fundamental-inc" id="esc-fund-inc" />
          <Label htmlFor="esc-fund-inc">Ensino Fundamental Incompleto</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="fundamental-comp" id="esc-fund-comp" />
          <Label htmlFor="esc-fund-comp">Ensino Fundamental Completo</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="medio-inc" id="esc-med-inc" />
          <Label htmlFor="esc-med-inc">Ensino Médio Incompleto</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="medio-comp" id="esc-med-comp" />
          <Label htmlFor="esc-med-comp">Ensino Médio Completo</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="tecnico" id="esc-tec" />
          <Label htmlFor="esc-tec">Curso Técnico Completo</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="superior-inc" id="esc-sup-inc" />
          <Label htmlFor="esc-sup-inc">Ensino Superior Incompleto</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="superior-comp" id="esc-sup-comp" />
          <Label htmlFor="esc-sup-comp">Ensino Superior Completo</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="pos-comp" id="esc-pos-comp" />
          <Label htmlFor="esc-pos-comp">Pós Graduação Completo</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="pos-inc" id="esc-pos-inc" />
          <Label htmlFor="esc-pos-inc">Pós-Graduação Incompleto</Label>
        </div>
      </RadioGroup>
    </div>

    {/* Renda */}
    <div className="mt-4">
      <Label>Qual a sua renda mensal fixa individual? *</Label>
      <p className="text-sm text-gray-500 mb-2">Calcule fazendo uma média das suas remunerações nos últimos 3 meses.</p>
      <RadioGroup
        value={formData.rendaMensal}
        onValueChange={(value) => handleInputChange("rendaMensal", value)}
        className="mt-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="nenhuma" id="renda-nenhuma" />
          <Label htmlFor="renda-nenhuma">Nenhuma renda</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="ate-1" id="renda-1" />
          <Label htmlFor="renda-1">Até 1 salário mínimo</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="1-3" id="renda-1-3" />
          <Label htmlFor="renda-1-3">De 1 a 3 salários mínimos</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="3-5" id="renda-3-5" />
          <Label htmlFor="renda-3-5">De 3 a 5 salários mínimos</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="5-7" id="renda-5-7" />
          <Label htmlFor="renda-5-7">De 5 a 7 salários mínimos</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="7-10" id="renda-7-10" />
          <Label htmlFor="renda-7-10">De 7 a 10 salários mínimos</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="mais-10" id="renda-mais-10" />
          <Label htmlFor="renda-mais-10">Mais de 10 salários mínimos</Label>
        </div>
      </RadioGroup>
    </div>
  </div>
);

export const ProgramasSociaisPF = ({ formData, handleInputChange }: StepFormsProps) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold border-b pb-2">Programas Sociais</h3>
    <div>
      <Label>Você participa ou já participou de algum Programa Social? *</Label>
      <RadioGroup
        value={formData.programaSocial}
        onValueChange={(value) => handleInputChange("programaSocial", value)}
        className="mt-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="bolsa-familia" id="prog-bf" />
          <Label htmlFor="prog-bf">Bolsa Família</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="bpc" id="prog-bpc" />
          <Label htmlFor="prog-bpc">Benefício de Prestação Continuada (BPC)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="cadunico" id="prog-cad" />
          <Label htmlFor="prog-cad">Cadastro Único (CadÚnico)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="bolsa-verde" id="prog-bv" />
          <Label htmlFor="prog-bv">Programa Bolsa Verde</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="outro" id="prog-outro" />
          <Label htmlFor="prog-outro">Outro</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="nenhum" id="prog-nenhum" />
          <Label htmlFor="prog-nenhum">Nenhum</Label>
        </div>
      </RadioGroup>
      {formData.programaSocial === "outro" && (
        <Input
          value={formData.outroProgramaSocial}
          onChange={(e) => handleInputChange("outroProgramaSocial", e.target.value)}
          placeholder="Qual outro programa social?"
          className="mt-2"
        />
      )}
    </div>
  </div>
);

export const CotasPF = ({ formData, handleInputChange }: StepFormsProps) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold border-b pb-2">Sistema de Cotas</h3>
    <div>
      <Label>Você se declara como pertencente a grupos beneficiários de políticas afirmativas? *</Label>
      <RadioGroup
        value={formData.concorreCotas}
        onValueChange={(value) => handleInputChange("concorreCotas", value)}
        className="mt-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="sim" id="cotas-sim" />
          <Label htmlFor="cotas-sim">Sim</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="nao" id="cotas-nao" />
          <Label htmlFor="cotas-nao">Não</Label>
        </div>
      </RadioGroup>
    </div>
    {formData.concorreCotas === "sim" && (
      <div className="mt-4">
        <Label>Qual tipo de cotas?</Label>
        <RadioGroup
          value={formData.tipoCotas}
          onValueChange={(value) => handleInputChange("tipoCotas", value)}
          className="mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="racial" id="cotas-racial" />
            <Label htmlFor="cotas-racial">Racial</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pcd" id="cotas-pcd" />
            <Label htmlFor="cotas-pcd">PCD</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="social" id="cotas-social" />
            <Label htmlFor="cotas-social">Social</Label>
          </div>
        </RadioGroup>
      </div>
    )}
  </div>
);

export const ArtisticoPF = ({ formData, handleInputChange }: StepFormsProps) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold border-b pb-2">Atividade Artística</h3>
    <div>
      <Label>Qual a sua principal função/profissão no campo artístico e cultural? *</Label>
      <RadioGroup
        value={formData.funcaoArtistica}
        onValueChange={(value) => handleInputChange("funcaoArtistica", value)}
        className="mt-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="artista" id="func-artista" />
          <Label htmlFor="func-artista">Artista, Artesão(a), Brincante, Criador(a)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="instrutor" id="func-instrutor" />
          <Label htmlFor="func-instrutor">Instrutor(a), Oficineiro(a), Educador(a)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="curador" id="func-curador" />
          <Label htmlFor="func-curador">Curador(a), Programador(a)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="produtor" id="func-produtor" />
          <Label htmlFor="func-produtor">Produtor(a)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="gestor" id="func-gestor" />
          <Label htmlFor="func-gestor">Gestor(a)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="tecnico" id="func-tecnico" />
          <Label htmlFor="func-tecnico">Técnico(a)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="critico" id="func-critico" />
          <Label htmlFor="func-critico">Crítico(a), Pesquisador(a)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="outro" id="func-outro" />
          <Label htmlFor="func-outro">Outro</Label>
        </div>
      </RadioGroup>
      {formData.funcaoArtistica === "outro" && (
        <Input
          value={formData.outraFuncaoArtistica}
          onChange={(e) => handleInputChange("outraFuncaoArtistica", e.target.value)}
          placeholder="Indique outra função artística"
          className="mt-2"
        />
      )}
    </div>
    <div className="mt-4">
      <Label htmlFor="reg-profissao">Profissão</Label>
      <Input
        id="reg-profissao"
        value={formData.profissao}
        onChange={(e) => handleInputChange("profissao", e.target.value)}
        placeholder="Profissão exercida fora da área cultural"
      />
    </div>
  </div>
);

export const ColetivoPF = ({ formData, handleInputChange }: StepFormsProps) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold border-b pb-2">Representa Coletivo</h3>
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id="reg-coletivo"
        checked={formData.representaColetivo}
        onChange={(e) => handleInputChange("representaColetivo", e.target.checked)}
        className="rounded border-gray-300"
      />
      <Label htmlFor="reg-coletivo">Representa Coletivo/Grupo sem CNPJ</Label>
    </div>
    {formData.representaColetivo && (
      <div className="mt-4 space-y-4">
        <div>
          <Label htmlFor="reg-nome-coletivo">Nome do Coletivo/Grupo</Label>
          <Input
            id="reg-nome-coletivo"
            value={formData.nomeColetivo}
            onChange={(e) => handleInputChange("nomeColetivo", e.target.value)}
            placeholder="Nome do coletivo"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="reg-ano-coletivo">Ano de Fundação</Label>
            <Input
              id="reg-ano-coletivo"
              value={formData.anoColetivo}
              onChange={(e) => handleInputChange("anoColetivo", e.target.value)}
              placeholder="2010"
            />
          </div>
          <div>
            <Label htmlFor="reg-quantidade">Quantidade de Pessoas</Label>
            <Input
              id="reg-quantidade"
              type="number"
              value={formData.quantidadePessoas}
              onChange={(e) => handleInputChange("quantidadePessoas", e.target.value)}
              placeholder="10"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="reg-membros">Membros do Coletivo</Label>
          <Textarea
            id="reg-membros"
            value={formData.membrosColetivo}
            onChange={(e) => handleInputChange("membrosColetivo", e.target.value)}
            placeholder="Nome dos membros"
            rows={3}
          />
        </div>
      </div>
    )}
  </div>
);

export const ExperienciaPF = ({ formData, handleInputChange }: StepFormsProps) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold border-b pb-2">Experiência Cultural</h3>
    <div>
      <Label htmlFor="reg-curriculo">Mini Currículo ou Mini portfólio</Label>
      <Textarea
        id="reg-curriculo"
        value={formData.miniCurriculo}
        onChange={(e) => handleInputChange("miniCurriculo", e.target.value)}
        placeholder="Escreva aqui um resumo do seu currículo destacando as principais atuações culturais realizadas."
        rows={4}
      />
    </div>
  </div>
);

export const BancarioPF = ({ formData, handleInputChange }: StepFormsProps) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold border-b pb-2">Dados Bancários</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="reg-banco">Banco</Label>
        <Input
          id="reg-banco"
          value={formData.banco}
          onChange={(e) => handleInputChange("banco", e.target.value)}
          placeholder="Nome do banco"
        />
      </div>
      <div>
        <Label htmlFor="reg-agencia">Agência</Label>
        <Input
          id="reg-agencia"
          value={formData.agencia}
          onChange={(e) => handleInputChange("agencia", e.target.value)}
          placeholder="0000"
        />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="reg-conta">Conta</Label>
        <Input
          id="reg-conta"
          value={formData.conta}
          onChange={(e) => handleInputChange("conta", e.target.value)}
          placeholder="00000000-0"
        />
      </div>
      <div>
        <Label htmlFor="reg-tipo-conta">Tipo de Conta</Label>
        <Select value={formData.tipoConta} onValueChange={(value) => handleInputChange("tipoConta", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="corrente">Corrente</SelectItem>
            <SelectItem value="poupanca">Poupança</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    <div>
      <Label htmlFor="reg-pix">Chave PIX</Label>
      <Input
        id="reg-pix"
        value={formData.pix}
        onChange={(e) => handleInputChange("pix", e.target.value)}
        placeholder="CPF, email ou chave aleatória"
      />
    </div>
  </div>
);

// Componentes para PJ
export const DadosEmpresaPJ = ({ formData, handleInputChange }: StepFormsProps) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold border-b pb-2">Dados da Empresa</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="reg-razao">Razão Social *</Label>
        <Input
          id="reg-razao"
          value={formData.razaoSocial}
          onChange={(e) => handleInputChange("razaoSocial", e.target.value)}
          placeholder="Razão social da empresa"
        />
      </div>
      <div>
        <Label htmlFor="reg-nome-fantasia">Nome fantasia</Label>
        <Input
          id="reg-nome-fantasia"
          value={formData.nomeFantasia}
          onChange={(e) => handleInputChange("nomeFantasia", e.target.value)}
          placeholder="Nome fantasia"
        />
      </div>
    </div>
    <div>
      <Label htmlFor="reg-cnpj">CNPJ</Label>
      <Input
        id="reg-cnpj"
        value={formData.cnpj}
        onChange={(e) => handleInputChange("cnpj", e.target.value)}
        placeholder="00.000.000/0001-00"
      />
    </div>
  </div>
);

export const EnderecoPJ = ({ formData, handleInputChange }: StepFormsProps) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold border-b pb-2">Endereço da Sede</h3>
    <div>
      <Label htmlFor="reg-cep-sede">CEP</Label>
      <Input
        id="reg-cep-sede"
        value={formData.cep}
        onChange={(e) => handleInputChange("cep", e.target.value)}
        placeholder="00000-000"
      />
    </div>
    <div>
      <Label htmlFor="reg-endereco-sede">Logradouro *</Label>
      <Input
        id="reg-endereco-sede"
        value={formData.enderecoSede}
        onChange={(e) => handleInputChange("enderecoSede", e.target.value)}
        placeholder="Rua, Avenida, etc."
      />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="reg-numero-sede">Número</Label>
        <Input
          id="reg-numero-sede"
          value={formData.numeroSede}
          onChange={(e) => handleInputChange("numeroSede", e.target.value)}
          placeholder="Número"
        />
      </div>
      <div>
        <Label htmlFor="reg-complemento-sede">Complemento</Label>
        <Input
          id="reg-complemento-sede"
          value={formData.complementoSede}
          onChange={(e) => handleInputChange("complementoSede", e.target.value)}
          placeholder="Apto, Bloco, etc."
        />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="reg-cidade">Cidade</Label>
        <Input
          id="reg-cidade"
          value={formData.cidade}
          onChange={(e) => handleInputChange("cidade", e.target.value)}
          placeholder="Cidade"
        />
      </div>
      <div>
        <Label htmlFor="reg-estado-sede">Estado</Label>
        <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o estado" />
          </SelectTrigger>
          <SelectContent>
            {[
              { sigla: "AC", nome: "Acre" }, { sigla: "AL", nome: "Alagoas" }, { sigla: "AP", nome: "Amapá" },
              { sigla: "AM", nome: "Amazonas" }, { sigla: "BA", nome: "Bahia" }, { sigla: "CE", nome: "Ceará" },
              { sigla: "DF", nome: "Distrito Federal" }, { sigla: "ES", nome: "Espírito Santo" }, { sigla: "GO", nome: "Goiás" },
              { sigla: "MA", nome: "Maranhão" }, { sigla: "MT", nome: "Mato Grosso" }, { sigla: "MS", nome: "Mato Grosso do Sul" },
              { sigla: "MG", nome: "Minas Gerais" }, { sigla: "PA", nome: "Pará" }, { sigla: "PB", nome: "Paraíba" },
              { sigla: "PR", nome: "Paraná" }, { sigla: "PE", nome: "Pernambuco" }, { sigla: "PI", nome: "Piauí" },
              { sigla: "RJ", nome: "Rio de Janeiro" }, { sigla: "RN", nome: "Rio Grande do Norte" }, { sigla: "RS", nome: "Rio Grande do Sul" },
              { sigla: "RO", nome: "Rondônia" }, { sigla: "RR", nome: "Roraima" }, { sigla: "SC", nome: "Santa Catarina" },
              { sigla: "SP", nome: "São Paulo" }, { sigla: "SE", nome: "Sergipe" }, { sigla: "TO", nome: "Tocantins" }
            ].map((estado) => (
              <SelectItem key={estado.sigla} value={estado.sigla}>
                {estado.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
);

export const InscricoesPJ = ({ formData, handleInputChange }: StepFormsProps) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold border-b pb-2">Inscrições</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="reg-inscricao-estadual">Inscrição Estadual</Label>
        <Input
          id="reg-inscricao-estadual"
          value={formData.inscricaoEstadual}
          onChange={(e) => handleInputChange("inscricaoEstadual", e.target.value)}
          placeholder="Inscrição estadual"
        />
      </div>
      <div>
        <Label htmlFor="reg-inscricao-municipal">Inscrição Municipal</Label>
        <Input
          id="reg-inscricao-municipal"
          value={formData.inscricaoMunicipal}
          onChange={(e) => handleInputChange("inscricaoMunicipal", e.target.value)}
          placeholder="Inscrição municipal"
        />
      </div>
    </div>
  </div>
);

export const ResponsavelPJ = ({ formData, handleInputChange }: StepFormsProps) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold border-b pb-2">Responsável Legal</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="reg-nome-responsavel">Nome do Responsável</Label>
        <Input
          id="reg-nome-responsavel"
          value={formData.nomeResponsavel}
          onChange={(e) => handleInputChange("nomeResponsavel", e.target.value)}
          placeholder="Nome completo"
        />
      </div>
      <div>
        <Label htmlFor="reg-cpf-responsavel">CPF do Responsável</Label>
        <Input
          id="reg-cpf-responsavel"
          value={formData.cpfResponsavel}
          onChange={(e) => handleInputChange("cpfResponsavel", e.target.value)}
          placeholder="000.000.000-00"
        />
      </div>
    </div>
    <div>
      <Label htmlFor="reg-cargo-responsavel">Cargo</Label>
      <Input
        id="reg-cargo-responsavel"
        value={formData.cargoResponsavel}
        onChange={(e) => handleInputChange("cargoResponsavel", e.target.value)}
        placeholder="Cargo exercido"
      />
    </div>
  </div>
);

export const BancarioPJ = BancarioPF; // Mesmo componente

