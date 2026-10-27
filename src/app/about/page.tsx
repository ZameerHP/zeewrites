import React from "react";
import { Metadata } from "next";
import { AboutBentoClient } from "@/components/about/AboutBentoClient";

export const metadata: Metadata = {
  title: "About | Zee Writes",
  description:
    "Zee Writes publishes practical guides and step-by-step tech fixes written by Zee.",
  alternates: {
    canonical: "https://zeewrites.com/about",
  },
};

export default function AboutPage() {
  return <AboutBentoClient />;
}
