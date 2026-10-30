const mark = `<svg class="mark" viewBox="0 0 36 36" width="36" height="36" aria-hidden="true">
  <rect width="36" height="36" rx="11" fill="#0B7A4B"/>
  <path d="M13 10v16M13 18.1 23.4 11M13 17.7 23.4 25" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const logo = `<div class="logo">${mark}<span>Kagua</span></div>`;

const pasteIcon = `<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="7" y="5" width="11" height="15" rx="2"/>
  <path d="M10 5.2h4M10 11h6M10 15h4"/>
</svg>`;

const scanIcon = (stroke: string, size: number) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M8 4H5v3M16 4h3v3M19 16v3h-3M5 16v3h3"/>
  <circle cx="12" cy="12" r="2.2" fill="${stroke}" stroke="none"/>
</svg>`;

const chatIcon = `<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M5 7.5A1.5 1.5 0 0 1 6.5 6h11A1.5 1.5 0 0 1 19 7.5v7a1.5 1.5 0 0 1-1.5 1.5H12l-4 3v-3H6.5A1.5 1.5 0 0 1 5 14.5z"/>
</svg>`;

const statusIcons = `<svg viewBox="0 0 68 16" width="68" height="16" aria-hidden="true">
  <rect x="0" y="9" width="3" height="5" rx="0.6" fill="#111111"/>
  <rect x="5" y="6" width="3" height="8" rx="0.6" fill="#111111"/>
  <rect x="10" y="3" width="3" height="11" rx="0.6" fill="#111111"/>
  <rect x="15" y="1" width="3" height="13" rx="0.6" fill="#111111"/>
  <path d="M26 11.5c1.6-1.4 3.6-1.4 5.2 0" fill="none" stroke="#111111" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M23.6 9.2c2.8-2.4 6.8-2.4 9.6 0" fill="none" stroke="#111111" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M21.4 6.8c4.2-3.4 10.2-3.4 14.4 0" fill="none" stroke="#111111" stroke-width="1.6" stroke-linecap="round"/>
  <rect x="44" y="3" width="18" height="10" rx="2" fill="none" stroke="#111111" stroke-width="1.4"/>
  <rect x="46" y="5" width="12" height="6" rx="1" fill="#111111"/>
  <rect x="62.5" y="6" width="1.6" height="4" rx="0.4" fill="#111111"/>
</svg>`;

const phone = `<div class="phone" role="img" aria-label="Phone showing a Kagua result. Stop. This address matches a frozen one.">
  <div class="screen">
    <div class="status"><span>12:30</span>${statusIcons}</div>
    <div class="greet">
      <div class="avatar">AK</div>
      <p>Welcome back 👋</p>
      <div class="scan">${scanIcon("#0B7A4B", 22)}</div>
    </div>
    <div class="card-slot">
      <div class="result">
        <p class="result-label">Result</p>
        <p class="result-level">Stop</p>
        <p class="result-why">This address matches a frozen one</p>
        <div class="detail">
          <span class="detail-mark" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"><rect x="5" y="4" width="14" height="16" rx="2"/><path d="M8 9h8M8 13h5"/></svg></span>
          <span>T9yK…m2Qa · frozen list</span>
        </div>
      </div>
    </div>
    <div class="actions">
      <div class="action"><div class="orb">${pasteIcon}</div><span>Paste</span></div>
      <div class="action"><div class="orb">${scanIcon("#FFFFFF", 26)}</div><span>Scan</span></div>
      <div class="action"><div class="orb">${chatIcon}</div><span>Chat</span></div>
    </div>
  </div>
</div>`;

