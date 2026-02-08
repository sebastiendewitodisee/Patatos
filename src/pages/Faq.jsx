import { faqItems } from "../data/faq";

function Faq() {
  return (
    <div className="container page-block">
      <section className="section section-tight">
        <h1>FAQ</h1>
        <p className="section-intro">Les réponses rapides aux questions qui reviennent le plus.</p>
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
