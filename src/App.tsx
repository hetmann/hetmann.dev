import { ArrowUpRight, Mail, MapPin, Menu, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import ChapterNav from './components/ChapterNav';
import Header from './components/Header';
import WebGLBackground from './components/WebGLBackground';
import { capabilities, clients, company, processSteps } from './content/site';

const terminalLines = [
  '$ mkdir acme-client && cd acme-client',
  '$ composer create-project laravel/laravel api',
  '$ php artisan make:model Project -mcr',
  '$ php artisan migrate --force',
  '$ forge deploy production',
  '✓ Laravel API is live',
  '$ npx create-expo-app@latest app',
  '$ pnpm add @hetmann/react-ui-kit',
  '$ npx expo prebuild --clean',
  '✓ Expo app is ready',
  '$ eas build --platform all --profile production',
  '$ eas submit --platform all',
  '✓ Your project has been successfully deployed',
];

function FuiOverlay() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const lineDelay = 950;
    const restartDelay = 3000;
    const totalDuration = terminalLines.length * lineDelay + restartDelay;
    const startedAt = performance.now();

    const interval = window.setInterval(() => {
      const elapsed = (performance.now() - startedAt) % totalDuration;
      const nextVisible =
        elapsed >= terminalLines.length * lineDelay ? terminalLines.length : Math.floor(elapsed / lineDelay) + 1;
      setVisibleLines(nextVisible);
    }, 80);

    setVisibleLines(1);
    return () => window.clearInterval(interval);
  }, []);

  const successDots = [visibleLines >= 6, visibleLines >= 10, visibleLines >= 13];

  return (
    <div className="fui-overlay" aria-hidden="true">
      <div className="coding-window architecture-terminal">
        <div className="window-bar">
          <span className="window-title">YOUR_PROJECT.tsx</span>
          <i className="window-status">
            {successDots.map((active, index) => (
              <span className={active ? 'active' : ''} key={index} />
            ))}
          </i>
        </div>
        {terminalLines.map((line, index) => (
          <code
            className={`dev-terminal-line ${index < visibleLines ? 'visible' : ''} ${
              index === visibleLines - 1 ? 'typing-now' : ''
            }`}
            key={`${line}-${index}`}
          >
            {line}
          </code>
        ))}
      </div>
      <div className="scanline" />
    </div>
  );
}

function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canUsePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canUsePointer || reducedMotion) return undefined;

    const move = (event: PointerEvent) => {
      if (!glowRef.current) return;
      glowRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
      glowRef.current.classList.add('visible');
    };
    const leave = () => glowRef.current?.classList.remove('visible');

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerleave', leave);
    };
  }, []);

  return <div ref={glowRef} className="cursor-glow" aria-hidden="true" />;
}

function useActiveSection(sectionIds: string[]) {
  const [active, setActive] = useState(sectionIds[0]);

  useEffect(() => {
    const observers = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean)
      .map((element) => {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) setActive(element!.id);
          },
          { rootMargin: '-38% 0px -52% 0px', threshold: 0.01 },
        );
        observer.observe(element!);
        return observer;
      });

    return () => observers.forEach((observer) => observer.disconnect());
  }, [sectionIds]);

  return active;
}

