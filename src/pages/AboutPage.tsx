import { Breadcrumbs } from '../components/Breadcrumbs/Breadcrumbs'
import { ABOUT } from '../data/marketing'
import './AboutPage.css'

export function AboutPage() {
  return (
    <div className="about-page">
      <div className="about-page__wrap">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'About' }]} />
        <h1 className="page-title">About LeanChem</h1>
        <p className="page-subtitle">{ABOUT.mission}</p>

        <section aria-labelledby="pillars-heading">
          <h2 id="pillars-heading">Mission pillars</h2>
          <div className="about-pillars">
            {ABOUT.pillars.map((p) => (
              <article key={p.title}>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="lead-heading">
          <h2 id="lead-heading">Leadership</h2>
          <div className="about-team">
            {ABOUT.leadership.map((person) => (
              <article key={person.role}>
                <div className="about-team__avatar" aria-hidden="true" />
                <h3>{person.name}</h3>
                <p className="about-team__role">{person.role}</p>
                <p>{person.bio}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
