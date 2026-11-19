export function fieldClasses(invalid = false) {
  return `w-full rounded-xl border bg-branco px-3 text-vinho placeholder:text-bordo/80 ${
    invalid ? 'border-bordo border-2' : 'border-bordo/70 focus:border-bordo'
  }`
}
