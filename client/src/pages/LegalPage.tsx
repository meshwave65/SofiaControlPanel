import { ArrowLeft, ExternalLink, ShieldCheck, FileText } from "lucide-react";
import { Link, useLocation } from "wouter";

type LegalPageProps = {
  kind: "privacy" | "terms";
};

const content = {
  privacy: {
    eyebrow: "Privacidade e transparência",
    title: "Política de Privacidade",
    updated: "19 de outubro de 2026",
  },
  terms: {
    eyebrow: "Uso responsável da plataforma",
    title: "Termos de Uso",
    updated: "19 de outubro de 2026",
  },
};

export default function LegalPage({ kind }: LegalPageProps) {
  const [, setLocation] = useLocation();
  const page = content[kind];

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground sm:px-10">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b-2 border-accent/30 pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-accent"
          >
            <ArrowLeft className="h-4 w-4" /> SofiaControlPanel
          </Link>
          <nav className="flex gap-4 text-xs uppercase tracking-wider text-muted-foreground">
            <Link href="/privacity" className="hover:text-accent">
              Privacidade
            </Link>
            <Link href="/terms" className="hover:text-accent">
              Termos
            </Link>
          </nav>
        </header>

        <article className="cad-card space-y-8 border-2 border-foreground/15 p-6 sm:p-10">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-accent">
              {page.eyebrow}
            </p>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
              {page.title}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Última atualização: {page.updated}
            </p>
          </div>

          {kind === "privacy" ? <PrivacyContent /> : <TermsContent />}
        </article>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-foreground/10 pt-6 text-xs text-muted-foreground">
          <span>SofiaControlPanel · MeshWave</span>
          <button
            type="button"
            onClick={() => setLocation("/")}
            className="inline-flex items-center gap-2 hover:text-accent"
          >
            Voltar para a página inicial <ExternalLink className="h-3 w-3" />
          </button>
        </footer>
      </div>
    </main>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-7 text-sm leading-7 text-foreground/85">
      <section>
        <h2 className="mb-2 flex items-center gap-2 text-xl font-bold text-foreground">
          <ShieldCheck className="h-5 w-5 text-accent" /> 1. Sobre esta política
        </h2>
        <p>
          Esta política explica como o SofiaControlPanel coleta, usa, armazena e
          protege informações necessárias para oferecer um painel de controle e
          orquestração de agentes, tarefas e missões da plataforma Sofia.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-xl font-bold text-foreground">
          2. Dados coletados
        </h2>
        <p>
          Quando você entra com o Google, recebemos os dados básicos
          disponibilizados pelo provedor, como nome, endereço de e-mail,
          identificador da conta e imagem de perfil quando fornecida. Também
          podemos registrar dados técnicos da sessão, como horário de acesso,
          navegador, endereço IP e registros de segurança.
        </p>
        <p className="mt-3">
          O painel pode armazenar informações operacionais inseridas pelo
          usuário, incluindo agentes, tarefas, missões, mensagens e seus
          respectivos estados. Não solicitamos senhas do Google e não
          armazenamos a senha da sua conta Google.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-xl font-bold text-foreground">
          3. Como usamos os dados
        </h2>
        <p>
          Usamos os dados para autenticar usuários, manter a sessão, exibir o
          painel, organizar agentes e missões, oferecer recursos solicitados,
          prevenir abuso, diagnosticar falhas e melhorar a segurança e a
          confiabilidade do serviço.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-xl font-bold text-foreground">
          4. Compartilhamento e serviços de terceiros
        </h2>
        <p>
          Não vendemos dados pessoais. Podemos processar dados por meio de
          provedores necessários ao funcionamento do serviço, como Google para
          autenticação, Supabase para autenticação e armazenamento de dados,
          Render para hospedagem e Cloudflare para DNS, segurança e entrega.
          Cada provedor trata dados conforme suas próprias políticas.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-xl font-bold text-foreground">
          5. Retenção, segurança e direitos
        </h2>
        <p>
          Retemos dados enquanto a conta e os registros operacionais forem
          necessários para a finalidade descrita ou enquanto houver obrigação
          legal. Aplicamos controles de acesso e medidas técnicas razoáveis, mas
          nenhum serviço conectado à internet é completamente livre de riscos.
        </p>
        <p className="mt-3">
          Para solicitar acesso, correção ou exclusão de dados, entre em contato
          pelo endereço abaixo. Podemos solicitar informações suficientes para
          confirmar a identidade do solicitante.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-xl font-bold text-foreground">6. Contato</h2>
        <p>
          Para dúvidas sobre privacidade ou solicitações relacionadas aos seus
          dados, escreva para{" "}
          <a
            className="text-accent underline"
            href="mailto:info@meshwave.com.br"
          >
            info@meshwave.com.br
          </a>
          .
        </p>
      </section>
    </div>
  );
}

function TermsContent() {
  return (
    <div className="space-y-7 text-sm leading-7 text-foreground/85">
      <section>
        <h2 className="mb-2 flex items-center gap-2 text-xl font-bold text-foreground">
          <FileText className="h-5 w-5 text-accent" /> 1. Finalidade
        </h2>
        <p>
          O SofiaControlPanel é um painel para organização e acompanhamento de
          agentes, tarefas, missões, mensagens e processos de orquestração da
          plataforma Sofia.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-xl font-bold text-foreground">
          2. Acesso e responsabilidade
        </h2>
        <p>
          O acesso é feito por autenticação autorizada. Você é responsável por
          proteger sua conta, revisar as ações realizadas no painel e manter
          informações de contato atualizadas. Não compartilhe sua sessão nem
          tente acessar dados de outros usuários.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-xl font-bold text-foreground">
          3. Uso aceitável
        </h2>
        <p>
          É proibido usar o serviço para fraude, abuso, invasão, distribuição de
          código malicioso, violação de direitos de terceiros, tentativa de
          contornar controles de acesso ou execução de atividades ilegais.
          Missões e tarefas devem ser revisadas antes de serem executadas em
          ambientes externos.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-xl font-bold text-foreground">
          4. Disponibilidade e limitações
        </h2>
        <p>
          O serviço pode ser alterado, suspenso ou interrompido para manutenção,
          segurança ou evolução do produto. O painel não garante que uma missão
          será executada, que dados estarão sempre disponíveis ou que resultados
          automatizados estarão livres de erros. Valide resultados importantes
          antes de tomar decisões.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-xl font-bold text-foreground">
          5. Contato e alterações
        </h2>
        <p>
          Podemos atualizar estes termos para refletir mudanças no serviço ou
          requisitos legais. A versão vigente será publicada nesta página.
          Dúvidas podem ser encaminhadas para{" "}
          <a
            className="text-accent underline"
            href="mailto:info@meshwave.com.br"
          >
            info@meshwave.com.br
          </a>
          .
        </p>
      </section>
    </div>
  );
}
