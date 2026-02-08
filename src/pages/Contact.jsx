import { useState } from "react";
import Card from "../components/Card";

function Contact() {
  const [formData, setFormData] = useState({ name: "", message: "" });
  const [feedback, setFeedback] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFeedback("Formulaire local-only enregistré en UI. À brancher plus tard.");
  };

  const handleWhatsAppClick = () => {
    alert("Placeholder: ajoute ici le lien du groupe WhatsApp.");
  };

  return (
    <div className="container page-block">
      <section className="section section-tight">
        <h1>Contact 📱</h1>
        <p className="section-intro">Point central pour partager les liens et garder le contact de la team.</p>
      </section>

      <section className="section">
        <Card title="Groupe WhatsApp">
          <p>Lien du groupe: <strong>à compléter</strong></p>
          <button type="button" className="btn btn-primary" onClick={handleWhatsAppClick}>
            Ajouter le lien
          </button>
        </Card>
      </section>

      <section className="section">
        <Card title="Mini formulaire (local-only)">
          <form className="contact-form" onSubmit={handleSubmit}>
            <label htmlFor="name">Nom</label>
            <input
              id="name"
              name="name"
              type="text"
              className="input"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ton prénom"
            />

            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              rows="4"
              className="input"
              value={formData.message}
              onChange={handleChange}
              placeholder="Ton message"
            />

            <button type="submit" className="btn">
              Envoyer (UI)
            </button>
            <p className="muted-text">Formulaire local-only, à brancher plus tard.</p>
            {feedback ? <p className="form-feedback">{feedback}</p> : null}
          </form>
        </Card>
      </section>
    </div>
  );
}

export default Contact;
