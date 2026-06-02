import Link from "next/link";
import {
  MessageSquare,
  ShoppingCart,
  Bell,
  BarChart3,
  CreditCard,
  Users,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  Truck,
  Megaphone,
  MousePointerClick,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Shopify × WhatsApp Integration — Landing Page                     */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <TrustedBy />
      <Features />
      <HowItWorks />
      <ShopifyFeatures />
      <Stats />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Navbar                                                            */
/* ------------------------------------------------------------------ */
function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <MessageSquare className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">WatiShop</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it works</a>
          <a href="#shopify" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Shopify</a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
          >
            Start free trial
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                              */
/* ------------------------------------------------------------------ */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <ShoppingCart className="h-4 w-4" />
            Shopify × WhatsApp Integration
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Turn WhatsApp into your{" "}
            <span className="text-primary">most powerful</span>{" "}
            sales channel
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Connect your Shopify store to WhatsApp Business in minutes.
            Recover abandoned carts, send order updates, close COD orders,
            and drive 3× more conversions — all on the platform your
            customers already use every day.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30"
            >
              Start free 14-day trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
            >
              See how it works
            </a>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required · Setup in 5 minutes · Cancel anytime
          </p>
        </div>

        {/* Hero visual */}
        <div className="mx-auto mt-16 max-w-4xl">
          <div className="rounded-2xl border border-border bg-card p-2 shadow-2xl shadow-primary/5">
            <div className="rounded-xl bg-muted/50 p-8 sm:p-12">
              <div className="grid gap-6 sm:grid-cols-3">
                <HeroCard icon={ShoppingCart} label="Abandoned carts recovered" value="2,847" change="+34%" />
                <HeroCard icon={MessageSquare} label="Messages delivered" value="18.2K" change="98.5%" />
                <HeroCard icon={CreditCard} label="Revenue from WhatsApp" value="$42.5K" change="+127%" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroCard({ icon: Icon, label, value, change }: { icon: React.ElementType; label: string; value: string; change: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 text-center">
      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xs font-medium text-primary">{change}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Trusted By                                                        */
/* ------------------------------------------------------------------ */
function TrustedBy() {
  return (
    <section className="border-y border-border bg-muted/30 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-muted-foreground">
          Trusted by 5,000+ Shopify merchants worldwide
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {["FashionStore", "TechGadgets", "HomeDecor", "BeautyBox", "FitGear"].map((name) => (
            <span key={name} className="text-lg font-bold text-muted-foreground/40">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Features                                                          */
/* ------------------------------------------------------------------ */
const features = [
  {
    icon: ShoppingCart,
    title: "Abandoned Cart Recovery",
    description:
      "Automatically send WhatsApp reminders when customers leave items in their cart. Recover 15-25% of lost sales with personalized nudges.",
  },
  {
    icon: Truck,
    title: "Cash on Delivery Confirmation",
    description:
      "Verify COD orders instantly via WhatsApp. Reduce fake orders and RTO rates by confirming purchase intent before shipping.",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Chat Button",
    description:
      "Add a one-click WhatsApp chat widget to your Shopify store. Let customers ask questions, get support, and buy — all in chat.",
  },
  {
    icon: Bell,
    title: "E-commerce Notifications",
    description:
      "Send order confirmations, shipping updates, and delivery notifications on WhatsApp — 5× higher open rates than email.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description:
      "Track message delivery, response rates, conversion funnels, and revenue attribution. Know exactly what's working.",
  },
  {
    icon: Megaphone,
    title: "Pop-ups & Opt-ins",
    description:
      "Grow your WhatsApp subscriber list with smart pop-ups on your Shopify store. Capture consent and segment audiences automatically.",
  },
  {
    icon: CreditCard,
    title: "Payments on WhatsApp",
    description:
      "Send payment links, collect COD confirmations, and close sales without customers ever leaving WhatsApp.",
  },
  {
    icon: Users,
    title: "Customer Segmentation",
    description:
      "Segment contacts by purchase history, cart value, location, and engagement. Send targeted campaigns that convert.",
  },
];

function Features() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Features
          </p>
          <h2 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
            Everything you need to sell on WhatsApp
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A complete Shopify-WhatsApp toolkit — from cart recovery to
            post-purchase support, all managed from one dashboard.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  How It Works                                                      */
/* ------------------------------------------------------------------ */
const steps = [
  {
    step: "01",
    title: "Connect your Shopify store",
    description:
      "Install our Shopify app in one click. We sync your products, orders, and customer data automatically.",
  },
  {
    step: "02",
    title: "Set up WhatsApp Business",
    description:
      "Link your WhatsApp Business account through our guided setup. Get your official Business API approved in minutes.",
  },
  {
    step: "03",
    title: "Configure automations",
    description:
      "Choose from pre-built templates for abandoned carts, order updates, COD confirmation, and more. Customize to match your brand.",
  },
  {
    step: "04",
    title: "Watch sales grow",
    description:
      "Sit back as WhatsApp drives recoveries, confirmations, and repeat purchases. Track every dollar in real-time analytics.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-muted/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            How it works
          </p>
          <h2 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
            Up and running in minutes
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            No coding. No complex setup. Connect Shopify, link WhatsApp,
            and start converting.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.step} className="relative">
              <span className="text-5xl font-black text-primary/10">{s.step}</span>
              <h3 className="mt-2 text-lg font-semibold text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Shopify-specific Features                                         */
/* ------------------------------------------------------------------ */
function ShopifyFeatures() {
  return (
    <section id="shopify" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left content */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Built for Shopify
            </p>
            <h2 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
              Deep Shopify integration
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              We don't just bolt WhatsApp onto your store. Our native Shopify
              integration syncs products, orders, customers, and inventory in
              real time — so every WhatsApp message is backed by live store data.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                "Auto-sync products, variants, and images from Shopify",
                "Real-time order status: placed → shipped → delivered",
                "Abandoned cart data synced every 5 minutes",
                "Customer tags and segments flow into WhatsApp audiences",
                "COD verification with one-click confirm/reject",
                "Revenue attribution: see exactly which WhatsApp message drove the sale",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right visual */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-primary/5">
            <div className="space-y-4">
              <MockNotification
                icon={ShoppingCart}
                title="Cart Abandoned"
                message="Hi Sarah! You left a Blue Denim Jacket in your cart. Complete your order now and get 10% off!"
                time="2 min ago"
              />
              <MockNotification
                icon={Truck}
                title="Order Shipped"
                message="Your order #4521 is on the way! Track your package here →"
                time="1 hour ago"
              />
              <MockNotification
                icon={CreditCard}
                title="COD Confirmed"
                message="Thanks for confirming! Your Cash on Delivery order has been verified and will ship today."
                time="3 hours ago"
              />
              <MockNotification
                icon={MousePointerClick}
                title="Payment Link Sent"
                message="Complete your purchase: $89.99 for Wireless Earbuds. Click to pay securely →"
                time="5 hours ago"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MockNotification({ icon: Icon, title, message, time }: { icon: React.ElementType; title: string; message: string; time: string }) {
  return (
    <div className="flex gap-3 rounded-lg border border-border bg-background p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <span className="text-[11px] text-muted-foreground">{time}</span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{message}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stats                                                             */
/* ------------------------------------------------------------------ */
function Stats() {
  return (
    <section className="bg-primary py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { value: "98%", label: "Message open rate" },
            { value: "3×", label: "Higher conversion vs email" },
            { value: "15-25%", label: "Abandoned carts recovered" },
            { value: "5,000+", label: "Shopify merchants" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-4xl font-bold text-primary-foreground">{s.value}</p>
              <p className="mt-1 text-sm text-primary-foreground/70">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Testimonials                                                      */
/* ------------------------------------------------------------------ */
function Testimonials() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Loved by Shopify merchants
          </h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            {
              quote: "We recovered $12K in abandoned carts in the first month. WhatsApp outperforms email by a mile.",
              name: "Priya S.",
              role: "Fashion retailer",
            },
            {
              quote: "COD confirmation on WhatsApp cut our RTO rate from 35% to 12%. Game changer for our D2C brand.",
              name: "Arjun M.",
              role: "Electronics store",
            },
            {
              quote: "Setup took 10 minutes. The Shopify integration just works — orders, products, everything syncs perfectly.",
              name: "Sarah L.",
              role: "Home decor brand",
            },
          ].map((t) => (
            <div key={t.name} className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-foreground leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  CTA                                                               */
/* ------------------------------------------------------------------ */
function CTA() {
  return (
    <section id="pricing" className="bg-muted/40 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
          Ready to boost your Shopify sales?
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Join 5,000+ merchants who use WhatsApp to recover carts, confirm
          orders, and grow revenue. Start your free trial today.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30"
          >
            Start free 14-day trial
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Already have an account? Log in
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-primary" /> Free 14-day trial
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-primary" /> 5-minute setup
          </span>
          <span className="flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-primary" /> No credit card required
          </span>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                            */
/* ------------------------------------------------------------------ */
function Footer() {
  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <MessageSquare className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">WatiShop</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Shopify × WhatsApp integration that drives sales and delights customers.
            </p>
          </div>
          <FooterCol
            title="Product"
            links={["Features", "Pricing", "Integrations", "API Docs"]}
          />
          <FooterCol
            title="Company"
            links={["About", "Blog", "Careers", "Contact"]}
          />
          <FooterCol
            title="Legal"
            links={["Privacy Policy", "Terms of Service", "Cookie Policy"]}
          />
        </div>
        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} WatiShop. All rights reserved.
          Not affiliated with WhatsApp® or Shopify®.
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
