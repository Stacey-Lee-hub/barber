import PageHero from './PageHero'

/**
 * sections: [{ id, title, body: ReactNode }]
 */
export default function LegalPage({ eyebrow, title, updated, intro, sections }) {
  return (
    <>
      <PageHero compact eyebrow={eyebrow} title={title} intro={intro} />
      <section className="section section--light legal">
        <div className="container legal__grid">
          <nav className="legal__toc" aria-label="On this page">
            <p className="small-caps">On this page</p>
            <ol>
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>{s.title}</a>
                </li>
              ))}
            </ol>
          </nav>
          <article className="legal__body">
            <p className="legal__updated">Last updated: {updated}</p>
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="legal__section" aria-labelledby={`${s.id}-h`}>
                <h2 id={`${s.id}-h`}>
                  <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  {s.title}
                </h2>
                {s.body}
              </section>
            ))}
          </article>
        </div>
      </section>
    </>
  )
}

export function DraftNote({ children }) {
  return (
    <p className="legal__draft">
      <strong>Draft policy — to be confirmed by the shop.</strong> {children}
    </p>
  )
}
