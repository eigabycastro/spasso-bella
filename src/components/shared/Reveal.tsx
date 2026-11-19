import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { EASE } from '../../utils/motion'

/**
 * Entra na tela subindo e saindo de um leve desfoque.
 * Com "reduzir movimento" ativado, o MotionConfig do layout troca por um simples aparecer.
 */
export default function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.9, delay: delay / 1000, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}
