import Image from "next/image";
import { PhoneCalling } from "./icons";

/** Avatar with an overlapping glass "call" bubble, used on the CTA cards. */
export function CtaAvatar({ image }: { image: string }) {
  return (
    <div className="relative flex h-20 w-[142px] shrink-0">
      <Image src={image} alt="" width={80} height={80} className="relative z-[1] size-20 rounded-full border border-white-05 object-cover" />
      <div className="absolute top-0 left-[62px] z-0 flex size-20 items-center justify-center rounded-full border border-white bg-white-05 shadow-[inset_0_0_40px_0_#fff]">
        <PhoneCalling width={32} height={32} className="text-grey-01" />
      </div>
    </div>
  );
}
