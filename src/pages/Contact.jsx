import { useState } from "react";
import { useTranslation } from "react-i18next";
import Card from "../components/Card";

function Contact() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: "", message: "" });
  const [feedback, setFeedback] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFeedback(t("contact.form.feedback"));
  };

  const handleWhatsAppClick = () => {
    window.alert(t("contact.whatsapp.alert"));
  };

  return (
    <div className="container page-block">
      <section className="section section-tight">
        <h1>{t("contact.title")}</h1>
        <p className="section-intro">{t("contact.intro")}</p>
      </section>

      <section className="section">
        <Card title={t("contact.whatsapp.title")}>
          <p>
            {t("contact.whatsapp.link_label")} <strong>{t("contact.whatsapp.placeholder")}</strong>
          </p>
          <button type="button" className="btn btn-primary" onClick={handleWhatsAppClick}>
            {t("contact.whatsapp.add_link")}
          </button>
        </Card>
      </section>

      <section className="section">
        <Card title={t("contact.form.title")}>
          <form className="contact-form" onSubmit={handleSubmit}>
            <label htmlFor="name">{t("contact.form.name_label")}</label>
            <input
              id="name"
              name="name"
              type="text"
              className="input"
              value={formData.name}
              onChange={handleChange}
              placeholder={t("contact.form.name_placeholder")}
            />

            <label htmlFor="message">{t("contact.form.message_label")}</label>
            <textarea
              id="message"
              name="message"
              rows="4"
              className="input"
              value={formData.message}
              onChange={handleChange}
              placeholder={t("contact.form.message_placeholder")}
            />

            <button type="submit" className="btn">
              {t("contact.form.submit")}
            </button>
            <p className="muted-text">{t("contact.form.note")}</p>
            {feedback ? <p className="form-feedback">{feedback}</p> : null}
          </form>
        </Card>
      </section>
    </div>
  );
}

export default Contact;
