import { createPortal } from 'react-dom';
import type { Project } from '../content';
import { useModal } from './useModal';
import { ProjectArt } from './ProjectArt';
import { CloseIcon } from './ProjectDialog';

/**
 * "View more projects": every project in a grid, over a blurred page.
 * Clicking a project opens its detail dialog on top of this one.
 */
export function AllProjects({ items, onOpen, onClose }: {
  items: Project[];
  onOpen: (index: number) => void;
  onClose: () => void;
}) {
  const { panelRef, initialFocus } = useModal(onClose);

  return createPortal(
    <div className="dialog-backdrop dialog-backdrop--blur" onClick={onClose}>
      <div
        ref={panelRef}
        className="all-projects"
        role="dialog"
        aria-modal="true"
        aria-labelledby="all-projects-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="all-projects__head">
          <div>
            <span className="kicker">ARCHIVE</span>
            <h3 id="all-projects-title" className="all-projects__title">ALL PROJECTS</h3>
          </div>
          <button ref={initialFocus} className="dialog__close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        <div className="all-projects__grid">
          {items.map((p, i) => (
            <button
              key={p.num}
              type="button"
              className="mini-card"
              style={{ '--accent': p.accent, animationDelay: `${i * 40}ms` } as React.CSSProperties}
              onClick={() => onOpen(i)}
              aria-haspopup="dialog"
            >
              <span className="mini-card__art"><ProjectArt num={p.num} /></span>
              <span className="mini-card__body">
                <span className="mini-card__top">
                  <span className="mini-card__num">{p.num}</span>
                  <span className="mini-card__kind">{p.tag}</span>
                </span>
                <span className="mini-card__title">{p.title}</span>
                <span className="mini-card__tagline">{p.tagline}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
