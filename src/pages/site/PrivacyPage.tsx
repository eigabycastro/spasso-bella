import { useOutletContext } from 'react-router-dom'
import type { SiteContext } from '../../components/layout/SiteLayout'
import { openConsentSettings } from '../../utils/consent'
import { Fill, Identification, LegalPage, List, Section } from './LegalPage'

/**
 * Política de Privacidade — LGPD (Lei nº 13.709/2018).
 * Revisar com um(a) advogado(a) antes de publicar; atualizar a data ao mudar o texto.
 */
export default function PrivacyPage() {
  const { settings: s } = useOutletContext<SiteContext>()
  const name = s?.business_name || 'Spasso Bella MG'

  return (
    <LegalPage title="Política de Privacidade" updated="18 de novembro de 2026">
      <p>
        Esta política explica, de forma simples, quais dados pessoais o <strong>{name}</strong> trata, para que eles são usados e quais
        são os seus direitos, de acordo com a Lei Geral de Proteção de Dados (LGPD, Lei nº 13.709/2018).
      </p>

      <Section title="1. Quem é a responsável pelos seus dados">
        <p>A controladora dos dados é a profissional responsável pelo studio:</p>
        <Identification s={s} />
        <p>
          Para qualquer assunto sobre seus dados, fale pelo e-mail <Fill value={s?.contact_email || ''} /> ou pelo WhatsApp{' '}
          <Fill value={s?.phone || ''} />. Por ser um agente de tratamento de pequeno porte (Resolução CD/ANPD nº 2/2022), o studio não
          precisa indicar um encarregado (DPO); este canal atende os seus pedidos.
        </p>
      </Section>

      <Section title="2. Ao visitar este site">
        <List>
          <li>Não pedimos cadastro e não há formulários: nenhum dado seu é digitado aqui.</li>
          <li>
            Não usamos Google Analytics, pixels de redes sociais, cookies de publicidade ou qualquer ferramenta de rastreamento.
          </li>
          <li>
            A empresa de hospedagem registra dados técnicos de acesso (endereço IP, data, hora e navegador) para manter o site seguro
            e funcionando. O Marco Civil da Internet (Lei nº 12.965/2014, art. 15) exige que esses registros sejam guardados por 6 meses.
          </li>
          <li>As fontes e imagens são carregadas do próprio site, sem chamar serviços de terceiros.</li>
          <li>
            O <strong>mapa do Google</strong> só é carregado se você permitir. Ao carregá-lo, o Google recebe dados da sua navegação e
            passa a valer a política de privacidade dele.
          </li>
          <li>
            Os botões de WhatsApp e Instagram apenas abrem esses aplicativos. A partir daí, vale a política de privacidade da Meta.
          </li>
        </List>
      </Section>

      <Section title="3. Quando você agenda e é atendida">
        <p>Para marcar e realizar o atendimento, registramos somente o necessário:</p>
        <List>
          <li>
            <strong>Nome e WhatsApp</strong>, para agendar, confirmar e lembrar o horário. Base legal: execução do serviço que você
            contratou (art. 7º, V).
          </li>
          <li>
            <strong>Histórico de atendimentos e pagamentos</strong>, para controle financeiro e obrigações fiscais. Base legal:
            cumprimento de obrigação legal (art. 7º, II) e execução do serviço (art. 7º, V).
          </li>
          <li>
            <strong>Data de aniversário</strong>, que é opcional, para enviar uma mensagem de parabéns. Só é registrada se você quiser
            informar (consentimento, art. 7º, I), e você pode pedir para não receber.
          </li>
          <li>
            <strong>Observações de saúde</strong>, como alergia a algum produto, para a sua segurança no procedimento. É um dado
            sensível: só é registrado com o seu consentimento (art. 11, I), e você pode pedir a exclusão a qualquer momento.
          </li>
        </List>
        <p>Seus dados não são vendidos, não são usados para publicidade de terceiros e não são compartilhados para marketing.</p>
        <p>
          Dados de menores de 18 anos só são registrados com a autorização de um dos pais ou do responsável legal (art. 14).
        </p>
      </Section>

      <Section title="4. Fotos na galeria">
        <p>
          Fotos de clientes só são publicadas com autorização expressa da cliente (LGPD, art. 7º, I, e Código Civil, art. 20). Você
          pode retirar a autorização quando quiser, e a foto é removida do site.
        </p>
      </Section>

      <Section title="5. Com quem os dados são compartilhados">
        <List>
          <li>
            <strong>Supabase</strong>: guarda o banco de dados e as fotos da galeria.
          </li>
          <li>
            <strong>Vercel</strong>: hospeda o site.
          </li>
          <li>
            <strong>Meta (WhatsApp)</strong>: usado para conversar com você sobre o seu horário.
          </li>
          <li>
            <strong>Google Maps</strong>: somente se você permitir o mapa.
          </li>
          <li>Autoridades públicas, quando houver obrigação legal ou ordem judicial.</li>
        </List>
        <p>
          Os servidores desses fornecedores podem ficar fora do Brasil. Nesses casos, a transferência internacional segue as garantias
          previstas no art. 33 da LGPD, como as cláusulas contratuais de proteção de dados oferecidas pelos fornecedores.
        </p>
      </Section>

      <Section title="6. Por quanto tempo guardamos">
        <p>
          Enquanto você for cliente e, depois do último atendimento, pelo tempo necessário para cumprir obrigações legais e fiscais e
          para a defesa de direitos (em geral, até 5 anos). A data de aniversário e as observações de saúde são apagadas quando você
          pedir. Os registros de acesso ao site são guardados por 6 meses, como exige o Marco Civil da Internet.
        </p>
      </Section>

      <Section title="7. Segurança">
        <p>
          Somente a profissional responsável acessa os dados, com login e senha. O banco de dados tem regras que bloqueiam o acesso de
          qualquer outra pessoa, e toda a comunicação com o site é criptografada (HTTPS).
        </p>
      </Section>

      <Section title="8. Seus direitos">
        <p>Pelo art. 18 da LGPD, você pode, a qualquer momento e sem custo:</p>
        <List>
          <li>confirmar se tratamos seus dados e ter acesso a eles;</li>
          <li>corrigir dados incompletos, inexatos ou desatualizados;</li>
          <li>pedir a anonimização, o bloqueio ou a eliminação de dados desnecessários;</li>
          <li>pedir a portabilidade dos seus dados;</li>
          <li>pedir a eliminação dos dados tratados com o seu consentimento;</li>
          <li>saber com quem seus dados são compartilhados;</li>
          <li>revogar o seu consentimento;</li>
          <li>
            reclamar à Autoridade Nacional de Proteção de Dados (ANPD), em{' '}
            <a href="https://www.gov.br/anpd" target="_blank" rel="noreferrer" className="font-medium text-bordo underline underline-offset-2">
              gov.br/anpd<span className="sr-only"> (abre em nova aba)</span>
            </a>
            .
          </li>
        </List>
        <p>Para exercer seus direitos, use o canal do item 1. Respondemos em até 15 dias (art. 19, II).</p>
      </Section>

      <Section title="9. Cookies e armazenamento no navegador">
        <p>Usamos apenas o armazenamento essencial:</p>
        <List>
          <li>a sua escolha sobre o mapa do Google, para não perguntar de novo a cada visita;</li>
          <li>a sessão de login, somente na área restrita da profissional.</li>
        </List>
        <p>
          Não usamos cookies de rastreamento, de estatísticas ou de publicidade.{' '}
          <button type="button" onClick={openConsentSettings} className="font-medium text-bordo underline underline-offset-2 hover:text-vinho">
            Alterar minhas preferências de privacidade
          </button>
          .
        </p>
      </Section>

      <Section title="10. Mudanças nesta política">
        <p>
          Esta política pode ser atualizada. A data no topo da página sempre indica a versão em vigor. Se houver mudança importante,
          avisaremos pelo site.
        </p>
      </Section>
    </LegalPage>
  )
}
