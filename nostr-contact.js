(function () {
  var overlay = document.getElementById("nostrContactOverlay");
  var openBtn = document.getElementById("nostrChatOpen");
  var closeBtn = document.getElementById("nostrContactClose");
  var textarea = document.getElementById("nostrContactMessage");
  var sendBtn = document.getElementById("nostrContactSend");
  var feedback = document.getElementById("nostrContactFeedback");
  var hint = document.querySelector(".nostr-contact-hint");

  if (!overlay || !openBtn || !sendBtn || !textarea || !feedback) return;

  function openModal() {
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    textarea.value = "";
    feedback.textContent = "";
    feedback.className = "nostr-contact-feedback";
    if (hint) {
      hint.classList.remove("is-hidden");
    }
    textarea.focus();
  }

  function closeModal() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
  }

  openBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) closeModal();
  });

  function setFeedback(msg, isError) {
    feedback.textContent = msg;
    feedback.className = "nostr-contact-feedback " + (isError ? "is-error" : "is-success");
    if (hint) {
      if (msg) {
        hint.classList.add("is-hidden");
      } else {
        hint.classList.remove("is-hidden");
      }
    }
  }

  sendBtn.addEventListener("click", function () {
    var config = window.NOSTR_CONTACT_CONFIG;
    if (!config || !config.NOSTR_TARGET_NPUB) {
      setFeedback("Konfiguration fehlt (npub).", true);
      return;
    }

    var message = textarea.value.trim();
    if (!message) {
      setFeedback("Bitte eine Nachricht eingeben.", true);
      return;
    }

    sendBtn.disabled = true;
    setFeedback("Wird gesendet…", false);

    if (!window.NostrTools || !window.NostrTools.generateSecretKey) {
      setFeedback("Nostr-Bibliothek nicht geladen. Bitte Seite neu laden.", true);
      sendBtn.disabled = false;
      return;
    }

    var nostrTools = window.NostrTools;

    (function () {
      var nip19 = nostrTools.nip19;
      var nip04 = nostrTools.nip04;
      var getPublicKey = nostrTools.getPublicKey;
      var finalizeEvent = nostrTools.finalizeEvent;
      var SimplePool = nostrTools.SimplePool;
      var generateSecretKey = nostrTools.generateSecretKey;

      var decodedNpub = nip19.decode(config.NOSTR_TARGET_NPUB);
      if (decodedNpub.type !== "npub") {
        setFeedback("Ungültige npub.", true);
        sendBtn.disabled = false;
        return;
      }

      var senderSk = generateSecretKey();
      var recipientPk = decodedNpub.data;
      var senderPk = getPublicKey(senderSk);

      var encryptedContent;
      try {
        encryptedContent = nip04.encrypt(senderSk, recipientPk, message);
      } catch (err) {
        setFeedback("Verschlüsselung fehlgeschlagen.", true);
        sendBtn.disabled = false;
        return;
      }

      var draft = {
        kind: 4,
        content: encryptedContent,
        tags: [["p", recipientPk]],
        created_at: Math.floor(Date.now() / 1000),
        pubkey: senderPk,
      };

      var signedEvent;
      try {
        signedEvent = finalizeEvent(draft, senderSk);
      } catch (err) {
        setFeedback("Signatur fehlgeschlagen.", true);
        sendBtn.disabled = false;
        return;
      }

      var relay = config.NOSTR_RELAY || "wss://relay.damus.io";
      var pool = new SimplePool();
      var relays = [relay];

      var timeoutMs = 20000;
      var timeoutPromise = new Promise(function (_, reject) {
        setTimeout(function () {
          reject(new Error("timeout"));
        }, timeoutMs);
      });

      Promise.race([pool.publish(relays, signedEvent), timeoutPromise])
        .then(function () {
          setFeedback("Nachricht gesendet.", false);
          textarea.value = "";
          sendBtn.disabled = false;
          setTimeout(closeModal, 1500);
        })
        .catch(function (err) {
          setFeedback(
            err && err.message === "timeout" ? "leider offline" : "Relay-Fehler: " + (err.message || "Unbekannt"),
            true
          );
          sendBtn.disabled = false;
        })
        .finally(function () {
          pool.close(relays);
        });
    })();
  });
})();

