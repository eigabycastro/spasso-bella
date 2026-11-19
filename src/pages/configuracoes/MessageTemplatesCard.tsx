import { MessageCircle, RotateCcw } from 'lucide-react'
import type { Control, FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form'
import { useWatch } from 'react-hook-form'
import Card from '../../components/ui/Card'
import Textarea from '../../components/ui/Textarea'
import type { MessageTemplates } from '../../types/models'
import { DEFAULT_TEMPLATES, fillTemplate, TEMPLATE_FIELDS } from '../../utils/whatsappMessages'
import type { SettingsFormInput, SettingsFormOutput } from './ConfiguracoesPage'

type Props = {
  control: Control<SettingsFormInput, unknown, SettingsFormOutput>
  register: UseFormRegister<SettingsFormInput>
  setValue: UseFormSetValue<SettingsFormInput>
  errors?: FieldErrors<MessageTemplates>
}

const MESSAGES: { key: keyof MessageTemplates; label: string; hint: string }[] = [
  { key: 'confirmation', label: 'Confirmação de horário', hint: 'Enviada pelo botão “Confirmar no WhatsApp” na agenda.' },
  { key: 'reminder', label: 'Lembrete', hint: 'Enviado pela lista “Lembretes de amanhã” no início.' },
  { key: 'birthday', label: 'Aniversário', hint: 'Enviada pela lista de aniversariantes.' },
]

// Valores só para a prévia (não são de nenhuma cliente)
const PREVIEW = { nome: 'Ana', data: 'amanhã', hora: '14:00', servicos: 'Design de sobrancelhas' }

/** Textos das mensagens de WhatsApp, com prévia de como chegam para a cliente. */
export default function MessageTemplatesCard({ control, register, setValue, errors }: Props) {
  const values = useWatch({ control, name: 'message_templates' })

  return (
    <Card className="flex flex-col gap-5 lg:col-span-2">
      <div>
        <h2 className="flex items-center gap-2 font-semibold">
          <MessageCircle size={18} strokeWidth={1.75} className="text-bordo" aria-hidden />
          Mensagens do WhatsApp
        </h2>
        <p className="mt-1 text-sm text-bordo">
          Escreva do seu jeito. Os campos entre chaves são trocados automaticamente:
        </p>
        <ul className="mt-2 flex flex-wrap gap-2 text-xs">
          {TEMPLATE_FIELDS.map((f) => (
            <li key={f.field} className="rounded-full bg-rosa-claro px-3 py-1.5 text-vinho">
              <code className="font-semibold">{f.field}</code> = {f.meaning}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {MESSAGES.map((m) => (
          <div key={m.key} className="flex flex-col gap-2">
            <Textarea label={m.label} hint={errors?.[m.key]?.message ?? m.hint} rows={5} {...register(`message_templates.${m.key}`)} />
            <div aria-live="polite" className="rounded-2xl rounded-tl-sm bg-rosa-claro px-3.5 py-2.5 text-sm leading-relaxed text-vinho">
              <span className="mb-1 block text-xs font-medium text-bordo">Prévia de como chega:</span>
              {fillTemplate(values?.[m.key] ?? '', PREVIEW)}
            </div>
            {values?.[m.key] !== DEFAULT_TEMPLATES[m.key] && (
              <button
                type="button"
                onClick={() => setValue(`message_templates.${m.key}`, DEFAULT_TEMPLATES[m.key], { shouldDirty: true })}
                className="inline-flex min-h-11 items-center gap-1.5 self-start text-sm font-medium text-bordo underline-offset-4 hover:underline"
              >
                <RotateCcw size={14} strokeWidth={1.75} aria-hidden />
                Voltar ao texto padrão
              </button>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
