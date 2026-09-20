import { createPortal } from 'react-dom';
import { isPlaceholder, type Project } from '../content';
import { useModal } from './useModal';

/**
 * The detail panel for one project.
 * Rendered with a portal straight into <body>, so it sits above the header and
 * chapter menu instead of being trapped inside the page's layer.
 */
export function ProjectDialog({ project, onClose }: { project: Project; onClose: () => void }) {
  const { panelRef, initialFocus } = useModal(onClose);
  const hasLink = !isPlaceholder(project.link.href);

  return createPortal(
    <div className="dialog-backdrop dialog-backdrop--top" onClick={onClose}>
      <div
        ref={panelRef}
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        style={{ '--accent': project.accent } as React.CSSProperties}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog__bar" />
        <div className="dialog__body">
          <div className="dialog__head">
            <div>
              <span className="dialog__meta">{project.num} · {project.kind}</span>
              <h3 id="dialog-title" className="dialog__title">{project.title}</h3>
              <span className="dialog__tagline">{project.tagline}</span>
            </div>
            <button ref={initialFocus} className="dialog__close" onClick={onClose} aria-label="Close">
              <CloseIcon />
            </button>
          </div>
          <div className="dialog__grid">
            <div><span className="dialog__label">THE PROBLEM</span><p>{project.problem}</p></div>
            <div><span className="dialog__label">WHAT I BUILT</span><p>{project.built}</p></div>
            <div><span className="dialog__label">THE HARD PART</span><p>{project.hard}</p></div>
          </div>
          <div className="dialog__foot">
            <span className="dialog__stack">{project.stack.join(' · ')}</span>
            {hasLink
              ? <a className="dialog__link" href={project.link.href} target="_blank" rel="noopener">{project.link.label} →</a>
              : <span className="dialog__soon">LINK COMING SOON</span>}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <path d="M5 5 19 19M19 5 5 19" />
    </svg>
  );
}
