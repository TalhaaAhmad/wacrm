import Link from "next/link";
import { MessageSquare } from "lucide-react";

export const metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: June 2, 2026
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p className="mt-2">
              By accessing or using WatiShop, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. Description of Service</h2>
            <p className="mt-2">
              WatiShop provides a platform that connects Shopify stores with WhatsApp Business
              API to enable order notifications, abandoned cart recovery, and customer communication.
              We are an independent service and are not affiliated with WhatsApp Inc. or Shopify Inc.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">3. Account Registration</h2>
            <p className="mt-2">
              To use certain features of the service, you must register for an account.
              You agree to provide accurate and complete information during registration
              and to keep your account information updated. You are responsible for
              maintaining the confidentiality of your account credentials.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. WhatsApp Business API</h2>
            <p className="mt-2">
              Use of WhatsApp messaging features requires a valid WhatsApp Business account
              and compliance with Meta&apos;s Business Messaging Policies. You are responsible
              for obtaining and maintaining any necessary approvals from Meta for your
              WhatsApp Business API usage.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Shopify Integration</h2>
            <p className="mt-2">
              Connecting your Shopify store requires a valid Shopify account. You grant us
              permission to access your store data (orders, customers, products) solely
              for the purpose of providing our services. You may revoke this access at any time
              by disconnecting your store or deleting your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">6. Acceptable Use</h2>
            <p className="mt-2">
              You agree not to use the service to send spam, unsolicited messages, or any
              content that violates applicable laws or regulations. You must obtain proper
              consent from recipients before sending them WhatsApp messages.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">7. Payment and Billing</h2>
            <p className="mt-2">
              Certain features of the service may require payment. All fees are billed in
              advance and are non-refundable unless otherwise stated. We reserve the right
              to change our pricing at any time with notice to users.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">8. Limitation of Liability</h2>
            <p className="mt-2">
              To the maximum extent permitted by law, WatiShop shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages arising out
              of or relating to your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">9. Termination</h2>
            <p className="mt-2">
              We may suspend or terminate your account at any time for violations of these
              terms or for any other reason at our discretion. You may also delete your
              account at any time from your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">10. Changes to Terms</h2>
            <p className="mt-2">
              We may update these Terms of Service from time to time. We will notify you
              of any material changes by posting the updated terms on this page.
              Continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">11. Contact</h2>
            <p className="mt-2">
              If you have any questions about these Terms of Service, please contact us
              at support@watishop.com.
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
