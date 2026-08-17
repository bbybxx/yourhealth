import Link from "next/link";

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {/* листок */}
      <path
        d="M24 44c-9.4-6.4-15-12.4-15-20.5C9 15 15.5 9 24 9s15 6 15 14.5C39 31.6 33.4 37.6 24 44Z"
        fill="#0a3522"
      />
      <path
        d="M24 12v29"
        stroke="#A7E16C"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M14 19c7 4 12.5 6.4 18.5 7.4"
        stroke="#A7E16C"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M24 12c4.6 4 7.6 9 8.4 14"
        stroke="#A7E16C"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      {/* акцентная точка */}
      <circle cx="35" cy="10" r="4.5" fill="#F08041" />
    </svg>
  );
}

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className}`} aria-label="your health — на главную">
      <LogoMark className="h-9 w-9 shrink-0" />
      <span className="font-serif leading-none tracking-tight">
        <span className="block text-[22px] font-bold text-brand">your</span>
        <span className="-mt-1 block text-[22px] font-bold text-accent">health</span>
      </span>
    </Link>
  );
}
