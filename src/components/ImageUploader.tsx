'use client';

function sanitizeFileName(name: string): string {
  const noDiacritics = name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  const underscored = noDiacritics.replace(/\s+/g, '_');
  let cleaned = underscored.replace(/[^a-zA-Z0-9._-]/g, '');
  if (!cleaned) cleaned = 'file';
  const originalExt = name.split('.').pop() || '';
  if (originalExt && !cleaned.toLowerCase().endsWith('.' + originalExt.toLowerCase())) {
    if (!/\.[a-zA-Z0-9]{1,10}$/.test(cleaned)) {
      cleaned += '.' + originalExt.replace(/[^a-zA-Z0-9]/g, '');
    }
  }
  cleaned = cleaned.toLowerCase().slice(0, 180);
  return cleaned;
}

import { useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Props = {
  memoryId: string;
  onUploaded?: () => void; // izsauksim, lai vecāks var atjaunot sarakstu
};

export function ImageUploader({ memoryId, onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const inputEl = e.currentTarget; // capture reference before awaits
    const file = inputEl.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file.');
      return;
    }

    setUploading(true);

    try {
      // 1) Paņemam lietotāja UID
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData.user) {
        alert('Please sign in first.');
        return;
      }
      const uid = userData.user.id;

      // 2) Izveidojam ceļu bucketā: user/<uid>/mem_<id>/timestamp_filename
      const safeName = sanitizeFileName(file.name);
      const path = `user/${uid}/mem_${memoryId}/${Date.now()}_${safeName}`;

      // 3) Augšupielāde uz bucket `memories`
      const { error: upErr } = await supabase.storage.from('memories').upload(path, file, {
        contentType: file.type,
        upsert: false,
      });

      if (upErr) {
        console.error(upErr);
        alert(upErr.message);
        return;
      }

      // 4) Pierakstām metadatus tabulā `memory_files`
      const { error: metaErr } = await supabase.from('memory_files').insert({
        memory_id: memoryId,
        user_id: uid,
        bucket: 'memories',
        path,
        mime_type: file.type,
        size_bytes: file.size,
      });

      if (metaErr) {
        console.error(metaErr);
        alert(metaErr.message);
        return;
      }

      // 5) Notīrām file input un paziņojam vecākam
      if (inputEl) inputEl.value = '';
      onUploaded?.();
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium">Add photo</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="text-sm"
      />
      {uploading && <span className="text-xs text-gray-500">Uploading…</span>}
    </div>
  );
}
