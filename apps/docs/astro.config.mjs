import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import { prefixLocalLinks } from "./src/plugins/prefix-local-links.mjs";

const base = process.env.DOCS_BASE_PATH || "/";

export default defineConfig({
  site: process.env.DOCS_SITE_URL || "https://martinandreev.github.io",
  base,
  markdown: {
    rehypePlugins: [[prefixLocalLinks, { base }]],
  },
  integrations: [
    starlight({
      title: "NextPhish Docs",
      description:
        "Build, run, and understand security awareness simulations with NextPhish.",
      logo: { src: "./public/nextphish-mark.svg", alt: "NextPhish" },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/MartinAndreev/next-phish",
        },
      ],
      customCss: ["./src/styles/starlight.css"],
      sidebar: [
        { label: "Overview", link: "/" },
        { label: "Getting started", slug: "getting-started" },
        {
          label: "Set up",
          items: [
            { slug: "guides/local-development" },
            { slug: "guides/production" },
            { slug: "guides/mcp" },
            { slug: "guides/mail-allowlisting" },
            { slug: "guides/ignored-networks" },
          ],
        },
        {
          label: "Understand results",
          items: [{ slug: "concepts/events-and-data" }],
        },
        {
          label: "Using NextPhish",
          items: [{ autogenerate: { directory: "app" } }],
        },
      ],
    }),
  ],
});
