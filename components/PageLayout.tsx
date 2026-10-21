import Head from "next/head";
import React from "react";

interface PageLayoutProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    mainClassName?: string;
}

/**
 * Common page shell. Static icons/manifest tags live in _document.tsx; each page
 * only supplies its title (and an optional description override).
 */
export function PageLayout({title, description, children, mainClassName = ""}: PageLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col items-center py-6">
            <Head>
                <title>{title}</title>
                {description ? <meta name="description" content={description}/> : null}
            </Head>
            <main
                className={`flex w-full flex-1 flex-col items-center px-4 text-center sm:px-6 lg:px-8 ${mainClassName}`}
            >
                {children}
            </main>
        </div>
    );
}
