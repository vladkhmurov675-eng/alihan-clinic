'use client';

import Cropper, { Area } from 'react-easy-crop';
import { useState, useCallback } from 'react';
import { uploadFile } from '../../lib/r2';
import { updateDoctorAvatar, updateDoctorAvatarByAdmin } from '../../actions';

interface Props {
  doctorId: number;
  currentAvatar?: string | null;
  onUpload: (url: string) => void;
  onClose: () => void;
  isAdmin?: boolean;
}

async function getCroppedImg(imgSrc: string, croppedAreaPixels: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imgSrc;
  });

  const canvas = document.createElement('canvas');
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  ctx.drawImage(
    image,
    croppedAreaPixels.x, croppedAreaPixels.y,
    croppedAreaPixels.width, croppedAreaPixels.height,
    0, 0,
    croppedAreaPixels.width, croppedAreaPixels.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas is empty'));
    }, 'image/jpeg', 0.9);
  });
}

export default function AvatarUploadForm({ doctorId, currentAvatar, onUpload, onClose, isAdmin }: Props) {
  const [file, setFile] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(URL.createObjectURL(f));
  };

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedArea(croppedPixels);
  }, []);

  const onConfirm = async () => {
    if (!file || !croppedArea) return;
    setSaving(true);
    setError('');
    try {
      const blob = await getCroppedImg(file, croppedArea);
      const url = await uploadFile(new File([blob], 'avatar.jpg', { type: 'image/jpeg' }));

      if (isAdmin) {
        await updateDoctorAvatarByAdmin(doctorId, url);
      } else {
        await updateDoctorAvatar(url);
      }

      onUpload(url);
      onClose();
    } catch (err) {
    console.error('Avatar upload error:', err);
    if (err instanceof Error) {
      setError(`Ошибка: ${err.message}`);
    } else {
      setError('Ошибка загрузки фото. Попробуйте ещё раз.');
    }
  } finally {
    setSaving(false);
  }
};

  const resetFile = () => {
    setFile(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setError('');
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-primary)',
          borderRadius: 14, padding: '1.5rem',
          width: '100%', maxWidth: 440,
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0 }}>Загрузить фото</h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-muted)' }}
          >×</button>
        </div>

        {!file ? (
          <label style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '0.75rem', padding: '2.5rem 1rem',
            border: '2px dashed var(--border-color)', borderRadius: 10,
            cursor: 'pointer', color: 'var(--text-muted)',
            transition: 'border-color 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
          >
            <span style={{ fontSize: '2.5rem' }}>📷</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Нажмите чтобы выбрать фото</span>
            <span style={{ fontSize: '0.78rem' }}>JPG, PNG до 5 МБ</span>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChange} />
          </label>
        ) : (
          <>
            <div style={{
              position: 'relative', width: '100%', height: 300,
              borderRadius: 8, overflow: 'hidden', background: '#000',
            }}>
              <Cropper
                image={file}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                Масштаб
              </label>
              <input
                type="range" min={1} max={3} step={0.01}
                value={zoom}
                onChange={e => setZoom(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <button
              type="button"
              onClick={resetFile}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.5rem',
              }}
            >
              ← Выбрать другое фото
            </button>
          </>
        )}

        {error && (
          <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginTop: '0.75rem' }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
            Отмена
          </button>
          <button
            onClick={onConfirm}
            disabled={!file || saving}
            className={`btn ${!file || saving ? 'btn-disabled' : 'btn-primary'}`}
            style={{ flex: 1 }}
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}
