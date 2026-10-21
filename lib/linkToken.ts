import crypto from "crypto";

/**
 * The bot issues a signed, short-lived token when a user runs `/verify`.
 * Opening `https://sotonverify.link/link?t=<token>` lets the user finish the
 * link with a Southampton sign-in *in the browser they are currently in*.
 *
 * The token is deliberately self contained: the browser never has to correlate
 * an OAuth state cookie with the browser the flow started in.
 */
export interface LinkTokenPayload {
    discordId: string;
    discordTag: string;
    guildId: string;
    /** Unix timestamp in seconds. */
    exp: number;
    nonce: string;
}

export type LinkTokenResult =
    | { ok: true; payload: LinkTokenPayload }
    | { ok: false; reason: LinkTokenErrorReason; message: string };

export type LinkTokenErrorReason =
    | "not-configured"
    | "malformed"
    | "bad-signature"
    | "expired"
    | "invalid-payload";

const MAX_TOKEN_LENGTH = 2048;
const MAX_DISCORD_ID_LENGTH = 25;
const MAX_DISCORD_TAG_LENGTH = 37; // matches VarChar(37) in the Prisma schema
const MAX_NONCE_LENGTH = 128;
const DISCORD_ID_RE = /^\d{15,25}$/;

function linkSecret(): string | null {
    const secret = process.env.LINK_TOKEN_SECRET;
    return secret && secret.length > 0 ? secret : null;
}

function base64UrlEncode(value: Buffer | string): string {
    return Buffer.from(value)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

function base64UrlDecode(value: string): Buffer {
    if (!/^[A-Za-z0-9_-]+$/.test(value)) {
        throw new Error("Invalid base64url value");
    }

    const padding = value.length % 4 === 0 ? "" : "=".repeat(4 - (value.length % 4));
    return Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/") + padding, "base64");
}

function signature(payload: string, secret: string): Buffer {
    return crypto.createHmac("sha256", secret).update(payload).digest();
}

/**
 * Signs a token. The bot performs the same operation in Rust; this export is
 * useful for local testing and for any future admin tooling.
 */
export function signLinkToken(payload: LinkTokenPayload): string {
    const secret = linkSecret();
    if (!secret) {
        throw new Error("LINK_TOKEN_SECRET is not configured");
    }

    const body = base64UrlEncode(JSON.stringify(payload));
    return `${body}.${base64UrlEncode(signature(body, secret))}`;
}

export function verifyLinkToken(token: unknown): LinkTokenResult {
    const secret = linkSecret();
    if (!secret) {
        return {
            ok: false,
            reason: "not-configured",
            message: "This service is not configured to create verification links.",
        };
    }

    if (typeof token !== "string" || token.length === 0 || token.length > MAX_TOKEN_LENGTH) {
        return { ok: false, reason: "malformed", message: "This verification link is not valid." };
    }

    const parts = token.split(".");
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
        return { ok: false, reason: "malformed", message: "This verification link is not valid." };
    }

    const [body, encodedSignature] = parts;

    let suppliedSignature: Buffer;
    try {
        suppliedSignature = base64UrlDecode(encodedSignature);
    } catch {
        return { ok: false, reason: "malformed", message: "This verification link is not valid." };
    }

    const expectedSignature = signature(body, secret);
    if (
        suppliedSignature.length !== expectedSignature.length ||
        !crypto.timingSafeEqual(suppliedSignature, expectedSignature)
    ) {
        return {
            ok: false,
            reason: "bad-signature",
            message: "This verification link is not valid.",
        };
    }

    let payload: unknown;
    try {
        payload = JSON.parse(base64UrlDecode(body).toString("utf8"));
    } catch {
        return { ok: false, reason: "malformed", message: "This verification link is not valid." };
    }

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        return { ok: false, reason: "invalid-payload", message: "This verification link is not valid." };
    }

    const value = payload as Record<string, unknown>;
    const valid =
        typeof value.discordId === "string" &&
        DISCORD_ID_RE.test(value.discordId) &&
        typeof value.discordTag === "string" &&
        value.discordTag.length > 0 &&
        value.discordTag.length <= MAX_DISCORD_TAG_LENGTH &&
        typeof value.guildId === "string" &&
        DISCORD_ID_RE.test(value.guildId) &&
        typeof value.exp === "number" &&
        Number.isInteger(value.exp) &&
        value.exp > 0 &&
        typeof value.nonce === "string" &&
        value.nonce.length > 0 &&
        value.nonce.length <= MAX_NONCE_LENGTH;

    if (!valid) {
        return { ok: false, reason: "invalid-payload", message: "This verification link is not valid." };
    }

    const parsed = value as unknown as LinkTokenPayload;
    if (parsed.exp * 1000 <= Date.now()) {
        return {
            ok: false,
            reason: "expired",
            message: "This verification link has expired. Run /verify in Discord to get a new one.",
        };
    }

    return { ok: true, payload: parsed };
}

/**
 * In-memory nonce store. This deployment runs a single Next.js instance, so a
 * process-local set is enough to make a token single-use. If the service is ever
 * scaled horizontally this should move to Redis or a database table.
 */
const usedNonces = new Map<string, number>();
const MAX_USED_NONCES = 5000;

function isNonceUsed(nonce: string): boolean {
    const expiresAt = usedNonces.get(nonce);
    if (expiresAt === undefined) {
        return false;
    }
    if (expiresAt <= Date.now()) {
        usedNonces.delete(nonce);
        return false;
    }
    return true;
}

export function tryConsumeNonce(nonce: string, expiresAtSeconds: number): boolean {
    if (isNonceUsed(nonce)) {
        return false;
    }

    const now = Date.now();
    if (usedNonces.size >= MAX_USED_NONCES) {
        for (const [key, expiresAt] of usedNonces) {
            if (expiresAt <= now) {
                usedNonces.delete(key);
            }
        }
        // Still full: drop the oldest entries (Map preserves insertion order).
        while (usedNonces.size >= MAX_USED_NONCES) {
            const oldest = usedNonces.keys().next().value;
            if (oldest === undefined) {
                break;
            }
            usedNonces.delete(oldest);
        }
    }

    usedNonces.set(nonce, expiresAtSeconds * 1000);
    return true;
}

export function releaseNonce(nonce: string): void {
    usedNonces.delete(nonce);
}
