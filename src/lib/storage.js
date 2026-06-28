import { supabase } from './supabase.js'
import { evidenceFileError } from './constants.js'

// Upload a file to a bucket and return a usable URL.
// public-media → public URL; evidence → signed (private) URL.
export async function uploadFile(bucket, userId, file) {
  // Defense-in-depth: reject bad evidence files even if a caller skipped the UI check.
  if (bucket === 'evidence') {
    const bad = evidenceFileError(file)
    if (bad) throw new Error(bad === 'size' ? 'file-too-large' : 'file-type-unsupported')
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
