import React from "react";

interface BrandTitleProps {
    compact?: boolean;
}

/**
 * The "Soton Verify" wordmark. The second word explicitly overrides the global
 * heading colour so the two-tone effect actually renders.
 */
export function BrandTitle({compact = false}: BrandTitleProps) {
    const size = compact
        ? "text-4xl sm:text-5xl"
        : "text-4xl sm:text-5xl md:text-6xl";

    return (
        <h1 className={`m-5 font-bold ${size}`}>
            <span className="text-[#005C85]">Soton</span>{" "}
            <span className="text-slate-900">Verify</span>
        </h1>
    );
}
