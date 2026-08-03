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
        <span className="text-lg font-bold tracking-[0.5px]">{BRAND_NAME}</span>
      )}
    </span>
  );
}