const css = `
:root { color-scheme: light; }
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: #FFFFFF;
  color: #111111;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}
h1, h2, h3, p { margin: 0; }
a { color: inherit; }
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #0B7A4B;
  font-weight: 800;
  font-size: 26px;
  letter-spacing: -0.045em;
  line-height: 1;
}
.hero {
  position: relative;
  height: 100vh;
  min-height: 760px;
  overflow: hidden;
  background: #FFFFFF;
}
.blob {
  position: absolute;
  border-radius: 50%;
  background: #F4F6F5;
  pointer-events: none;
}
.blob-a { width: 560px; height: 560px; right: -70px; bottom: -200px; }
.blob-b { width: 280px; height: 280px; right: 300px; top: -40px; }
.hero-copy {
  position: relative;
  z-index: 2;
  padding: 48px 0 0 76px;
  max-width: 700px;
}
h1 {
  margin-top: 88px;
  font-size: 78px;
  line-height: 0.94;
  letter-spacing: -0.048em;
  font-weight: 800;
  color: #111111;
}
.sub {
  margin-top: 22px;
  max-width: 390px;
  font-size: 18px;
  line-height: 1.4;
  font-weight: 400;
  color: #111111;
}
.pills {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}
.pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  padding: 0 22px;
  border-radius: 999px;
  background: #111111;
  color: #FFFFFF;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.015em;
  text-decoration: none;
  white-space: nowrap;
}
.pill:focus-visible {
  outline: 3px solid #0B7A4B;
  outline-offset: 3px;
}
.note {
  margin-top: 14px;
  font-size: 14px;
  line-height: 1.4;
  color: #111111;
}
.phone {
  position: absolute;
  z-index: 1;
  top: 22px;
  right: 56px;
  width: 412px;
  height: 848px;
  background: #111111;
  border-radius: 50px;
  padding: 10px;
  box-shadow: 0 28px 60px rgba(17, 17, 17, 0.14);
}
.screen {
  height: 100%;
  background: #F4F6F5;
  border-radius: 40px;
  padding: 12px 14px 24px;
  overflow: hidden;
}
.status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px 0;
  color: #111111;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.greet {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 22px 8px 0;
}
.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #0B7A4B;
  color: #FFFFFF;
  display: grid;
  place-items: center;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.03em;
  flex: none;
}
.greet p {
  flex: 1;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #111111;
}
.scan {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: #FFFFFF;
  display: grid;
  place-items: center;
  flex: none;
}
.card-slot { position: relative; margin: 26px 4px 52px; }
.result {
  position: relative;
  background: #0B7A4B;
  color: #FFFFFF;
  border-radius: 30px;
  min-height: 430px;
  padding: 28px 26px 86px;
}
.result-label { font-size: 15px; font-weight: 600; }
.result-level {
  margin-top: 10px;
  font-size: 78px;
  line-height: 0.88;
  font-weight: 800;
  letter-spacing: -0.045em;
}
.result-why {
  margin-top: 14px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.02em;
  white-space: nowrap;
}
.detail {
  position: absolute;
  left: 20px;
  bottom: -34px;
  display: flex;
  align-items: center;
  gap: 12px;
  width: max-content;
  max-width: calc(100% - 28px);
  background: #FFFFFF;
  color: #111111;
  border-radius: 18px;
  padding: 12px 16px 12px 12px;
  box-shadow: 0 14px 30px rgba(17, 17, 17, 0.1);
}
.detail-mark {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #0B7A4B;
  display: grid;
  place-items: center;
  flex: none;
}
.detail span:last-child {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.actions {
  display: flex;
  justify-content: space-between;
  padding: 6px 18px 0;
}
.action {
  width: 86px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.orb {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #0B7A4B;
  display: grid;
  place-items: center;
}
.action span {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #111111;
}
.section { padding: 88px 76px 0; }
.inner { max-width: 1080px; margin: 0 auto; }
h2 {
  font-size: 42px;
  line-height: 1.05;
  font-weight: 800;
  letter-spacing: -0.04em;
}
.steps, .features {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 32px;
  margin-top: 36px;
  padding: 0;
  list-style: none;
}
.steps span {
  display: block;
  margin-bottom: 12px;
  color: #0B7A4B;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.04em;
}
.steps p, .features p {
  font-size: 18px;
  line-height: 1.35;
  font-weight: 600;
  letter-spacing: -0.02em;
  max-width: 28ch;
}
.features h3 {
  margin-bottom: 8px;
  font-size: 22px;
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: -0.03em;
}
.features p { font-weight: 400; font-size: 16px; line-height: 1.45; }
#how { scroll-margin-top: 24px; }
.footer { padding: 88px 76px 80px; }
.footer-inner { display: flex; flex-direction: column; align-items: flex-start; gap: 18px; }
.footer .tag {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.1;
}
.wired { font-size: 14px; line-height: 1.4; }
@media (max-width: 900px) {
  .hero { height: auto; min-height: 0; overflow: hidden; }
  .hero-copy { padding: 24px 20px 0; max-width: none; }
  h1 { margin-top: 28px; font-size: 42px; }
  .sub { max-width: 34ch; font-size: 16px; margin-top: 16px; }
  .pills { margin-top: 20px; }
  .pill { height: 52px; padding: 0 16px; }
  .phone {
    position: relative;
    top: auto;
    right: auto;
    width: min(360px, calc(100% - 32px));
    height: auto;
    margin: 20px auto 8px;
  }
  .screen { height: auto; }
  .greet { padding-top: 16px; }
  .card-slot { margin-top: 18px; margin-bottom: 46px; }
  .result { min-height: 0; padding: 22px 16px 72px; }
  .result-level { font-size: 64px; }
  .result-why { font-size: 13px; }
  .blob-a { width: 240px; height: 240px; right: -20px; bottom: 40px; }
  .blob-b { width: 120px; height: 120px; right: 16px; top: auto; bottom: 220px; }
  .section, .footer { padding-left: 20px; padding-right: 20px; }
  .section { padding-top: 56px; }
  .footer { padding-top: 56px; padding-bottom: 48px; }
  h2 { font-size: 32px; }
  .steps, .features { grid-template-columns: 1fr; gap: 28px; }
  .footer .tag { font-size: 28px; }
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
`;

