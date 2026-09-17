import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { company } from '../content/site';
import { navItems } from '../content/site';

type HeaderProps = {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
};

export default function Header({ menuOpen, setMenuOpen }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <a className="brand" href="#top" aria-label="Hetmann Technologies home">
        <span className="brand-mark">
          <img src="/assets/hetmann-h.png" alt="" />
        </span>
      </a>
      <nav className="desktop-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <a href={item.href} key={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
      <a className="header-cta" href={`mailto:${company.email}`}>
        Start a project
      </a>
      <div className={`mobile-panel ${menuOpen ? 'open' : ''}`}>
        <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
          <X size={22} />
        </button>
        {navItems.map((item) => (
          <a href={item.href} key={item.href} onClick={() => setMenuOpen(false)}>
            {item.label}
          </a>
        ))}
      </div>
    </header>
  );
}
