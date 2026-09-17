"use client";
import { useState } from "react";
import Link from "next/link";

const links = [
  ["Work", "projects"],
  ["About", "about"],
  ["Experience", "experience"],
  ["Contact", "contact"],
];
export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <nav
        className="wrap navigation"
        aria-label="Main navigation"
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
      >
        <Link className="wordmark" href="/#main" onClick={() => setOpen(false)}>
          Jorge Sandoval<span aria-hidden="true">.</span>
        </Link>
        <button
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="navigation-links"
          onClick={() => setOpen((current) => !current)}
        >
          {open ? "Close −" : "Menu +"}
        </button>
        <div
          id="navigation-links"
          className={`nav-links ${open ? "is-open" : ""}`}
        >
          {links.map(([label, id]) => (
            <Link key={id} href={`/#${id}`} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
          <a
            className="nav-social"
            href="https://www.linkedin.com/in/jorgesandev/"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
        </div>
      </nav>
    </header>
  );
}
