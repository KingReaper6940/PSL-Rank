import SeoPageLayout from '../components/SeoPageLayout'

export default function Terms() {
  return (
    <SeoPageLayout
      eyebrow="Terms"
      title="Terms of use for PSL Rank."
      description="Terms for using PSL Rank, including acceptable use, content submission expectations, and service disclaimers."
    >
      <section>
        <h2>Acceptance of terms</h2>
        <p>
          By using PSL Rank, you agree to use the service in accordance with these
          terms. If you do not agree, you should stop using the service.
        </p>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <ul>
          <li>Do not submit unlawful or abusive content.</li>
          <li>Do not attempt to disrupt the app or backend services.</li>
          <li>Do not impersonate others or submit misleading information intentionally.</li>
        </ul>
      </section>

      <section>
        <h2>Content submissions</h2>
        <p>
          Users may submit contender information and images. You are responsible for the
          material you submit and should only submit content you have the right to share.
        </p>
      </section>

      <section>
        <h2>Ranking and availability disclaimers</h2>
        <p>
          Rankings are generated from platform logic and recorded votes and may change at
          any time. PSL Rank is provided on an as-available basis without guarantees of
          uptime, continuity, or outcome accuracy.
        </p>
      </section>

      <section>
        <h2>Changes to the service</h2>
        <p>
          Features, ranking logic details, and page content may change without notice as
          the project evolves.
        </p>
      </section>
    </SeoPageLayout>
  )
}

