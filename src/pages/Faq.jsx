import { faqItems } from "../data/faq";

function Faq() {
  return (
    <div className="container page-block">
      <section className="section section-tight">
        <h1>FAQ</h1>
        <p className="section-intro">Les questions qu'on se pose vraiment côté Patatos, avec des réponses utiles.</p>
      </section>

      <section className="section">
        <div className="faq-list">
          {faqItems.map((item) => (
            <details key={item.question} className="faq-item">
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Faq;
