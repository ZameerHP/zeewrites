import { Article, SiteSettings, TextToolDefinition } from "@/types";
import { DEFAULT_AUTHOR, CATEGORIES } from "@/data/categories";

export function generateHomepageJsonLd(settings: SiteSettings) {
  const baseUrl = settings.siteUrl.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: settings.siteName,
        description:
          "Guides, tech fixes and simple text tools.",
        publisher: {
          "@id": `${baseUrl}/#organization`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${baseUrl}/?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
        inLanguage: "en-US",
      },
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: settings.siteName,
        url: baseUrl,
        email: "zameerpanhwer67@gmail.com",
        founder: {
          "@id": `${baseUrl}/#founder`,
        },
        privacyPolicy: `${baseUrl}/privacy-policy`,
      },
      {
        "@type": "Person",
        "@id": `${baseUrl}/#founder`,
        name: "Zee",
        description: DEFAULT_AUTHOR.bio,
        worksFor: {
          "@id": `${baseUrl}/#organization`,
        },
        url: `${baseUrl}/about`,
      },
    ],
  };
}

export function generateArticleJsonLd(article: Article, settings: SiteSettings) {
  const baseUrl = settings.siteUrl.replace(/\/$/, "");
  const articleUrl = `${baseUrl}/article/${article.slug}`;
  const categoryInfo = CATEGORIES[article.category];

  const graph: Record<string, unknown>[] = [
    {
      "@type": ["TechArticle", "BlogPosting"],
      "@id": `${articleUrl}#article`,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": articleUrl,
      },
      headline: article.title,
      description: article.metaDescription || article.excerpt,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      wordCount: article.wordCount,
      articleSection: categoryInfo?.name || "Technical Guides",
      keywords: article.tags.join(", "),
      author: {
        "@type": "Person",
        name: "Zee",
        url: `${baseUrl}/about`,
      },
      publisher: {
        "@type": "Organization",
        name: settings.siteName,
        url: baseUrl,
      },
      image: {
        "@type": "ImageObject",
        url: article.coverImage.url.startsWith("http")
          ? article.coverImage.url
          : `${baseUrl}${article.coverImage.url}`,
        width: article.coverImage.width,
        height: article.coverImage.height,
        caption: article.coverImage.caption,
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${articleUrl}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: baseUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: categoryInfo?.name || "Articles",
          item: `${baseUrl}/category/${article.category}`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: article.title,
          item: articleUrl,
        },
      ],
    },
  ];

  if (article.howToSteps && article.howToSteps.length > 0) {
    graph.push({
      "@type": "HowTo",
      "@id": `${articleUrl}#howto`,
      name: article.title,
      description: article.verifiedTakeaway.instantFix,
      totalTime: "PT5M",
      step: article.howToSteps.map((step) => ({
        "@type": "HowToStep",
        position: step.stepNumber,
        name: step.name,
        text: step.text,
      })),
    });
  }

  if (article.faqs && article.faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${articleUrl}#faq`,
      mainEntity: article.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export function generateToolJsonLd(
  tool: TextToolDefinition,
  settings: SiteSettings
) {
  const baseUrl = settings.siteUrl.replace(/\/$/, "");
  const toolUrl = `${baseUrl}/tools/${tool.slug}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": `${toolUrl}#software`,
        name: `${tool.name} — Zee Writes`,
        description: tool.description,
        url: toolUrl,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any (Web Browser)",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        featureList: tool.features.join("; "),
        author: {
          "@type": "Organization",
          name: settings.siteName,
          url: baseUrl,
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${toolUrl}#faq`,
        mainEntity: tool.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${toolUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: baseUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Interactive Text Tools Suite",
            item: `${baseUrl}/tools`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: tool.name,
            item: toolUrl,
          },
        ],
      },
    ],
  };
}
