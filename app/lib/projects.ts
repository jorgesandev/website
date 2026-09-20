export const projects = [
  {
    id: "01",
    name: "Senda",
    category: "Accessible mobility",
    status: "Hackathon MVP",
    summary: "Pedestrian routing that accounts for different mobility needs.",
    image: {
      src: "/work/senda-overview.png",
      alt: "Senda interface showing functional accessibility profiles for pedestrian routing.",
    },
    problem:
      "A short walking route is not necessarily an accessible one. Barriers and mobility needs change which paths are useful.",
    contribution:
      "Led implementation of the Next.js and FastAPI product, profile-aware Valhalla routing, live citizen barrier reports, and AI-assisted route guidance.",
    decision:
      "Used profile-aware routing and citizen reports to make accessibility part of route selection, with AI assistance around the routing workflow.",
    outcome:
      "Built an MVP for HackFox 2026. Accessibility coverage and real-world route safety have not been independently validated.",
    stack: ["Next.js", "FastAPI", "Valhalla"],
    github: "https://github.com/jorgesandev/Senda",
    demo: "https://sendamx.vercel.app/",
  },
  {
    id: "02",
    name: "Yaocihuatl",
    category: "Civic technology · Applied AI",
    status: "Synthetic-data MVP",
    summary: "A system for documenting political gender-based violence online.",
    image: {
      src: "/work/yaocihuatl-chimalli.png",
      alt: "Yaocihuatl's Chimalli guided assistance interface with human-review safeguards.",
    },
    problem:
      "Organizing potentially harmful online material calls for searchable evidence and careful human review.",
    contribution:
      "Built and deployed the Next.js, FastAPI, PostgreSQL/pgvector, and Redis architecture on AWS, using synthetic demonstration data and human-review safeguards.",
    decision:
      "Combined relational storage and vector retrieval, keeping human review in the workflow instead of treating model output as a final judgment.",
    outcome:
      "Delivered an institutional MVP. The demonstration uses synthetic data; no production adoption or model-accuracy claim is made.",
    stack: ["Next.js", "FastAPI", "PostgreSQL", "AWS"],
    github: "https://github.com/jorgesandev/yaocihuatl",
    demo: null,
  },
  {
    id: "03",
    name: "LiquiFi",
    category: "Financial technology",
    status: "1st · Arbitrum Innovation Track",
    summary: "An invoice-financing prototype for small businesses.",
    image: {
      src: "/work/liquifi-overview.png",
      alt: "LiquiFi's invoice-financing prototype interface.",
    },
    problem:
      "Small businesses can face a gap between issuing an invoice and receiving payment.",
    contribution:
      "Led development of the Next.js product and Arbitrum smart-contract integrations for a decentralized invoice-financing prototype.",
    decision:
      "Connected a web interface to smart contracts to demonstrate the financing workflow end to end.",
    outcome:
      "The team placed first in the Arbitrum Innovation Track at Ethereum México 2025. This is an unaudited hackathon prototype, not a financial service.",
    stack: ["Next.js", "Arbitrum", "Smart contracts"],
    github: "https://github.com/jorgesandev/liquifi",
    demo: "https://liquifidev.vercel.app/",
  },
];
