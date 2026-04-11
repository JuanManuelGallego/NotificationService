"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/src/app/AuthContext";

// ── Translations ────────────────────────────────────────────────────────────

const CONTENT = {
  en: {
    nav: { cta: "Sign in" },
    hero: {
      badge: "Practice management, reimagined",
      title: "The modern platform for healthcare professionals",
      subtitle:
        "Manage patients, appointments, reminders, and your entire practice — all in one intuitive place.",
      cta: "Sign in to your dashboard",
    },
    features: {
      title: "Everything you need to run your practice",
      subtitle:
        "Patient Nova centralises all your clinical operations into a single, polished platform.",
      items: [
        {
          icon: "🪪",
          title: "Patient Management",
          desc: "Keep complete records for every patient. Search, filter, and access profiles in seconds.",
        },
        {
          icon: "📝",
          title: "Appointments",
          desc: "Schedule and track appointments with status tracking, payment records, and full history.",
        },
        {
          icon: "📆",
          title: "Calendar",
          desc: "Monthly calendar view to visualise your schedule at a glance with appointment overlays.",
        },
        {
          icon: "🔔",
          title: "Reminders",
          desc: "Send automated reminders to reduce no-shows and keep patients informed.",
        },
      ],
    },
    howItWorks: {
      title: "Get started in minutes",
      steps: [
        {
          num: "01",
          title: "Log in securely",
          desc: "Access your dashboard with enterprise-grade authentication and automatic session management.",
        },
        {
          num: "02",
          title: "Set up your practice",
          desc: "Add patients, configure appointment types, and personalise your workflow in minutes.",
        },
        {
          num: "03",
          title: "Run your practice smarter",
          desc: "Track key metrics, reduce no-shows, and focus on what matters most — your patients.",
        },
      ],
    },
    cta: {
      title: "Ready to streamline your practice?",
      subtitle: "Join healthcare professionals who trust Patient Nova.",
      btn: "Sign in now",
    },
    footer: {
      tagline: "Modern practice management for healthcare professionals.",
      rights: "All rights reserved.",
    },
    modal: {
      title: "Sign in to Patient Nova",
      subtitle: "Welcome back",
      email: "Email address",
      emailPlaceholder: "doctor@example.com",
      password: "Password",
      passwordPlaceholder: "••••••••",
      submit: "Sign in",
      submitting: "Signing in…",
      error401: "Incorrect email or password",
      errorGeneric: "Sign in failed. Please try again.",
      divider: "or",
      fullPage: "Go to full sign-in page",
    },
  },

  es: {
    nav: { cta: "Iniciar sesión" },
    hero: {
      badge: "Gestión clínica, reinventada",
      title: "La plataforma moderna para profesionales de la salud",
      subtitle:
        "Gestiona pacientes, citas, recordatorios y toda tu práctica clínica — todo en un solo lugar.",
      cta: "Iniciar sesión en tu dashboard",
    },
    features: {
      title: "Todo lo que necesitas para gestionar tu clínica",
      subtitle:
        "Patient Nova centraliza todas tus operaciones clínicas en una plataforma intuitiva.",
      items: [
        {
          icon: "🪪",
          title: "Gestión de pacientes",
          desc: "Mantén un historial completo de cada paciente. Busca, filtra y accede a perfiles en segundos.",
        },
        {
          icon: "📝",
          title: "Citas",
          desc: "Agenda y gestiona citas con seguimiento de estado, registros de pagos e historial completo.",
        },
        {
          icon: "📆",
          title: "Calendario",
          desc: "Vista mensual para visualizar tu agenda de un vistazo con todas tus citas superpuestas.",
        },
        {
          icon: "🔔",
          title: "Recordatorios",
          desc: "Envía recordatorios automáticos para reducir ausencias y mantener informados a tus pacientes.",
        },
      ],
    },
    howItWorks: {
      title: "Comienza en minutos",
      steps: [
        {
          num: "01",
          title: "Inicia sesión de forma segura",
          desc: "Accede a tu dashboard con autenticación empresarial y gestión automática de sesiones.",
        },
        {
          num: "02",
          title: "Configura tu práctica",
          desc: "Agrega pacientes, configura tipos de citas y personaliza tu flujo de trabajo en minutos.",
        },
        {
          num: "03",
          title: "Gestiona de forma más inteligente",
          desc: "Sigue métricas clave, reduce ausencias y enfócate en lo que importa: tus pacientes.",
        },
      ],
    },
    cta: {
      title: "¿Listo para optimizar tu práctica clínica?",
      subtitle: "Únete a los profesionales de la salud que confían en Patient Nova.",
      btn: "Iniciar sesión ahora",
    },
    footer: {
      tagline: "Gestión clínica moderna para profesionales de la salud.",
      rights: "Todos los derechos reservados.",
    },
    modal: {
      title: "Inicia sesión en Patient Nova",
      subtitle: "Bienvenido de nuevo",
      email: "Correo electrónico",
      emailPlaceholder: "medico@ejemplo.com",
      password: "Contraseña",
      passwordPlaceholder: "••••••••",
      submit: "Iniciar sesión",
      submitting: "Iniciando sesión…",
      error401: "Credenciales incorrectas",
      errorGeneric: "Error al iniciar sesión. Intenta de nuevo.",
      divider: "o",
      fullPage: "Ir a la página de inicio de sesión",
    },
  },
} as const;

