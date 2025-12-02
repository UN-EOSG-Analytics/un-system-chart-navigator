"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function AnimatedCornerLogo() {
  const pathname = usePathname();

  // Always start hidden to prevent flash
  const [cornerClass, setCornerClass] = useState("corner-slide-hidden");
  const [spriteClass, setSpriteClass] = useState("un-two-zero-roll-hidden");

  useEffect(() => {
    // Only animate on home page
    if (pathname !== "/") return;

    // On home page, start the animation sequence
    const cornerTimer = setTimeout(() => {
      setCornerClass("corner-slide-entrance");
    }, 1500);

    // Sprite rolls in shortly after corner starts (200ms after corner -> 1700ms total)
    const spriteTimer = setTimeout(() => {
      setSpriteClass("un-two-zero-roll-entrance");
    }, 1200);

    return () => {
      clearTimeout(cornerTimer);
      clearTimeout(spriteTimer);
    };
  }, [pathname]);

  // Only render on main page
  if (pathname !== "/") return null;

  return (
    <div>
      <a
        href="https://un-two-zero.network/"
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed bottom-0 left-0 z-30 hidden cursor-pointer transition-opacity hover:opacity-80 md:block ${cornerClass}`}
        aria-label="Visit UN 2.0 Network"
      >
        {/* Base corner logo */}
        <Image
          src="/images/un-two-zero-corner.svg"
          alt="UN 2.0 Corner Logo"
          width={123}
          height={123}
          className="block"
        />
        {/* UN20 Animation Sprite on top */}
        <div className="absolute inset-0 flex items-center justify-start pt-2 pl-3">
          <Image
            src="/images/un-two-zero-logo-quintets.svg"
            alt="UN 2.0 Animation"
            width={31}
            height={29}
            className={`block ${spriteClass}`}
          />
        </div>
      </a>
    </div>
  );
}
