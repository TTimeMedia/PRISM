import { APP_NAME, APP_TAGLINE } from '@prism/config';
import styles from './page.module.css';

/**
 * The PRISM marketing homepage. Copy mirrors the approved website hero
 * and manifesto sections in docs/PRODUCT_BIBLE.md §4-5 — do not
 * rewrite it into clinical language. This is intentionally the only
 * page built in Foundation; an account/data portal is a later, separate
 * decision (see docs/BUILD_STATUS.md).
 */
export default function Home() {
  return (
    <div className={styles.page}>
      <main>
        <section className={styles.hero}>
          <div
            className={styles.spectrumBar}
            aria-hidden="true"
            style={{
              background:
                'linear-gradient(90deg, var(--prism-cyan), var(--prism-pink), var(--prism-violet), var(--prism-mint), var(--prism-yellow))',
            }}
          />
          <p className={styles.wordmark}>{APP_NAME}</p>
          <h1 className={styles.tagline}>{APP_TAGLINE}</h1>
          <p className={styles.subhead}>
            A private, personalized space for managing and documenting your gender-affirming
            journey.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>There&rsquo;s no right way to transition.</h2>
          <div className={styles.sectionBody}>
            <p>Some people take hormones. Some don&rsquo;t.</p>
            <p>Some have surgery. Some don&rsquo;t.</p>
            <p>Some change their name. Some don&rsquo;t.</p>
            <p>Some know exactly what they want. Others are still figuring things out.</p>
            <p style={{ marginTop: 12, color: 'var(--prism-text-primary)' }}>
              PRISM adapts to every journey.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Everything that matters. Nothing that doesn&rsquo;t.
          </h2>
          <div className={styles.sectionBody}>
            <p>PRISM builds itself around what you choose to track.</p>
            <p>Medication. Appointments. Milestones. Journal entries. Memories.</p>
            <p style={{ marginTop: 12, color: 'var(--prism-text-primary)' }}>
              Or none of those. You decide.
            </p>
          </div>
        </section>
      </main>
      <footer className={styles.footer}>{APP_NAME} — pre-development.</footer>
    </div>
  );
}
