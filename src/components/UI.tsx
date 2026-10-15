// Primitivos de UI reutilizáveis.
import { useEffect, type ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function Empty({ icon, title, hint, action }: { icon: string; title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <div className="big" aria-hidden>{icon}</div>
      <strong>{title}</strong>
      {hint ? <p className="muted">{hint}</p> : null}
      {action ? <div style={{ marginTop: 12 }}>{action}</div> : null}
    </div>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);
  return (
    <div className="modal-back" onClick={onClose} role="presentation">
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button className="btn ghost" onClick={onClose} aria-label="Fechar">✕</button>
        </div>
        <div style={{ marginTop: 12 }}>{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className="field">
      <label>
        {label}
        <span style={{ display: 'block', marginTop: 6 }}>{children}</span>
      </label>
      {error ? <span className="err" role="alert">{error}</span> : null}
    </div>
  );
}

export function Progress({ percent }: { percent: number }) {
  return (
    <div className="progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
      <div style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
    </div>
  );
}

export function Avatar({ src, name, large }: { src?: string; name: string; large?: boolean }) {
  if (src) return <img src={src} alt={name} className={`avatar${large ? ' lg' : ''}`} />;
  const initials = name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '💗';
  return <span className={`avatar${large ? ' lg' : ''}`} aria-label={name}>{initials}</span>;
}

export function Stars({ value, onChange, label }: { value?: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="stars" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" className={n <= (value ?? 0) ? 'on' : ''} onClick={() => onChange(n)} aria-label={`${n} estrelas`}>
          ⭐
        </button>
      ))}
    </div>
  );
}

export function fileToDataURL(file: File, maxKB = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, Math.sqrt((maxKB * 1024) / Math.max(1, file.size)));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => reject(new Error('Imagem inválida'));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}
