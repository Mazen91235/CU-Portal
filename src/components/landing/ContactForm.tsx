import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useCreateMessageMutation } from "../../services/apis/MessageAPIs";
import { handlePopupErrors } from "../../utils/ErrorHandling";
import { showToast } from "../../utils/ToastsManager";
import { Form } from "../forms/Form";
import { Input } from "../forms/Input";
import { Button } from "../forms/Button";
import decorTop from "../../assets/Cheerful Young Woman with Book 2.png";
import styles from "./ContactForm.module.css";

export const ContactForm = () => {
    const schema = z.object({
        name: z.string().min(1, "Name is required"),
        email: z.email("Invalid email address"),
        phone: z.string().min(1, "Phone number is required"),
        content: z.string().min(1, "Message is required"),
    });
    type FormData = z.infer<typeof schema>;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const [createMessage] = useCreateMessageMutation();

    const onSubmit = async (data: FormData) => {
        try {
            await createMessage({
                name: data.name,
                email: data.email,
                phone: data.phone,
                content: data.content,
            }).unwrap();
            reset();
            showToast("success", "Success", "Message sent successfully.");
        } catch (error: unknown) {
            handlePopupErrors(error);
        }
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
                <Form onSubmit={handleSubmit(onSubmit)} errors={errors}>
                    <Input
                        register={register}
                        name="name"
                        type="text"
                        label="Name"
                        placeholder="Name"
                        errors={errors}
                    />
                    <Input
                        register={register}
                        name="email"
                        type="email"
                        label="Email"
                        placeholder="Email"
                        errors={errors}
                    />
                    <Input
                        register={register}
                        name="phone"
                        type="text"
                        label="Phone"
                        placeholder="Phone"
                        errors={errors}
                    />
                    <Input
                        register={register}
                        name="content"
                        type="text"
                        label="Message"
                        placeholder="Message"
                        errors={errors}
                        isTextArea={true}
                    />
                    <Button
                        text="Get In Touch"
                        loadingText="Sending Message..."
                        isSubmitting={isSubmitting}
                        isOrange={true}
                    />
                </Form>
            </div>
        </section>
    );
};
