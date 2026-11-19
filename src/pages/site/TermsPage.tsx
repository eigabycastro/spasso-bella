import { Link, useOutletContext } from 'react-router-dom'
import type { SiteContext } from '../../components/layout/SiteLayout'
import { Identification, LegalPage, List, Section } from './LegalPage'

/**
 * Termos de Uso do site — Código de Defesa do Consumidor (Lei nº 8.078/1990),
 * Decreto nº 7.962/2013 e Marco Civil da Internet (Lei nº 12.965/2014).
 * Não cria regras de cancelamento/multa: elas são combinadas no agendamento.
 * Revisar com um(a) advogado(a) antes de publicar.
 */
export default function TermsPage() {
  const { settings: s } = useOutletContext<SiteContext>()
  const name = s?.business_name || 'Spasso Bella MG'

  return (
    <LegalPage title="Termos de Uso" updated="18 de novembro de 2026">
      <p>
        Estes termos explicam como funciona este site do <strong>{name}</strong>. Ao usar o site, você concorda com eles.
      </p>

      <Section title="1. Quem somos">
        <Identification s={s} />
      </Section>

      <Section title="2. Para que serve o site">
        <p>
          O site apresenta o studio, os procedimentos, os valores, os horários e a localização. O agendamento não é feito no site, e sim
          por mensagem (WhatsApp ou Instagram), e só vale depois que a profissional confirma o horário.
        </p>
      </Section>

      <Section title="3. Valores e informações">
        <List>
          <li>Os valores publicados valem para os agendamentos feitos enquanto estiverem no site (Código de Defesa do Consumidor, art. 30).</li>
          <li>A duração mostrada é aproximada e pode variar de acordo com cada atendimento.</li>
          <li>Se encontrar alguma informação errada, avise pelos contatos acima para corrigirmos.</li>
        </List>
      </Section>

      <Section title="4. Remarcação e cancelamento">
        <p>As condições de remarcação e de cancelamento são combinadas diretamente com a profissional no momento do agendamento.</p>
      </Section>

      <Section title="5. Resultados e fotos">
        <p>
          Cada pessoa tem características próprias, então os resultados variam. As fotos da galeria mostram trabalhos reais, publicados
          com a autorização das clientes, e não são garantia de um resultado idêntico.
        </p>
      </Section>

      <Section title="6. Marca e conteúdo">
        <p>
          O nome, o logotipo, os textos e as fotos deste site pertencem ao studio ou às clientes que autorizaram o uso. Não é permitido
          copiar ou reutilizar sem autorização (Lei nº 9.610/1998 e Lei nº 9.279/1996).
        </p>
      </Section>

      <Section title="7. Links para outros sites">
        <p>
          Os botões de WhatsApp, Instagram e Google Maps levam a serviços de outras empresas, que têm os próprios termos e políticas de
          privacidade.
        </p>
      </Section>

      <Section title="8. Área restrita">
        <p>A área de gestão do site é de uso exclusivo da profissional responsável. Tentar acessá-la sem autorização é proibido.</p>
      </Section>

      <Section title="9. Privacidade">
        <p>
          O tratamento de dados pessoais segue a nossa{' '}
          <Link to="/privacidade" className="font-medium text-bordo underline underline-offset-2 hover:text-vinho">
            Política de Privacidade
          </Link>
          .
        </p>
      </Section>

      <Section title="10. Lei aplicável">
        <p>
          Estes termos seguem as leis brasileiras. Como consumidora, você pode propor qualquer ação no foro do seu domicílio (Código de
          Defesa do Consumidor, art. 101, I).
        </p>
      </Section>
    </LegalPage>
  )
}
