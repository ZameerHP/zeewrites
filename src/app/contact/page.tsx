import React from "react";
import { Metadata } from "next";
import { ContactFormClient } from "@/components/contact/ContactFormClient";

export const metadata: Metadata = {
  title: "Contact | Zee Writes",
  description:
    "Questions, corrections or ideas? Send Zee a message at zameerpanhwer67@gmail.com or 03353162656.",
  alternates: {
    canonical: "https://zeewrites.com/contact",
  },
};

export default function ContactPage() {
  return <ContactFormClient />;
}
