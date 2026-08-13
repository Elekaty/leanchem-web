import { createFileRoute, Link } from '@tanstack/react-router'
import { ABOUT } from '../data/marketing'

export const Route = createFileRoute('/about')({
  head: () => ({
    meta: [{ title: 'About LeanChem | Mission & Leadership' }],
  }),
  component: AboutPage,
})

function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-organza">
        <Link to="/" className="text-lapis no-underline hover:underline">
          Home
        </Link>
        <span className="mx-2">→</span>
        <span className="font-semibold text-velvet">About</span>
      </nav>
      <h1 className="text-3xl font-bold tracking-tight text-velvet">About LeanChem</h1>
      <p className="mt-3 max-w-3xl text-lg leading-relaxed text-velvet/70">{ABOUT.mission}</p>

      <h2 className="mt-12 text-xl font-bold text-lapis">Mission pillars</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {ABOUT.pillars.map((p) => (
          <article key={p.title} className="rounded-lg border border-organza/35 bg-white p-5">
            <h3 className="font-bold text-velvet">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-velvet/65">{p.body}</p>
          </article>
        ))}
      </div>

      <h2 className="mt-12 text-xl font-bold text-lapis">Leadership</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {ABOUT.leadership.map((person) => (
          <article key={person.role} className="rounded-lg border border-organza/35 bg-white p-5">
            <div
              className="mb-3 h-14 w-14 rounded-full bg-gradient-to-br from-lapis to-adamantine opacity-85"
              aria-hidden="true"
            />
            <h3 className="font-bold text-velvet">{person.name}</h3>
            <p className="text-sm font-semibold text-lapis">{person.role}</p>
            <p className="mt-2 text-sm leading-relaxed text-velvet/65">{person.bio}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
