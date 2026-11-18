import { X } from 'lucide-react';
import './ChildSafetyPage.css';

export default function ChildSafetyPage({ onBack }: { onBack: () => void }) {
  return (
    <main className="child-safety-page">
      <header className="cs-header-row">
        <button className="cs-close-button" type="button" onClick={onBack} aria-label="Zatvori">
          <X size={18} />
        </button>
        <div className="cs-brand">MAHALA · qla.dev</div>
        <h1>Standardi zaštite djece<br />Child Safety Standards</h1>
        <p className="cs-muted">Posljednja izmjena / Last updated: 17. 11. 2026.</p>
        <nav className="cs-lang-nav">
          <a href="#bs">Bosanski</a>
          <a href="#en">English</a>
        </nav>
      </header>

      <section className="cs-lang-section" id="bs" lang="bs">
        <p>MAHALA je aplikacija lokalne zajednice koju razvija i održava <strong>qla.dev</strong>. Imamo <strong>nultu toleranciju</strong> prema seksualnom zlostavljanju i iskorištavanju djece (CSAE), uključujući materijal sa seksualnim zlostavljanjem djece (CSAM). Ovi standardi važe za sve korisnike i sav sadržaj u aplikaciji MAHALA.</p>

        <h2>Šta je zabranjeno</h2>
        <ul>
          <li>Materijal sa seksualnim zlostavljanjem djece (CSAM), u bilo kojem obliku: slika, video, tekst ili link.</li>
          <li>Svaki sadržaj koji seksualizira maloljetnike.</li>
          <li>Grooming: kontaktiranje ili pridobijanje maloljetnika radi seksualnog iskorištavanja.</li>
          <li>Seksualna iznuda (sextortion) i trgovina djecom.</li>
          <li>Promoviranje, traženje ili dijeljenje takvog sadržaja, ili upućivanje na mjesta gdje se može naći.</li>
        </ul>
        <p>Zabrana važi za objave, komentare, teme, slike, profile i korisnička imena.</p>

        <h2>Ko može koristiti MAHALU</h2>
        <p>MAHALA je namijenjena osobama od 13 godina i starijim.</p>

        <h2>Kako sprječavamo takav sadržaj</h2>
        <ul>
          <li>Prije objave, svaka objava (tekst i slika) i svaki komentar prolaze automatsku provjeru. Sadržaj sa seksualnim sadržajem koji uključuje maloljetnike se odbija i ne objavljuje.</li>
          <li>Prijave korisnika pregledava moderator.</li>
        </ul>

        <h2>Kako prijaviti</h2>
        <ul>
          <li><strong>U aplikaciji:</strong> na svakoj objavi i komentaru postoji dugme <strong>„Prijavi"</strong>. Napiši razlog prijave. Prijavom se autor ujedno blokira za tebe.</li>
          <li><strong>E-mailom:</strong> <a href="mailto:info@qla.dev">info@qla.dev</a>, i ako nemaš nalog.</li>
          <li>Prijave pregledavamo u roku od 24 sata.</li>
        </ul>
        <div className="cs-box">Ako je dijete u neposrednoj opasnosti, odmah pozovi policiju (u Bosni i Hercegovini: <strong>122</strong>).</div>

        <h2>Šta radimo kad saznamo za takav sadržaj</h2>
        <ul>
          <li>Odmah uklanjamo sadržaj iz aplikacije.</li>
          <li>Suspendujemo nalog autora, odjavljujemo ga sa svih uređaja i skrivamo sav njegov sadržaj.</li>
          <li>Čuvamo zapise koliko je potrebno za istragu. Nisu javno dostupni.</li>
          <li>Materijal sa seksualnim zlostavljanjem djece prijavljujemo nadležnim organima u Bosni i Hercegovini, a gdje je primjenjivo i organizaciji NCMEC (CyberTipline). Sarađujemo s organima za provođenje zakona.</li>
        </ul>

        <h2>Usklađenost sa zakonima</h2>
        <p>Pridržavamo se zakona o zaštiti djece koji važe u Bosni i Hercegovini i u zemljama u kojima je MAHALA dostupna.</p>

        <h2>Kontakt za zaštitu djece</h2>
        <p>qla.dev, <a href="mailto:info@qla.dev">info@qla.dev</a>. Ova osoba je zadužena za pitanja o sprječavanju materijala sa seksualnim zlostavljanjem djece u aplikaciji MAHALA.</p>
      </section>

      <section className="cs-lang-section" id="en" lang="en">
        <p>MAHALA is a local community app developed and operated by <strong>qla.dev</strong>. We have <strong>zero tolerance</strong> for child sexual abuse and exploitation (CSAE), including child sexual abuse material (CSAM). These standards apply to all users and all content in the MAHALA app.</p>

        <h2>What is prohibited</h2>
        <ul>
          <li>Child sexual abuse material (CSAM) in any form: images, video, text or links.</li>
          <li>Any content that sexualises minors.</li>
          <li>Grooming: contacting or befriending a minor with the intent of sexual exploitation.</li>
          <li>Sextortion and child trafficking.</li>
          <li>Promoting, requesting or sharing such content, or pointing to where it can be found.</li>
        </ul>
        <p>This applies to posts, comments, topics, images, profiles and usernames.</p>

        <h2>Who can use MAHALA</h2>
        <p>MAHALA is intended for people aged 13 and older.</p>

        <h2>How we prevent it</h2>
        <ul>
          <li>Before publishing, every post (text and image) and every comment goes through an automated check. Sexual content involving minors is rejected and not published.</li>
          <li>User reports are reviewed by a moderator.</li>
        </ul>

        <h2>How to report</h2>
        <ul>
          <li><strong>In the app:</strong> every post and comment has a <strong>"Prijavi" (Report)</strong> button. Enter the reason. Reporting also blocks the author for you.</li>
          <li><strong>By email:</strong> <a href="mailto:info@qla.dev">info@qla.dev</a>, also if you do not have an account.</li>
          <li>We review reports within 24 hours.</li>
        </ul>
        <div className="cs-box">If a child is in immediate danger, call the police right away (in Bosnia and Herzegovina: <strong>122</strong>).</div>

        <h2>What we do when we learn about such content</h2>
        <ul>
          <li>We remove the content from the app immediately.</li>
          <li>We suspend the author's account, sign it out on all devices and hide all of its content.</li>
          <li>We keep records for as long as needed for an investigation. They are not public.</li>
          <li>We report child sexual abuse material to the relevant authorities in Bosnia and Herzegovina and, where applicable, to NCMEC (CyberTipline). We cooperate with law enforcement.</li>
        </ul>

        <h2>Compliance with laws</h2>
        <p>We comply with the child safety laws that apply in Bosnia and Herzegovina and in the countries where MAHALA is available.</p>

        <h2>Child safety contact</h2>
        <p>qla.dev, <a href="mailto:info@qla.dev">info@qla.dev</a>. This contact is responsible for questions about how MAHALA prevents child sexual abuse material.</p>
      </section>
    </main>
  );
}