export default function App() {
  const sectionIds = useMemo(() => ['top', 'work', 'capabilities', 'about', 'process', 'contact'], []);
  const activeSection = useActiveSection(sectionIds);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="site-shell">
      <WebGLBackground activeSection={activeSection} />
      <FuiOverlay />
      <CursorGlow />
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <ChapterNav activeSection={activeSection} />

      <main>
        <section id="top" className="section hero-section" data-theme="dark">
          <div className="section-inner hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Hetmann Technologies SRL / Cluj-Napoca</p>
              <h1>Full-stack systems from architecture to delivery.</h1>
              <p className="hero-lede">
                {company.tagline} We design, build, ship, and maintain practical software across
                web products, APIs, databases, cloud services, integrations, and operational tooling.
              </p>
              <div className="hero-actions">
                <a className="button button-primary" href="#work">
                  View clients
                  <ArrowUpRight size={18} strokeWidth={1.8} />
                </a>
                <a className="button button-ghost" href={`mailto:${company.email}`}>
                  Start a project
                </a>
              </div>
            </div>
            <div className="hero-aside" aria-label="Company highlights">
              <div>
                <span>Focus</span>
                <strong>Architecture, full-stack, delivery</strong>
              </div>
              <div>
                <span>Base</span>
                <strong>{company.location}</strong>
              </div>
              <div>
                <span>Domain</span>
                <strong>{company.domain}</strong>
              </div>
            </div>
          </div>
          <a className="scroll-cue" href="#work" aria-label="Scroll to work">
            Scroll down
          </a>
        </section>

        <section id="work" className="section light-section">
          <div className="section-inner">
            <div className="section-heading">
              <p className="eyebrow">Selected clients</p>
              <h2>Architecture and delivery for companies with real users, complex workflows, and business-critical software.</h2>
            </div>
            <div className="client-grid">
              {clients.map(({ Icon, ...client }) => (
                <a className="client-card" href={client.href} target="_blank" rel="noreferrer" key={client.title}>
                  <Icon size={28} strokeWidth={1.6} />
                  <span>{client.category}</span>
                  <h3>{client.title}</h3>
                  <p>{client.description}</p>
                  <ArrowUpRight className="card-arrow" size={20} strokeWidth={1.6} />
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="capabilities" className="section navy-section">
          <div className="section-inner">
            <div className="split-layout">
              <div>
                <p className="eyebrow">Capabilities</p>
                <h2>Focused software delivery without unnecessary ceremony.</h2>
              </div>
              <p>
                Hetmann works where architecture, implementation, and delivery need to move
                together: APIs, databases, product interfaces, cloud services, integrations,
                workflow automation, and maintainable technical foundations.
              </p>
            </div>
            <div className="capability-list">
              {capabilities.map(({ Icon, ...item }, index) => (
                <article className="capability-row" key={item.title}>
                  <span className="row-number">{String(index + 1).padStart(2, '0')}</span>
                  <Icon size={24} strokeWidth={1.6} />
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="section light-section about-section">
          <div className="section-inner about-grid">
            <div>
              <p className="eyebrow">About</p>
              <h2>Creative development solutions from Cluj-Napoca, Romania.</h2>
            </div>
            <div className="about-copy">
              <p>
                Hetmann Technologies SRL is a full-stack software company creating modern digital
                products for businesses with demanding product and engineering needs. Client
                experience spans architecture, frontend, backend, cloud services, e-commerce,
                health products, travel platforms, analytics integrations, luxury retail, and media.
              </p>
              <div className="stat-grid">
                <div>
                  <strong>2017</strong>
                  <span>Company timeline</span>
                </div>
                <div>
                  <strong>Cluj-Napoca</strong>
                  <span>Registered in Romania</span>
                </div>
                <div>
                  <strong>12</strong>
                  <span>Selected client references</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="process" className="section process-section">
          <div className="section-inner">
            <div className="section-heading">
              <p className="eyebrow">Process</p>
              <h2>A clear path from architecture decisions to stable delivery.</h2>
            </div>
            <div className="process-track">
              {processSteps.map((step, index) => (
                <div className="process-step" key={step}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="section contact-section">
          <div className="section-inner contact-panel">
            <div>
              <p className="eyebrow">Contact</p>
              <h2>Have a product to build or a system to improve?</h2>
            </div>
            <div className="contact-actions">
              <a href={`mailto:${company.email}`} className="contact-link">
                <Mail size={22} strokeWidth={1.6} />
                {company.email}
              </a>
              <span className="contact-link">
                <MapPin size={22} strokeWidth={1.6} />
                {company.location}
              </span>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <img src="/assets/hetmann-h.png" alt={company.name} />
        <p>© 2017 - 2026 {company.name}. All rights reserved.</p>
      </footer>

      <button
        className="floating-menu"
        type="button"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        onClick={() => setMenuOpen((value) => !value)}
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
    </div>
  );
}
