import { logoMarkup } from "./logo.ts";

const logo = logoMarkup();

const css = `
:root { color-scheme: dark; }
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
html, body {
  margin: 0;
  background: #050605;
  color: #F3F4EE;
}
body {
  font-family: Geist, "Geist Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.5;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}
h1, h2, h3, p { margin: 0; }
a { color: inherit; }
img { max-width: 100%; }
.inner { max-width: 1080px; margin: 0 auto; }
.top { padding: 28px 64px 0; }
.wordmark {
  display: inline-flex;
  align-items: center;
  line-height: 0;
  transition: transform 180ms ease;
}
.wordmark-svg { display: block; height: 40px; width: auto; }
.wire-draw { stroke-dasharray: 1; }
.wordmark:hover { transform: translateY(-1px); }
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(260px, 340px);
  gap: 48px;
  align-items: start;
  padding: 56px 64px 24px;
}
h1 {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 11em;
  margin-top: 28px;
  color: #F3F4EE;
  font-size: 56px;
  font-weight: 500;
  line-height: 1.08;
  letter-spacing: -0.03em;
}
.line { display: block; }
.lime { color: #C6F432; }
.sub {
  max-width: 38em;
  margin-top: 20px;
  color: #A3AA9C;
  font-size: 17px;
  font-weight: 400;
  line-height: 1.5;
}
.actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 28px; }
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 16px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.01em;
  text-decoration: none;
  line-height: 1;
}
.btn {
  transition: transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
}
.btn-primary { background: #C6F432; color: #050605; }
.btn-secondary {
  background: transparent;
  color: #F3F4EE;
  box-shadow: inset 0 0 0 1px #C6F432;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(198, 244, 50, 0.32);
}
.btn-secondary:hover { background: rgba(198, 244, 50, 0.14); }
.btn-primary:active { transform: translateY(-1px) scale(0.98); }
.btn-secondary:active { transform: scale(0.98); }
.btn:focus-visible { outline: 2px solid #C6F432; outline-offset: 3px; }
.note {
  max-width: 40em;
  margin-top: 16px;
  color: #A3AA9C;
  font-size: 14px;
  line-height: 1.45;
}
.phone-slot { position: relative; }
.glow {
  position: absolute;
  z-index: 0;
  left: 0;
  right: 0;
  top: 6%;
  height: 72%;
  background: radial-gradient(closest-side, rgba(198, 244, 50, 0.22), rgba(198, 244, 50, 0) 72%);
  pointer-events: none;
}
.phone { position: relative; z-index: 1; margin: 0; }
.bezel {
  background: #0C0E0B;
  border-radius: 32px;
  padding: 22px 10px 12px;
  position: relative;
}
.phone-stop .bezel { box-shadow: inset 0 0 0 1px #C42F1F; }
.phone-hero.phone-stop .bezel::after {
  content: "";
  position: absolute;
  inset: -6px;
  border-radius: 38px;
  border: 1px solid #C42F1F;
  opacity: 0.28;
  pointer-events: none;
}
.camera {
  position: absolute;
  top: 8px;
  left: 50%;
  width: 8px;
  height: 8px;
  margin-left: -4px;
  border-radius: 50%;
  background: #14170F;
}
.bezel img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 22px;
  background: #050605;
}
.phone figcaption, .shot figcaption {
  margin-top: 10px;
  color: #A3AA9C;
  font-size: 13px;
  line-height: 1.4;
}
.section { padding: 72px 64px 0; }
h2 {
  color: #F3F4EE;
  font-size: 28px;
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 1.2;
}
.steps, .features, .shots {
  display: grid;
  gap: 18px;
  margin-top: 28px;
  padding: 0;
  list-style: none;
}
.steps { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.steps li, .feature {
  background: #14170F;
  border-radius: 20px;
  padding: 22px 22px 24px;
}
.steps span {
  display: block;
  margin-bottom: 12px;
  color: #C6F432;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.04em;
}
.steps h3, .feature h3 {
  color: #F3F4EE;
  font-size: 18px;
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 1.3;
}
.steps p, .feature p {
  margin-top: 8px;
  color: #A3AA9C;
  font-size: 15px;
  line-height: 1.5;
}
.features { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.shots { grid-template-columns: repeat(3, minmax(0, 1fr)); align-items: start; }
.shot { margin: 0; }
.shot .bezel { border-radius: 26px; padding: 18px 8px 10px; }
.shot img { border-radius: 18px; }
.footer { padding: 72px 64px 64px; }
.footer-inner { display: flex; flex-direction: column; align-items: flex-start; gap: 16px; }
.footer-line, .credit { color: #A3AA9C; font-size: 14px; line-height: 1.5; max-width: 46em; }
.footer-line a { color: #C6F432; text-decoration: none; }
.footer-line a:focus-visible { outline: 2px solid #C6F432; outline-offset: 3px; }
#how { scroll-margin-top: 24px; }
@media (max-width: 900px) {
  .top, .hero, .section, .footer { padding-left: 20px; padding-right: 20px; }
  .top { padding-top: 22px; }
  .hero {
    grid-template-columns: 1fr;
    gap: 32px;
    padding-top: 32px;
  }
  h1 { margin-top: 22px; font-size: 36px; }
  .sub { font-size: 16px; }
  .phone, .phone-slot { width: min(320px, 100%); }
  .section { padding-top: 56px; }
  h2 { font-size: 24px; }
  .steps, .features, .shots { grid-template-columns: 1fr; }
  .footer { padding-top: 56px; padding-bottom: 48px; }
}
@keyframes rise {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: none; }
}
@keyframes phone-in {
  from { opacity: 0; transform: translateY(12px) scale(0.97); }
  to { opacity: 1; transform: none; }
}
@keyframes phone-float {
  0%, 100% { transform: translateY(-6px); }
  50% { transform: translateY(6px); }
}
@keyframes glow-breathe {
  0%, 100% { opacity: 0.45; }
  50% { opacity: 0.95; }
}
@keyframes wire-draw {
  from { stroke-dashoffset: 1; }
  to { stroke-dashoffset: 0; }
}
@keyframes wordmark-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes stop-pulse {
  0%, 100% { opacity: 0.18; }
  50% { opacity: 0.42; }
}
@media (prefers-reduced-motion: no-preference) {
  .js .rise {
    animation: rise 600ms ease-out both;
    animation-delay: var(--d, 0ms);
  }
  .js .reveal {
    opacity: 0;
    transform: translateY(14px);
  }
  .js .reveal.is-in {
    animation: rise 600ms ease-out both;
    animation-delay: var(--d, 0ms);
  }
  .js .phone-hero { animation: phone-in 700ms ease-out both; }
  .js .phone-hero .bezel { animation: phone-float 6s ease-in-out 700ms infinite; }
  .js .glow { animation: glow-breathe 7s ease-in-out infinite; }
  .js .wire-draw { animation: wire-draw 1.2s ease-out both; }
  .js .wordmark-letters { animation: wordmark-in 600ms ease-out both; }
  .js .phone-hero.phone-stop .bezel::after { animation: stop-pulse 4.8s ease-in-out 1s infinite; }
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .rise, .reveal, .phone-hero, .phone-hero .bezel, .glow, .wire-draw, .wordmark-letters, .phone-hero.phone-stop .bezel::after {
    animation: none !important;
  }
  .reveal { opacity: 1 !important; transform: none !important; }
  .wire-draw { stroke-dashoffset: 0 !important; }
  .btn, .wordmark { transition: none; }
  .btn:hover, .btn:active, .wordmark:hover { transform: none; }
  .btn-primary:hover, .btn-primary:active { box-shadow: none; }
  .btn-secondary:hover { background: transparent; }
}
`;

