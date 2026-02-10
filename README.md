# QuickNostr

A small, self‑contained Nostr contact widget that you can use as a modal on any static site. Messages are encrypted on the client and sent via a configurable relay.

## How it works

- There is a chat‑bubble button (`.nostr-chat-btn`) that opens a modal on top of the page.
- Inside the modal you write a message, which is encrypted via Nostr and sent as DMs (kind 4) to a fixed `npub`.
- For every message a fresh secret key is generated; you do not need to expose any `nsec` in the frontend.

## Project structure

- `nostr-contact.js` – controls the modal and sending over Nostr.
- `nostr-contact-config.example.js` – template for your own configuration.
- `nostr-tools-entry.js` – entry point for bundling `nostr-tools` into a global `window.NostrTools` variable.
- `build-nostr-bundle.js` – small build script for esbuild.
- `src/nostr-contact.css` – styles for the button, modal, textarea and send button.
- `demo/index.html` – simple example page where everything is wired together.

## Installation

```bash
git clone <your-repo-url> quicknostr
cd quicknostr
npm install
npm run build
```

After `npm run build`, the bundled Nostr library is written to `dist/nostr-tools-bundle.js`.

## Configuration

1. Create a config file based on the example:

   ```bash
   cp nostr-contact-config.example.js nostr-contact-config.js
   ```

   The new file `nostr-contact-config.js` lives next to `nostr-contact.js`.

2. Edit `nostr-contact-config.js` and set your own values:

   ```js
   window.NOSTR_CONTACT_CONFIG = {
     NOSTR_TARGET_NPUB: "npub1yourtargetaddress...",
     NOSTR_RELAY: "wss://nos.lol",
   };
   ```

## Embedding into your own page

1. Include the CSS (adjust the path to your setup):

```html
<link rel="stylesheet" href="/path/to/nostr-contact.css" />
```

2. Add a button to open the modal:

```html
<button
  type="button"
  class="nostr-chat-btn"
  id="nostrChatOpen"
  aria-label="Send message"
>
  <!-- Any icon you like, e.g. a chat bubble -->
</button>
```

3. Add the modal markup itself:

```html
<div
  class="nostr-contact-overlay"
  id="nostrContactOverlay"
  role="dialog"
  aria-modal="true"
  aria-label="Send message via Nostr"
  aria-hidden="true"
>
  <div class="nostr-contact-modal">
    <button
      type="button"
      class="nostr-contact-close"
      id="nostrContactClose"
      aria-label="Close"
    >
      &times;
    </button>
    <textarea
      id="nostrContactMessage"
      class="nostr-contact-textarea"
      placeholder="Message...&#10;please include phone number or email"
      rows="4"
    ></textarea>
    <button
      type="button"
      class="nostr-contact-send"
      id="nostrContactSend"
    >
      Send
    </button>
    <p
      class="nostr-contact-feedback"
      id="nostrContactFeedback"
      aria-live="polite"
    ></p>
    <p class="nostr-contact-hint">
      Messages are encrypted via Nostr and delivered through a relay.
    </p>
  </div>
</div>
```

4. Include the scripts in this order:

```html
<script src="/path/to/nostr-contact-config.js"></script>
<script src="/path/to/nostr-tools-bundle.js"></script>
<script src="/path/to/nostr-contact.js"></script>
```

After that, the button should open the modal, and the send button will send encrypted DMs to your configured `npub`.

## Typography and styling

The demo uses a license‑free monospace stack on the body:

```css
font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
  "Liberation Mono", "Courier New", monospace;
```

You can reuse these fonts or replace them with your own. The widget works independently of the rest of your site design as long as the required classes (`.nostr-chat-btn`, `.nostr-contact-overlay`, `.nostr-contact-modal`, `.nostr-contact-textarea`, `.nostr-contact-send`) are present.

## License

This project is licensed under the MIT License. You can use, modify, and redistribute the code in your own projects.

