import { useState } from "react";
import decorTop from "../../assets/Cheerful Young Woman with Book 2.png";
import styles from "./ContactForm.module.css";

export const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (
            !formData.name ||
            !formData.email ||
            !formData.phone ||
            !formData.message
        ) {
            alert("Please fill in all fields.");
            return;
        }

        setFormData({
            name: "",
            email: "",
            phone: "",
            message: "",
        });

        alert("Message sent successfully!");
    };

    return (
        <section
            className={styles.contactFormSection}
            id="contact-form-section"
        >
            <img
                src={decorTop}
                alt="Decoration"
                className={styles.formDecorTop}
            />
            <div className={styles.contactFormCard}>
                <h2 className={styles.contactFormTitle}>Contact Us</h2>
                <div className={styles.contactFormSubtitle}>
                    Stay updated with our latest news and events
                </div>
                <form
                    className={styles.contactFormFields}
                    onSubmit={handleSubmit}
                >
                    <div className={styles.formRow}>
                        <label
                            className={styles.formLabel}
                            htmlFor="contact-name"
                        >
                            Name:
                        </label>
                        <input
                            type="text"
                            id="contact-name"
                            name="name"
                            className={styles.formInput}
                            required
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>
                    <div className={styles.formRow}>
                        <label
                            className={styles.formLabel}
                            htmlFor="contact-email"
                        >
                            Email:
                        </label>
                        <input
                            type="email"
                            id="contact-email"
                            name="email"
                            className={styles.formInput}
                            required
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                    <div className={styles.formRow}>
                        <label
                            className={styles.formLabel}
                            htmlFor="contact-phone"
                        >
                            Phone:
                        </label>
                        <input
                            type="text"
                            id="contact-phone"
                            name="phone"
                            className={styles.formInput}
                            required
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>
                    <div className={styles.formRow}>
                        <label
                            className={styles.formLabel}
                            htmlFor="contact-message"
                        >
                            Message:
                        </label>
                        <textarea
                            id="contact-message"
                            name="message"
                            className={styles.formTextarea}
                            rows={5}
                            required
                            value={formData.message}
                            onChange={handleChange}
                        ></textarea>
                    </div>
                    <div className={styles.formRow}>
                        <button type="submit" className={styles.formSubmitBtn}>
                            Get In Touch
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};
