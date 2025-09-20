'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

function sanitizeFileName(name: string): string {
  // 1) Normalize and strip diacritics (ā, ē, ķ, etc.)
  const noDiacritics = name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  // 2) Replace whitespace with underscore
  const underscored = noDiacritics.replace(/\s+/g, '_');
  // 3) Remove any characters not allowed (keep letters, numbers, dot, dash, underscore)
  let cleaned = underscored.replace(/[^a-zA-Z0-9._-]/g, '');
  // 4) Fallback name if empty
  if (!cleaned) cleaned = 'file';
  // 5) Preserve extension if it was stripped
  const originalExt = name.split('.').pop() || '';
  if (originalExt && !cleaned.toLowerCase().endsWith('.' + originalExt.toLowerCase())) {
    if (!/\.[a-zA-Z0-9]{1,10}$/.test(cleaned)) {
      cleaned += '.' + originalExt.replace(/[^a-zA-Z0-9]/g, '');
    }
  }
  // 6) Lowercase & reasonable length
  cleaned = cleaned.toLowerCase().slice(0, 180);
  return cleaned;
}

type Props = {
  memoryId: string;
  onUploaded?: () => void; // izsauksim, lai vecāks var atsvaidzināt sarakstu
  // (vēlāk varēsi padot arī maxSizeBytes u.c.)
};

const ACCEPT =
  '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export function DocumentUploader({ memoryId, onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const inputEl = e.currentTarget; // saglabājam pirms await
    const file = inputEl.files?.[0];
    if (!file) return;

    // Ātra tipa pārbaude
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|docx?|DOCX?)$/)) {
      alert('Please choose a PDF or Word document.');
      return;
    }

    // (Pēc izvēles) izmēra ierobežojums, piem., 20 MB
    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert('File is too large (max 20 MB).');
      return;
    }

    setUploading(true);
    try {
      // 1) Paņem lietotāja UID
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData.user) {
        alert('Please sign in first.');
        return;
      }
      const uid = userData.user.id;

      // 2) Ceļš bucketā: user/<uid>/mem_<id>/timestamp_filename
      const safeName = sanitizeFileName(file.name);
      const path = `user/${uid}/mem_${memoryId}/${Date.now()}_${safeName}`;

      // 3) Augšupielāde
      const { error: upErr } = await supabase.storage.from('memories').upload(path, file, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });

      if (upErr) {
        console.error(upErr);
        alert(upErr.message);
        return;
      }

      // 4) Metadati DB
      const { error: metaErr } = await supabase.from('memory_files').insert({
        memory_id: memoryId,
        user_id: uid,
        bucket: 'memories',
        path,
        mime_type: file.type || 'application/octet-stream',
        size_bytes: file.size,
      });

      if (metaErr) {
        console.error(metaErr);
        alert(metaErr.message);
        return;
      }

      // 5) Notīram inputu un paziņojam vecākam
      inputEl.value = '';
      onUploaded?.();
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium">Add document</label>
      <input
        type="file"
        accept={ACCEPT}
        onChange={handleChange}
        disabled={uploading}
        className="text-sm"
      />
      {uploading && <span className="text-xs text-gray-500">Uploading…</span>}
    </div>
  );
}
