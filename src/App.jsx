import { useState } from 'react'
import { projectData } from './data/project'

function App() {
  const [notes, setNotes] = useState(projectData.notes.initialNotes)
  const [draftNote, setDraftNote] = useState('')

  const onSubmitNote = (event) => {
    event.preventDefault()
    const cleanNote = draftNote.trim()
    if (!cleanNote) return
    setNotes((currentNotes) => [...currentNotes, cleanNote])
    setDraftNote('')
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#fff5d8,_#edf8ff_42%,_#ffffff_100%)] text-slate-900">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:gap-8 lg:px-10 lg:py-12">
        <header className="rounded-3xl border border-amber-200/80 bg-white/85 p-6 shadow-sm backdrop-blur">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
            {projectData.badge}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            {projectData.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-700 sm:text-base">
            {projectData.subtitle}
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
            <h2 className="text-lg font-bold">{projectData.sections.statusTitle}</h2>
            <p className="mt-3 text-sm text-slate-700 sm:text-base">
              {projectData.currentStatus.currentStep}
            </p>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
            <h2 className="text-lg font-bold">
              {projectData.sections.nextActionTitle}
            </h2>
            <p className="mt-3 text-sm text-slate-700 sm:text-base">
              {projectData.currentStatus.nextAction}
            </p>
          </article>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
          <h2 className="text-lg font-bold">{projectData.sections.todoTitle}</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {projectData.todoNow.map((task) => (
              <li
                key={task}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3"
              >
                <input
                  type="checkbox"
                  readOnly
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm text-slate-700">{task}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
          <h2 className="text-lg font-bold">{projectData.sections.timelineTitle}</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {projectData.timeline.map((item) => (
              <article
                key={item.step}
                className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/80 to-white p-4"
              >
                <h3 className="text-base font-extrabold text-slate-900">{item.step}</h3>
                <p className="mt-2 text-sm text-slate-700">
                  <span className="font-semibold">
                    {projectData.sections.objectiveLabel}:
                  </span>{' '}
                  {item.objective}
                </p>
                <p className="mt-3 text-sm font-semibold text-slate-900">
                  {projectData.sections.checklistLabel}
                </p>
                <ul className="mt-2 space-y-2">
                  {item.checklist.map((point) => (
                    <li key={point} className="text-sm text-slate-700">
                      - {point}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
          <h2 className="text-lg font-bold">{projectData.sections.germinationTitle}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {projectData.germination.guidance.map((item) => (
              <article
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4"
              >
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">
                  {item.label}
                </h3>
                <p className="mt-2 text-sm text-slate-700">{item.content}</p>
              </article>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
            <h3 className="text-sm font-bold text-rose-900">
              {projectData.sections.alertsTitle}
            </h3>
            <ul className="mt-2 space-y-2">
              {projectData.germination.alerts.map((alert) => (
                <li key={alert} className="text-sm text-rose-900">
                  - {alert}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
          <h2 className="text-lg font-bold">{projectData.sections.notesTitle}</h2>
          <ul className="mt-4 space-y-2">
            {notes.map((note, index) => (
              <li
                key={`${note}-${index}`}
                className="rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-2 text-sm text-slate-700"
              >
                {note}
              </li>
            ))}
          </ul>
          <form onSubmit={onSubmitNote} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={draftNote}
              onChange={(event) => setDraftNote(event.target.value)}
              placeholder={projectData.notes.inputPlaceholder}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-amber-500 transition focus:ring-2"
            />
            <button
              type="submit"
              className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
            >
              {projectData.notes.buttonLabel}
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}

export default App
