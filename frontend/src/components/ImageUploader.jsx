import { useState, useCallback, useRef } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';

export default function ImageUploader({ images = [], onChange, max = 8, label = "images", showMainLabel = false }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const addFiles = useCallback((files) => {
    const newImgs = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .slice(0, max - images.length)
      .map(f => ({ id: `${f.name}-${Date.now()}`, file: f, url: URL.createObjectURL(f), name: f.name }));
    onChange([...images, ...newImgs]);
  }, [images, onChange, max]);

  const remove = (id) => onChange(images.filter(img => img.id !== id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {images.length < max && (
        <div
          className={`image-drop-zone ${dragging ? 'dragging' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        >
          <input ref={inputRef} type="file" accept="image/*" multiple={max > 1} style={{ display: 'none' }}
            onChange={(e) => addFiles(e.target.files)} />
          <Upload size={18} style={{ color: 'var(--color-river-stone)', margin: '0 auto 8px' }} />
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Drop {label} here or <span style={{ color: 'var(--color-walnut)', textDecoration: 'underline', cursor: 'pointer' }}>browse</span>
          </p>
          <p style={{ fontSize: 11, color: 'var(--color-text-caption)', marginTop: 4 }}>
            Up to {max} {max === 1 ? 'file' : 'files'} · PNG, JPG, WebP
          </p>
        </div>
      )}
      {images.length > 0 && (
        <div className="image-grid">
          {images.map((img, idx) => (
            <div key={img.id} className="image-thumb" title={img.name}>
              {img.url ? (
                <img src={img.url} alt={img.name} />
              ) : (
                <div className="flex-center" style={{ width: '100%', height: '100%' }}>
                  <ImageIcon size={20} style={{ color: 'var(--color-river-stone)' }} />
                </div>
              )}
              {showMainLabel && idx === 0 && (
                <div style={{ position: 'absolute', top: 4, left: 4, background: 'var(--color-walnut)', color: 'white', fontSize: 9, fontWeight: 600, padding: '1px 5px', borderRadius: 2, letterSpacing: '0.05em' }}>
                  MAIN
                </div>
              )}
              <div className="image-thumb-actions">
                <button
                  onClick={(e) => { e.stopPropagation(); remove(img.id); }}
                  style={{ background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', borderRadius: 3, padding: 4, cursor: 'pointer', display: 'flex' }}
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
