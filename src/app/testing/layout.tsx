import type { Metadata } from "next";

/** /testing: a page for trying payments, outside the site's layout (no loader, cursor or navbar) and never indexed. */
export const metadata: Metadata = {
  title: "Testing pembayaran | webdev.co.id",
  robots: { index: false, follow: false },
};

export default function TestingLayout({ children }: LayoutProps<"/testing">) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-[radial-gradient(120%_80%_at_50%_0%,color-mix(in_srgb,var(--color-holo-25)_14%,#fff),#fff_60%)] px-5 py-16">
      {children}
    </main>
  );
}
