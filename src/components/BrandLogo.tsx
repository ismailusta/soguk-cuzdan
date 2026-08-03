import Image from "next/image";
import { BRAND_LOGO_PATH, BRAND_NAME } from "@/lib/brand";

export function BrandLogo({
  size = 28,
  withWordmark = true,
  priority = false,
  className = "",
}: {
  size?: number;
  withWordmark?: boolean;
  priority?: boolean;
  className?: string;
}) {
  const wordScale = size >= 52 ? "lg" : size >= 40 ? "md" : "sm";
  const topCls =
    wordScale === "lg"
      ? "text-[22px] md:text-[24px]"
      : wordScale === "md"
        ? "text-[15px] md:text-[16px]"
        : "text-[13px]";
  const botCls =
    wordScale === "lg"
      ? "text-[16px] md:text-[18px]"
      : wordScale === "md"
        ? "text-[12px] md:text-[13px]"
        : "text-[11px]";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src={BRAND_LOGO_PATH}
        alt={BRAND_NAME}
        width={size}
        height={size}
        className="shrink-0 object-contain"
        priority={priority}
        unoptimized
      />
      {withWordmark && (
        <span
          className="flex flex-col justify-center leading-[0.92]"
          aria-label={BRAND_NAME}
        >
          <span
            className={`${topCls} font-extrabold tracking-[0.06em] text-fg uppercase`}
          >
            Kripto
          </span>
          <span
            className={`${botCls} font-light tracking-[0.22em] text-fg/55 uppercase`}
          >
            Store
          </span>
        </span>
      )}
    </span>
  );
}
