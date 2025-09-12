import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Download, FileText, Users, Building } from "lucide-react";

const DetalhesEdital = () => {
  const navigate = useNavigate();
  const [selectedProponente, setSelectedProponente] = useState<string | null>(null);

  const faqItems = [
    {
      question: "O que é o PNAB - Jahu?",
      answer: "O PNAB - Jahu é um programa municipal de fomento à cultura, alinhado à Política Nacional Aldir Blanc de Fomento à Cultura, que visa descentralizar e democratizar o acesso aos recursos culturais."
    },
    {
      question: "Quem pode participar deste edital?",
      answer: "Podem participar Pessoa Física e Pessoa Jurídica com sede ou residência comprovada em Jahu, que atuem na área cultural e atendam aos requisitos do edital."
    },
    {
      question: "Onde posso acompanhar a publicação e resultados?",
      answer: "Todas as informações, datas e resultados serão publicados no Diário Oficial do Município de Jahu e no site oficial da Secretaria de Cultura."
    },
    {
      question: "Qual o prazo para submissão das propostas?",
      answer: "As propostas devem ser submetidas até o dia 31 de março de 2025, às 18h00, exclusivamente através da plataforma digital do PNAB - Jahu."
    },
    {
      question: "Como será feita a avaliação dos projetos?",
      answer: "Os projetos serão avaliados por uma comissão técnica composta por especialistas em cultura, que analisará a relevância cultural, viabilidade técnica e impacto social das propostas."
    }
  ];

  const proponentes = [
    {
      id: "prop-1",
      nome: "Maria Silva Santos",
      tipo: "Pessoa Física",
      documento: "123.456.789-00",
      area: "Teatro e Artes Cênicas",
      descricao: "Atriz e produtora cultural com 15 anos de experiência em teatro comunitário",
      icon: Users
    },
    {
      id: "prop-2", 
      nome: "Associação Cultural Arte Viva",
      tipo: "Pessoa Jurídica",
      documento: "12.345.678/0001-90",
      area: "Música e Dança",
      descricao: "ONG dedicada ao ensino de música para jovens em situação de vulnerabilidade",
      icon: Building
    },
    {
      id: "prop-3",
      nome: "João Carlos Oliveira",
      tipo: "Pessoa Física", 
      documento: "987.654.321-00",
      area: "Literatura e Poesia",
      descricao: "Escritor e poeta, organizador de saraus literários na periferia",
      icon: Users
    }
  ];

  const handleDownload = () => {
    // Simula o download do edital
    alert("Download do edital iniciado!");
  };

  const handleInscreverProponente = () => {
    if (selectedProponente) {
      const proponente = proponentes.find(p => p.id === selectedProponente);
      if (proponente) {
        navigate(`/nova-proposta?proponente=${encodeURIComponent(proponente.id)}&nome=${encodeURIComponent(proponente.nome)}&tipo=${encodeURIComponent(proponente.tipo)}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">
          EDITAL PNAB - JAHU - APOIO À CULTURA LOCAL
          </h1>
          <h2 className="text-xl text-muted-foreground">
            PRODUÇÃO CULTURAL E ARTÍSTICA
          </h2>
        </div>

        {/* Descrição do Edital */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Sobre o Edital
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
          O Edital PNAB - Jahu visa fomentar a produção cultural e artística no município de Jahu, 
          apoiando projetos de diversas linguagens que promovam o acesso à cultura, a valorização de artistas 
          locais e a diversidade cultural. Serão contempladas propostas de Pessoa Física e Pessoa Jurídica, 
          com foco em iniciativas que contribuam para o desenvolvimento cultural da cidade.
            </p>
          </CardContent>
        </Card>

        {/* Botão de Download */}
        <div className="text-center mb-8">
          <Button onClick={handleDownload} className="gap-2" size="lg">
            <Download className="h-4 w-4" />
            Baixar aqui o Edital
          </Button>
        </div>

        {/* Perguntas Frequentes */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Perguntas Frequentes</CardTitle>
            <CardDescription>
              Tire suas principais dúvidas sobre o edital
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Seção de Proponentes */}
        <Card>
          <CardHeader>
            <CardTitle>Selecione um proponente cadastrado</CardTitle>
            <CardDescription>
              Escolha qual dos seus proponentes cadastrados fará a inscrição no edital
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {proponentes.map((proponente) => {
                const Icon = proponente.icon;
                const isSelected = selectedProponente === proponente.id;
                
                return (
                  <Card 
                    key={proponente.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedProponente(proponente.id)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Icon className="h-5 w-5 text-primary" />
                        {proponente.nome}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-medium">{proponente.tipo}</span>
                        <span>{proponente.documento}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-primary">
                          {proponente.area}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {proponente.descricao}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {selectedProponente && (
              <div className="mt-6 text-center">
                <Button size="lg" onClick={handleInscreverProponente}>
                  Criar proposta para este proponente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DetalhesEdital;