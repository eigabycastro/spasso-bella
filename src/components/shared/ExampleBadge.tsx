import { FlaskConical } from 'lucide-react'
import Badge from '../ui/Badge'

/** Marca qualquer número ou dado de demonstração. Nada fictício aparece sem ele. */
export default function ExampleBadge() {
  return (
    <Badge tone="outline">
      <FlaskConical size={12} strokeWidth={1.75} aria-hidden />
      Exemplo
    </Badge>
  )
}
