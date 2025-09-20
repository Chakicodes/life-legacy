'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Container } from '@/components/Container';
import { RequireAuth } from '@/components/RequireAuth';
import { Button } from '@/components/Button';
import { ImageUploader } from '@/components/ImageUploader';
import { DocumentUploader } from '@/components/DocumentUploader';

type Memory = {
  id: string;
  title: string;
  body: string | null;
  created_at: string;
  updated_at: string;
};

export default function MemoryDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id as string;

  const [item, setItem] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);

  type MemImage = { id: string; path: string; url: string | null };
  const [images, setImages] = useState<MemImage[]>([]);
  const [imgLoading, setImgLoading] = useState(false);

  type MemDoc = { id: string; path: string; url: string | null };

  const [docs, setDocs] = useState<MemDoc[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);

  const loadImages = useCallback(async (memoryId: string) => {
    setImgLoading(true);
    const { data, error } = await supabase
      .from('memory_files')
      .select('id, path')
      .eq('memory_id', memoryId)
      .ilike('mime_type', 'image/%')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setImages([]);
      setImgLoading(false);
      return;
    }

    const rows = data ?? [];
    const results: MemImage[] = await Promise.all(
      rows.map(async (row) => {
        const { data: signed, error: signErr } = await supabase.storage
          .from('memories')
          .createSignedUrl(row.path, 60 * 10);
        return {
          id: row.id,
          path: row.path,
          url: signErr ? null : (signed?.signedUrl ?? null),
        } as MemImage;
      }),
    );

    setImages(results);
    setImgLoading(false);
  }, []);

  const loadDocs = useCallback(async (memoryId: string) => {
    setDocsLoading(true);

    const { data, error } = await supabase
      .from('memory_files')
      .select('id, path, mime_type')
      .eq('memory_id', memoryId)
      .not('mime_type', 'ilike', 'image/%') // viss, kas nav image/*
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setDocs([]);
      setDocsLoading(false);
      return;
    }

    const rows = data ?? [];
    const results: MemDoc[] = await Promise.all(
      rows.map(async (row) => {
        const { data: signed, error: signErr } = await supabase.storage
          .from('memories')
          .createSignedUrl(row.path, 60 * 10);
        return {
          id: row.id,
          path: row.path,
          url: signErr ? null : (signed?.signedUrl ?? null),
        } as MemDoc;
      }),
    );

    setDocs(results);
    setDocsLoading(false);
  }, []);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);

      const { data, error } = await supabase
        .from('memories')
        .select('id, title, body, created_at, updated_at')
        .eq('id', id)
        .maybeSingle();

      if (!active) return;
      if (error) {
        console.error(error);
      }
      setItem(data ?? null);
      setLoading(false);
      if (data) {
        await Promise.all([loadImages(id), loadDocs(id)]);
      }
    }

    if (id) load();

    return () => {
      active = false;
    };
  }, [id, loadImages, loadDocs]);

  async function onDelete() {
    if (!item) return;
    const ok = confirm('Delete this memory? This cannot be undone.');
    if (!ok) return;

    const { error } = await supabase.from('memories').delete().eq('id', item.id);
    if (error) {
      alert(error.message);
      return;
    }
    router.push('/memories');
  }

  async function deleteImage(img: MemImage) {
    const ok = confirm('Delete this photo? This cannot be undone.');
    if (!ok) return;

    // 1) Dzēšam no Storage
    const { error: storageErr } = await supabase.storage.from('memories').remove([img.path]);

    if (storageErr) {
      alert(storageErr.message);
      return;
    }

    // 2) Dzēšam metadatus no DB
    const { error: dbErr } = await supabase.from('memory_files').delete().eq('id', img.id);

    if (dbErr) {
      alert(dbErr.message);
      return;
    }

    // 3) Atjaunojam UI lokāli
    setImages((prev) => prev.filter((x) => x.id !== img.id));
  }

  async function deleteDoc(doc: MemDoc) {
    const ok = confirm('Delete this document? This cannot be undone.');
    if (!ok) return;

    // 1) storage
    const { error: storageErr } = await supabase.storage.from('memories').remove([doc.path]);
    if (storageErr) {
      alert(storageErr.message);
      return;
    }

    // 2) DB
    const { error: dbErr } = await supabase.from('memory_files').delete().eq('id', doc.id);
    if (dbErr) {
      alert(dbErr.message);
      return;
    }

    // 3) UI
    setDocs((prev) => prev.filter((x) => x.id !== doc.id));
  }

  return (
    <RequireAuth>
      <Container className="py-16">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/memories" className="text-sm text-blue-600 hover:underline">
            ← Back
          </Link>

          <div className="flex items-center gap-2">
            <Link href={`/memories/${id}/edit`} className="text-sm text-blue-600 hover:underline">
              Edit
            </Link>
            <Button variant="secondary" onClick={onDelete}>
              Delete
            </Button>
          </div>
        </div>

        {loading && <p className="text-sm text-gray-600">Loading…</p>}

        {!loading && !item && (
          <p className="text-sm text-red-600">Memory not found or you have no access.</p>
        )}

        {item && (
          <>
            <article className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h1 className="text-2xl font-semibold tracking-tight">{item.title}</h1>
                <div className="shrink-0 text-right">
                  <time dateTime={item.created_at} className="block text-xs text-gray-500">
                    Created: {new Date(item.created_at).toLocaleString()}
                  </time>
                  {item.updated_at !== item.created_at && (
                    <time dateTime={item.updated_at} className="block text-xs text-gray-500">
                      Last updated: {new Date(item.updated_at).toLocaleString()}
                    </time>
                  )}
                </div>
              </div>
              {item.body ? (
                <p className="text-sm leading-6 text-gray-800 whitespace-pre-wrap">{item.body}</p>
              ) : (
                <p className="text-sm text-gray-600 italic">No message.</p>
              )}
            </article>

            <div className="mt-8 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Photos</h2>
                <button
                  className="text-sm text-blue-600 hover:underline"
                  onClick={() => loadImages(item.id)}
                  disabled={imgLoading}
                >
                  {imgLoading ? 'Refreshing…' : 'Refresh'}
                </button>
              </div>

              <ImageUploader memoryId={item.id} onUploaded={() => loadImages(item.id)} />

              {images.length === 0 ? (
                <p className="text-sm text-gray-600">No photos yet.</p>
              ) : (
                <ul className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {images.map((img) => (
                    <li
                      key={img.id}
                      className="aspect-square overflow-hidden rounded-md border bg-gray-50"
                    >
                      <div className="relative h-full w-full">
                        {img.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={img.url}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                            (no preview)
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteImage(img)}
                          className="absolute right-1 top-1 rounded bg-white/80 px-2 py-0.5 text-xs text-red-600 shadow hover:bg-white"
                          aria-label="Delete photo"
                          title="Delete photo"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="mt-10 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Documents</h2>
                <button
                  className="text-sm text-blue-600 hover:underline"
                  onClick={() => item && loadDocs(item.id)}
                  disabled={docsLoading}
                >
                  {docsLoading ? 'Refreshing…' : 'Refresh'}
                </button>
              </div>

              <DocumentUploader memoryId={item.id} onUploaded={() => loadDocs(item.id)} />

              {docs.length === 0 ? (
                <p className="text-sm text-gray-600">No documents yet.</p>
              ) : (
                <ul className="mt-3 divide-y rounded-md border">
                  {docs.map((doc) => {
                    const fileName = doc.path.split('/').pop() ?? doc.path;
                    return (
                      <li key={doc.id} className="flex items-center justify-between gap-3 p-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{fileName}</p>
                          {doc.url ? (
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Download / Open
                            </a>
                          ) : (
                            <span className="text-xs text-gray-500">(no link)</span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => deleteDoc(doc)}
                          className="rounded bg-white px-2 py-1 text-xs text-red-600 shadow hover:bg-gray-50"
                        >
                          Delete
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </>
        )}
      </Container>
    </RequireAuth>
  );
}