export const pageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="description" content="Kagua checks addresses and chats in seconds, so you never have to wonder." />
  <title>Kagua — See the scam before it sees you</title>
  <link rel="icon" href="data:image/svg+xml,%3Csvg viewBox='0 0 36 36'%3E%3Crect width='36' height='36' rx='11' fill='%230B7A4B'/%3E%3C/svg%3E" />
  <style>${css}</style>
</head>
<body>
  <header class="hero">
    <div class="blob blob-a"></div>
    <div class="blob blob-b"></div>
    <div class="hero-copy">
      ${logo}
      <h1 id="headline">See the scam<br />before it<br />sees you</h1>
      <p class="sub">Kagua checks addresses and chats in seconds, so you never have to wonder.</p>
      <div class="pills">
        <a class="pill" href="mailto:waitlist@kagua.app?subject=Kagua%20waitlist">Join the waitlist</a>
        <a class="pill" href="#how">See how it works</a>
      </div>
      <p class="note">Android first. Works with no internet at check time.</p>
    </div>
    ${phone}
  </header>
  <main>
    <section class="section" id="how" aria-labelledby="how-title">
      <div class="inner">
        <h2 id="how-title">How it works</h2>
        <ol class="steps">
          <li><span>1</span><p>Paste or drop whatever you got</p></li>
          <li><span>2</span><p>Kagua reads it on your phone</p></li>
          <li><span>3</span><p>You get a straight answer: Stop, Check more or No flags found, with why</p></li>
        </ol>
      </div>
    </section>
    <section class="section" id="features" aria-labelledby="features-title">
      <div class="inner">
        <h2 id="features-title">What you can check</h2>
        <div class="features">
          <article>
            <h3>Address check</h3>
            <p>Paste an address. Kagua compares it with the frozen list.</p>
          </article>
          <article>
            <h3>Chat check</h3>
            <p>Drop a chat. Kagua reads it on your phone.</p>
          </article>
          <article>
            <h3>Works with no internet at check time</h3>
            <p>The check runs on the phone. No connection needed then.</p>
          </article>
        </div>
      </div>
    </section>
  </main>
  <footer class="footer">
    <div class="inner footer-inner">
      ${logo}
      <p class="tag">See the scam before it sees you.</p>
      <a class="pill" href="mailto:waitlist@kagua.app?subject=Kagua%20waitlist">Join the waitlist</a>
      <p class="wired">Placeholder. To be wired.</p>
    </div>
  </footer>
</body>
</html>
`;
