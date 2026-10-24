import { TEST_PRODUCT, rupiah } from "@/lib/payments/products";
import { CheckoutForm } from "./CheckoutForm";

/** /testing: one product and a pay button that opens DOKU's checkout page. */
export default function TestingPage() {
  return (
    <div className="w-full max-w-[440px] rounded-3xl border border-grey-07 bg-grey-09 p-2 shadow-[var(--shadow-card)]">
      <div className="rounded-2xl bg-[linear-gradient(180deg,#363a44_-143.93%,#00040f_100%)] px-6 py-7 text-white">
        <p className="t-body-s text-white/60">Testing pembayaran · DOKU</p>
        <h1 className="t-title-m mt-2">{TEST_PRODUCT.name}</h1>
        <p className="mt-6 text-[40px] leading-none font-medium tracking-[-0.03em]">{rupiah(TEST_PRODUCT.price)}</p>
      </div>
      <div className="px-4 pt-6 pb-4 md:px-6">
        <CheckoutForm />
      </div>
    </div>
  );
}
