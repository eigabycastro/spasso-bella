import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import { useAuth } from '../../hooks/authContext'
import { supabaseConfigError } from '../../services/supabase'

const schema = z.object({
  email: z.email('Informe um e-mail válido'),
  password: z.string().min(1, 'Informe a senha'),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const { status, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } })

  // Já está logada: vai direto para o painel
  if (status === 'admin') return <Navigate to={from} replace />

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setError(null)
    const result = await signIn(email, password)
    if (result.error) return setError(result.error)
    navigate(from, { replace: true })
  })

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <Card className="w-full max-w-sm p-8">
        <img src="/logo/spasso-bella-logo-640.png" alt="Spasso Bella" className="mx-auto mb-2 size-40" />
        <p className="mb-8 text-center text-xs font-medium uppercase tracking-[0.25em] text-bordo">Spasso Bella Manager</p>

        {supabaseConfigError ? (
          <p role="alert" className="flex items-start gap-2 rounded-xl border border-bordo/40 bg-rosa-claro px-3 py-2.5 text-sm">
            <AlertTriangle size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-bordo" aria-hidden />
            <span>
              Sistema não configurado: {supabaseConfigError}. Depois de corrigir, reinicie o <code>npm run dev</code>.
            </span>
          </p>
        ) : (
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <Input label="E-mail" type="email" autoComplete="email" inputMode="email" error={errors.email?.message} {...register('email')} />
            <Input label="Senha" type="password" autoComplete="current-password" error={errors.password?.message} {...register('password')} />
            {error && (
              <p role="alert" className="rounded-xl border border-bordo bg-branco px-3 py-2 text-sm font-medium text-vinho">
                {error}
              </p>
            )}
            <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
