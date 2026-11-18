import { useState } from 'react';
import type { FormEvent } from 'react';
import { supportRequestsUrl } from '../api/endpoints';
import './SupportPage.css';

export default function SupportPage({ onBack }: { onBack: () => void }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setSending(true);
    setError('');
    try {
      const response = await fetch(supportRequestsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(values)),
      });
      if (!response.ok) throw new Error('Poruka nije poslana. Provjeri podatke i pokušaj ponovo.');
      setSent(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Poruka nije poslana.');
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="legal-page support-page">
      <section>
        <button type="button" onClick={onBack}>← Nazad</button>
        <h1>Kontaktiraj MAHALA tim</h1>
        <p>Za pomoć, sigurnosni problem ili prijavu zloupotrebe pošalji poruku našem timu. Prijave neprikladnog sadržaja pregledamo u roku od 24 sata.</p>
        <p>U aplikaciji možeš izabrati „Prijavi” na objavi ili komentaru. „Prijavi i blokiraj” odmah uklanja sadržaj tog korisnika iz tvog prikaza.</p>
        {sent ? <p role="status">Poruka je zaprimljena. Hvala što pomažeš da zajednica bude sigurna.</p> : (
          <form onSubmit={submit}>
            <label>Ime<input name="name" autoComplete="name" required maxLength={120} /></label>
            <label>Email za odgovor<input name="email" type="email" autoComplete="email" required maxLength={255} /></label>
            <label>Poruka<textarea name="message" required minLength={10} maxLength={5000} rows={7} placeholder="Opiši problem. Za prijavu navedi objavu ili komentar i gdje se nalazi." /></label>
            <p>Podatke iz ove poruke čuvamo radi obrade tvog zahtjeva. Detalji su u <a href="/privacy">Politici privatnosti</a>.</p>
            {error ? <p role="alert">{error}</p> : null}
            <button type="submit" disabled={sending}>{sending ? 'Slanje…' : 'Pošalji poruku'}</button>
          </form>
        )}
      </section>
    </main>
  );
}
