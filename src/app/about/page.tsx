import React from "react";
import { Metadata } from "next";
import { AboutBentoClient } from "@/components/about/AboutBentoClient";

export const metadata: Metadata = {
  title: "About | Zee Writes",
  description:
    "Zee Writes publishes practical tech fixes, tested AI prompting methods, and browser-based text utilities written by Zee.",
  alternates: {
    canonical: "https://zeewrites.blog/about",
  },
};

export default function AboutPage() {
  return <AboutBentoClient />;
}