type Lang = keyof typeof CONTENT;

// ── Login Modal ──────────────────────────────────────────────────────────────

function LoginModal({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const { login, loading, error } = useAuthContext();
  const router = useRouter();
  const t = CONTENT[ lang ].modal;

  const [ email, setEmail ] = useState("");
  const [ password, setPassword ] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch {
      // error is managed by AuthContext
    }
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [ onClose ]);

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-panel modal-panel--sm fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="landing-modal-title">{t.title}</div>
            <div className="landing-modal-subtitle">{t.subtitle}</div>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Form */}
        <form
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
          onSubmit={handleSubmit}
          noValidate
        >
          <label className="form-label">
            {t.email}
            <input
              className="form-input"
              type="email"
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
              required
            />
          </label>

          <label className="form-label">
            {t.password}
            <input
              className="form-input"
              type="password"
              placeholder={t.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <div className="login-card__error">
              ⚠️{" "}
              {error === "Server error: 401" ? t.error401 : t.errorGeneric}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary login-card__submit"
            style={{ marginTop: 4 }}
            disabled={loading || !email || !password}
          >
            {loading ? t.submitting : t.submit}
          </button>
        </form>

        {/* Fallback link */}
        <div
          style={{
            textAlign: "center",
            marginTop: 20,
            paddingTop: 16,
            borderTop: "1px solid var(--c-gray-100)",
          }}
        >
          <span style={{ fontSize: 13, color: "var(--c-gray-400)" }}>
            {t.divider}{" "}
          </span>
          <Link
            href="/login"
            style={{
              fontSize: 13,
              color: "var(--c-brand-accent)",
              textDecoration: "none",
            }}
          >
            {t.fullPage}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Landing Page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [ lang, setLang ] = useState<Lang>("es");
  const [ loginOpen, setLoginOpen ] = useState(false);
  const { isAuthenticated, initializing } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!initializing && isAuthenticated) router.replace("/dashboard");
  }, [ initializing, isAuthenticated, router ]);

  // While checking session, render nothing to avoid flash
  if (initializing || isAuthenticated) return null;

  const t = CONTENT[ lang ];

  return (
    <>
      {loginOpen && (
        <LoginModal lang={lang} onClose={() => setLoginOpen(false)} />
      )}

      {/* ── Navbar ── */}
      <nav className="landing-nav">
        <div className="landing-nav__inner">
          <div className="landing-nav__brand">
            <Image
              src="/favicon.ico"
              alt="Patient Nova"
              width={32}
              height={32}
              style={{ borderRadius: "var(--r-md)" }}
            />
            <span className="landing-nav__logo-text">Patient Nova</span>
          </div>
          <div className="landing-nav__actions">
            <button
              className="landing-lang-toggle"
              onClick={() => setLang((l) => (l === "en" ? "es" : "en"))}
              aria-label="Toggle language"
            >
              {lang === "en" ? "🇪🇸 ES" : "🇺🇸 EN"}
            </button>
            <button className="btn-primary" onClick={() => setLoginOpen(true)}>
              {t.nav.cta}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="landing-container">
          <div className="landing-hero__badge">{t.hero.badge}</div>
          <h1 className="landing-hero__title">{t.hero.title}</h1>
          <p className="landing-hero__subtitle">{t.hero.subtitle}</p>
          <button
            className="btn-primary btn-hero landing-hero__cta"
            onClick={() => setLoginOpen(true)}
          >
            {t.hero.cta} →
          </button>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="landing-section">
        <div className="landing-container">
          <div className="landing-section-header">
            <h2 className="landing-section-title">{t.features.title}</h2>
            <p className="landing-section-subtitle">{t.features.subtitle}</p>
          </div>
          <div className="landing-features-grid">
            {t.features.items.map((f, i) => (
              <div key={i} className="landing-feature-card">
                <span className="landing-feature-card__icon">{f.icon}</span>
                <h3 className="landing-feature-card__title">{f.title}</h3>
                <p className="landing-feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="landing-section landing-section--white">
        <div className="landing-container">
          <div className="landing-section-header">
            <h2 className="landing-section-title">{t.howItWorks.title}</h2>
          </div>
          <div className="landing-steps">
            {t.howItWorks.steps.map((step, i) => (
              <div key={i} className="landing-step">
                <div className="landing-step__num">{step.num}</div>
                <h3 className="landing-step__title">{step.title}</h3>
                <p className="landing-step__desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="landing-cta-banner">
        <div className="landing-container">
          <h2 className="landing-cta-banner__title">{t.cta.title}</h2>
          <p className="landing-cta-banner__subtitle">{t.cta.subtitle}</p>
          <button
            className="btn-primary btn-hero landing-cta-banner__btn"
            onClick={() => setLoginOpen(true)}
          >
            {t.cta.btn} →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-container landing-footer__inner">
          <div className="landing-footer__brand">
            <Image
              src="/favicon.ico"
              alt="Patient Nova"
              width={22}
              height={22}
              style={{ borderRadius: "var(--r-sm)" }}
            />
            <span
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: "var(--c-brand)",
              }}
            >
              Patient Nova
            </span>
          </div>
          <p className="landing-footer__tagline">{t.footer.tagline}</p>
          <p className="landing-footer__copy">
            © {new Date().getFullYear()} Patient Nova. {t.footer.rights}
          </p>
        </div>
      </footer>
    </>
  );
}