function phone(file: string, alt: string, caption: string, stop: boolean): string {
  const klass = stop ? "phone phone-hero phone-stop" : "phone phone-hero";
  return `<figure class="${klass}">
    <div class="bezel">
      <span class="camera" aria-hidden="true"></span>
      <img src="assets/${file}" alt="${alt}" width="600" height="1298" />
    </div>
    <figcaption>${caption}</figcaption>
  </figure>`;
}

export const pageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <meta name="description" content="Kagwa Wire is an Android app for peer-to-peer USDT sellers. It checks a chat or an address on the phone and shows Stop, Check more, No flags found or Can't tell." />
  <title>Kagwa Wire — Check it before you release it.</title>
  <link rel="icon" type="image/png" href="assets/favicon-512.png" sizes="512x512" />
  <link rel="apple-touch-icon" href="assets/apple-touch-icon-180.png" />
  <meta property="og:image" content="assets/favicon-512.png" />
  <script>document.documentElement.classList.add("js")</script>
  <style>${css}</style>
</head>
<body>
  <header class="top">${logo}</header>
  <main>
    <section class="hero">
      <div class="hero-copy">
        <h1>
          <span class="line rise" style="--d:0ms">Check it before you</span>
          <span class="line rise" style="--d:80ms"><span class="lime">release it.</span></span>
        </h1>
        <p class="sub rise" style="--d:160ms">Kagwa Wire is an Android app for peer-to-peer USDT sellers. Paste the buyer's chat or the address you're about to send to. Kagwa Wire checks it on the phone and shows one of four results, Stop, Check more, No flags found or Can't tell, with the exact line that caused it.</p>
        <div class="actions rise" style="--d:240ms">
          <a class="btn btn-primary" href="mailto:waitlist@kagua.app?subject=Kagwa%20Wire%20waitlist">Join the waitlist</a>
          <a class="btn btn-secondary" href="#how">See how it works</a>
        </div>
        <p class="note rise" style="--d:320ms">In development for AI Yako 2026. The checks run in a web build today; the Android build with the on-phone model hasn't been tested on a phone yet.</p>
      </div>
      <div class="phone-slot">
        <div class="glow" aria-hidden="true"></div>
      ${phone(
        "stop-frozen.webp",
        "Stop screen for a frozen Tron address in the Kagwa Wire web build.",
        "Screens from the web build. Phone build not yet run.",
        true,
      )}
      </div>
    </section>
    <section class="section" id="how" aria-labelledby="how-title">
      <div class="inner">
        <h2 class="reveal" id="how-title" style="--d:0ms">How it works</h2>
        <ol class="steps">
          <li class="reveal" style="--d:0ms">
            <span>1</span>
            <h3>Paste what you were sent.</h3>
            <p>An address, or the buyer's messages. On the phone you can also use a screenshot or scan a QR.</p>
          </li>
          <li class="reveal" style="--d:80ms">
            <span>2</span>
            <h3>Kagwa Wire checks it on the phone.</h3>
            <p>Code checks the address and the chat rules. A small QVAC model on the phone can add notes on the chat. It can raise a warning, never lower one.</p>
          </li>
          <li class="reveal" style="--d:160ms">
            <span>3</span>
            <h3>You see one of four results.</h3>
            <p>Stop, Check more, No flags found or Can't tell, with the text that triggered it.</p>
          </li>
        </ol>
      </div>
    </section>
    <section class="section" id="checks" aria-labelledby="checks-title">
      <div class="inner">
        <h2 class="reveal" id="checks-title" style="--d:0ms">Checks</h2>
        <div class="features">
          <article class="feature reveal" style="--d:0ms">
            <h3>Address check</h3>
            <p>Flags a bad checksum, the wrong network, an address on Tether's frozen list, and an address that copies a saved contact's first and last characters but differs in the middle. The frozen list ships with the app, with its date shown for each network.</p>
          </article>
          <article class="feature reveal" style="--d:70ms">
            <h3>Chat check</h3>
            <p>A request for your seed phrase, PIN, password or one-time code is Stop. Rushing you, moving the talk to WhatsApp or Telegram, posing as support or an admin, or "I've already paid, release now" is Check more. English and Swahili phrases.</p>
          </article>
          <article class="feature reveal" style="--d:140ms">
            <h3>Offline at check time</h3>
            <p>The two models download once, about 400 MB in total (15.4 MB OCR + 382.2 MB tagger from the QVAC catalogue, plus a small detector file). After that, Kagwa Wire is designed to work with no internet at check time.</p>
          </article>
          <article class="feature reveal" style="--d:210ms">
            <h3>What it does not do</h3>
            <p>It doesn't hold funds, sign, or send anything, and it can't tell you a payment arrived. "No flags found" means the checks that ran found nothing. It isn't a clearance. Confirm the payment in your own M-Pesa or bank app.</p>
          </article>
        </div>
      </div>
    </section>
    <section class="section" id="screens" aria-labelledby="screens-title">
      <div class="inner">
        <h2 class="reveal" id="screens-title" style="--d:0ms">More screens</h2>
        <div class="shots">
          <figure class="shot phone-stop reveal" style="--d:0ms">
            <div class="bezel">
              <span class="camera" aria-hidden="true"></span>
              <img src="assets/stop-lookalike.webp" alt="Stop screen for a look-alike address in the Kagwa Wire web build." width="600" height="1298" />
            </div>
            <figcaption>Look-alike Stop</figcaption>
          </figure>
          <figure class="shot reveal" style="--d:90ms">
            <div class="bezel">
              <span class="camera" aria-hidden="true"></span>
              <img src="assets/no-flags.webp" alt="No flags found screen for an address in the Kagwa Wire web build." width="600" height="1298" />
            </div>
            <figcaption>No flags found</figcaption>
          </figure>
          <figure class="shot reveal" style="--d:180ms">
            <div class="bezel">
              <span class="camera" aria-hidden="true"></span>
              <img src="assets/check-more.webp" alt="Check more screen for a chat in the Kagwa Wire web build." width="600" height="1298" />
            </div>
            <figcaption>Check more</figcaption>
          </figure>
        </div>
      </div>
    </section>
  </main>
  <footer class="footer">
    <div class="inner footer-inner">
      ${logo}
      <p class="footer-line">Built for AI Yako 2026, Offline AI apps track · <a href="https://github.com/Amberesaiae/kagua">Source on GitHub</a> · <a href="mailto:waitlist@kagua.app?subject=Kagwa%20Wire%20waitlist">Join the waitlist</a></p>
      <p class="credit">Frozen-address list: USDT Blacklist Archive, KYT Group / cryptoalert.report (CC-BY-4.0), and Tron USDT contract events.</p>
    </div>
  </footer>
  <script>
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var nodes = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    for (var i = 0; i < nodes.length; i++) nodes[i].classList.add("is-in");
  } else {
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (!entries[i].isIntersecting) continue;
        entries[i].target.classList.add("is-in");
        io.unobserve(entries[i].target);
      }
    }, { threshold: 0.16, rootMargin: "0px 0px -6% 0px" });
    for (var j = 0; j < nodes.length; j++) io.observe(nodes[j]);
  }
  var slot = document.querySelector(".phone-slot");
  var glow = document.querySelector(".glow");
  if (!slot || !glow) return;
  var pending = false;
  var y = 0;
  function apply() {
    pending = false;
    var shift = Math.max(-16, Math.min(16, y * -0.03));
    var extra = Math.max(-10, Math.min(10, y * -0.018));
    slot.style.transform = "translate3d(0," + shift + "px,0)";
    glow.style.transform = "translate3d(0," + extra + "px,0)";
  }
  window.addEventListener("scroll", function () {
    y = window.scrollY || 0;
    if (pending) return;
    pending = true;
    requestAnimationFrame(apply);
  }, { passive: true });
})();
  </script>
</body>
</html>
`;
