import SeoPageLayout from '../components/SeoPageLayout'

export default function Privacy() {
  return (
    <SeoPageLayout
      eyebrow="Privacy Policy"
      title="Privacy policy for PSL Rank."
      description="Read the PSL Rank privacy policy covering user submissions, usage data handled by the app, and service limitations."
    >
      <section>
        <h2>Overview</h2>
        <p>
          This page describes how PSL Rank handles information submitted through the app.
          PSL Rank is a ranking platform that allows users to vote on matchups, browse
          leaderboard data, and submit contender details.
        </p>
      </section>

      <section>
        <h2>Information you submit</h2>
        <p>
          PSL Rank may store information you submit through the app, such as contender
          names, aliases, taglines, image URLs, uploaded images, and voting outcomes.
          Please avoid submitting sensitive personal information.
        </p>
      </section>

      <section>
        <h2>How submitted information is used</h2>
        <ul>
          <li>To display contenders, profiles, and leaderboard rankings.</li>
          <li>To calculate and update ratings based on recorded matchups.</li>
          <li>To operate and maintain platform functionality.</li>
        </ul>
      </section>

      <section>
        <h2>Third-party services</h2>
        <p>
          PSL Rank may rely on hosting, storage, and backend providers to deliver the
          service. Those providers may process data as necessary to operate the platform.
        </p>
      </section>

      <section>
        <h2>Data quality and removal requests</h2>
        <p>
          If you believe content is inaccurate or should be reviewed, contact the site
          operator through the appropriate project channel or repository contact method.
          Responses are not guaranteed.
        </p>
      </section>

      <section>
        <h2>Policy updates</h2>
        <p>
          This policy may be updated over time as features change. The latest version
          available on this page applies.
        </p>
      </section>
    </SeoPageLayout>
  )
}

