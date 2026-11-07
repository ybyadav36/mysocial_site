"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CardsIcon, ChatIcon, UserIcon } from "./icons";

const ITEMS = [
  { href: "/discover", label: "Discover", Icon: CardsIcon },
  { href: "/matches", label: "Chats", Icon: ChatIcon },
  { href: "/profile", label: "Profile", Icon: UserIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="pb-safe z-40 shrink-0 border-t border-line bg-bg/90 pt-2 backdrop-blur-xl">
      <ul className="mx-auto flex max-w-md items-center justify-around">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 px-5 py-1 text-[11px] font-medium transition ${active ? "text-accent" : "text-muted hover:text-text"}`}
              >
                <Icon className="size-6" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
