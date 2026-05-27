"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { Button, Heading } from "@/components/ui";

type Props = {
  title?: string;
  description?: string;
  placeholder?: string;
  buttonLabel?: string;
  onSubmit?: (email: string) => void;
};

export default function NewsletterCTA({
  title = "Be First to Spot What's Next",
  description = "Sign up for exclusive updates and private market intelligence, delivered directly to your inbox.",
  placeholder = "Your Email Address",
  buttonLabel = "Subscribe",
  onSubmit,
}: Props) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    
    if (!email) {
      setMessage("Please enter your email address");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      // Call the custom onSubmit if provided, otherwise use default behavior
      if (onSubmit) {
        onSubmit(email);
        setEmail("");
        setIsSubmitting(false);
        return;
      }

      // Default behavior: save to database and redirect to register
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Successfully subscribed! Redirecting to registration...");
        setEmail("");
        
        // Redirect to register page after a short delay
        setTimeout(() => {
          router.push('/register/step-1');
        }, 1500);
      } else {
        setMessage(data.message || "Failed to subscribe. Please try again.");
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <div className="appContainer mb-16">
        <div className="rounded-md bg-themeTealWhite px-6 py-10 md:py-16">
          <div className="mx-auto max-w-xl text-center">
            <Heading as="h3" className="text-themeTeal mb-2">
              {title}
            </Heading>
            <p className="text-themeTealLight">{description}</p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col items-center gap-4">
              {/* input group */}
              <label className="sr-only" htmlFor="newsletter-email">
                Email address
              </label>
              <div className="flex w-full max-w-lg items-center gap-2 rounded border border-themeTealLighter bg-white p-2 focus:border-themeTeal">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded bg-themeTealLighter">
                  <Mail className="h-6 w-6 text-themeTealWhite" />
                </span>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={placeholder}
                  disabled={isSubmitting}
                  className="w-full bg-transparent text-themeTeal placeholder-themeTealLighter focus:outline-none disabled:opacity-50"
                />
              </div>

              <Button
                type="submit"
                variant="solid"
                color="skyblue"
                size="md"
                className="w-44"
                text={isSubmitting ? "Subscribing..." : buttonLabel}
                disabled={isSubmitting}
              />

              {/* Message display */}
              {message && (
                <div className={`text-sm text-center max-w-lg ${
                  message.includes("Successfully") ? "text-green-600" : "text-red-600"
                }`}>
                  {message}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
