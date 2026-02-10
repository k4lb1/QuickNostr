import { nip19, nip04, getPublicKey, finalizeEvent, SimplePool, generateSecretKey } from "nostr-tools";

if (typeof window !== "undefined") {
  window.NostrTools = { nip19, nip04, getPublicKey, finalizeEvent, SimplePool, generateSecretKey };
}

