import { supabase } from './supabase.js'
import { evidenceFileError } from './constants.js'
import { DEMO } from './demo.js'

// Upload a file to a bucket and return a usable URL.
// public-media → public URL; evidence → signed (private) URL.
export async function uploadFile(bucket, userId, file) {
  // Defense-in-depth: reject bad evidence files even if a caller skipped the UI check.
  if (bucket === 'evidence') {
    const bad = evidenceFileError(file)
    if (bad) throw new Error(bad === 'size' ? 'file-too-large' : 'file-type-unsupported')
  }
  // DEMO has no Supabase client (supabase === null) — without this guard the
  // demo build white-screens the moment a file is chosen in Evidence Capture or
  // the radar photo fill. Return a local object URL so the upload→preview→save
  // flow works end-to-end against fixtures. (Validation above still applies.)
  if (DEMO) {
    return { path: `demo/${Date.now()}_${file.name.replace(/[^\w.\-]+/g, '_')}`, url: URL.createObjectURL(file) }
  }
  const safe = file.name.replace(/[^\w.\-]+/g, '_')
  const path = `${userId}/${Date.now()}_${safe}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false })
  if (error) throw error
  if (bucket === 'public-media') {
    return { path, url: supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl }
  }
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24 * 7)
  return { path, url: data?.signedUrl }
}
