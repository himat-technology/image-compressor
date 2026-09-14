export function HowItWorks() {
  return (
    <section className="how-it-works" aria-labelledby="how-heading">
      <div className="section-heading">
        <h2 id="how-heading">How to compress &amp; convert images</h2>
        <p>Upload → Configure → Process → Preview → Download</p>
      </div>
      <ol className="steps">
        <li>
          <span className="steps__num">1</span>
          <div>
            <h3>Upload or drag images</h3>
            <p>
              Select single or multiple JPEG, PNG, WebP, or AVIF files, or drop
              them into the upload zone.
            </p>
          </div>
        </li>
        <li>
          <span className="steps__num">2</span>
          <div>
            <h3>Adjust quality &amp; format</h3>
            <p>
              Choose WebP, JPEG, PNG, or AVIF, set quality, and optionally limit
              max width and height.
            </p>
          </div>
        </li>
        <li>
          <span className="steps__num">3</span>
          <div>
            <h3>Preview &amp; download</h3>
            <p>
              Compare original and compressed previews, then download files
              individually or as a ZIP. Copy Base64 when needed.
            </p>
          </div>
        </li>
      </ol>
    </section>
  );
}
