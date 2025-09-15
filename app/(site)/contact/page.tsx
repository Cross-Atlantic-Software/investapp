'use client'
import { PageTitle } from "@/components/containers";
import { ContactInfo, ContactForm } from "@/components/subcomponents";
import Faq, { FaqItem } from "@/components/containers/faq";

const FAQS: FaqItem[] = Array.from({ length: 12 }, () => ({
  q: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  a: "Answer copy goes here. You can place plain text or any React nodes.",
}));

export default function Contact() {

    return (
    <>
        <PageTitle
          heading="We’d love to hear from you."
          description="Our team is ready to guide you through the next steps towards accessing the private market."
        />
        <section className="appContainer py-10 md:py-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,420px)_1fr]">
            <ContactInfo className="md:pr-4" />
            <ContactForm
              onSubmit={(data) => {
                // TODO: send to API / integrations
                console.log("contact form submit", data);
              }}
            />
          </div>
        </section>
        
        <Faq items={FAQS} />
    </>
  );
}
