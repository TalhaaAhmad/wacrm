import Link from "next/link";
import { MessageSquare } from "lucide-react";

export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <MessageSquare className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">WatiShop</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: June 2, 2026
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Introduction</h2>
            <p className="mt-2">
              WatiShop (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) respects your privacy and is committed to
              protecting your personal data. This Privacy Policy explains how we collect,
              use, store, and safeguard your information when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. Information We Collect</h2>
            <p className="mt-2">
              We collect information you provide directly to us, including:
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>Account information (name, email address, password)</li>
              <li>WhatsApp Business API credentials (phone number ID, access token)</li>
              <li>Shopify store information (store domain, webhook configuration)</li>
              <li>Message templates and notification preferences</li>
              <li>Contact information synced from your Shopify store</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">3. How We Use Your Information</h2>
            <p className="mt-2">
              We use the information we collect to:
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>Provide and maintain our services</li>
              <li>Send WhatsApp messages on your behalf (order notifications, cart recovery)</li>
              <li>Process and fulfill orders from your Shopify store</li>
              <li>Improve and optimize our platform</li>
              <li>Communicate with you about your account and service updates</li>
              <li>Ensure security and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Data Storage and Security</h2>
            <p className="mt-2">
              We use Supabase for data storage with industry-standard security measures.
              Sensitive credentials (WhatsApp access tokens, webhook secrets) are encrypted
              using AES-256-GCM encryption. We implement Row Level Security (RLS) to ensure
              your data is only accessible to you.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Data Sharing</h2>
            <p className="mt-2">
              We do not sell or rent your personal information to third parties. We only share
              data with:
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>Meta (WhatsApp) — to send messages via the WhatsApp Business API</li>
              <li>Shopify — to sync order and customer data</li>
              <li>Service providers — for hosting, analytics, and payment processing</li>
            </ul>
            <p className="mt-2">
              All third-party providers are bound by confidentiality and data protection obligations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">6. Cookies and Tracking</h2>
            <p className="mt-2">
              We use essential cookies to maintain your session and preferences. We do not
              use tracking cookies for advertising purposes. You can control cookie settings
              through your browser preferences.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">7. Your Rights</h2>
            <p className="mt-2">
              Depending on your location, you may have the right to:
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Delete your personal data</li>
              <li>Export your data in a portable format</li>
              <li>Object to certain processing activities</li>
            </ul>
            <p className="mt-2">
              To exercise these rights, contact us at support@watishop.com.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">8. Data Retention</h2>
            <p className="mt-2">
              We retain your data for as long as your account is active. When you delete your
              account, we will delete your personal data within 30 days, except where we are
              required to retain it for legal or regulatory purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">9. Children&apos;s Privacy</h2>
            <p className="mt-2">
              Our service is not intended for individuals under the age of 16. We do not
              knowingly collect personal information from children. If you believe we have
              collected data from a child, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">10. Changes to This Policy</h2>
            <p className="mt-2">
              We may update this Privacy Policy from time to time. We will notify you of
              material changes by posting the updated policy on this page and updating the
              &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">11. Contact Us</h2>
            <p className="mt-2">
              If you have any questions about this Privacy Policy or our data practices,
              please contact us at support@watishop.com.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p>&copy; 2026 WatiShop. All rights reserved.</p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
