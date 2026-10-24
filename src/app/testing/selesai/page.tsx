import { Suspense } from "react";
import { PaymentResult } from "./PaymentResult";

/** /testing/selesai?invoice=…: where DOKU sends the customer back; shows the order's status until it settles. */
export default function SelesaiPage() {
  return (
    <div className="w-full max-w-[440px] rounded-3xl border border-grey-07 bg-grey-09 p-8 text-center shadow-[var(--shadow-card)]">
      <Suspense fallback={<p className="t-body-m text-grey-03">Memuat…</p>}>
        <PaymentResult />
      </Suspense>
    </div>
  );
}
