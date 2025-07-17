import Link from "next/link";

interface buttonLinkProps {
  href?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export default function buttonLink({
  href,
  children,
  onClick,
}: buttonLinkProps) {
  const className =
    "rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20";

  if (onClick) {
    return (
      <button onClick={onClick} className={className}>
        {children}
      </button>
    );
  }

  return (
    <Link href={href!} className={className}>
      {children}
    </Link>
  );
}
