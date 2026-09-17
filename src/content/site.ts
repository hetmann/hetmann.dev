import { Braces, CloudCog, DatabaseZap, Gem, HeartPulse, Layers3, Network, Plane, RadioTower, Rocket, ShoppingBag, Trophy, Tv, Workflow } from 'lucide-react';

export const navItems = [
  { label: 'Clients', href: '#work' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'About', href: '#about' },
  { label: 'Process', href: '#process' },
  { label: 'Contact', href: '#contact' },
];

export const chapters = [
  { key: 'hero', label: 'Intro', href: '#top' },
  { key: 'work', label: 'Clients', href: '#work' },
  { key: 'capabilities', label: 'Capabilities', href: '#capabilities' },
  { key: 'about', label: 'About', href: '#about' },
  { key: 'process', label: 'Process', href: '#process' },
  { key: 'contact', label: 'Contact', href: '#contact' },
];

export const clients = [
  {
    title: 'ComAve',
    category: 'Sports commerce super app',
    href: 'https://comave.com',
    description: 'Full-stack product delivery across GraphQL services, cloud workflows, loyalty systems, and customer-facing experiences.',
    Icon: Trophy,
  },
  {
    title: 'Bucherer',
    category: 'Luxury retail',
    href: 'https://www.bucherer.com',
    description: 'Quality-focused engineering, testing, documentation, and cloud-connected retail software delivery.',
    Icon: Gem,
  },
  {
    title: 'Fullscript',
    category: 'Digital health',
    href: 'https://fullscript.com',
    description: 'Health product implementation bridging product experience, service integration, and reliable release execution.',
    Icon: HeartPulse,
  },
  {
    title: 'Paperpile',
    category: 'Research productivity',
    href: 'https://paperpile.com',
    description: 'Modernization of core application architecture, native integrations, and long-lived codebase foundations.',
    Icon: Layers3,
  },
  {
    title: 'Wander',
    category: 'Travel technology',
    href: 'https://wander.com',
    description: 'End-to-end product architecture and MVP delivery, from first implementation through public launch.',
    Icon: Plane,
  },
  {
    title: 'Brunswick',
    category: 'Marine technology',
    href: 'https://www.brunswick.com',
    description: 'White-label product architecture, shared data model, cloud sync strategy, and multi-brand delivery.',
    Icon: RadioTower,
  },
  {
    title: 'Ometria',
    category: 'Customer analytics',
    href: 'https://ometria.com',
    description: 'Analytics SDK integration work connecting product events, native surfaces, and customer data workflows.',
    Icon: Workflow,
  },
  {
    title: 'UI8',
    category: 'Design marketplace',
    href: 'https://ui8.net',
    description: 'Productized templates and browser-based creative tooling for digital design asset generation.',
    Icon: Braces,
  },
  {
    title: 'FoodStyles',
    category: 'Food discovery',
    href: 'https://foostyles.com',
    description: 'GraphQL, TypeScript, product UI, automated testing, and application delivery for a UK product company.',
    Icon: ShoppingBag,
  },
  {
    title: 'Splend',
    category: 'Automotive mobility',
    href: 'https://splend.com',
    description: 'Technical leadership across architecture, implementation standards, team mentoring, and delivery process improvement.',
    Icon: Rocket,
  },
  {
    title: 'Nexinto',
    category: 'Hosting infrastructure',
    href: 'https://www.plusserver.com/en/brand/nexinto',
    description: 'Internal tool modernization, state architecture migration, and workflow improvements for hosting infrastructure.',
    Icon: Braces,
  },
  {
    title: 'Trilulilu',
    category: 'Media platform',
    href: 'https://trilulilu.ro',
    description: 'Full-stack media platform work, including live playlist and DJ-style SPA experiences.',
    Icon: Tv,
  },
];

export const capabilities = [
  {
    title: 'Architecture',
    description: 'System design, domain boundaries, data flows, integration strategy, and implementation roadmaps.',
    Icon: Network,
  },
  {
    title: 'Full-Stack Engineering',
    description: 'Frontend, backend, APIs, databases, cloud services, and operational tooling built as one product system.',
    Icon: DatabaseZap,
  },
  {
    title: 'Platforms and Integrations',
    description: 'Commerce, internal tools, analytics, authentication, third-party APIs, and business workflow automation.',
    Icon: Layers3,
  },
  {
    title: 'Delivery and Operations',
    description: 'CI/CD, release process, documentation, testing strategy, cloud pipelines, and long-term maintainability.',
    Icon: CloudCog,
  },
];

export const processSteps = [
  'Map the business problem, domain model, integrations, and delivery constraints.',
  'Design the architecture: data, APIs, infrastructure, product surfaces, and release path.',
  'Implement the full stack with pragmatic testing, observability, and deployment discipline.',
  'Hand over a maintainable system with documentation, ownership boundaries, and iteration room.',
];

export const company = {
  name: 'Hetmann Technologies SRL',
  domain: 'hetmann.dev',
  email: 'contact@hetmann.tech',
  location: 'Cluj-Napoca, Romania',
  tagline: 'Full-stack software architecture, implementation, and delivery for modern digital products.',
};
