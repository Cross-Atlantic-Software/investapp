'use client'
import { useEffect, useState } from 'react';
import { PageTitle } from "@/components/containers";
import { ContactInfo, ContactForm } from "@/components/subcomponents";
import Faq, { FaqItem } from "@/components/containers/faq";

interface ContactFaq {
  id: number;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
}

export default function Contact() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContactFaqs = async () => {
      try {
        const response = await fetch('/api/contact-faqs');
        const data = await response.json();
        
        if (data.success && data.data.faqs) {
          const faqItems: FaqItem[] = data.data.faqs.map((faq: ContactFaq) => ({
            q: faq.question,
            a: faq.answer,
          }));
          setFaqs(faqItems);
        }
      } catch (error) {
        console.error('Error fetching contact FAQs:', error);
        // Fallback to default FAQs if API fails
        setFaqs(Array.from({ length: 6 }, () => ({
          q: "How can I get started with investing?",
          a: "You can start by creating an account and completing the KYC process to access our investment opportunities.",
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchContactFaqs();
  }, []);

  return (
    <>
        <PageTitle
          heading="We'd love to hear from you."
          description="Our team is ready to guide you through the next steps towards accessing the private market."
        />
        <section className="appContainer py-10 md:py-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,420px)_1fr]">
            <ContactInfo className="md:pr-4" />
            <ContactForm />
          </div>
        </section>
        
        {!loading && <Faq items={faqs} />}
    </>
  );
}
