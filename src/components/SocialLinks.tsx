import { HIMAT_LINKS } from '../lib/links';

interface SocialLinksProps {
  className?: string;
  compact?: boolean;
}

export function SocialLinks({ className = '', compact = false }: SocialLinksProps) {
  return (
    <nav
      className={`social-links${compact ? ' social-links--compact' : ''} ${className}`.trim()}
      aria-label="HiMat Technology on social media"
    >
      <a
        className="social-link"
        href={HIMAT_LINKS.facebook}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="HiMat Technology on Facebook"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
          <path
            fill="currentColor"
            d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z"
          />
        </svg>
        {!compact ? <span>Facebook</span> : null}
      </a>
      <a
        className="social-link"
        href={HIMAT_LINKS.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="HiMat Technology on LinkedIn"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
          <path
            fill="currentColor"
            d="M6.5 8.5A2 2 0 1 1 6.5 4.5a2 2 0 0 1 0 4zm.1 2.2H4.4V20h2.2V10.7zM13.7 10.5c-1.2 0-2 .6-2.3 1.1V10.7H9.2c0 .3-.1 9.3-.1 9.3h2.2v-5.2c0-.3.1-.6.2-.8.3-.6.9-1.2 1.9-1.2 1.3 0 1.8.9 1.8 2.3V20h2.2v-5.5c0-2.9-1.5-4-3.7-4z"
          />
        </svg>
        {!compact ? <span>LinkedIn</span> : null}
      </a>
      <a
        className="social-link"
        href={HIMAT_LINKS.instagram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="HiMat Technology on Instagram"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
          <path
            fill="currentColor"
            d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2zM17.4 6.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0zM12 3.5c-2.3 0-2.6 0-3.5.1-.9.1-1.5.2-2 .4a4 4 0 0 0-1.5 1 4 4 0 0 0-1 1.5c-.2.5-.3 1.1-.4 2-.1.9-.1 1.2-.1 3.5s0 2.6.1 3.5c.1.9.2 1.5.4 2a4 4 0 0 0 1 1.5 4 4 0 0 0 1.5 1c.5.2 1.1.3 2 .4.9.1 1.2.1 3.5.1s2.6 0 3.5-.1c.9-.1 1.5-.2 2-.4a4 4 0 0 0 1.5-1 4 4 0 0 0 1-1.5c.2-.5.3-1.1.4-2 .1-.9.1-1.2.1-3.5s0-2.6-.1-3.5c-.1-.9-.2-1.5-.4-2a4 4 0 0 0-1-1.5 4 4 0 0 0-1.5-1c-.5-.2-1.1-.3-2-.4-.9-.1-1.2-.1-3.5-.1zm0 1.5c2.3 0 2.5 0 3.4.1.8 0 1.2.2 1.5.3.4.1.6.3.9.6.3.3.5.5.6.9.1.3.2.7.3 1.5.1.9.1 1.1.1 3.4s0 2.5-.1 3.4c0 .8-.2 1.2-.3 1.5-.1.4-.3.6-.6.9-.3.3-.5.5-.9.6-.3.1-.7.2-1.5.3-.9.1-1.1.1-3.4.1s-2.5 0-3.4-.1c-.8 0-1.2-.2-1.5-.3-.4-.1-.6-.3-.9-.6-.3-.3-.5-.5-.6-.9-.1-.3-.2-.7-.3-1.5-.1-.9-.1-1.1-.1-3.4s0-2.5.1-3.4c0-.8.2-1.2.3-1.5.1-.4.3-.6.6-.9.3-.3.5-.5.9-.6.3-.1.7-.2 1.5-.3.9-.1 1.1-.1 3.4-.1z"
          />
        </svg>
        {!compact ? <span>Instagram</span> : null}
      </a>
    </nav>
  );
}
