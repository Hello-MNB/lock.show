// GENERATED — do not hand-edit; source docs/registry/F1.csv; regenerate via
// `node scripts/generate-registry-data.mjs` (npm script TBD by orchestrator).
// R-6 phase 1 (§16.A.5b) — one row per FIELD × SOURCE in F1.csv, aggregated
// here to one record per field_id. See scripts/generate-registry-data.mjs
// for the exact column mapping + aggregation rule (representative row =
// strongest evidence_ceiling available for that field).
// FIREWALL: no score / rank / % / weight numbers anywhere in this file.
// why_key is an i18n KEY ONLY — never store the "why a buyer cares" sentence
// here; that copy lives in src/lib/i18n/{en,he}.js, staged by the orchestrator.

export const PLANET_KEYS = [
  "identity",
  "music",
  "live",
  "audience",
  "prokit",
  "proof"
]

// One record per field_id (376 total). See generator header for the
// aggregation rule and for what `sources[]` losslessly preserves from the
// raw F1 rows (source_brand/source_channel/source_type/logo_asset/
// connection_method/consent_requirement/limitation_text/per-source
// evidence_ceiling+freshness_rule+applicability).
export const FIELDS = [
  {
    "field_id": "stage_name",
    "field_label_en": "Stage name",
    "planet_key": "identity",
    "segment": "Identity & Entity Resolution",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "stage_name",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "legal_name",
    "field_label_en": "Legal name",
    "planet_key": "identity",
    "segment": "Identity & Entity Resolution",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "legal_name",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "artist_alias",
    "field_label_en": "Artist alias",
    "planet_key": "identity",
    "segment": "Identity & Entity Resolution",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "artist_alias",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "act_name",
    "field_label_en": "Act name",
    "planet_key": "identity",
    "segment": "Identity & Entity Resolution",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "act_name",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "artist_family",
    "field_label_en": "Artist family",
    "planet_key": "identity",
    "segment": "Identity & Entity Resolution",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "artist_family",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "canonical_subtype",
    "field_label_en": "Canonical subtype",
    "planet_key": "identity",
    "segment": "Identity & Entity Resolution",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "canonical_subtype",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "primary_genre",
    "field_label_en": "Primary genre",
    "planet_key": "identity",
    "segment": "Identity & Entity Resolution",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "primary_genre",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "secondary_genres",
    "field_label_en": "Secondary genres",
    "planet_key": "identity",
    "segment": "Identity & Entity Resolution",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "secondary_genres",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "performance_format",
    "field_label_en": "Performance format",
    "planet_key": "identity",
    "segment": "Identity & Entity Resolution",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "performance_format",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "act_structure",
    "field_label_en": "Act structure",
    "planet_key": "identity",
    "segment": "Identity & Entity Resolution",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "act_structure",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "home_city",
    "field_label_en": "Home city",
    "planet_key": "identity",
    "segment": "Identity & Entity Resolution",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "home_city",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "home_country",
    "field_label_en": "Home country",
    "planet_key": "identity",
    "segment": "Identity & Entity Resolution",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "home_country",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "active_territories",
    "field_label_en": "Active territories",
    "planet_key": "identity",
    "segment": "Identity & Entity Resolution",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "active_territories",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "performance_languages",
    "field_label_en": "Performance languages",
    "planet_key": "identity",
    "segment": "Identity & Entity Resolution",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "performance_languages",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "official_website_url",
    "field_label_en": "Official website",
    "planet_key": "identity",
    "segment": "Identity & Entity Resolution",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "official_website_url",
    "sources": [
      {
        "source_brand": "Official Website",
        "source_channel": "official website",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Owner-controlled source; still not proof of live draw",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "spotify_artist_profile",
    "field_label_en": "Spotify artist profile",
    "planet_key": "identity",
    "segment": "Identity & Entity Resolution",
    "applicability": "required",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "spotify_artist_profile",
    "sources": [
      {
        "source_brand": "Spotify",
        "source_channel": "public profile",
        "source_type": "platform",
        "logo_asset": "codex:spotify",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Public profile identifies a footprint; it does not prove live draw",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "apple_music_artist_profile",
    "field_label_en": "Apple Music artist profile",
    "planet_key": "identity",
    "segment": "Identity & Entity Resolution",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "apple_music_artist_profile",
    "sources": [
      {
        "source_brand": "Apple Music",
        "source_channel": "public profile",
        "source_type": "platform",
        "logo_asset": "codex:apple-music",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Public profile identifies a footprint; it does not prove live draw",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "youtube_channel_url",
    "field_label_en": "YouTube channel",
    "planet_key": "identity",
    "segment": "Identity & Entity Resolution",
    "applicability": "required",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "youtube_channel_url",
    "sources": [
      {
        "source_brand": "YouTube",
        "source_channel": "public profile",
        "source_type": "platform",
        "logo_asset": "codex:youtube",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Public profile identifies a footprint; it does not prove live draw",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "instagram_profile_url",
    "field_label_en": "Instagram profile",
    "planet_key": "identity",
    "segment": "Identity & Entity Resolution",
    "applicability": "required",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "instagram_profile_url",
    "sources": [
      {
        "source_brand": "Instagram",
        "source_channel": "public profile",
        "source_type": "platform",
        "logo_asset": "codex:instagram",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Public profile identifies a footprint; it does not prove live draw",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "tiktok_profile_url",
    "field_label_en": "TikTok profile",
    "planet_key": "identity",
    "segment": "Identity & Entity Resolution",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "tiktok_profile_url",
    "sources": [
      {
        "source_brand": "TikTok",
        "source_channel": "public profile",
        "source_type": "platform",
        "logo_asset": "codex:tiktok",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Public profile identifies a footprint; it does not prove live draw",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "facebook_page_url",
    "field_label_en": "Facebook Page",
    "planet_key": "identity",
    "segment": "Identity & Entity Resolution",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "facebook_page_url",
    "sources": [
      {
        "source_brand": "Facebook",
        "source_channel": "public profile",
        "source_type": "platform",
        "logo_asset": "codex:facebook",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Public profile identifies a footprint; it does not prove live draw",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "x_profile_url",
    "field_label_en": "X profile",
    "planet_key": "identity",
    "segment": "Identity & Entity Resolution",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "x_profile_url",
    "sources": [
      {
        "source_brand": "X",
        "source_channel": "public profile",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Public profile identifies a footprint; it does not prove live draw",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "soundcloud_profile_url",
    "field_label_en": "SoundCloud profile",
    "planet_key": "identity",
    "segment": "Identity & Entity Resolution",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "soundcloud_profile_url",
    "sources": [
      {
        "source_brand": "SoundCloud",
        "source_channel": "public profile",
        "source_type": "platform",
        "logo_asset": "codex:soundcloud",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Public profile identifies a footprint; it does not prove live draw",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "bandcamp_artist_page",
    "field_label_en": "Bandcamp artist page",
    "planet_key": "identity",
    "segment": "Identity & Entity Resolution",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "bandcamp_artist_page",
    "sources": [
      {
        "source_brand": "Bandcamp",
        "source_channel": "public profile",
        "source_type": "platform",
        "logo_asset": "codex:bandcamp",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Public profile identifies a footprint; it does not prove live draw",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "beatport_artist_profile",
    "field_label_en": "Beatport artist profile",
    "planet_key": "identity",
    "segment": "Identity & Entity Resolution",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "beatport_artist_profile",
    "sources": [
      {
        "source_brand": "Beatport",
        "source_channel": "public profile",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Public profile identifies a footprint; it does not prove live draw",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "resident_advisor_artist_profile",
    "field_label_en": "Resident Advisor artist profile",
    "planet_key": "identity",
    "segment": "Identity & Entity Resolution",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "resident_advisor_artist_profile",
    "sources": [
      {
        "source_brand": "Resident Advisor",
        "source_channel": "public profile",
        "source_type": "platform",
        "logo_asset": "codex:resident-advisor",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Public profile identifies a footprint; it does not prove live draw",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "bandsintown_artist_profile",
    "field_label_en": "Bandsintown artist profile",
    "planet_key": "identity",
    "segment": "Identity & Entity Resolution",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "bandsintown_artist_profile",
    "sources": [
      {
        "source_brand": "Bandsintown",
        "source_channel": "public profile",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Public profile identifies a footprint; it does not prove live draw",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "songkick_artist_profile",
    "field_label_en": "Songkick artist profile",
    "planet_key": "identity",
    "segment": "Identity & Entity Resolution",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "songkick_artist_profile",
    "sources": [
      {
        "source_brand": "Songkick",
        "source_channel": "public profile",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Public profile identifies a footprint; it does not prove live draw",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "identity_manager_office",
    "field_label_en": "Manager office",
    "planet_key": "identity",
    "segment": "Identity & Entity Resolution",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-365d",
    "method_ceiling": "verified",
    "why_key": "identity_manager_office",
    "sources": [
      {
        "source_brand": "Manager Office",
        "source_channel": "representation confirmation",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "review-365d",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirmation covers this bounded claim only",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "authorized_representative",
    "field_label_en": "Authorized representative",
    "planet_key": "identity",
    "segment": "Identity & Entity Resolution",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-365d",
    "method_ceiling": "verified",
    "why_key": "authorized_representative",
    "sources": [
      {
        "source_brand": "Artist Representative",
        "source_channel": "authority confirmation",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "review-365d",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirmation covers this bounded claim only",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "duplicate_profile_resolution",
    "field_label_en": "Duplicate profile resolution",
    "planet_key": "identity",
    "segment": "Identity & Entity Resolution",
    "applicability": "supporting",
    "visibility": "working",
    "freshness": "refresh-on-source-change",
    "method_ceiling": "not-assessable",
    "why_key": "duplicate_profile_resolution",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "refresh-on-source-change",
        "consent_requirement": "system derivation",
        "limitation_text": "System match candidate requires artist confirmation; never auto-merges identities",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "buyer_facing_one_liner",
    "field_label_en": "Buyer-facing one-liner",
    "planet_key": "identity",
    "segment": "Positioning & Brand",
    "applicability": "required",
    "visibility": "passport-eligible",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "buyer_facing_one_liner",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "short_biography",
    "field_label_en": "Short biography",
    "planet_key": "identity",
    "segment": "Positioning & Brand",
    "applicability": "required",
    "visibility": "passport-eligible",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "short_biography",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "long_biography",
    "field_label_en": "Long biography",
    "planet_key": "identity",
    "segment": "Positioning & Brand",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "long_biography",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "genre_description",
    "field_label_en": "Genre description",
    "planet_key": "identity",
    "segment": "Positioning & Brand",
    "applicability": "required",
    "visibility": "passport-eligible",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "genre_description",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "artist_proposition",
    "field_label_en": "Artist proposition",
    "planet_key": "identity",
    "segment": "Positioning & Brand",
    "applicability": "required",
    "visibility": "passport-eligible",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "artist_proposition",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "distinctive_promise",
    "field_label_en": "Distinctive promise",
    "planet_key": "identity",
    "segment": "Positioning & Brand",
    "applicability": "supporting",
    "visibility": "passport-eligible",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "distinctive_promise",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "target_audience",
    "field_label_en": "Target audience",
    "planet_key": "identity",
    "segment": "Positioning & Brand",
    "applicability": "required",
    "visibility": "passport-eligible",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "target_audience",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "target_booking_contexts",
    "field_label_en": "Target booking contexts",
    "planet_key": "identity",
    "segment": "Positioning & Brand",
    "applicability": "required",
    "visibility": "passport-eligible",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "target_booking_contexts",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "brand_story",
    "field_label_en": "Brand story",
    "planet_key": "identity",
    "segment": "Positioning & Brand",
    "applicability": "supporting",
    "visibility": "passport-eligible",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "brand_story",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "tone_of_voice",
    "field_label_en": "Tone of voice",
    "planet_key": "identity",
    "segment": "Positioning & Brand",
    "applicability": "supporting",
    "visibility": "passport-eligible",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "tone_of_voice",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "artist_logo_file",
    "field_label_en": "Artist logo",
    "planet_key": "identity",
    "segment": "Positioning & Brand",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "artist_logo_file",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "logo file",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist upload",
        "limitation_text": null,
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "artist_wordmark_file",
    "field_label_en": "Artist wordmark",
    "planet_key": "identity",
    "segment": "Positioning & Brand",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "artist_wordmark_file",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "wordmark file",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist upload",
        "limitation_text": null,
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "brand_color_palette",
    "field_label_en": "Brand color palette",
    "planet_key": "identity",
    "segment": "Positioning & Brand",
    "applicability": "supporting",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "brand_color_palette",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "brand guide",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist upload",
        "limitation_text": null,
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "brand_typography",
    "field_label_en": "Brand typography",
    "planet_key": "identity",
    "segment": "Positioning & Brand",
    "applicability": "supporting",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "brand_typography",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "brand guide",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist upload",
        "limitation_text": null,
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "primary_press_photo",
    "field_label_en": "Primary press photo",
    "planet_key": "identity",
    "segment": "Positioning & Brand",
    "applicability": "required",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "primary_press_photo",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "press photo",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist upload",
        "limitation_text": null,
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "profile_image_file",
    "field_label_en": "Profile image",
    "planet_key": "identity",
    "segment": "Positioning & Brand",
    "applicability": "required",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "profile_image_file",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "profile image",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist upload",
        "limitation_text": null,
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "cover_image_file",
    "field_label_en": "Cover image",
    "planet_key": "identity",
    "segment": "Positioning & Brand",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "cover_image_file",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "cover image",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist upload",
        "limitation_text": null,
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "press_kit_file",
    "field_label_en": "Press kit",
    "planet_key": "identity",
    "segment": "Positioning & Brand",
    "applicability": "required",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "press_kit_file",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "EPK or press-kit file",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist upload",
        "limitation_text": null,
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "brand_usage_guide",
    "field_label_en": "Brand usage guide",
    "planet_key": "identity",
    "segment": "Positioning & Brand",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "brand_usage_guide",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "brand guide",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist upload",
        "limitation_text": null,
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "brand_link_in_bio_url",
    "field_label_en": "Brand link-in-bio page",
    "planet_key": "identity",
    "segment": "Positioning & Brand",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "brand_link_in_bio_url",
    "sources": [
      {
        "source_brand": "Linktree",
        "source_channel": "link-in-bio page",
        "source_type": "platform",
        "logo_asset": "codex:linktree",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Routing utility only; does not prove audience quality",
        "applicability": "conditional"
      },
      {
        "source_brand": "Beacons",
        "source_channel": "link-in-bio page",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Routing utility only; does not prove audience quality",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "visual_consistency_review",
    "field_label_en": "Visual consistency review",
    "planet_key": "identity",
    "segment": "Positioning & Brand",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-on-source-change",
    "method_ceiling": "not-assessable",
    "why_key": "visual_consistency_review",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "refresh-on-source-change",
        "consent_requirement": "system derivation",
        "limitation_text": "Advisory observation only; never a quality score",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "catalogue_release_record",
    "field_label_en": "Catalogue release record",
    "planet_key": "music",
    "segment": "Catalogue / Repertoire",
    "applicability": "required",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "catalogue_release_record",
    "sources": [
      {
        "source_brand": "Spotify",
        "source_channel": "release catalogue",
        "source_type": "platform",
        "logo_asset": "codex:spotify",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Platform metadata may be incomplete or duplicated; artist confirms ownership and credits",
        "applicability": "required"
      },
      {
        "source_brand": "Apple Music",
        "source_channel": "release catalogue",
        "source_type": "platform",
        "logo_asset": "codex:apple-music",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Platform metadata may be incomplete or duplicated; artist confirms ownership and credits",
        "applicability": "conditional"
      },
      {
        "source_brand": "Beatport",
        "source_channel": "release catalogue",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Platform metadata may be incomplete or duplicated; artist confirms ownership and credits",
        "applicability": "conditional"
      },
      {
        "source_brand": "Bandcamp",
        "source_channel": "release catalogue",
        "source_type": "platform",
        "logo_asset": "codex:bandcamp",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Platform metadata may be incomplete or duplicated; artist confirms ownership and credits",
        "applicability": "conditional"
      },
      {
        "source_brand": "SoundCloud",
        "source_channel": "release catalogue",
        "source_type": "platform",
        "logo_asset": "codex:soundcloud",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Platform metadata may be incomplete or duplicated; artist confirms ownership and credits",
        "applicability": "conditional"
      },
      {
        "source_brand": "YouTube Music",
        "source_channel": "release catalogue",
        "source_type": "platform",
        "logo_asset": "codex:youtube",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Platform metadata may be incomplete or duplicated; artist confirms ownership and credits",
        "applicability": "conditional"
      },
      {
        "source_brand": "Discogs",
        "source_channel": "release catalogue",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Platform metadata may be incomplete or duplicated; artist confirms ownership and credits",
        "applicability": "conditional"
      },
      {
        "source_brand": "Official Label Website",
        "source_channel": "release catalogue",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Platform metadata may be incomplete or duplicated; artist confirms ownership and credits",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "unreleased_material",
    "field_label_en": "Unreleased material",
    "planet_key": "music",
    "segment": "Catalogue / Repertoire",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "unreleased_material",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "audio file",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist upload",
        "limitation_text": "Artist-provided creative evidence; subjective quality is never verified",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "representative_track",
    "field_label_en": "Representative track",
    "planet_key": "music",
    "segment": "Catalogue / Repertoire",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "representative_track",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "audio file",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist upload",
        "limitation_text": "Artist-provided creative evidence; subjective quality is never verified",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "repertoire_duration",
    "field_label_en": "Repertoire duration",
    "planet_key": "music",
    "segment": "Catalogue / Repertoire",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "repertoire_duration",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "set_repertoire_type",
    "field_label_en": "Set repertoire type",
    "planet_key": "music",
    "segment": "Catalogue / Repertoire",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "set_repertoire_type",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "repertoire_languages",
    "field_label_en": "Repertoire languages",
    "planet_key": "music",
    "segment": "Catalogue / Repertoire",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "repertoire_languages",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "catalogue_master_rights_owner",
    "field_label_en": "Master rights owner",
    "planet_key": "music",
    "segment": "Catalogue / Repertoire",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "catalogue_master_rights_owner",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "catalogue_publishing_rights_owner",
    "field_label_en": "Publishing rights owner",
    "planet_key": "music",
    "segment": "Catalogue / Repertoire",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "catalogue_publishing_rights_owner",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "isrc_record",
    "field_label_en": "ISRC record",
    "planet_key": "music",
    "segment": "Catalogue / Repertoire",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "supporting",
    "why_key": "isrc_record",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "release metadata document",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist upload",
        "limitation_text": null,
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "upc_record",
    "field_label_en": "UPC record",
    "planet_key": "music",
    "segment": "Catalogue / Repertoire",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "supporting",
    "why_key": "upc_record",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "release metadata document",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist upload",
        "limitation_text": null,
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "catalogue_number",
    "field_label_en": "Catalogue number",
    "planet_key": "music",
    "segment": "Catalogue / Repertoire",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "supporting",
    "why_key": "catalogue_number",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "label release document",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist upload",
        "limitation_text": null,
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "release_metadata_file",
    "field_label_en": "Release metadata file",
    "planet_key": "music",
    "segment": "Catalogue / Repertoire",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "supporting",
    "why_key": "release_metadata_file",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "metadata file",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist upload",
        "limitation_text": null,
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "producer_credit",
    "field_label_en": "Producer credit",
    "planet_key": "music",
    "segment": "Catalogue / Repertoire",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "producer_credit",
    "sources": [
      {
        "source_brand": "Discogs",
        "source_channel": "release credits",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Credit is source-linked and artist-confirmed; rights validity is separate",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "composer_credit",
    "field_label_en": "Composer credit",
    "planet_key": "music",
    "segment": "Catalogue / Repertoire",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "composer_credit",
    "sources": [
      {
        "source_brand": "Spotify",
        "source_channel": "release credits",
        "source_type": "platform",
        "logo_asset": "codex:spotify",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Credit is source-linked and artist-confirmed; rights validity is separate",
        "applicability": "conditional"
      },
      {
        "source_brand": "Apple Music",
        "source_channel": "release credits",
        "source_type": "platform",
        "logo_asset": "codex:apple-music",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Credit is source-linked and artist-confirmed; rights validity is separate",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "remixer_credit",
    "field_label_en": "Remixer credit",
    "planet_key": "music",
    "segment": "Catalogue / Repertoire",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "remixer_credit",
    "sources": [
      {
        "source_brand": "Beatport",
        "source_channel": "release credits",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Credit is source-linked and artist-confirmed; rights validity is separate",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "featured_artist_credit",
    "field_label_en": "Featured artist credit",
    "planet_key": "music",
    "segment": "Catalogue / Repertoire",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "featured_artist_credit",
    "sources": [
      {
        "source_brand": "Spotify",
        "source_channel": "release credits",
        "source_type": "platform",
        "logo_asset": "codex:spotify",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Credit is source-linked and artist-confirmed; rights validity is separate",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "label_credit",
    "field_label_en": "Label credit",
    "planet_key": "music",
    "segment": "Catalogue / Repertoire",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-365d",
    "method_ceiling": "verified",
    "why_key": "label_credit",
    "sources": [
      {
        "source_brand": "Beatport",
        "source_channel": "release credits",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Credit is source-linked and artist-confirmed; rights validity is separate",
        "applicability": "conditional"
      },
      {
        "source_brand": "Record Label",
        "source_channel": "label confirmation",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "review-365d",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirms the bounded release relationship only",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "signature_sound",
    "field_label_en": "Signature sound",
    "planet_key": "identity",
    "segment": "Creative Quality & Differentiation",
    "applicability": "required",
    "visibility": "passport-eligible",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "signature_sound",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Artist articulation; never converted into a quality grade",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "signature_performance_capability",
    "field_label_en": "Signature performance capability",
    "planet_key": "identity",
    "segment": "Creative Quality & Differentiation",
    "applicability": "required",
    "visibility": "passport-eligible",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "signature_performance_capability",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Artist articulation; never converted into a quality grade",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "creative_concept",
    "field_label_en": "Creative concept",
    "planet_key": "identity",
    "segment": "Creative Quality & Differentiation",
    "applicability": "supporting",
    "visibility": "passport-eligible",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "creative_concept",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Artist articulation; never converted into a quality grade",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "sonic_identity",
    "field_label_en": "Sonic identity",
    "planet_key": "identity",
    "segment": "Creative Quality & Differentiation",
    "applicability": "supporting",
    "visibility": "passport-eligible",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "sonic_identity",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Artist articulation; never converted into a quality grade",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "visual_show_concept",
    "field_label_en": "Visual show concept",
    "planet_key": "identity",
    "segment": "Creative Quality & Differentiation",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "visual_show_concept",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Artist articulation; never converted into a quality grade",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "customization_capability",
    "field_label_en": "Customization capability",
    "planet_key": "identity",
    "segment": "Creative Quality & Differentiation",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "customization_capability",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Artist articulation; never converted into a quality grade",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "creative_limitations",
    "field_label_en": "Creative limitations",
    "planet_key": "identity",
    "segment": "Creative Quality & Differentiation",
    "applicability": "required",
    "visibility": "passport-eligible",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "creative_limitations",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Artist articulation; never converted into a quality grade",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "representative_audio_link",
    "field_label_en": "Representative audio link",
    "planet_key": "identity",
    "segment": "Creative Quality & Differentiation",
    "applicability": "required",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "representative_audio_link",
    "sources": [
      {
        "source_brand": "SoundCloud",
        "source_channel": "audio track",
        "source_type": "platform",
        "logo_asset": "codex:soundcloud",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Creative evidence is viewable; subjective quality is never verified",
        "applicability": "required"
      },
      {
        "source_brand": "Bandcamp",
        "source_channel": "audio track",
        "source_type": "platform",
        "logo_asset": "codex:bandcamp",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Creative evidence is viewable; subjective quality is never verified",
        "applicability": "conditional"
      },
      {
        "source_brand": "Spotify",
        "source_channel": "release track",
        "source_type": "platform",
        "logo_asset": "codex:spotify",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Creative evidence is viewable; subjective quality is never verified",
        "applicability": "conditional"
      },
      {
        "source_brand": "LOCK",
        "source_channel": "artist-uploaded audio",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist upload",
        "limitation_text": "Artist upload; subjective quality is never verified",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "representative_video_link",
    "field_label_en": "Representative video link",
    "planet_key": "identity",
    "segment": "Creative Quality & Differentiation",
    "applicability": "required",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "representative_video_link",
    "sources": [
      {
        "source_brand": "YouTube",
        "source_channel": "representative video",
        "source_type": "platform",
        "logo_asset": "codex:youtube",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Video supports the existence and format of the performance; it does not verify commercial draw",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "gateway_live_clip",
    "field_label_en": "Gateway live clip",
    "planet_key": "identity",
    "segment": "Creative Quality & Differentiation",
    "applicability": "required",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "gateway_live_clip",
    "sources": [
      {
        "source_brand": "YouTube",
        "source_channel": "gateway live clip",
        "source_type": "platform",
        "logo_asset": "codex:youtube",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Video supports the existence and format of the performance; it does not verify commercial draw",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "full_live_set_video",
    "field_label_en": "Full live-set video",
    "planet_key": "identity",
    "segment": "Creative Quality & Differentiation",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "full_live_set_video",
    "sources": [
      {
        "source_brand": "YouTube",
        "source_channel": "full live set",
        "source_type": "platform",
        "logo_asset": "codex:youtube",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Video supports the existence and format of the performance; it does not verify commercial draw",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "short_performance_clip",
    "field_label_en": "Short performance clip",
    "planet_key": "identity",
    "segment": "Creative Quality & Differentiation",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "short_performance_clip",
    "sources": [
      {
        "source_brand": "Instagram",
        "source_channel": "Reel",
        "source_type": "platform",
        "logo_asset": "codex:instagram",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Video supports the existence and format of the performance; it does not verify commercial draw",
        "applicability": "conditional"
      },
      {
        "source_brand": "TikTok",
        "source_channel": "video post",
        "source_type": "platform",
        "logo_asset": "codex:tiktok",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Video supports the existence and format of the performance; it does not verify commercial draw",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "unreleased_demo_file",
    "field_label_en": "Unreleased demo",
    "planet_key": "identity",
    "segment": "Creative Quality & Differentiation",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "unreleased_demo_file",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "audio demo",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist upload",
        "limitation_text": "Working-only unless the artist explicitly publishes it",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "visual_show_reference",
    "field_label_en": "Visual show reference",
    "planet_key": "identity",
    "segment": "Creative Quality & Differentiation",
    "applicability": "conditional",
    "visibility": "buyer-context",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "visual_show_reference",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "show reference image or video",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist upload",
        "limitation_text": "Reference concept; actual venue feasibility requires production review",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "streaming_listener_band",
    "field_label_en": "Monthly listener band",
    "planet_key": "music",
    "segment": "Streaming Consumption",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "streaming_listener_band",
    "sources": [
      {
        "source_brand": "Spotify for Artists",
        "source_channel": "connected account",
        "source_type": "platform",
        "logo_asset": "codex:spotify",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Streaming is secondary context; never live-draw proof; counts render only as governed bands",
        "applicability": "supporting"
      },
      {
        "source_brand": "Apple Music for Artists",
        "source_channel": "connected account",
        "source_type": "platform",
        "logo_asset": "codex:apple-music",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Streaming is secondary context; never live-draw proof; counts render only as governed bands",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "streaming_follower_band",
    "field_label_en": "Streaming follower band",
    "planet_key": "music",
    "segment": "Streaming Consumption",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "streaming_follower_band",
    "sources": [
      {
        "source_brand": "Spotify for Artists",
        "source_channel": "connected account",
        "source_type": "platform",
        "logo_asset": "codex:spotify",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Streaming is secondary context; never live-draw proof; counts render only as governed bands",
        "applicability": "supporting"
      },
      {
        "source_brand": "Apple Music for Artists",
        "source_channel": "connected account",
        "source_type": "platform",
        "logo_asset": "codex:apple-music",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Streaming is secondary context; never live-draw proof; counts render only as governed bands",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "stream_band",
    "field_label_en": "Stream band",
    "planet_key": "music",
    "segment": "Streaming Consumption",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "stream_band",
    "sources": [
      {
        "source_brand": "Spotify for Artists",
        "source_channel": "connected account",
        "source_type": "platform",
        "logo_asset": "codex:spotify",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Streaming is secondary context; never live-draw proof; counts render only as governed bands",
        "applicability": "supporting"
      },
      {
        "source_brand": "Apple Music for Artists",
        "source_channel": "connected account",
        "source_type": "platform",
        "logo_asset": "codex:apple-music",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Streaming is secondary context; never live-draw proof; counts render only as governed bands",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "save_band",
    "field_label_en": "Save band",
    "planet_key": "music",
    "segment": "Streaming Consumption",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "save_band",
    "sources": [
      {
        "source_brand": "Spotify for Artists",
        "source_channel": "connected account",
        "source_type": "platform",
        "logo_asset": "codex:spotify",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Streaming is secondary context; never live-draw proof; counts render only as governed bands",
        "applicability": "supporting"
      },
      {
        "source_brand": "Apple Music for Artists",
        "source_channel": "connected account",
        "source_type": "platform",
        "logo_asset": "codex:apple-music",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Streaming is secondary context; never live-draw proof; counts render only as governed bands",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "repeat_listener_indicator",
    "field_label_en": "Repeat-listener indicator",
    "planet_key": "music",
    "segment": "Streaming Consumption",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "repeat_listener_indicator",
    "sources": [
      {
        "source_brand": "Spotify for Artists",
        "source_channel": "connected account",
        "source_type": "platform",
        "logo_asset": "codex:spotify",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Streaming is secondary context; never live-draw proof; counts render only as governed bands",
        "applicability": "supporting"
      },
      {
        "source_brand": "Apple Music for Artists",
        "source_channel": "connected account",
        "source_type": "platform",
        "logo_asset": "codex:apple-music",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Streaming is secondary context; never live-draw proof; counts render only as governed bands",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "top_tracks",
    "field_label_en": "Top tracks",
    "planet_key": "music",
    "segment": "Streaming Consumption",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "top_tracks",
    "sources": [
      {
        "source_brand": "Spotify for Artists",
        "source_channel": "connected account",
        "source_type": "platform",
        "logo_asset": "codex:spotify",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Streaming is secondary context; never live-draw proof; counts render only as governed bands",
        "applicability": "supporting"
      },
      {
        "source_brand": "Apple Music for Artists",
        "source_channel": "connected account",
        "source_type": "platform",
        "logo_asset": "codex:apple-music",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Streaming is secondary context; never live-draw proof; counts render only as governed bands",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "streaming_top_cities",
    "field_label_en": "Streaming top cities",
    "planet_key": "music",
    "segment": "Streaming Consumption",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "streaming_top_cities",
    "sources": [
      {
        "source_brand": "Spotify for Artists",
        "source_channel": "connected account",
        "source_type": "platform",
        "logo_asset": "codex:spotify",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Streaming is secondary context; never live-draw proof; counts render only as governed bands",
        "applicability": "supporting"
      },
      {
        "source_brand": "Apple Music for Artists",
        "source_channel": "connected account",
        "source_type": "platform",
        "logo_asset": "codex:apple-music",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Streaming is secondary context; never live-draw proof; counts render only as governed bands",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "streaming_top_countries",
    "field_label_en": "Streaming top countries",
    "planet_key": "music",
    "segment": "Streaming Consumption",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "streaming_top_countries",
    "sources": [
      {
        "source_brand": "Spotify for Artists",
        "source_channel": "connected account",
        "source_type": "platform",
        "logo_asset": "codex:spotify",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Streaming is secondary context; never live-draw proof; counts render only as governed bands",
        "applicability": "supporting"
      },
      {
        "source_brand": "Apple Music for Artists",
        "source_channel": "connected account",
        "source_type": "platform",
        "logo_asset": "codex:apple-music",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Streaming is secondary context; never live-draw proof; counts render only as governed bands",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "listener_territory_distribution",
    "field_label_en": "Listener territory distribution",
    "planet_key": "music",
    "segment": "Streaming Consumption",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "listener_territory_distribution",
    "sources": [
      {
        "source_brand": "Spotify for Artists",
        "source_channel": "connected account",
        "source_type": "platform",
        "logo_asset": "codex:spotify",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Streaming is secondary context; never live-draw proof; counts render only as governed bands",
        "applicability": "supporting"
      },
      {
        "source_brand": "Apple Music for Artists",
        "source_channel": "connected account",
        "source_type": "platform",
        "logo_asset": "codex:apple-music",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Streaming is secondary context; never live-draw proof; counts render only as governed bands",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "editorial_playlist_placement",
    "field_label_en": "Editorial playlist placement",
    "planet_key": "music",
    "segment": "Streaming Consumption",
    "applicability": "supporting",
    "visibility": "passport-eligible",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "editorial_playlist_placement",
    "sources": [
      {
        "source_brand": "Spotify for Artists",
        "source_channel": "playlist analytics",
        "source_type": "platform",
        "logo_asset": "codex:spotify",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Streaming is secondary context; never live-draw proof; placement does not prove ticket demand",
        "applicability": "supporting"
      },
      {
        "source_brand": "Apple Music for Artists",
        "source_channel": "playlist analytics",
        "source_type": "platform",
        "logo_asset": "codex:apple-music",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Streaming is secondary context; never live-draw proof; placement does not prove ticket demand",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "user_playlist_placement",
    "field_label_en": "User playlist placement",
    "planet_key": "music",
    "segment": "Streaming Consumption",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "user_playlist_placement",
    "sources": [
      {
        "source_brand": "Spotify for Artists",
        "source_channel": "playlist analytics",
        "source_type": "platform",
        "logo_asset": "codex:spotify",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Streaming is secondary context; never live-draw proof; user playlists are supporting context only",
        "applicability": "supporting"
      },
      {
        "source_brand": "Apple Music for Artists",
        "source_channel": "playlist analytics",
        "source_type": "platform",
        "logo_asset": "codex:apple-music",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Streaming is secondary context; never live-draw proof; user playlists are supporting context only",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "dj_tracklist_presence",
    "field_label_en": "DJ tracklist presence",
    "planet_key": "music",
    "segment": "Streaming Consumption",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "dj_tracklist_presence",
    "sources": [
      {
        "source_brand": "1001Tracklists",
        "source_channel": "public tracklist",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Tracklist presence is secondary context; never live-draw proof; it shows usage or mention and does not prove ownership",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "streaming_change_over_time",
    "field_label_en": "Streaming change over time",
    "planet_key": "music",
    "segment": "Streaming Consumption",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-on-source-change",
    "method_ceiling": "not-assessable",
    "why_key": "streaming_change_over_time",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "refresh-on-source-change",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed history only; never rendered as a prediction; streaming remains secondary context",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "instagram_follower_band",
    "field_label_en": "Instagram follower band",
    "planet_key": "audience",
    "segment": "Audience & Fanbase",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "instagram_follower_band",
    "sources": [
      {
        "source_brand": "Instagram",
        "source_channel": "connected account",
        "source_type": "platform",
        "logo_asset": "codex:instagram",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Counts render only as bands; platform audience does not equal local ticket demand",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "instagram_engagement_band",
    "field_label_en": "Instagram engagement band",
    "planet_key": "audience",
    "segment": "Audience & Fanbase",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "instagram_engagement_band",
    "sources": [
      {
        "source_brand": "Instagram",
        "source_channel": "connected account",
        "source_type": "platform",
        "logo_asset": "codex:instagram",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Counts render only as bands; platform audience does not equal local ticket demand",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "instagram_top_cities",
    "field_label_en": "Instagram top cities",
    "planet_key": "audience",
    "segment": "Audience & Fanbase",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "instagram_top_cities",
    "sources": [
      {
        "source_brand": "Instagram",
        "source_channel": "connected account",
        "source_type": "platform",
        "logo_asset": "codex:instagram",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Counts render only as bands; platform audience does not equal local ticket demand",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "instagram_audience_age_band",
    "field_label_en": "Instagram audience age band",
    "planet_key": "audience",
    "segment": "Audience & Fanbase",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "instagram_audience_age_band",
    "sources": [
      {
        "source_brand": "Instagram",
        "source_channel": "connected account",
        "source_type": "platform",
        "logo_asset": "codex:instagram",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Counts render only as bands; platform audience does not equal local ticket demand",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "instagram_audience_gender_distribution",
    "field_label_en": "Instagram audience gender distribution",
    "planet_key": "audience",
    "segment": "Audience & Fanbase",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "instagram_audience_gender_distribution",
    "sources": [
      {
        "source_brand": "Instagram",
        "source_channel": "connected account",
        "source_type": "platform",
        "logo_asset": "codex:instagram",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Counts render only as bands; platform audience does not equal local ticket demand",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "instagram_share_activity_band",
    "field_label_en": "Instagram share activity band",
    "planet_key": "audience",
    "segment": "Audience & Fanbase",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "instagram_share_activity_band",
    "sources": [
      {
        "source_brand": "Instagram",
        "source_channel": "connected account",
        "source_type": "platform",
        "logo_asset": "codex:instagram",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Counts render only as bands; platform audience does not equal local ticket demand",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "instagram_save_activity_band",
    "field_label_en": "Instagram save activity band",
    "planet_key": "audience",
    "segment": "Audience & Fanbase",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "instagram_save_activity_band",
    "sources": [
      {
        "source_brand": "Instagram",
        "source_channel": "connected account",
        "source_type": "platform",
        "logo_asset": "codex:instagram",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Counts render only as bands; platform audience does not equal local ticket demand",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "tiktok_follower_band",
    "field_label_en": "TikTok follower band",
    "planet_key": "audience",
    "segment": "Audience & Fanbase",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "tiktok_follower_band",
    "sources": [
      {
        "source_brand": "TikTok",
        "source_channel": "connected account",
        "source_type": "platform",
        "logo_asset": "codex:tiktok",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Counts render only as bands; platform audience does not equal local ticket demand",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "tiktok_engagement_band",
    "field_label_en": "TikTok engagement band",
    "planet_key": "audience",
    "segment": "Audience & Fanbase",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "tiktok_engagement_band",
    "sources": [
      {
        "source_brand": "TikTok",
        "source_channel": "connected account",
        "source_type": "platform",
        "logo_asset": "codex:tiktok",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Counts render only as bands; platform audience does not equal local ticket demand",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "tiktok_top_territories",
    "field_label_en": "TikTok top territories",
    "planet_key": "audience",
    "segment": "Audience & Fanbase",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "tiktok_top_territories",
    "sources": [
      {
        "source_brand": "TikTok",
        "source_channel": "connected account",
        "source_type": "platform",
        "logo_asset": "codex:tiktok",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Counts render only as bands; platform audience does not equal local ticket demand",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "tiktok_share_activity_band",
    "field_label_en": "TikTok share activity band",
    "planet_key": "audience",
    "segment": "Audience & Fanbase",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "tiktok_share_activity_band",
    "sources": [
      {
        "source_brand": "TikTok",
        "source_channel": "connected account",
        "source_type": "platform",
        "logo_asset": "codex:tiktok",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Counts render only as bands; platform audience does not equal local ticket demand",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "youtube_subscriber_band",
    "field_label_en": "YouTube subscriber band",
    "planet_key": "audience",
    "segment": "Audience & Fanbase",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "youtube_subscriber_band",
    "sources": [
      {
        "source_brand": "YouTube Studio",
        "source_channel": "connected account",
        "source_type": "platform",
        "logo_asset": "codex:youtube",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Counts render only as bands; platform audience does not equal local ticket demand",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "youtube_viewer_territories",
    "field_label_en": "YouTube viewer territories",
    "planet_key": "audience",
    "segment": "Audience & Fanbase",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "youtube_viewer_territories",
    "sources": [
      {
        "source_brand": "YouTube Studio",
        "source_channel": "connected account",
        "source_type": "platform",
        "logo_asset": "codex:youtube",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Counts render only as bands; platform audience does not equal local ticket demand",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "youtube_returning_viewer_indicator",
    "field_label_en": "YouTube returning-viewer indicator",
    "planet_key": "audience",
    "segment": "Audience & Fanbase",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "youtube_returning_viewer_indicator",
    "sources": [
      {
        "source_brand": "YouTube Studio",
        "source_channel": "connected account",
        "source_type": "platform",
        "logo_asset": "codex:youtube",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Counts render only as bands; platform audience does not equal local ticket demand",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "facebook_follower_band",
    "field_label_en": "Facebook follower band",
    "planet_key": "audience",
    "segment": "Audience & Fanbase",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "facebook_follower_band",
    "sources": [
      {
        "source_brand": "Meta Business Suite",
        "source_channel": "connected account",
        "source_type": "platform",
        "logo_asset": "codex:facebook",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Counts render only as bands; platform audience does not equal local ticket demand",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "facebook_engagement_band",
    "field_label_en": "Facebook engagement band",
    "planet_key": "audience",
    "segment": "Audience & Fanbase",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "facebook_engagement_band",
    "sources": [
      {
        "source_brand": "Meta Business Suite",
        "source_channel": "connected account",
        "source_type": "platform",
        "logo_asset": "codex:facebook",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Counts render only as bands; platform audience does not equal local ticket demand",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "audience_languages",
    "field_label_en": "Audience languages",
    "planet_key": "audience",
    "segment": "Audience & Fanbase",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "audience_languages",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Self-reported audience context; not independently verified",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "core_audience_description",
    "field_label_en": "Core audience description",
    "planet_key": "audience",
    "segment": "Audience & Fanbase",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "core_audience_description",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Self-reported audience context; not independently verified",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "user_generated_content_presence",
    "field_label_en": "User-generated content presence",
    "planet_key": "audience",
    "segment": "Audience & Fanbase",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "supporting",
    "why_key": "user_generated_content_presence",
    "sources": [
      {
        "source_brand": "Instagram",
        "source_channel": "tagged posts",
        "source_type": "platform",
        "logo_asset": "codex:instagram",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Public mentions are candidates until artist confirms relevance and identity",
        "applicability": "supporting"
      },
      {
        "source_brand": "TikTok",
        "source_channel": "user-generated videos",
        "source_type": "platform",
        "logo_asset": "codex:tiktok",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Public mentions are candidates until artist confirms relevance and identity",
        "applicability": "supporting"
      },
      {
        "source_brand": "YouTube",
        "source_channel": "fan uploads",
        "source_type": "platform",
        "logo_asset": "codex:youtube",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Public mentions are candidates until artist confirms relevance and identity",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "repeat_audience_interaction",
    "field_label_en": "Repeat audience interaction",
    "planet_key": "audience",
    "segment": "Audience & Fanbase",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-on-source-change",
    "method_ceiling": "not-assessable",
    "why_key": "repeat_audience_interaction",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "refresh-on-source-change",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed history only; never rendered as a prediction; derived from permissioned engagement history",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "event_related_engagement",
    "field_label_en": "Event-related engagement",
    "planet_key": "audience",
    "segment": "Audience & Fanbase",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-on-source-change",
    "method_ceiling": "not-assessable",
    "why_key": "event_related_engagement",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "refresh-on-source-change",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed history only; never rendered as a prediction; engagement remains separate from ticket evidence",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "instagram_feed_presence",
    "field_label_en": "Instagram Feed presence",
    "planet_key": "audience",
    "segment": "Social & Content Engine",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "supporting",
    "why_key": "instagram_feed_presence",
    "sources": [
      {
        "source_brand": "Instagram",
        "source_channel": "Feed",
        "source_type": "platform",
        "logo_asset": "codex:instagram",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Channel presence is not evidence quality or booking readiness",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "instagram_reels_presence",
    "field_label_en": "Instagram Reels presence",
    "planet_key": "audience",
    "segment": "Social & Content Engine",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "supporting",
    "why_key": "instagram_reels_presence",
    "sources": [
      {
        "source_brand": "Instagram",
        "source_channel": "Reels",
        "source_type": "platform",
        "logo_asset": "codex:instagram",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Channel presence is not evidence quality or booking readiness",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "instagram_stories_presence",
    "field_label_en": "Instagram Stories presence",
    "planet_key": "audience",
    "segment": "Social & Content Engine",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "supporting",
    "why_key": "instagram_stories_presence",
    "sources": [
      {
        "source_brand": "Instagram",
        "source_channel": "Stories",
        "source_type": "platform",
        "logo_asset": "codex:instagram",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Channel presence is not evidence quality or booking readiness",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "instagram_live_presence",
    "field_label_en": "Instagram Live presence",
    "planet_key": "audience",
    "segment": "Social & Content Engine",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "supporting",
    "why_key": "instagram_live_presence",
    "sources": [
      {
        "source_brand": "Instagram",
        "source_channel": "Live",
        "source_type": "platform",
        "logo_asset": "codex:instagram",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Channel presence is not evidence quality or booking readiness",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "instagram_broadcast_channel",
    "field_label_en": "Instagram Broadcast Channel",
    "planet_key": "audience",
    "segment": "Social & Content Engine",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "supporting",
    "why_key": "instagram_broadcast_channel",
    "sources": [
      {
        "source_brand": "Instagram",
        "source_channel": "Broadcast Channel",
        "source_type": "platform",
        "logo_asset": "codex:instagram",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Channel presence is not evidence quality or booking readiness",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "tiktok_posts_presence",
    "field_label_en": "TikTok posts presence",
    "planet_key": "audience",
    "segment": "Social & Content Engine",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "supporting",
    "why_key": "tiktok_posts_presence",
    "sources": [
      {
        "source_brand": "TikTok",
        "source_channel": "Posts",
        "source_type": "platform",
        "logo_asset": "codex:tiktok",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Channel presence is not evidence quality or booking readiness",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "tiktok_live_presence",
    "field_label_en": "TikTok Live presence",
    "planet_key": "audience",
    "segment": "Social & Content Engine",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "supporting",
    "why_key": "tiktok_live_presence",
    "sources": [
      {
        "source_brand": "TikTok",
        "source_channel": "Live",
        "source_type": "platform",
        "logo_asset": "codex:tiktok",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Channel presence is not evidence quality or booking readiness",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "youtube_video_presence",
    "field_label_en": "YouTube video presence",
    "planet_key": "audience",
    "segment": "Social & Content Engine",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "supporting",
    "why_key": "youtube_video_presence",
    "sources": [
      {
        "source_brand": "YouTube",
        "source_channel": "Videos",
        "source_type": "platform",
        "logo_asset": "codex:youtube",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Channel presence is not evidence quality or booking readiness",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "youtube_shorts_presence",
    "field_label_en": "YouTube Shorts presence",
    "planet_key": "audience",
    "segment": "Social & Content Engine",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "supporting",
    "why_key": "youtube_shorts_presence",
    "sources": [
      {
        "source_brand": "YouTube",
        "source_channel": "Shorts",
        "source_type": "platform",
        "logo_asset": "codex:youtube",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Channel presence is not evidence quality or booking readiness",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "youtube_live_presence",
    "field_label_en": "YouTube Live presence",
    "planet_key": "audience",
    "segment": "Social & Content Engine",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "supporting",
    "why_key": "youtube_live_presence",
    "sources": [
      {
        "source_brand": "YouTube",
        "source_channel": "Live",
        "source_type": "platform",
        "logo_asset": "codex:youtube",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Channel presence is not evidence quality or booking readiness",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "facebook_page_presence",
    "field_label_en": "Facebook Page presence",
    "planet_key": "audience",
    "segment": "Social & Content Engine",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "supporting",
    "why_key": "facebook_page_presence",
    "sources": [
      {
        "source_brand": "Facebook",
        "source_channel": "Page",
        "source_type": "platform",
        "logo_asset": "codex:facebook",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Channel presence is not evidence quality or booking readiness",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "facebook_events_presence",
    "field_label_en": "Facebook Events presence",
    "planet_key": "audience",
    "segment": "Social & Content Engine",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "supporting",
    "why_key": "facebook_events_presence",
    "sources": [
      {
        "source_brand": "Facebook",
        "source_channel": "Events",
        "source_type": "platform",
        "logo_asset": "codex:facebook",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Channel presence is not evidence quality or booking readiness",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "facebook_group_presence",
    "field_label_en": "Facebook Group presence",
    "planet_key": "audience",
    "segment": "Social & Content Engine",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "supporting",
    "why_key": "facebook_group_presence",
    "sources": [
      {
        "source_brand": "Facebook",
        "source_channel": "Group",
        "source_type": "platform",
        "logo_asset": "codex:facebook",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Channel presence is not evidence quality or booking readiness",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "x_posts_presence",
    "field_label_en": "X posts presence",
    "planet_key": "audience",
    "segment": "Social & Content Engine",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "supporting",
    "why_key": "x_posts_presence",
    "sources": [
      {
        "source_brand": "X",
        "source_channel": "Posts",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Channel presence is not evidence quality or booking readiness",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "posting_cadence",
    "field_label_en": "Posting cadence",
    "planet_key": "audience",
    "segment": "Social & Content Engine",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "posting_cadence",
    "sources": [
      {
        "source_brand": "Instagram",
        "source_channel": "content analytics",
        "source_type": "platform",
        "logo_asset": "codex:instagram",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Cadence is descriptive; it never becomes a performance score",
        "applicability": "supporting"
      },
      {
        "source_brand": "TikTok",
        "source_channel": "content analytics",
        "source_type": "platform",
        "logo_asset": "codex:tiktok",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Cadence is descriptive; it never becomes a performance score",
        "applicability": "supporting"
      },
      {
        "source_brand": "YouTube",
        "source_channel": "content analytics",
        "source_type": "platform",
        "logo_asset": "codex:youtube",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Cadence is descriptive; it never becomes a performance score",
        "applicability": "supporting"
      },
      {
        "source_brand": "Facebook",
        "source_channel": "content analytics",
        "source_type": "platform",
        "logo_asset": "codex:facebook",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Cadence is descriptive; it never becomes a performance score",
        "applicability": "supporting"
      },
      {
        "source_brand": "X",
        "source_channel": "content analytics",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Cadence is descriptive; it never becomes a performance score",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "release_campaign_presence",
    "field_label_en": "Release campaign presence",
    "planet_key": "audience",
    "segment": "Social & Content Engine",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "release_campaign_presence",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Artist-declared content practice; platform links can strengthen it",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "gig_promotion_presence",
    "field_label_en": "Gig-promotion presence",
    "planet_key": "audience",
    "segment": "Social & Content Engine",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "gig_promotion_presence",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Artist-declared content practice; platform links can strengthen it",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "behind_the_scenes_content",
    "field_label_en": "Behind-the-scenes content",
    "planet_key": "audience",
    "segment": "Social & Content Engine",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "behind_the_scenes_content",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Artist-declared content practice; platform links can strengthen it",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "studio_content_presence",
    "field_label_en": "Studio content presence",
    "planet_key": "audience",
    "segment": "Social & Content Engine",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "studio_content_presence",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Artist-declared content practice; platform links can strengthen it",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "live_content_presence",
    "field_label_en": "Live-performance content",
    "planet_key": "audience",
    "segment": "Social & Content Engine",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "live_content_presence",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Artist-declared content practice; platform links can strengthen it",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "fan_content_presence",
    "field_label_en": "Fan-content presence",
    "planet_key": "audience",
    "segment": "Social & Content Engine",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "fan_content_presence",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Artist-declared content practice; platform links can strengthen it",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "collaboration_content_presence",
    "field_label_en": "Collaboration-content presence",
    "planet_key": "audience",
    "segment": "Social & Content Engine",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "collaboration_content_presence",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Artist-declared content practice; platform links can strengthen it",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "content_call_to_action",
    "field_label_en": "Content call to action",
    "planet_key": "audience",
    "segment": "Social & Content Engine",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "content_call_to_action",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Artist-declared content practice; platform links can strengthen it",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "content_link_in_bio_url",
    "field_label_en": "Content link-in-bio page",
    "planet_key": "audience",
    "segment": "Social & Content Engine",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "supporting",
    "why_key": "content_link_in_bio_url",
    "sources": [
      {
        "source_brand": "Linktree",
        "source_channel": "link-in-bio page",
        "source_type": "platform",
        "logo_asset": "codex:linktree",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Routing utility only; does not prove audience quality",
        "applicability": "conditional"
      },
      {
        "source_brand": "Beacons",
        "source_channel": "link-in-bio page",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Routing utility only; does not prove audience quality",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "content_calendar_file",
    "field_label_en": "Content calendar",
    "planet_key": "audience",
    "segment": "Social & Content Engine",
    "applicability": "conditional",
    "visibility": "working",
    "freshness": "review-30d",
    "method_ceiling": "supporting",
    "why_key": "content_calendar_file",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "content calendar",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-30d",
        "consent_requirement": "artist upload",
        "limitation_text": "Operational working file; never Passport-facing",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "content_production_owner",
    "field_label_en": "Content production owner",
    "planet_key": "audience",
    "segment": "Social & Content Engine",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "verified",
    "why_key": "content_production_owner",
    "sources": [
      {
        "source_brand": "Manager Office",
        "source_channel": "role confirmation",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "review-365d",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirms responsibility only; not content quality",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "whatsapp_community_size_band",
    "field_label_en": "WhatsApp community size band",
    "planet_key": "audience",
    "segment": "Owned Community / CRM",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "self-reported",
    "why_key": "whatsapp_community_size_band",
    "sources": [
      {
        "source_brand": "WhatsApp Communities",
        "source_channel": "declared member band",
        "source_type": "declared",
        "logo_asset": "codex:whatsapp",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-90d",
        "consent_requirement": "declared band only",
        "limitation_text": "Declared band only; never scrape member identities, phone numbers, or third-party contact lists",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "whatsapp_channel_follower_band",
    "field_label_en": "WhatsApp Channel follower band",
    "planet_key": "audience",
    "segment": "Owned Community / CRM",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "self-reported",
    "why_key": "whatsapp_channel_follower_band",
    "sources": [
      {
        "source_brand": "WhatsApp Channels",
        "source_channel": "declared follower band",
        "source_type": "declared",
        "logo_asset": "codex:whatsapp",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-90d",
        "consent_requirement": "declared band only",
        "limitation_text": "Declared band only; never scrape member identities, phone numbers, or third-party contact lists",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "telegram_group_member_band",
    "field_label_en": "Telegram group member band",
    "planet_key": "audience",
    "segment": "Owned Community / CRM",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "self-reported",
    "why_key": "telegram_group_member_band",
    "sources": [
      {
        "source_brand": "Telegram Groups",
        "source_channel": "declared member band",
        "source_type": "declared",
        "logo_asset": "codex:telegram",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-90d",
        "consent_requirement": "declared band only",
        "limitation_text": "Declared band only; never scrape member identities, phone numbers, or third-party contact lists",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "telegram_channel_subscriber_band",
    "field_label_en": "Telegram channel subscriber band",
    "planet_key": "audience",
    "segment": "Owned Community / CRM",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "self-reported",
    "why_key": "telegram_channel_subscriber_band",
    "sources": [
      {
        "source_brand": "Telegram Channels",
        "source_channel": "declared subscriber band",
        "source_type": "declared",
        "logo_asset": "codex:telegram",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-90d",
        "consent_requirement": "declared band only",
        "limitation_text": "Declared band only; never scrape member identities, phone numbers, or third-party contact lists",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "discord_member_band",
    "field_label_en": "Discord member band",
    "planet_key": "audience",
    "segment": "Owned Community / CRM",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "self-reported",
    "why_key": "discord_member_band",
    "sources": [
      {
        "source_brand": "Discord",
        "source_channel": "declared member band",
        "source_type": "declared",
        "logo_asset": "generic:none",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-90d",
        "consent_requirement": "declared band only",
        "limitation_text": "Declared band only; never scrape member identities, phone numbers, or third-party contact lists",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "email_subscriber_band",
    "field_label_en": "Email subscriber band",
    "planet_key": "audience",
    "segment": "Owned Community / CRM",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "email_subscriber_band",
    "sources": [
      {
        "source_brand": "Mailchimp",
        "source_channel": "audience list analytics",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Counts render as bands; no subscriber identities enter LOCK",
        "applicability": "conditional"
      },
      {
        "source_brand": "Klaviyo",
        "source_channel": "audience list analytics",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Counts render as bands; no subscriber identities enter LOCK",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "email_open_rate_band",
    "field_label_en": "Email open-rate band",
    "planet_key": "audience",
    "segment": "Owned Community / CRM",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "email_open_rate_band",
    "sources": [
      {
        "source_brand": "Mailchimp",
        "source_channel": "campaign analytics",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Campaign metric is descriptive and permissioned; never a score",
        "applicability": "supporting"
      },
      {
        "source_brand": "Klaviyo",
        "source_channel": "campaign analytics",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Campaign metric is descriptive and permissioned; never a score",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "email_click_rate_band",
    "field_label_en": "Email click-rate band",
    "planet_key": "audience",
    "segment": "Owned Community / CRM",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "email_click_rate_band",
    "sources": [
      {
        "source_brand": "Mailchimp",
        "source_channel": "campaign analytics",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Campaign metric is descriptive and permissioned; never a score",
        "applicability": "supporting"
      },
      {
        "source_brand": "Klaviyo",
        "source_channel": "campaign analytics",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Campaign metric is descriptive and permissioned; never a score",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "patreon_member_band",
    "field_label_en": "Patreon member band",
    "planet_key": "audience",
    "segment": "Owned Community / CRM",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "patreon_member_band",
    "sources": [
      {
        "source_brand": "Patreon",
        "source_channel": "membership analytics",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Count renders as a band; supporter identities are not imported",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "sms_list_size_band",
    "field_label_en": "SMS list size band",
    "planet_key": "audience",
    "segment": "Owned Community / CRM",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "supporting",
    "why_key": "sms_list_size_band",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "aggregate list report",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist upload",
        "limitation_text": "Aggregate band only; no phone-number list is retained",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "community_territory",
    "field_label_en": "Community territory",
    "planet_key": "audience",
    "segment": "Owned Community / CRM",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "self-reported",
    "why_key": "community_territory",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "community_language",
    "field_label_en": "Community language",
    "planet_key": "audience",
    "segment": "Owned Community / CRM",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "self-reported",
    "why_key": "community_language",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "broadcast_reach_band",
    "field_label_en": "Broadcast reach band",
    "planet_key": "audience",
    "segment": "Owned Community / CRM",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "self-reported",
    "why_key": "broadcast_reach_band",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Declared band only; never scrape member identities, phone numbers, or third-party contact lists",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "opt_out_process",
    "field_label_en": "Opt-out process",
    "planet_key": "audience",
    "segment": "Owned Community / CRM",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "self-reported",
    "why_key": "opt_out_process",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "community_consent_record",
    "field_label_en": "Community consent record",
    "planet_key": "audience",
    "segment": "Owned Community / CRM",
    "applicability": "required",
    "visibility": "working",
    "freshness": "review-365d",
    "method_ceiling": "supporting",
    "why_key": "community_consent_record",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "consent record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist upload",
        "limitation_text": "Confirms consent process existence; does not import personal contact data",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "community_to_ticket_evidence",
    "field_label_en": "Community-to-ticket evidence",
    "planet_key": "audience",
    "segment": "Owned Community / CRM",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "per-event",
    "method_ceiling": "verified",
    "why_key": "community_to_ticket_evidence",
    "sources": [
      {
        "source_brand": "UTM Report",
        "source_channel": "tracked-link report",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "per-event",
        "consent_requirement": "artist upload",
        "limitation_text": "Attribution is bounded to the tracked mechanism and event; no general causality claim",
        "applicability": "conditional"
      },
      {
        "source_brand": "Coupon-Code Report",
        "source_channel": "coupon report",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "per-event",
        "consent_requirement": "artist upload",
        "limitation_text": "Attribution is bounded to the tracked mechanism and event; no general causality claim",
        "applicability": "conditional"
      },
      {
        "source_brand": "Ticket Export",
        "source_channel": "artist-owned account export",
        "source_type": "document",
        "logo_asset": "generic:ticket-export",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist upload",
        "limitation_text": "Attribution is bounded to the tracked mechanism and event; no general causality claim",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "community_last_activity_date",
    "field_label_en": "Community last activity date",
    "planet_key": "audience",
    "segment": "Owned Community / CRM",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-on-source-change",
    "method_ceiling": "not-assessable",
    "why_key": "community_last_activity_date",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "refresh-on-source-change",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed history only; never rendered as a prediction; aggregate activity date only",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "past_performance",
    "field_label_en": "Past performance record",
    "planet_key": "live",
    "segment": "Live Footprint & Performance",
    "applicability": "required",
    "visibility": "passport-eligible",
    "freshness": "per-event",
    "method_ceiling": "verified",
    "why_key": "past_performance",
    "sources": [
      {
        "source_brand": "Resident Advisor",
        "source_channel": "public event page",
        "source_type": "platform",
        "logo_asset": "codex:resident-advisor",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Public listing alone is supporting context; artist confirms identity and participation",
        "applicability": "required"
      },
      {
        "source_brand": "Bandsintown",
        "source_channel": "past event page",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Public listing alone is supporting context; artist confirms identity and participation",
        "applicability": "conditional"
      },
      {
        "source_brand": "Songkick",
        "source_channel": "past event page",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Public listing alone is supporting context; artist confirms identity and participation",
        "applicability": "conditional"
      },
      {
        "source_brand": "Facebook Events",
        "source_channel": "public event page",
        "source_type": "platform",
        "logo_asset": "codex:facebook",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Public listing alone is supporting context; artist confirms identity and participation",
        "applicability": "conditional"
      },
      {
        "source_brand": "Official Festival Website",
        "source_channel": "lineup page",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Public listing alone is supporting context; artist confirms identity and participation",
        "applicability": "conditional"
      },
      {
        "source_brand": "Official Venue Website",
        "source_channel": "event page",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Public listing alone is supporting context; artist confirms identity and participation",
        "applicability": "conditional"
      },
      {
        "source_brand": "Lineup Poster",
        "source_channel": "lineup poster",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "per-event",
        "consent_requirement": "artist upload",
        "limitation_text": "Poster supports billing presence; it does not prove attendance or delivery",
        "applicability": "required"
      },
      {
        "source_brand": "Event Producer",
        "source_channel": "event confirmation",
        "source_type": "entity",
        "logo_asset": "generic:producer-confirmation",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirmation covers this bounded claim only",
        "applicability": "required"
      },
      {
        "source_brand": "Venue",
        "source_channel": "event confirmation",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirmation covers this bounded claim only",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "artist_role_in_event",
    "field_label_en": "Artist role in event",
    "planet_key": "live",
    "segment": "Live Footprint & Performance",
    "applicability": "required",
    "visibility": "passport-eligible",
    "freshness": "per-event",
    "method_ceiling": "verified",
    "why_key": "artist_role_in_event",
    "sources": [
      {
        "source_brand": "Lineup Poster",
        "source_channel": "lineup poster",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "per-event",
        "consent_requirement": "artist upload",
        "limitation_text": "Billing language may be ambiguous; producer confirmation is stronger",
        "applicability": "required"
      },
      {
        "source_brand": "Event Producer",
        "source_channel": "role confirmation",
        "source_type": "entity",
        "logo_asset": "generic:producer-confirmation",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirmation covers this bounded claim only",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "slot_type",
    "field_label_en": "Slot type held",
    "planet_key": "live",
    "segment": "Live Footprint & Performance",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "per-event",
    "method_ceiling": "verified",
    "why_key": "slot_type",
    "sources": [
      {
        "source_brand": "Lineup Poster",
        "source_channel": "lineup poster",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "per-event",
        "consent_requirement": "artist upload",
        "limitation_text": "Poster supports billing position only where explicitly shown",
        "applicability": "conditional"
      },
      {
        "source_brand": "Event Producer",
        "source_channel": "slot confirmation",
        "source_type": "entity",
        "logo_asset": "generic:producer-confirmation",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirmation covers this bounded claim only",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "set_format",
    "field_label_en": "Set format",
    "planet_key": "live",
    "segment": "Live Footprint & Performance",
    "applicability": "required",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "set_format",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "set_duration",
    "field_label_en": "Set duration",
    "planet_key": "live",
    "segment": "Live Footprint & Performance",
    "applicability": "required",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "set_duration",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "open_format_capability",
    "field_label_en": "Open-format capability",
    "planet_key": "live",
    "segment": "Live Footprint & Performance",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "open_format_capability",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "performance_frequency_band",
    "field_label_en": "Performance frequency band",
    "planet_key": "live",
    "segment": "Live Footprint & Performance",
    "applicability": "supporting",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "performance_frequency_band",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": null,
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "residency_record",
    "field_label_en": "Residency record",
    "planet_key": "live",
    "segment": "Live Footprint & Performance",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "verified",
    "why_key": "residency_record",
    "sources": [
      {
        "source_brand": "Resident Advisor",
        "source_channel": "recurring event or residency page",
        "source_type": "platform",
        "logo_asset": "codex:resident-advisor",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Public listing is supporting; venue or producer confirmation can verify the relationship",
        "applicability": "conditional"
      },
      {
        "source_brand": "Official Venue Website",
        "source_channel": "recurring event or residency page",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Public listing is supporting; venue or producer confirmation can verify the relationship",
        "applicability": "conditional"
      },
      {
        "source_brand": "Event Producer",
        "source_channel": "residency confirmation",
        "source_type": "entity",
        "logo_asset": "generic:producer-confirmation",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "review-180d",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirmation covers this bounded claim only",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "live_video_link",
    "field_label_en": "Live video",
    "planet_key": "live",
    "segment": "Live Footprint & Performance",
    "applicability": "required",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "live_video_link",
    "sources": [
      {
        "source_brand": "YouTube",
        "source_channel": "live video",
        "source_type": "platform",
        "logo_asset": "codex:youtube",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Video supports the performance footprint; it does not verify paid draw",
        "applicability": "required"
      },
      {
        "source_brand": "LOCK",
        "source_channel": "artist-uploaded video",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist upload",
        "limitation_text": "Artist upload; performance context should be stated",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "full_set_video",
    "field_label_en": "Full-set video",
    "planet_key": "live",
    "segment": "Live Footprint & Performance",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "full_set_video",
    "sources": [
      {
        "source_brand": "YouTube",
        "source_channel": "full set",
        "source_type": "platform",
        "logo_asset": "codex:youtube",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Video supports the performance footprint; it does not verify paid draw",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "fan_footage_link",
    "field_label_en": "Fan footage",
    "planet_key": "live",
    "segment": "Live Footprint & Performance",
    "applicability": "supporting",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "fan_footage_link",
    "sources": [
      {
        "source_brand": "Instagram",
        "source_channel": "tagged post or Reel",
        "source_type": "platform",
        "logo_asset": "codex:instagram",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Video supports the performance footprint; it does not verify paid draw",
        "applicability": "supporting"
      },
      {
        "source_brand": "TikTok",
        "source_channel": "fan video",
        "source_type": "platform",
        "logo_asset": "codex:tiktok",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Video supports the performance footprint; it does not verify paid draw",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "live_repeat_booking",
    "field_label_en": "Repeat booking",
    "planet_key": "live",
    "segment": "Live Footprint & Performance",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "per-event",
    "method_ceiling": "verified",
    "why_key": "live_repeat_booking",
    "sources": [
      {
        "source_brand": "Event Producer",
        "source_channel": "repeat booking",
        "source_type": "entity",
        "logo_asset": "generic:producer-confirmation",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirmation covers this bounded claim only",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "invited_back",
    "field_label_en": "Invited back",
    "planet_key": "live",
    "segment": "Live Footprint & Performance",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "per-event",
    "method_ceiling": "verified",
    "why_key": "invited_back",
    "sources": [
      {
        "source_brand": "Event Producer",
        "source_channel": "invited back",
        "source_type": "entity",
        "logo_asset": "generic:producer-confirmation",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirmation covers this bounded claim only",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "performance_delivery_confirmation",
    "field_label_en": "Performance delivery confirmation",
    "planet_key": "live",
    "segment": "Live Footprint & Performance",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "per-event",
    "method_ceiling": "verified",
    "why_key": "performance_delivery_confirmation",
    "sources": [
      {
        "source_brand": "Event Producer",
        "source_channel": "performance delivery confirmation",
        "source_type": "entity",
        "logo_asset": "generic:producer-confirmation",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirmation covers this bounded claim only",
        "applicability": "conditional"
      },
      {
        "source_brand": "Venue",
        "source_channel": "delivery confirmation",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirmation covers this bounded claim only",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "event_ticket_export",
    "field_label_en": "Event ticket export",
    "planet_key": "proof",
    "segment": "Ticketing, Draw & Event Evidence",
    "applicability": "required",
    "visibility": "passport-eligible",
    "freshness": "per-event",
    "method_ceiling": "verified",
    "why_key": "event_ticket_export",
    "sources": [
      {
        "source_brand": "Eventer",
        "source_channel": "artist-owned account export",
        "source_type": "document",
        "logo_asset": "generic:ticket-export",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist owns the account",
        "limitation_text": "Only the artist-owned account export is documentary proof; public scans or aggregator numbers are not equivalent",
        "applicability": "required"
      },
      {
        "source_brand": "Tickchak",
        "source_channel": "artist-owned account export",
        "source_type": "document",
        "logo_asset": "generic:ticket-export",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist owns the account",
        "limitation_text": "Only the artist-owned account export is documentary proof; public scans or aggregator numbers are not equivalent",
        "applicability": "conditional"
      },
      {
        "source_brand": "Ticketmaster Israel",
        "source_channel": "artist-owned account export",
        "source_type": "document",
        "logo_asset": "generic:ticket-export",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist owns the account",
        "limitation_text": "Only the artist-owned account export is documentary proof; public scans or aggregator numbers are not equivalent",
        "applicability": "conditional"
      },
      {
        "source_brand": "Go-out",
        "source_channel": "artist-owned account export",
        "source_type": "document",
        "logo_asset": "generic:ticket-export",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist owns the account",
        "limitation_text": "Only the artist-owned account export is documentary proof; public scans or aggregator numbers are not equivalent",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "ticket_sales_band",
    "field_label_en": "Ticket sales band",
    "planet_key": "proof",
    "segment": "Ticketing, Draw & Event Evidence",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "per-event",
    "method_ceiling": "verified",
    "why_key": "ticket_sales_band",
    "sources": [
      {
        "source_brand": "Eventer",
        "source_channel": "artist-owned account export",
        "source_type": "document",
        "logo_asset": "generic:ticket-export",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist owns the account",
        "limitation_text": "Only the artist-owned account export is documentary proof; public scans or aggregator numbers are not equivalent; raw counts remain working-only and render as governed bands",
        "applicability": "conditional"
      },
      {
        "source_brand": "Tickchak",
        "source_channel": "artist-owned account export",
        "source_type": "document",
        "logo_asset": "generic:ticket-export",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist owns the account",
        "limitation_text": "Only the artist-owned account export is documentary proof; public scans or aggregator numbers are not equivalent; raw counts remain working-only and render as governed bands",
        "applicability": "conditional"
      },
      {
        "source_brand": "Ticketmaster Israel",
        "source_channel": "artist-owned account export",
        "source_type": "document",
        "logo_asset": "generic:ticket-export",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist owns the account",
        "limitation_text": "Only the artist-owned account export is documentary proof; public scans or aggregator numbers are not equivalent; raw counts remain working-only and render as governed bands",
        "applicability": "conditional"
      },
      {
        "source_brand": "Go-out",
        "source_channel": "artist-owned account export",
        "source_type": "document",
        "logo_asset": "generic:ticket-export",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist owns the account",
        "limitation_text": "Only the artist-owned account export is documentary proof; public scans or aggregator numbers are not equivalent; raw counts remain working-only and render as governed bands",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "tickets_scanned_band",
    "field_label_en": "Tickets scanned band",
    "planet_key": "proof",
    "segment": "Ticketing, Draw & Event Evidence",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "per-event",
    "method_ceiling": "verified",
    "why_key": "tickets_scanned_band",
    "sources": [
      {
        "source_brand": "Eventer",
        "source_channel": "artist-owned account export",
        "source_type": "document",
        "logo_asset": "generic:ticket-export",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist owns the account",
        "limitation_text": "Only the artist-owned account export is documentary proof; public scans or aggregator numbers are not equivalent; raw counts remain working-only and render as governed bands",
        "applicability": "conditional"
      },
      {
        "source_brand": "Tickchak",
        "source_channel": "artist-owned account export",
        "source_type": "document",
        "logo_asset": "generic:ticket-export",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist owns the account",
        "limitation_text": "Only the artist-owned account export is documentary proof; public scans or aggregator numbers are not equivalent; raw counts remain working-only and render as governed bands",
        "applicability": "conditional"
      },
      {
        "source_brand": "Ticketmaster Israel",
        "source_channel": "artist-owned account export",
        "source_type": "document",
        "logo_asset": "generic:ticket-export",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist owns the account",
        "limitation_text": "Only the artist-owned account export is documentary proof; public scans or aggregator numbers are not equivalent; raw counts remain working-only and render as governed bands",
        "applicability": "conditional"
      },
      {
        "source_brand": "Go-out",
        "source_channel": "artist-owned account export",
        "source_type": "document",
        "logo_asset": "generic:ticket-export",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist owns the account",
        "limitation_text": "Only the artist-owned account export is documentary proof; public scans or aggregator numbers are not equivalent; raw counts remain working-only and render as governed bands",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "attendance_band",
    "field_label_en": "Attendance band",
    "planet_key": "proof",
    "segment": "Ticketing, Draw & Event Evidence",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "per-event",
    "method_ceiling": "verified",
    "why_key": "attendance_band",
    "sources": [
      {
        "source_brand": "Eventer",
        "source_channel": "artist-owned account export",
        "source_type": "document",
        "logo_asset": "generic:ticket-export",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist owns the account",
        "limitation_text": "Only the artist-owned account export is documentary proof; public scans or aggregator numbers are not equivalent; raw counts remain working-only and render as governed bands",
        "applicability": "conditional"
      },
      {
        "source_brand": "Tickchak",
        "source_channel": "artist-owned account export",
        "source_type": "document",
        "logo_asset": "generic:ticket-export",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist owns the account",
        "limitation_text": "Only the artist-owned account export is documentary proof; public scans or aggregator numbers are not equivalent; raw counts remain working-only and render as governed bands",
        "applicability": "conditional"
      },
      {
        "source_brand": "Ticketmaster Israel",
        "source_channel": "artist-owned account export",
        "source_type": "document",
        "logo_asset": "generic:ticket-export",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist owns the account",
        "limitation_text": "Only the artist-owned account export is documentary proof; public scans or aggregator numbers are not equivalent; raw counts remain working-only and render as governed bands",
        "applicability": "conditional"
      },
      {
        "source_brand": "Go-out",
        "source_channel": "artist-owned account export",
        "source_type": "document",
        "logo_asset": "generic:ticket-export",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist owns the account",
        "limitation_text": "Only the artist-owned account export is documentary proof; public scans or aggregator numbers are not equivalent; raw counts remain working-only and render as governed bands",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "artist_attributed_sales_band",
    "field_label_en": "Artist-attributed sales band",
    "planet_key": "proof",
    "segment": "Ticketing, Draw & Event Evidence",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "per-event",
    "method_ceiling": "verified",
    "why_key": "artist_attributed_sales_band",
    "sources": [
      {
        "source_brand": "Eventer",
        "source_channel": "artist-owned account export",
        "source_type": "document",
        "logo_asset": "generic:ticket-export",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist owns the account",
        "limitation_text": "Only the artist-owned account export is documentary proof; public scans or aggregator numbers are not equivalent; raw counts remain working-only and render as governed bands",
        "applicability": "conditional"
      },
      {
        "source_brand": "Tickchak",
        "source_channel": "artist-owned account export",
        "source_type": "document",
        "logo_asset": "generic:ticket-export",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist owns the account",
        "limitation_text": "Only the artist-owned account export is documentary proof; public scans or aggregator numbers are not equivalent; raw counts remain working-only and render as governed bands",
        "applicability": "conditional"
      },
      {
        "source_brand": "Ticketmaster Israel",
        "source_channel": "artist-owned account export",
        "source_type": "document",
        "logo_asset": "generic:ticket-export",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist owns the account",
        "limitation_text": "Only the artist-owned account export is documentary proof; public scans or aggregator numbers are not equivalent; raw counts remain working-only and render as governed bands",
        "applicability": "conditional"
      },
      {
        "source_brand": "Go-out",
        "source_channel": "artist-owned account export",
        "source_type": "document",
        "logo_asset": "generic:ticket-export",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist owns the account",
        "limitation_text": "Only the artist-owned account export is documentary proof; public scans or aggregator numbers are not equivalent; raw counts remain working-only and render as governed bands",
        "applicability": "conditional"
      },
      {
        "source_brand": "UTM Report",
        "source_channel": "tracked-link report",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "per-event",
        "consent_requirement": "artist upload",
        "limitation_text": "Attribution is bounded to the tracked link or code and event",
        "applicability": "conditional"
      },
      {
        "source_brand": "Coupon-Code Report",
        "source_channel": "coupon report",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "per-event",
        "consent_requirement": "artist upload",
        "limitation_text": "Attribution is bounded to the tracked link or code and event",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "personal_link_sales_band",
    "field_label_en": "Personal-link sales band",
    "planet_key": "proof",
    "segment": "Ticketing, Draw & Event Evidence",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "per-event",
    "method_ceiling": "verified",
    "why_key": "personal_link_sales_band",
    "sources": [
      {
        "source_brand": "Eventer",
        "source_channel": "artist-owned account export",
        "source_type": "document",
        "logo_asset": "generic:ticket-export",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist owns the account",
        "limitation_text": "Only the artist-owned account export is documentary proof; public scans or aggregator numbers are not equivalent; raw counts remain working-only and render as governed bands",
        "applicability": "conditional"
      },
      {
        "source_brand": "Tickchak",
        "source_channel": "artist-owned account export",
        "source_type": "document",
        "logo_asset": "generic:ticket-export",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist owns the account",
        "limitation_text": "Only the artist-owned account export is documentary proof; public scans or aggregator numbers are not equivalent; raw counts remain working-only and render as governed bands",
        "applicability": "conditional"
      },
      {
        "source_brand": "Ticketmaster Israel",
        "source_channel": "artist-owned account export",
        "source_type": "document",
        "logo_asset": "generic:ticket-export",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist owns the account",
        "limitation_text": "Only the artist-owned account export is documentary proof; public scans or aggregator numbers are not equivalent; raw counts remain working-only and render as governed bands",
        "applicability": "conditional"
      },
      {
        "source_brand": "Go-out",
        "source_channel": "artist-owned account export",
        "source_type": "document",
        "logo_asset": "generic:ticket-export",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist owns the account",
        "limitation_text": "Only the artist-owned account export is documentary proof; public scans or aggregator numbers are not equivalent; raw counts remain working-only and render as governed bands",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "coupon_code_sales_band",
    "field_label_en": "Coupon-code sales band",
    "planet_key": "proof",
    "segment": "Ticketing, Draw & Event Evidence",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "per-event",
    "method_ceiling": "verified",
    "why_key": "coupon_code_sales_band",
    "sources": [
      {
        "source_brand": "Eventer",
        "source_channel": "artist-owned account export",
        "source_type": "document",
        "logo_asset": "generic:ticket-export",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist owns the account",
        "limitation_text": "Only the artist-owned account export is documentary proof; public scans or aggregator numbers are not equivalent; raw counts remain working-only and render as governed bands",
        "applicability": "conditional"
      },
      {
        "source_brand": "Tickchak",
        "source_channel": "artist-owned account export",
        "source_type": "document",
        "logo_asset": "generic:ticket-export",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist owns the account",
        "limitation_text": "Only the artist-owned account export is documentary proof; public scans or aggregator numbers are not equivalent; raw counts remain working-only and render as governed bands",
        "applicability": "conditional"
      },
      {
        "source_brand": "Ticketmaster Israel",
        "source_channel": "artist-owned account export",
        "source_type": "document",
        "logo_asset": "generic:ticket-export",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist owns the account",
        "limitation_text": "Only the artist-owned account export is documentary proof; public scans or aggregator numbers are not equivalent; raw counts remain working-only and render as governed bands",
        "applicability": "conditional"
      },
      {
        "source_brand": "Go-out",
        "source_channel": "artist-owned account export",
        "source_type": "document",
        "logo_asset": "generic:ticket-export",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist owns the account",
        "limitation_text": "Only the artist-owned account export is documentary proof; public scans or aggregator numbers are not equivalent; raw counts remain working-only and render as governed bands",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "presale_velocity_band",
    "field_label_en": "Presale velocity band",
    "planet_key": "proof",
    "segment": "Ticketing, Draw & Event Evidence",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "per-event",
    "method_ceiling": "verified",
    "why_key": "presale_velocity_band",
    "sources": [
      {
        "source_brand": "Eventer",
        "source_channel": "artist-owned account export",
        "source_type": "document",
        "logo_asset": "generic:ticket-export",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist owns the account",
        "limitation_text": "Only the artist-owned account export is documentary proof; public scans or aggregator numbers are not equivalent; raw counts remain working-only and render as governed bands",
        "applicability": "conditional"
      },
      {
        "source_brand": "Tickchak",
        "source_channel": "artist-owned account export",
        "source_type": "document",
        "logo_asset": "generic:ticket-export",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist owns the account",
        "limitation_text": "Only the artist-owned account export is documentary proof; public scans or aggregator numbers are not equivalent; raw counts remain working-only and render as governed bands",
        "applicability": "conditional"
      },
      {
        "source_brand": "Ticketmaster Israel",
        "source_channel": "artist-owned account export",
        "source_type": "document",
        "logo_asset": "generic:ticket-export",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist owns the account",
        "limitation_text": "Only the artist-owned account export is documentary proof; public scans or aggregator numbers are not equivalent; raw counts remain working-only and render as governed bands",
        "applicability": "conditional"
      },
      {
        "source_brand": "Go-out",
        "source_channel": "artist-owned account export",
        "source_type": "document",
        "logo_asset": "generic:ticket-export",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist owns the account",
        "limitation_text": "Only the artist-owned account export is documentary proof; public scans or aggregator numbers are not equivalent; raw counts remain working-only and render as governed bands",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "door_sales_band",
    "field_label_en": "Door sales band",
    "planet_key": "proof",
    "segment": "Ticketing, Draw & Event Evidence",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "per-event",
    "method_ceiling": "verified",
    "why_key": "door_sales_band",
    "sources": [
      {
        "source_brand": "Event Settlement",
        "source_channel": "door report",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist upload",
        "limitation_text": "Event-bounded settlement evidence; attribution to the artist must be stated separately",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "guest_list_band",
    "field_label_en": "Guest-list band",
    "planet_key": "proof",
    "segment": "Ticketing, Draw & Event Evidence",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "per-event",
    "method_ceiling": "verified",
    "why_key": "guest_list_band",
    "sources": [
      {
        "source_brand": "Event Settlement",
        "source_channel": "guest-list report",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist upload",
        "limitation_text": "Event-bounded settlement evidence; attribution to the artist must be stated separately",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "paid_vs_complimentary_band",
    "field_label_en": "Paid-versus-complimentary band",
    "planet_key": "proof",
    "segment": "Ticketing, Draw & Event Evidence",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "per-event",
    "method_ceiling": "verified",
    "why_key": "paid_vs_complimentary_band",
    "sources": [
      {
        "source_brand": "Event Settlement",
        "source_channel": "settlement report",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist upload",
        "limitation_text": "Event-bounded settlement evidence; attribution to the artist must be stated separately",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "gross_settlement_band",
    "field_label_en": "Gross settlement band",
    "planet_key": "proof",
    "segment": "Ticketing, Draw & Event Evidence",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "per-event",
    "method_ceiling": "verified",
    "why_key": "gross_settlement_band",
    "sources": [
      {
        "source_brand": "Event Settlement",
        "source_channel": "settlement",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist upload",
        "limitation_text": "Event-bounded settlement evidence; attribution to the artist must be stated separately",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "net_settlement_band",
    "field_label_en": "Net settlement band",
    "planet_key": "proof",
    "segment": "Ticketing, Draw & Event Evidence",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "per-event",
    "method_ceiling": "verified",
    "why_key": "net_settlement_band",
    "sources": [
      {
        "source_brand": "Event Settlement",
        "source_channel": "settlement",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "artist upload",
        "limitation_text": "Event-bounded settlement evidence; attribution to the artist must be stated separately",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "self_produced_event",
    "field_label_en": "Self-produced event",
    "planet_key": "proof",
    "segment": "Ticketing, Draw & Event Evidence",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "per-event",
    "method_ceiling": "self-reported",
    "why_key": "self_produced_event",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "per-event",
        "consent_requirement": "artist declaration",
        "limitation_text": "Declaration requires event evidence before Passport eligibility",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "ticketing_repeat_booking",
    "field_label_en": "Repeat booking",
    "planet_key": "proof",
    "segment": "Ticketing, Draw & Event Evidence",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "per-event",
    "method_ceiling": "verified",
    "why_key": "ticketing_repeat_booking",
    "sources": [
      {
        "source_brand": "Event Producer",
        "source_channel": "repeat-booking confirmation",
        "source_type": "entity",
        "logo_asset": "generic:producer-confirmation",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirmation covers this bounded claim only",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "venue_capacity_band",
    "field_label_en": "Venue capacity band",
    "planet_key": "proof",
    "segment": "Ticketing, Draw & Event Evidence",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "per-event",
    "method_ceiling": "verified",
    "why_key": "venue_capacity_band",
    "sources": [
      {
        "source_brand": "Venue",
        "source_channel": "capacity confirmation",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Capacity is context; it is not attendance or artist-attributed draw",
        "applicability": "conditional"
      },
      {
        "source_brand": "Venue Capacity Record",
        "source_channel": "official capacity record",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "per-event",
        "consent_requirement": "artist upload",
        "limitation_text": "Capacity is context; it is not attendance or artist-attributed draw",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "booking_context",
    "field_label_en": "Booking context",
    "planet_key": "proof",
    "segment": "Booking Market & Commercials",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "self-reported",
    "why_key": "booking_context",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Opportunity context only; fit is assessed per event and never stored as an artist score",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "buyer_type",
    "field_label_en": "Buyer type",
    "planet_key": "proof",
    "segment": "Booking Market & Commercials",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "self-reported",
    "why_key": "buyer_type",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Opportunity context only; fit is assessed per event and never stored as an artist score",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "event_territory",
    "field_label_en": "Event territory",
    "planet_key": "proof",
    "segment": "Booking Market & Commercials",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "self-reported",
    "why_key": "event_territory",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Opportunity context only; fit is assessed per event and never stored as an artist score",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "availability_status",
    "field_label_en": "Availability status",
    "planet_key": "proof",
    "segment": "Booking Market & Commercials",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "self-reported",
    "why_key": "availability_status",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Opportunity context only; fit is assessed per event and never stored as an artist score",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "fee_band",
    "field_label_en": "Fee band",
    "planet_key": "proof",
    "segment": "Booking Market & Commercials",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "self-reported",
    "why_key": "fee_band",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Opportunity context only; fit is assessed per event and never stored as an artist score",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "booking_request_source",
    "field_label_en": "Booking request source",
    "planet_key": "proof",
    "segment": "Booking Market & Commercials",
    "applicability": "conditional",
    "visibility": "working",
    "freshness": "per-request",
    "method_ceiling": "supporting",
    "why_key": "booking_request_source",
    "sources": [
      {
        "source_brand": "Gmail",
        "source_channel": "booking conversation",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "per-request",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Conversation metadata is private working context; message content requires explicit handling",
        "applicability": "conditional"
      },
      {
        "source_brand": "WhatsApp",
        "source_channel": "booking conversation",
        "source_type": "platform",
        "logo_asset": "codex:whatsapp",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "per-request",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Conversation metadata is private working context; message content requires explicit handling",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "booking_availability_process",
    "field_label_en": "Availability process",
    "planet_key": "proof",
    "segment": "Booking Market & Commercials",
    "applicability": "conditional",
    "visibility": "buyer-context",
    "freshness": "review-90d",
    "method_ceiling": "supporting",
    "why_key": "booking_availability_process",
    "sources": [
      {
        "source_brand": "Google Calendar",
        "source_channel": "availability workflow",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Shows that a process exists; it does not expose private calendar details",
        "applicability": "conditional"
      },
      {
        "source_brand": "Calendly",
        "source_channel": "availability workflow",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Shows that a process exists; it does not expose private calendar details",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "quote_document",
    "field_label_en": "Quote",
    "planet_key": "proof",
    "segment": "Booking Market & Commercials",
    "applicability": "conditional",
    "visibility": "working",
    "freshness": "per-request",
    "method_ceiling": "supporting",
    "why_key": "quote_document",
    "sources": [
      {
        "source_brand": "Booking Document",
        "source_channel": "quote",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "per-request",
        "consent_requirement": "artist upload",
        "limitation_text": "Private transaction terms; never public unless explicitly selected",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "travel_terms",
    "field_label_en": "Travel terms",
    "planet_key": "proof",
    "segment": "Booking Market & Commercials",
    "applicability": "conditional",
    "visibility": "working",
    "freshness": "per-request",
    "method_ceiling": "supporting",
    "why_key": "travel_terms",
    "sources": [
      {
        "source_brand": "Booking Document",
        "source_channel": "quote or contract",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "per-request",
        "consent_requirement": "artist upload",
        "limitation_text": "Private transaction terms; never public unless explicitly selected",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "expense_terms",
    "field_label_en": "Expense terms",
    "planet_key": "proof",
    "segment": "Booking Market & Commercials",
    "applicability": "conditional",
    "visibility": "working",
    "freshness": "per-request",
    "method_ceiling": "supporting",
    "why_key": "expense_terms",
    "sources": [
      {
        "source_brand": "Booking Document",
        "source_channel": "quote or contract",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "per-request",
        "consent_requirement": "artist upload",
        "limitation_text": "Private transaction terms; never public unless explicitly selected",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "deposit_requirement",
    "field_label_en": "Deposit requirement",
    "planet_key": "proof",
    "segment": "Booking Market & Commercials",
    "applicability": "conditional",
    "visibility": "working",
    "freshness": "per-request",
    "method_ceiling": "supporting",
    "why_key": "deposit_requirement",
    "sources": [
      {
        "source_brand": "Booking Document",
        "source_channel": "contract",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "per-request",
        "consent_requirement": "artist upload",
        "limitation_text": "Private transaction terms; never public unless explicitly selected",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "payment_terms",
    "field_label_en": "Payment terms",
    "planet_key": "proof",
    "segment": "Booking Market & Commercials",
    "applicability": "required",
    "visibility": "working",
    "freshness": "per-request",
    "method_ceiling": "supporting",
    "why_key": "payment_terms",
    "sources": [
      {
        "source_brand": "Booking Document",
        "source_channel": "contract",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "per-request",
        "consent_requirement": "artist upload",
        "limitation_text": "Private transaction terms; never public unless explicitly selected",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "cancellation_terms",
    "field_label_en": "Cancellation terms",
    "planet_key": "proof",
    "segment": "Booking Market & Commercials",
    "applicability": "required",
    "visibility": "working",
    "freshness": "per-request",
    "method_ceiling": "supporting",
    "why_key": "cancellation_terms",
    "sources": [
      {
        "source_brand": "Booking Document",
        "source_channel": "contract",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "per-request",
        "consent_requirement": "artist upload",
        "limitation_text": "Private transaction terms; never public unless explicitly selected",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "negotiator",
    "field_label_en": "Negotiator",
    "planet_key": "proof",
    "segment": "Booking Market & Commercials",
    "applicability": "conditional",
    "visibility": "buyer-context",
    "freshness": "review-365d",
    "method_ceiling": "verified",
    "why_key": "negotiator",
    "sources": [
      {
        "source_brand": "Manager Office",
        "source_channel": "negotiation-authority confirmation",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "review-365d",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirmation covers this bounded claim only",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "booking_contracting_entity",
    "field_label_en": "Contracting entity",
    "planet_key": "proof",
    "segment": "Booking Market & Commercials",
    "applicability": "required",
    "visibility": "buyer-context",
    "freshness": "review-365d",
    "method_ceiling": "verified",
    "why_key": "booking_contracting_entity",
    "sources": [
      {
        "source_brand": "Contracting Entity",
        "source_channel": "contracting-authority confirmation",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "review-365d",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirmation covers this bounded claim only",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "booking_request_date",
    "field_label_en": "Booking request date",
    "planet_key": "proof",
    "segment": "Booking Market & Commercials",
    "applicability": "supporting",
    "visibility": "working",
    "freshness": "per-request",
    "method_ceiling": "not-assessable",
    "why_key": "booking_request_date",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "per-request",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed private opportunity history only; never rendered as a prediction or artist weakness",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "event_date",
    "field_label_en": "Event date",
    "planet_key": "proof",
    "segment": "Booking Market & Commercials",
    "applicability": "supporting",
    "visibility": "working",
    "freshness": "per-request",
    "method_ceiling": "not-assessable",
    "why_key": "event_date",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "per-request",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed private opportunity history only; never rendered as a prediction or artist weakness",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "lead_time_band",
    "field_label_en": "Booking lead-time band",
    "planet_key": "proof",
    "segment": "Booking Market & Commercials",
    "applicability": "supporting",
    "visibility": "working",
    "freshness": "per-request",
    "method_ceiling": "not-assessable",
    "why_key": "lead_time_band",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "per-request",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed private opportunity history only; never rendered as a prediction or artist weakness",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "quote_status",
    "field_label_en": "Quote status",
    "planet_key": "proof",
    "segment": "Booking Market & Commercials",
    "applicability": "supporting",
    "visibility": "working",
    "freshness": "per-request",
    "method_ceiling": "not-assessable",
    "why_key": "quote_status",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "per-request",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed private opportunity history only; never rendered as a prediction or artist weakness",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "booking_status",
    "field_label_en": "Booking status",
    "planet_key": "proof",
    "segment": "Booking Market & Commercials",
    "applicability": "supporting",
    "visibility": "working",
    "freshness": "per-request",
    "method_ceiling": "not-assessable",
    "why_key": "booking_status",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "per-request",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed private opportunity history only; never rendered as a prediction or artist weakness",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "reason_closed",
    "field_label_en": "Reason closed",
    "planet_key": "proof",
    "segment": "Booking Market & Commercials",
    "applicability": "supporting",
    "visibility": "working",
    "freshness": "per-request",
    "method_ceiling": "not-assessable",
    "why_key": "reason_closed",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "per-request",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed private opportunity history only; never rendered as a prediction or artist weakness",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "booking_next_action",
    "field_label_en": "Booking next action",
    "planet_key": "proof",
    "segment": "Booking Market & Commercials",
    "applicability": "supporting",
    "visibility": "working",
    "freshness": "per-request",
    "method_ceiling": "not-assessable",
    "why_key": "booking_next_action",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "per-request",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed private opportunity history only; never rendered as a prediction or artist weakness",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "professional_reference",
    "field_label_en": "Professional reference",
    "planet_key": "proof",
    "segment": "Reputation, Trust & Reviews",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-365d",
    "method_ceiling": "verified",
    "why_key": "professional_reference",
    "sources": [
      {
        "source_brand": "Event Producer",
        "source_channel": "bounded professional reference",
        "source_type": "entity",
        "logo_asset": "generic:producer-confirmation",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "review-365d",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Reference covers the stated relationship and event only",
        "applicability": "conditional"
      },
      {
        "source_brand": "Venue",
        "source_channel": "bounded professional reference",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "review-365d",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Reference covers the stated relationship and event only",
        "applicability": "conditional"
      },
      {
        "source_brand": "Manager Office",
        "source_channel": "bounded professional reference",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "review-365d",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Reference covers the stated relationship and event only",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "reliability_confirmation",
    "field_label_en": "Reliability confirmation",
    "planet_key": "proof",
    "segment": "Reputation, Trust & Reviews",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "per-event",
    "method_ceiling": "verified",
    "why_key": "reliability_confirmation",
    "sources": [
      {
        "source_brand": "Event Producer",
        "source_channel": "reliability confirmation",
        "source_type": "entity",
        "logo_asset": "generic:producer-confirmation",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirmation covers this bounded claim only",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "punctuality_confirmation",
    "field_label_en": "Punctuality confirmation",
    "planet_key": "proof",
    "segment": "Reputation, Trust & Reviews",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "per-event",
    "method_ceiling": "verified",
    "why_key": "punctuality_confirmation",
    "sources": [
      {
        "source_brand": "Event Producer",
        "source_channel": "punctuality confirmation",
        "source_type": "entity",
        "logo_asset": "generic:producer-confirmation",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirmation covers this bounded claim only",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "communication_confirmation",
    "field_label_en": "Communication confirmation",
    "planet_key": "proof",
    "segment": "Reputation, Trust & Reviews",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "per-event",
    "method_ceiling": "verified",
    "why_key": "communication_confirmation",
    "sources": [
      {
        "source_brand": "Event Producer",
        "source_channel": "communication confirmation",
        "source_type": "entity",
        "logo_asset": "generic:producer-confirmation",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirmation covers this bounded claim only",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "technical_delivery_confirmation",
    "field_label_en": "Technical delivery confirmation",
    "planet_key": "proof",
    "segment": "Reputation, Trust & Reviews",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "per-event",
    "method_ceiling": "verified",
    "why_key": "technical_delivery_confirmation",
    "sources": [
      {
        "source_brand": "Event Producer",
        "source_channel": "technical delivery confirmation",
        "source_type": "entity",
        "logo_asset": "generic:producer-confirmation",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirmation covers this bounded claim only",
        "applicability": "conditional"
      },
      {
        "source_brand": "Venue",
        "source_channel": "technical delivery confirmation",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirmation covers this bounded claim only",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "artistic_delivery_confirmation",
    "field_label_en": "Artistic delivery confirmation",
    "planet_key": "proof",
    "segment": "Reputation, Trust & Reviews",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "per-event",
    "method_ceiling": "verified",
    "why_key": "artistic_delivery_confirmation",
    "sources": [
      {
        "source_brand": "Event Producer",
        "source_channel": "artistic delivery confirmation",
        "source_type": "entity",
        "logo_asset": "generic:producer-confirmation",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirmation covers this bounded claim only",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "problem_resolution_confirmation",
    "field_label_en": "Problem-resolution confirmation",
    "planet_key": "proof",
    "segment": "Reputation, Trust & Reviews",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "per-event",
    "method_ceiling": "verified",
    "why_key": "problem_resolution_confirmation",
    "sources": [
      {
        "source_brand": "Event Producer",
        "source_channel": "problem-resolution confirmation",
        "source_type": "entity",
        "logo_asset": "generic:producer-confirmation",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirmation covers this bounded claim only",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "would_rebook",
    "field_label_en": "Would rebook",
    "planet_key": "proof",
    "segment": "Reputation, Trust & Reviews",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "per-event",
    "method_ceiling": "verified",
    "why_key": "would_rebook",
    "sources": [
      {
        "source_brand": "Event Producer",
        "source_channel": "would rebook",
        "source_type": "entity",
        "logo_asset": "generic:producer-confirmation",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirmation covers this bounded claim only",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "trust_repeat_booking",
    "field_label_en": "Repeat booking",
    "planet_key": "proof",
    "segment": "Reputation, Trust & Reviews",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "per-event",
    "method_ceiling": "verified",
    "why_key": "trust_repeat_booking",
    "sources": [
      {
        "source_brand": "Event Producer",
        "source_channel": "repeat-booking record",
        "source_type": "entity",
        "logo_asset": "generic:producer-confirmation",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-event",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirmation covers this bounded claim only",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "testimonial_document",
    "field_label_en": "Testimonial",
    "planet_key": "proof",
    "segment": "Reputation, Trust & Reviews",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-365d",
    "method_ceiling": "supporting",
    "why_key": "testimonial_document",
    "sources": [
      {
        "source_brand": "Professional Testimonial",
        "source_channel": "testimonial",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist upload",
        "limitation_text": "Authorship must be confirmed before it is treated as a verified reference",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "published_review",
    "field_label_en": "Published review",
    "planet_key": "proof",
    "segment": "Reputation, Trust & Reviews",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "published_review",
    "sources": [
      {
        "source_brand": "Resident Advisor",
        "source_channel": "published review",
        "source_type": "platform",
        "logo_asset": "codex:resident-advisor",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Published opinion is attributed context; it is not a universal quality judgment",
        "applicability": "conditional"
      },
      {
        "source_brand": "Published Media Outlet",
        "source_channel": "published review",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Published opinion is attributed context; it is not a universal quality judgment",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "reference_dispute_status",
    "field_label_en": "Reference dispute status",
    "planet_key": "proof",
    "segment": "Reputation, Trust & Reviews",
    "applicability": "supporting",
    "visibility": "working",
    "freshness": "refresh-on-status-change",
    "method_ceiling": "not-assessable",
    "why_key": "reference_dispute_status",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "refresh-on-status-change",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed status only; never rendered as a prediction; disputed references leave public surfaces pending review",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "reference_correction_status",
    "field_label_en": "Reference correction status",
    "planet_key": "proof",
    "segment": "Reputation, Trust & Reviews",
    "applicability": "supporting",
    "visibility": "working",
    "freshness": "refresh-on-status-change",
    "method_ceiling": "not-assessable",
    "why_key": "reference_correction_status",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "refresh-on-status-change",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed status only; never rendered as a prediction; disputed references leave public surfaces pending review",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "manager_office_relationship",
    "field_label_en": "Manager-office relationship",
    "planet_key": "proof",
    "segment": "Network & Industry Access",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "supporting",
    "why_key": "manager_office_relationship",
    "sources": [
      {
        "source_brand": "Manager Office",
        "source_channel": "relationship confirmation",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Relationship context never inflates intrinsic readiness or quality",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "production_company_relationship",
    "field_label_en": "Production-company relationship",
    "planet_key": "proof",
    "segment": "Network & Industry Access",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "supporting",
    "why_key": "production_company_relationship",
    "sources": [
      {
        "source_brand": "Production Company",
        "source_channel": "relationship confirmation",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Relationship context never inflates intrinsic readiness or quality",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "venue_relationship",
    "field_label_en": "Venue relationship",
    "planet_key": "proof",
    "segment": "Network & Industry Access",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "supporting",
    "why_key": "venue_relationship",
    "sources": [
      {
        "source_brand": "Venue",
        "source_channel": "relationship confirmation",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Relationship context never inflates intrinsic readiness or quality",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "festival_relationship",
    "field_label_en": "Festival relationship",
    "planet_key": "proof",
    "segment": "Network & Industry Access",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "supporting",
    "why_key": "festival_relationship",
    "sources": [
      {
        "source_brand": "Festival",
        "source_channel": "relationship confirmation",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Relationship context never inflates intrinsic readiness or quality",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "promoter_relationship",
    "field_label_en": "Promoter relationship",
    "planet_key": "proof",
    "segment": "Network & Industry Access",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "supporting",
    "why_key": "promoter_relationship",
    "sources": [
      {
        "source_brand": "Promoter",
        "source_channel": "relationship confirmation",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Relationship context never inflates intrinsic readiness or quality",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "label_relationship",
    "field_label_en": "Label relationship",
    "planet_key": "proof",
    "segment": "Network & Industry Access",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "supporting",
    "why_key": "label_relationship",
    "sources": [
      {
        "source_brand": "Record Label",
        "source_channel": "relationship confirmation",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Relationship context never inflates intrinsic readiness or quality",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "publisher_relationship",
    "field_label_en": "Publisher relationship",
    "planet_key": "proof",
    "segment": "Network & Industry Access",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "supporting",
    "why_key": "publisher_relationship",
    "sources": [
      {
        "source_brand": "Music Publisher",
        "source_channel": "relationship confirmation",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Relationship context never inflates intrinsic readiness or quality",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "media_relationship",
    "field_label_en": "Media relationship",
    "planet_key": "proof",
    "segment": "Network & Industry Access",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "supporting",
    "why_key": "media_relationship",
    "sources": [
      {
        "source_brand": "Media Outlet",
        "source_channel": "relationship confirmation",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Relationship context never inflates intrinsic readiness or quality",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "a_and_r_relationship",
    "field_label_en": "A&R relationship",
    "planet_key": "proof",
    "segment": "Network & Industry Access",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "supporting",
    "why_key": "a_and_r_relationship",
    "sources": [
      {
        "source_brand": "A&R Contact",
        "source_channel": "relationship confirmation",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Relationship context never inflates intrinsic readiness or quality",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "artist_collaboration_credit",
    "field_label_en": "Artist collaboration credit",
    "planet_key": "proof",
    "segment": "Network & Industry Access",
    "applicability": "conditional",
    "visibility": "passport-eligible",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "artist_collaboration_credit",
    "sources": [
      {
        "source_brand": "Spotify",
        "source_channel": "release credits",
        "source_type": "platform",
        "logo_asset": "codex:spotify",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Source-linked credit; relationship depth and current status are not inferred",
        "applicability": "conditional"
      },
      {
        "source_brand": "Apple Music",
        "source_channel": "release credits",
        "source_type": "platform",
        "logo_asset": "codex:apple-music",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Source-linked credit; relationship depth and current status are not inferred",
        "applicability": "conditional"
      },
      {
        "source_brand": "Beatport",
        "source_channel": "release credits",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Source-linked credit; relationship depth and current status are not inferred",
        "applicability": "conditional"
      },
      {
        "source_brand": "Discogs",
        "source_channel": "release credits",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Source-linked credit; relationship depth and current status are not inferred",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "public_industry_affiliation",
    "field_label_en": "Public industry affiliation",
    "planet_key": "proof",
    "segment": "Network & Industry Access",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "public_industry_affiliation",
    "sources": [
      {
        "source_brand": "Official Agency Website",
        "source_channel": "agency roster page",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Public affiliation is supporting context until confirmed by the involved party",
        "applicability": "conditional"
      },
      {
        "source_brand": "Official Label Website",
        "source_channel": "label roster page",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Public affiliation is supporting context until confirmed by the involved party",
        "applicability": "conditional"
      },
      {
        "source_brand": "Official Venue Website",
        "source_channel": "event or resident page",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Public affiliation is supporting context until confirmed by the involved party",
        "applicability": "conditional"
      },
      {
        "source_brand": "Official Festival Website",
        "source_channel": "lineup archive",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Public affiliation is supporting context until confirmed by the involved party",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "referral_source",
    "field_label_en": "Referral source",
    "planet_key": "proof",
    "segment": "Network & Industry Access",
    "applicability": "conditional",
    "visibility": "working",
    "freshness": "per-referral",
    "method_ceiling": "verified",
    "why_key": "referral_source",
    "sources": [
      {
        "source_brand": "Referring Professional",
        "source_channel": "referral confirmation",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "per-referral",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Private referral context; not public without consent",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "relationship_last_activity_date",
    "field_label_en": "Relationship last activity date",
    "planet_key": "proof",
    "segment": "Network & Industry Access",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-on-source-change",
    "method_ceiling": "not-assessable",
    "why_key": "relationship_last_activity_date",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "refresh-on-source-change",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed history only; never rendered as a prediction or relationship-strength score",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "legal_entity_name",
    "field_label_en": "Legal entity name",
    "planet_key": "prokit",
    "segment": "Business, Legal & Rights",
    "applicability": "required",
    "visibility": "buyer-context",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "legal_entity_name",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Existence is self-reported until supported by a document or counterparty",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "business_registration_type",
    "field_label_en": "Business registration type",
    "planet_key": "prokit",
    "segment": "Business, Legal & Rights",
    "applicability": "required",
    "visibility": "buyer-context",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "business_registration_type",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Existence is self-reported until supported by a document or counterparty",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "invoice_capability",
    "field_label_en": "Invoice capability",
    "planet_key": "prokit",
    "segment": "Business, Legal & Rights",
    "applicability": "required",
    "visibility": "buyer-context",
    "freshness": "review-365d",
    "method_ceiling": "supporting",
    "why_key": "invoice_capability",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Existence is self-reported until supported by a document or counterparty",
        "applicability": "required"
      },
      {
        "source_brand": "Tax Registration Document",
        "source_channel": "tax document",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist upload",
        "limitation_text": "Document existence does not establish legal validity; specialist review may be required",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "tax_invoice_capability",
    "field_label_en": "Tax-invoice capability",
    "planet_key": "prokit",
    "segment": "Business, Legal & Rights",
    "applicability": "conditional",
    "visibility": "buyer-context",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "tax_invoice_capability",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Existence is self-reported until supported by a document or counterparty",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "receipt_capability",
    "field_label_en": "Receipt capability",
    "planet_key": "prokit",
    "segment": "Business, Legal & Rights",
    "applicability": "required",
    "visibility": "buyer-context",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "receipt_capability",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Existence is self-reported until supported by a document or counterparty",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "authorized_signatory",
    "field_label_en": "Authorized signatory",
    "planet_key": "prokit",
    "segment": "Business, Legal & Rights",
    "applicability": "conditional",
    "visibility": "buyer-context",
    "freshness": "review-365d",
    "method_ceiling": "supporting",
    "why_key": "authorized_signatory",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Existence is self-reported until supported by a document or counterparty",
        "applicability": "conditional"
      },
      {
        "source_brand": "Authority Document",
        "source_channel": "authority document",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist upload",
        "limitation_text": "Document existence does not establish legal validity; specialist review may be required",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "legal_master_rights_owner",
    "field_label_en": "Master rights owner",
    "planet_key": "prokit",
    "segment": "Business, Legal & Rights",
    "applicability": "conditional",
    "visibility": "buyer-context",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "legal_master_rights_owner",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Existence is self-reported until supported by a document or counterparty",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "legal_publishing_rights_owner",
    "field_label_en": "Publishing rights owner",
    "planet_key": "prokit",
    "segment": "Business, Legal & Rights",
    "applicability": "conditional",
    "visibility": "buyer-context",
    "freshness": "review-365d",
    "method_ceiling": "self-reported",
    "why_key": "legal_publishing_rights_owner",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Existence is self-reported until supported by a document or counterparty",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "business_registration_number",
    "field_label_en": "Business registration number",
    "planet_key": "prokit",
    "segment": "Business, Legal & Rights",
    "applicability": "required",
    "visibility": "buyer-context",
    "freshness": "review-365d",
    "method_ceiling": "supporting",
    "why_key": "business_registration_number",
    "sources": [
      {
        "source_brand": "Israel Tax Authority",
        "source_channel": "registration document",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist upload",
        "limitation_text": "Document existence does not establish legal validity; specialist review may be required",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "legal_contracting_entity",
    "field_label_en": "Contracting entity",
    "planet_key": "prokit",
    "segment": "Business, Legal & Rights",
    "applicability": "required",
    "visibility": "buyer-context",
    "freshness": "review-365d",
    "method_ceiling": "supporting",
    "why_key": "legal_contracting_entity",
    "sources": [
      {
        "source_brand": "Contract",
        "source_channel": "contract",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist upload",
        "limitation_text": "Document existence does not establish legal validity; specialist review may be required",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "label_agreement",
    "field_label_en": "Label agreement",
    "planet_key": "prokit",
    "segment": "Business, Legal & Rights",
    "applicability": "conditional",
    "visibility": "working",
    "freshness": "review-365d",
    "method_ceiling": "supporting",
    "why_key": "label_agreement",
    "sources": [
      {
        "source_brand": "Label Agreement",
        "source_channel": "agreement",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist upload",
        "limitation_text": "Document existence does not establish legal validity; specialist review may be required",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "publishing_agreement",
    "field_label_en": "Publishing agreement",
    "planet_key": "prokit",
    "segment": "Business, Legal & Rights",
    "applicability": "conditional",
    "visibility": "working",
    "freshness": "review-365d",
    "method_ceiling": "supporting",
    "why_key": "publishing_agreement",
    "sources": [
      {
        "source_brand": "Publishing Agreement",
        "source_channel": "agreement",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist upload",
        "limitation_text": "Document existence does not establish legal validity; specialist review may be required",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "management_agreement",
    "field_label_en": "Management agreement",
    "planet_key": "prokit",
    "segment": "Business, Legal & Rights",
    "applicability": "conditional",
    "visibility": "working",
    "freshness": "review-365d",
    "method_ceiling": "supporting",
    "why_key": "management_agreement",
    "sources": [
      {
        "source_brand": "Management Agreement",
        "source_channel": "agreement",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist upload",
        "limitation_text": "Document existence does not establish legal validity; specialist review may be required",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "representation_agreement",
    "field_label_en": "Representation agreement",
    "planet_key": "prokit",
    "segment": "Business, Legal & Rights",
    "applicability": "conditional",
    "visibility": "working",
    "freshness": "review-365d",
    "method_ceiling": "supporting",
    "why_key": "representation_agreement",
    "sources": [
      {
        "source_brand": "Representation Agreement",
        "source_channel": "agreement",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist upload",
        "limitation_text": "Document existence does not establish legal validity; specialist review may be required",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "trademark_registration",
    "field_label_en": "Trademark registration",
    "planet_key": "prokit",
    "segment": "Business, Legal & Rights",
    "applicability": "conditional",
    "visibility": "buyer-context",
    "freshness": "review-365d",
    "method_ceiling": "supporting",
    "why_key": "trademark_registration",
    "sources": [
      {
        "source_brand": "Trademark Certificate",
        "source_channel": "certificate",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist upload",
        "limitation_text": "Document existence does not establish legal validity; specialist review may be required",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "image_usage_rights",
    "field_label_en": "Image-usage rights",
    "planet_key": "prokit",
    "segment": "Business, Legal & Rights",
    "applicability": "conditional",
    "visibility": "working",
    "freshness": "review-365d",
    "method_ceiling": "supporting",
    "why_key": "image_usage_rights",
    "sources": [
      {
        "source_brand": "Rights Document",
        "source_channel": "rights document",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist upload",
        "limitation_text": "Document existence does not establish legal validity; specialist review may be required",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "music_usage_rights",
    "field_label_en": "Music-usage rights",
    "planet_key": "prokit",
    "segment": "Business, Legal & Rights",
    "applicability": "conditional",
    "visibility": "working",
    "freshness": "review-365d",
    "method_ceiling": "supporting",
    "why_key": "music_usage_rights",
    "sources": [
      {
        "source_brand": "Rights Document",
        "source_channel": "rights document",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist upload",
        "limitation_text": "Document existence does not establish legal validity; specialist review may be required",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "sample_clearance",
    "field_label_en": "Sample clearance",
    "planet_key": "prokit",
    "segment": "Business, Legal & Rights",
    "applicability": "conditional",
    "visibility": "buyer-context",
    "freshness": "review-365d",
    "method_ceiling": "supporting",
    "why_key": "sample_clearance",
    "sources": [
      {
        "source_brand": "Clearance Document",
        "source_channel": "clearance document",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist upload",
        "limitation_text": "Document existence does not establish legal validity; specialist review may be required",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "insurance_certificate",
    "field_label_en": "Insurance certificate",
    "planet_key": "prokit",
    "segment": "Business, Legal & Rights",
    "applicability": "conditional",
    "visibility": "buyer-context",
    "freshness": "review-365d",
    "method_ceiling": "supporting",
    "why_key": "insurance_certificate",
    "sources": [
      {
        "source_brand": "Insurance Certificate",
        "source_channel": "certificate",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist upload",
        "limitation_text": "Document existence does not establish legal validity; specialist review may be required",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "work_permit",
    "field_label_en": "Work permit",
    "planet_key": "prokit",
    "segment": "Business, Legal & Rights",
    "applicability": "conditional",
    "visibility": "buyer-context",
    "freshness": "review-365d",
    "method_ceiling": "supporting",
    "why_key": "work_permit",
    "sources": [
      {
        "source_brand": "Work Permit",
        "source_channel": "permit",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist upload",
        "limitation_text": "Document existence does not establish legal validity; specialist review may be required",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "visa_record",
    "field_label_en": "Visa record",
    "planet_key": "prokit",
    "segment": "Business, Legal & Rights",
    "applicability": "conditional",
    "visibility": "buyer-context",
    "freshness": "review-365d",
    "method_ceiling": "supporting",
    "why_key": "visa_record",
    "sources": [
      {
        "source_brand": "Visa Document",
        "source_channel": "visa",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist upload",
        "limitation_text": "Document existence does not establish legal validity; specialist review may be required",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "publication_consent_record",
    "field_label_en": "Publication consent record",
    "planet_key": "prokit",
    "segment": "Business, Legal & Rights",
    "applicability": "required",
    "visibility": "buyer-context",
    "freshness": "review-365d",
    "method_ceiling": "supporting",
    "why_key": "publication_consent_record",
    "sources": [
      {
        "source_brand": "Consent Record",
        "source_channel": "consent record",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist upload",
        "limitation_text": "Document existence does not establish legal validity; specialist review may be required",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "performance_rights_organization",
    "field_label_en": "Performance-rights organization",
    "planet_key": "prokit",
    "segment": "Business, Legal & Rights",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "supporting",
    "why_key": "performance_rights_organization",
    "sources": [
      {
        "source_brand": "ACUM",
        "source_channel": "member or repertoire record",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Registry presence supports affiliation only; rights scope remains document-specific",
        "applicability": "required"
      },
      {
        "source_brand": "BMI",
        "source_channel": "member or repertoire record",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Registry presence supports affiliation only; rights scope remains document-specific",
        "applicability": "conditional"
      },
      {
        "source_brand": "ASCAP",
        "source_channel": "member or repertoire record",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Registry presence supports affiliation only; rights scope remains document-specific",
        "applicability": "conditional"
      },
      {
        "source_brand": "PRS",
        "source_channel": "member or repertoire record",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Registry presence supports affiliation only; rights scope remains document-specific",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "specialist_legal_review",
    "field_label_en": "Specialist legal review",
    "planet_key": "prokit",
    "segment": "Business, Legal & Rights",
    "applicability": "conditional",
    "visibility": "working",
    "freshness": "review-365d",
    "method_ceiling": "verified",
    "why_key": "specialist_legal_review",
    "sources": [
      {
        "source_brand": "Legal Specialist",
        "source_channel": "bounded specialist review",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "review-365d",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Specialist review is scoped; LOCK does not provide legal validity judgments",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "legal_document_expiry",
    "field_label_en": "Legal document expiry",
    "planet_key": "prokit",
    "segment": "Business, Legal & Rights",
    "applicability": "supporting",
    "visibility": "working",
    "freshness": "refresh-on-source-change",
    "method_ceiling": "not-assessable",
    "why_key": "legal_document_expiry",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "refresh-on-source-change",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed expiry reminder only; never rendered as a prediction or legal-validity determination",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "technical_rider_file",
    "field_label_en": "Technical rider",
    "planet_key": "live",
    "segment": "Technical & Production",
    "applicability": "required",
    "visibility": "buyer-context",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "technical_rider_file",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "technical rider",
        "source_type": "document",
        "logo_asset": "generic:rider",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist upload",
        "limitation_text": "Current version must be explicit; a file link does not prove venue feasibility",
        "applicability": "required"
      },
      {
        "source_brand": "Google Drive",
        "source_channel": "shared technical rider",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Current version must be explicit; a file link does not prove venue feasibility",
        "applicability": "required"
      },
      {
        "source_brand": "Dropbox",
        "source_channel": "shared technical rider",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Current version must be explicit; a file link does not prove venue feasibility",
        "applicability": "required"
      },
      {
        "source_brand": "WeTransfer",
        "source_channel": "shared technical rider",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Current version must be explicit; a file link does not prove venue feasibility",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "hospitality_rider_file",
    "field_label_en": "Hospitality rider",
    "planet_key": "live",
    "segment": "Technical & Production",
    "applicability": "conditional",
    "visibility": "buyer-context",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "hospitality_rider_file",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "hospitality rider",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist upload",
        "limitation_text": "Document describes requirements; actual feasibility is opportunity-specific",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "stage_plot_file",
    "field_label_en": "Stage plot",
    "planet_key": "live",
    "segment": "Technical & Production",
    "applicability": "conditional",
    "visibility": "buyer-context",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "stage_plot_file",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "stage plot",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist upload",
        "limitation_text": "Document describes requirements; actual feasibility is opportunity-specific",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "input_list_file",
    "field_label_en": "Input list",
    "planet_key": "live",
    "segment": "Technical & Production",
    "applicability": "conditional",
    "visibility": "buyer-context",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "input_list_file",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "input list",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist upload",
        "limitation_text": "Document describes requirements; actual feasibility is opportunity-specific",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "channel_list_file",
    "field_label_en": "Channel list",
    "planet_key": "live",
    "segment": "Technical & Production",
    "applicability": "conditional",
    "visibility": "buyer-context",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "channel_list_file",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "channel list",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist upload",
        "limitation_text": "Document describes requirements; actual feasibility is opportunity-specific",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "patch_list_file",
    "field_label_en": "Patch list",
    "planet_key": "live",
    "segment": "Technical & Production",
    "applicability": "conditional",
    "visibility": "buyer-context",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "patch_list_file",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "patch list",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist upload",
        "limitation_text": "Document describes requirements; actual feasibility is opportunity-specific",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "backline_list_file",
    "field_label_en": "Backline list",
    "planet_key": "live",
    "segment": "Technical & Production",
    "applicability": "conditional",
    "visibility": "buyer-context",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "backline_list_file",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "backline list",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist upload",
        "limitation_text": "Document describes requirements; actual feasibility is opportunity-specific",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "equipment_list_file",
    "field_label_en": "Equipment list",
    "planet_key": "live",
    "segment": "Technical & Production",
    "applicability": "required",
    "visibility": "buyer-context",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "equipment_list_file",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "equipment list",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist upload",
        "limitation_text": "Document describes requirements; actual feasibility is opportunity-specific",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "lighting_plot_file",
    "field_label_en": "Lighting plot",
    "planet_key": "live",
    "segment": "Technical & Production",
    "applicability": "conditional",
    "visibility": "buyer-context",
    "freshness": "review-180d",
    "method_ceiling": "supporting",
    "why_key": "lighting_plot_file",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "lighting plot",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist upload",
        "limitation_text": "Document describes requirements; actual feasibility is opportunity-specific",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "dj_equipment_requirements",
    "field_label_en": "DJ equipment requirements",
    "planet_key": "live",
    "segment": "Technical & Production",
    "applicability": "required",
    "visibility": "buyer-context",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "dj_equipment_requirements",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Requirement is artist-declared; venue feasibility is checked per opportunity",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "microphone_requirements",
    "field_label_en": "Microphone requirements",
    "planet_key": "live",
    "segment": "Technical & Production",
    "applicability": "conditional",
    "visibility": "buyer-context",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "microphone_requirements",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Requirement is artist-declared; venue feasibility is checked per opportunity",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "monitor_requirements",
    "field_label_en": "Monitor requirements",
    "planet_key": "live",
    "segment": "Technical & Production",
    "applicability": "required",
    "visibility": "buyer-context",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "monitor_requirements",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Requirement is artist-declared; venue feasibility is checked per opportunity",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "foh_requirements",
    "field_label_en": "FOH requirements",
    "planet_key": "live",
    "segment": "Technical & Production",
    "applicability": "conditional",
    "visibility": "buyer-context",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "foh_requirements",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Requirement is artist-declared; venue feasibility is checked per opportunity",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "video_requirements",
    "field_label_en": "Video requirements",
    "planet_key": "live",
    "segment": "Technical & Production",
    "applicability": "conditional",
    "visibility": "buyer-context",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "video_requirements",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Requirement is artist-declared; venue feasibility is checked per opportunity",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "led_requirements",
    "field_label_en": "LED requirements",
    "planet_key": "live",
    "segment": "Technical & Production",
    "applicability": "conditional",
    "visibility": "buyer-context",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "led_requirements",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Requirement is artist-declared; venue feasibility is checked per opportunity",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "power_requirements",
    "field_label_en": "Power requirements",
    "planet_key": "live",
    "segment": "Technical & Production",
    "applicability": "conditional",
    "visibility": "buyer-context",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "power_requirements",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Requirement is artist-declared; venue feasibility is checked per opportunity",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "stage_dimensions_required",
    "field_label_en": "Stage dimensions required",
    "planet_key": "live",
    "segment": "Technical & Production",
    "applicability": "conditional",
    "visibility": "buyer-context",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "stage_dimensions_required",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Requirement is artist-declared; venue feasibility is checked per opportunity",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "changeover_time",
    "field_label_en": "Changeover time",
    "planet_key": "live",
    "segment": "Technical & Production",
    "applicability": "required",
    "visibility": "buyer-context",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "changeover_time",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Requirement is artist-declared; venue feasibility is checked per opportunity",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "soundcheck_duration",
    "field_label_en": "Soundcheck duration",
    "planet_key": "live",
    "segment": "Technical & Production",
    "applicability": "conditional",
    "visibility": "buyer-context",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "soundcheck_duration",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Requirement is artist-declared; venue feasibility is checked per opportunity",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "load_in_time",
    "field_label_en": "Load-in time",
    "planet_key": "live",
    "segment": "Technical & Production",
    "applicability": "conditional",
    "visibility": "buyer-context",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "load_in_time",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Requirement is artist-declared; venue feasibility is checked per opportunity",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "load_out_time",
    "field_label_en": "Load-out time",
    "planet_key": "live",
    "segment": "Technical & Production",
    "applicability": "conditional",
    "visibility": "buyer-context",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "load_out_time",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Requirement is artist-declared; venue feasibility is checked per opportunity",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "crew_size",
    "field_label_en": "Crew size",
    "planet_key": "live",
    "segment": "Technical & Production",
    "applicability": "required",
    "visibility": "buyer-context",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "crew_size",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Requirement is artist-declared; venue feasibility is checked per opportunity",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "production_footprint",
    "field_label_en": "Production footprint",
    "planet_key": "live",
    "segment": "Technical & Production",
    "applicability": "required",
    "visibility": "buyer-context",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "production_footprint",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Requirement is artist-declared; venue feasibility is checked per opportunity",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "travel_requirements",
    "field_label_en": "Travel requirements",
    "planet_key": "live",
    "segment": "Technical & Production",
    "applicability": "conditional",
    "visibility": "buyer-context",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "travel_requirements",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Requirement is artist-declared; venue feasibility is checked per opportunity",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "accommodation_requirements",
    "field_label_en": "Accommodation requirements",
    "planet_key": "live",
    "segment": "Technical & Production",
    "applicability": "conditional",
    "visibility": "buyer-context",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "accommodation_requirements",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Requirement is artist-declared; venue feasibility is checked per opportunity",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "feasible_alternative_setup",
    "field_label_en": "Feasible alternative setup",
    "planet_key": "live",
    "segment": "Technical & Production",
    "applicability": "conditional",
    "visibility": "buyer-context",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "feasible_alternative_setup",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Requirement is artist-declared; venue feasibility is checked per opportunity",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "rider_version",
    "field_label_en": "Rider version",
    "planet_key": "live",
    "segment": "Technical & Production",
    "applicability": "required",
    "visibility": "buyer-context",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "rider_version",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Requirement is artist-declared; venue feasibility is checked per opportunity",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "technical_contact",
    "field_label_en": "Technical contact",
    "planet_key": "live",
    "segment": "Technical & Production",
    "applicability": "required",
    "visibility": "buyer-context",
    "freshness": "review-180d",
    "method_ceiling": "verified",
    "why_key": "technical_contact",
    "sources": [
      {
        "source_brand": "Technical Manager",
        "source_channel": "contact confirmation",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "review-180d",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirmation covers this bounded claim only",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "production_contact",
    "field_label_en": "Production contact",
    "planet_key": "live",
    "segment": "Technical & Production",
    "applicability": "conditional",
    "visibility": "buyer-context",
    "freshness": "review-180d",
    "method_ceiling": "verified",
    "why_key": "production_contact",
    "sources": [
      {
        "source_brand": "Production Manager",
        "source_channel": "contact confirmation",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "review-180d",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirmation covers this bounded claim only",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "rider_review_date",
    "field_label_en": "Rider review date",
    "planet_key": "live",
    "segment": "Technical & Production",
    "applicability": "supporting",
    "visibility": "buyer-context",
    "freshness": "refresh-on-file-change",
    "method_ceiling": "not-assessable",
    "why_key": "rider_review_date",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "refresh-on-file-change",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed freshness indicator only; never rendered as a prediction or feasibility certification",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "team_manager_office",
    "field_label_en": "Manager office",
    "planet_key": "prokit",
    "segment": "Team, Management & Execution",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "verified",
    "why_key": "team_manager_office",
    "sources": [
      {
        "source_brand": "Manager Office",
        "source_channel": "role confirmation",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "review-365d",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirms role and scope only",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "booking_representative",
    "field_label_en": "Booking representative",
    "planet_key": "prokit",
    "segment": "Team, Management & Execution",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "verified",
    "why_key": "booking_representative",
    "sources": [
      {
        "source_brand": "Booking Representative",
        "source_channel": "role confirmation",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "review-365d",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirms role and scope only",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "artist_representative",
    "field_label_en": "Artist representative",
    "planet_key": "prokit",
    "segment": "Team, Management & Execution",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "verified",
    "why_key": "artist_representative",
    "sources": [
      {
        "source_brand": "Artist Representative",
        "source_channel": "role confirmation",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "review-365d",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirms role and scope only",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "tour_manager",
    "field_label_en": "Tour manager",
    "planet_key": "prokit",
    "segment": "Team, Management & Execution",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "verified",
    "why_key": "tour_manager",
    "sources": [
      {
        "source_brand": "Tour Manager",
        "source_channel": "role confirmation",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "review-365d",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirms role and scope only",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "production_manager",
    "field_label_en": "Production manager",
    "planet_key": "prokit",
    "segment": "Team, Management & Execution",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "verified",
    "why_key": "production_manager",
    "sources": [
      {
        "source_brand": "Production Manager",
        "source_channel": "role confirmation",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "review-365d",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirms role and scope only",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "technical_manager",
    "field_label_en": "Technical manager",
    "planet_key": "prokit",
    "segment": "Team, Management & Execution",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "verified",
    "why_key": "technical_manager",
    "sources": [
      {
        "source_brand": "Technical Manager",
        "source_channel": "role confirmation",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "review-365d",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirms role and scope only",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "publicist",
    "field_label_en": "Publicist",
    "planet_key": "prokit",
    "segment": "Team, Management & Execution",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "verified",
    "why_key": "publicist",
    "sources": [
      {
        "source_brand": "Publicist",
        "source_channel": "role confirmation",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "review-365d",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirms role and scope only",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "record_label",
    "field_label_en": "Record label",
    "planet_key": "prokit",
    "segment": "Team, Management & Execution",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "verified",
    "why_key": "record_label",
    "sources": [
      {
        "source_brand": "Record Label",
        "source_channel": "role confirmation",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "review-365d",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirms role and scope only",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "music_publisher",
    "field_label_en": "Music publisher",
    "planet_key": "prokit",
    "segment": "Team, Management & Execution",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "verified",
    "why_key": "music_publisher",
    "sources": [
      {
        "source_brand": "Music Publisher",
        "source_channel": "role confirmation",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "review-365d",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirms role and scope only",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "legal_adviser",
    "field_label_en": "Legal adviser",
    "planet_key": "prokit",
    "segment": "Team, Management & Execution",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "verified",
    "why_key": "legal_adviser",
    "sources": [
      {
        "source_brand": "Lawyer",
        "source_channel": "role confirmation",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "review-365d",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirms role and scope only",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "accountant",
    "field_label_en": "Accountant",
    "planet_key": "prokit",
    "segment": "Team, Management & Execution",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "verified",
    "why_key": "accountant",
    "sources": [
      {
        "source_brand": "Accountant",
        "source_channel": "role confirmation",
        "source_type": "entity",
        "logo_asset": "generic:none",
        "connection_method": "counterparty",
        "evidence_ceiling": "verified",
        "freshness_rule": "review-365d",
        "consent_requirement": "bounded magic link",
        "limitation_text": "Confirms role and scope only",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "authority_scope",
    "field_label_en": "Authority scope",
    "planet_key": "prokit",
    "segment": "Team, Management & Execution",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "authority_scope",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Operational declaration; authority-sensitive fields should be counterparty- or document-supported",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "authority_territory",
    "field_label_en": "Authority territory",
    "planet_key": "prokit",
    "segment": "Team, Management & Execution",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "authority_territory",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Operational declaration; authority-sensitive fields should be counterparty- or document-supported",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "authority_effective_date",
    "field_label_en": "Authority effective date",
    "planet_key": "prokit",
    "segment": "Team, Management & Execution",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "authority_effective_date",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Operational declaration; authority-sensitive fields should be counterparty- or document-supported",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "authority_expiry_date",
    "field_label_en": "Authority expiry date",
    "planet_key": "prokit",
    "segment": "Team, Management & Execution",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "authority_expiry_date",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Operational declaration; authority-sensitive fields should be counterparty- or document-supported",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "negotiation_authority",
    "field_label_en": "Negotiation authority",
    "planet_key": "prokit",
    "segment": "Team, Management & Execution",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "negotiation_authority",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Operational declaration; authority-sensitive fields should be counterparty- or document-supported",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "signing_authority",
    "field_label_en": "Signing authority",
    "planet_key": "prokit",
    "segment": "Team, Management & Execution",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "signing_authority",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Operational declaration; authority-sensitive fields should be counterparty- or document-supported",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "invoice_authority",
    "field_label_en": "Invoice authority",
    "planet_key": "prokit",
    "segment": "Team, Management & Execution",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "invoice_authority",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Operational declaration; authority-sensitive fields should be counterparty- or document-supported",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "payment_receipt_authority",
    "field_label_en": "Payment-receipt authority",
    "planet_key": "prokit",
    "segment": "Team, Management & Execution",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "payment_receipt_authority",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Operational declaration; authority-sensitive fields should be counterparty- or document-supported",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "calendar_owner",
    "field_label_en": "Calendar owner",
    "planet_key": "prokit",
    "segment": "Team, Management & Execution",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "calendar_owner",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Operational declaration; authority-sensitive fields should be counterparty- or document-supported",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "availability_owner",
    "field_label_en": "Availability owner",
    "planet_key": "prokit",
    "segment": "Team, Management & Execution",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "availability_owner",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Operational declaration; authority-sensitive fields should be counterparty- or document-supported",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "primary_contact",
    "field_label_en": "Primary contact",
    "planet_key": "prokit",
    "segment": "Team, Management & Execution",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "primary_contact",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Operational declaration; authority-sensitive fields should be counterparty- or document-supported",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "response_process",
    "field_label_en": "Response process",
    "planet_key": "prokit",
    "segment": "Team, Management & Execution",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "response_process",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Operational declaration; authority-sensitive fields should be counterparty- or document-supported",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "response_time_band",
    "field_label_en": "Response-time band",
    "planet_key": "prokit",
    "segment": "Team, Management & Execution",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "response_time_band",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Operational declaration; authority-sensitive fields should be counterparty- or document-supported",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "handoff_process",
    "field_label_en": "Handoff process",
    "planet_key": "prokit",
    "segment": "Team, Management & Execution",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "handoff_process",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Operational declaration; authority-sensitive fields should be counterparty- or document-supported",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "emergency_contact",
    "field_label_en": "Emergency contact",
    "planet_key": "prokit",
    "segment": "Team, Management & Execution",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "emergency_contact",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Operational declaration; authority-sensitive fields should be counterparty- or document-supported",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "access_status",
    "field_label_en": "Access status",
    "planet_key": "prokit",
    "segment": "Team, Management & Execution",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "access_status",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Operational declaration; authority-sensitive fields should be counterparty- or document-supported",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "access_revocation_process",
    "field_label_en": "Access-revocation process",
    "planet_key": "prokit",
    "segment": "Team, Management & Execution",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-180d",
    "method_ceiling": "self-reported",
    "why_key": "access_revocation_process",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-180d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Operational declaration; authority-sensitive fields should be counterparty- or document-supported",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "team_member_profile",
    "field_label_en": "Team-member profile",
    "planet_key": "prokit",
    "segment": "Team, Management & Execution",
    "applicability": "conditional",
    "visibility": "working",
    "freshness": "review-90d",
    "method_ceiling": "supporting",
    "why_key": "team_member_profile",
    "sources": [
      {
        "source_brand": "LinkedIn",
        "source_channel": "professional profile",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Operational channel presence does not prove performance quality",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "primary_contact_channel",
    "field_label_en": "Primary contact channel",
    "planet_key": "prokit",
    "segment": "Team, Management & Execution",
    "applicability": "required",
    "visibility": "working",
    "freshness": "review-90d",
    "method_ceiling": "supporting",
    "why_key": "primary_contact_channel",
    "sources": [
      {
        "source_brand": "Gmail",
        "source_channel": "email contact",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Operational channel presence does not prove performance quality",
        "applicability": "required"
      },
      {
        "source_brand": "WhatsApp",
        "source_channel": "messaging contact",
        "source_type": "platform",
        "logo_asset": "codex:whatsapp",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Operational channel presence does not prove performance quality",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "team_availability_process",
    "field_label_en": "Availability process",
    "planet_key": "prokit",
    "segment": "Team, Management & Execution",
    "applicability": "conditional",
    "visibility": "working",
    "freshness": "review-90d",
    "method_ceiling": "supporting",
    "why_key": "team_availability_process",
    "sources": [
      {
        "source_brand": "Google Calendar",
        "source_channel": "calendar workflow",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Operational channel presence does not prove performance quality",
        "applicability": "conditional"
      },
      {
        "source_brand": "Calendly",
        "source_channel": "scheduling page",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Operational channel presence does not prove performance quality",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "team_operations_channel",
    "field_label_en": "Team operations channel",
    "planet_key": "prokit",
    "segment": "Team, Management & Execution",
    "applicability": "conditional",
    "visibility": "working",
    "freshness": "review-90d",
    "method_ceiling": "supporting",
    "why_key": "team_operations_channel",
    "sources": [
      {
        "source_brand": "Slack",
        "source_channel": "team workspace",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Operational channel presence does not prove performance quality",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "team_operations_workspace",
    "field_label_en": "Team operations workspace",
    "planet_key": "prokit",
    "segment": "Team, Management & Execution",
    "applicability": "conditional",
    "visibility": "working",
    "freshness": "review-90d",
    "method_ceiling": "supporting",
    "why_key": "team_operations_workspace",
    "sources": [
      {
        "source_brand": "Notion",
        "source_channel": "operations workspace",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Operational channel presence does not prove performance quality",
        "applicability": "conditional"
      },
      {
        "source_brand": "Airtable",
        "source_channel": "operations base",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Operational channel presence does not prove performance quality",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "booking_fee_band",
    "field_label_en": "Booking fee band",
    "planet_key": "prokit",
    "segment": "Monetization & Commercials",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "self-reported",
    "why_key": "booking_fee_band",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Private commercial context; bands only where surfaced; never used to rank artists",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "guarantee_band",
    "field_label_en": "Guarantee band",
    "planet_key": "prokit",
    "segment": "Monetization & Commercials",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "self-reported",
    "why_key": "guarantee_band",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Private commercial context; bands only where surfaced; never used to rank artists",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "performance_revenue_band",
    "field_label_en": "Performance revenue band",
    "planet_key": "prokit",
    "segment": "Monetization & Commercials",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "self-reported",
    "why_key": "performance_revenue_band",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Private commercial context; bands only where surfaced; never used to rank artists",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "private_event_revenue_band",
    "field_label_en": "Private-event revenue band",
    "planet_key": "prokit",
    "segment": "Monetization & Commercials",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "self-reported",
    "why_key": "private_event_revenue_band",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Private commercial context; bands only where surfaced; never used to rank artists",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "corporate_event_revenue_band",
    "field_label_en": "Corporate-event revenue band",
    "planet_key": "prokit",
    "segment": "Monetization & Commercials",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "self-reported",
    "why_key": "corporate_event_revenue_band",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Private commercial context; bands only where surfaced; never used to rank artists",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "teaching_revenue_band",
    "field_label_en": "Teaching revenue band",
    "planet_key": "prokit",
    "segment": "Monetization & Commercials",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "self-reported",
    "why_key": "teaching_revenue_band",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Private commercial context; bands only where surfaced; never used to rank artists",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "production_revenue_band",
    "field_label_en": "Production revenue band",
    "planet_key": "prokit",
    "segment": "Monetization & Commercials",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "self-reported",
    "why_key": "production_revenue_band",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Private commercial context; bands only where surfaced; never used to rank artists",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "average_event_expense_band",
    "field_label_en": "Average event-expense band",
    "planet_key": "prokit",
    "segment": "Monetization & Commercials",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "self-reported",
    "why_key": "average_event_expense_band",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Private commercial context; bands only where surfaced; never used to rank artists",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "travel_expense_band",
    "field_label_en": "Travel-expense band",
    "planet_key": "prokit",
    "segment": "Monetization & Commercials",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "self-reported",
    "why_key": "travel_expense_band",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Private commercial context; bands only where surfaced; never used to rank artists",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "crew_cost_band",
    "field_label_en": "Crew-cost band",
    "planet_key": "prokit",
    "segment": "Monetization & Commercials",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "self-reported",
    "why_key": "crew_cost_band",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Private commercial context; bands only where surfaced; never used to rank artists",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "commission_band",
    "field_label_en": "Commission band",
    "planet_key": "prokit",
    "segment": "Monetization & Commercials",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "self-reported",
    "why_key": "commission_band",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Private commercial context; bands only where surfaced; never used to rank artists",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "settlement_terms",
    "field_label_en": "Settlement terms",
    "planet_key": "prokit",
    "segment": "Monetization & Commercials",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "self-reported",
    "why_key": "settlement_terms",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Private commercial context; bands only where surfaced; never used to rank artists",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "deposit_terms",
    "field_label_en": "Deposit terms",
    "planet_key": "prokit",
    "segment": "Monetization & Commercials",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "self-reported",
    "why_key": "deposit_terms",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Private commercial context; bands only where surfaced; never used to rank artists",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "payment_timing",
    "field_label_en": "Payment timing",
    "planet_key": "prokit",
    "segment": "Monetization & Commercials",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "self-reported",
    "why_key": "payment_timing",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Private commercial context; bands only where surfaced; never used to rank artists",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "revenue_territory",
    "field_label_en": "Revenue territory",
    "planet_key": "prokit",
    "segment": "Monetization & Commercials",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "self-reported",
    "why_key": "revenue_territory",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Private commercial context; bands only where surfaced; never used to rank artists",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "revenue_period",
    "field_label_en": "Revenue period",
    "planet_key": "prokit",
    "segment": "Monetization & Commercials",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "self-reported",
    "why_key": "revenue_period",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "artist declaration",
        "source_type": "declared",
        "logo_asset": "generic:self-declared",
        "connection_method": "declaration",
        "evidence_ceiling": "self-reported",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist declaration",
        "limitation_text": "Private commercial context; bands only where surfaced; never used to rank artists",
        "applicability": "required"
      }
    ]
  },
  {
    "field_id": "streaming_revenue_band",
    "field_label_en": "Streaming revenue band",
    "planet_key": "prokit",
    "segment": "Monetization & Commercials",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "streaming_revenue_band",
    "sources": [
      {
        "source_brand": "Spotify for Artists",
        "source_channel": "revenue export",
        "source_type": "platform",
        "logo_asset": "codex:spotify",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Private commercial context; bands only where surfaced; never used to rank artists",
        "applicability": "supporting"
      },
      {
        "source_brand": "Apple Music for Artists",
        "source_channel": "revenue export",
        "source_type": "platform",
        "logo_asset": "codex:apple-music",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Private commercial context; bands only where surfaced; never used to rank artists",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "video_revenue_band",
    "field_label_en": "Video revenue band",
    "planet_key": "prokit",
    "segment": "Monetization & Commercials",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "video_revenue_band",
    "sources": [
      {
        "source_brand": "YouTube Studio",
        "source_channel": "revenue analytics",
        "source_type": "platform",
        "logo_asset": "codex:youtube",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Private commercial context; bands only where surfaced; never used to rank artists",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "direct_music_sales_band",
    "field_label_en": "Direct music-sales band",
    "planet_key": "prokit",
    "segment": "Monetization & Commercials",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "direct_music_sales_band",
    "sources": [
      {
        "source_brand": "Bandcamp",
        "source_channel": "sales report",
        "source_type": "platform",
        "logo_asset": "codex:bandcamp",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Private commercial context; bands only where surfaced; never used to rank artists",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "patron_revenue_band",
    "field_label_en": "Patron revenue band",
    "planet_key": "prokit",
    "segment": "Monetization & Commercials",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "patron_revenue_band",
    "sources": [
      {
        "source_brand": "Patreon",
        "source_channel": "membership revenue",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Private commercial context; bands only where surfaced; never used to rank artists",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "merchandise_revenue_band",
    "field_label_en": "Merchandise revenue band",
    "planet_key": "prokit",
    "segment": "Monetization & Commercials",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "refresh-30d",
    "method_ceiling": "supporting",
    "why_key": "merchandise_revenue_band",
    "sources": [
      {
        "source_brand": "Shopify",
        "source_channel": "sales report",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Private commercial context; bands only where surfaced; never used to rank artists",
        "applicability": "conditional"
      },
      {
        "source_brand": "WooCommerce",
        "source_channel": "sales report",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "oauth",
        "evidence_ceiling": "supporting",
        "freshness_rule": "refresh-30d",
        "consent_requirement": "artist OAuth",
        "limitation_text": "Private commercial context; bands only where surfaced; never used to rank artists",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "royalty_revenue_band",
    "field_label_en": "Royalty revenue band",
    "planet_key": "prokit",
    "segment": "Monetization & Commercials",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "supporting",
    "why_key": "royalty_revenue_band",
    "sources": [
      {
        "source_brand": "Royalty Statement",
        "source_channel": "financial statement",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist upload",
        "limitation_text": "Private commercial context; bands only where surfaced; never used to rank artists",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "publishing_revenue_band",
    "field_label_en": "Publishing revenue band",
    "planet_key": "prokit",
    "segment": "Monetization & Commercials",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "supporting",
    "why_key": "publishing_revenue_band",
    "sources": [
      {
        "source_brand": "Publishing Statement",
        "source_channel": "financial statement",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist upload",
        "limitation_text": "Private commercial context; bands only where surfaced; never used to rank artists",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "neighboring_rights_revenue_band",
    "field_label_en": "Neighbouring-rights revenue band",
    "planet_key": "prokit",
    "segment": "Monetization & Commercials",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "supporting",
    "why_key": "neighboring_rights_revenue_band",
    "sources": [
      {
        "source_brand": "Rights Statement",
        "source_channel": "financial statement",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist upload",
        "limitation_text": "Private commercial context; bands only where surfaced; never used to rank artists",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "sync_revenue_band",
    "field_label_en": "Sync revenue band",
    "planet_key": "prokit",
    "segment": "Monetization & Commercials",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "supporting",
    "why_key": "sync_revenue_band",
    "sources": [
      {
        "source_brand": "Sync Statement",
        "source_channel": "financial statement",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist upload",
        "limitation_text": "Private commercial context; bands only where surfaced; never used to rank artists",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "brand_partnership_revenue_band",
    "field_label_en": "Brand-partnership revenue band",
    "planet_key": "prokit",
    "segment": "Monetization & Commercials",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "supporting",
    "why_key": "brand_partnership_revenue_band",
    "sources": [
      {
        "source_brand": "Brand Contract",
        "source_channel": "financial statement",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist upload",
        "limitation_text": "Private commercial context; bands only where surfaced; never used to rank artists",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "supporting_financial_statement",
    "field_label_en": "Supporting financial statement",
    "planet_key": "prokit",
    "segment": "Monetization & Commercials",
    "applicability": "conditional",
    "visibility": "artist",
    "freshness": "review-90d",
    "method_ceiling": "supporting",
    "why_key": "supporting_financial_statement",
    "sources": [
      {
        "source_brand": "Financial Statement",
        "source_channel": "financial statement",
        "source_type": "document",
        "logo_asset": "generic:none",
        "connection_method": "upload",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-90d",
        "consent_requirement": "artist upload",
        "limitation_text": "Private commercial context; bands only where surfaced; never used to rank artists",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "royalty_source_affiliation",
    "field_label_en": "Royalty-source affiliation",
    "planet_key": "prokit",
    "segment": "Monetization & Commercials",
    "applicability": "required",
    "visibility": "artist",
    "freshness": "review-365d",
    "method_ceiling": "supporting",
    "why_key": "royalty_source_affiliation",
    "sources": [
      {
        "source_brand": "ACUM",
        "source_channel": "member or repertoire record",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Affiliation does not verify received revenue",
        "applicability": "required"
      },
      {
        "source_brand": "BMI",
        "source_channel": "member or repertoire record",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Affiliation does not verify received revenue",
        "applicability": "conditional"
      },
      {
        "source_brand": "ASCAP",
        "source_channel": "member or repertoire record",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Affiliation does not verify received revenue",
        "applicability": "conditional"
      },
      {
        "source_brand": "PRS",
        "source_channel": "member or repertoire record",
        "source_type": "platform",
        "logo_asset": "generic:none",
        "connection_method": "url",
        "evidence_ceiling": "supporting",
        "freshness_rule": "review-365d",
        "consent_requirement": "artist-confirmed link",
        "limitation_text": "Affiliation does not verify received revenue",
        "applicability": "conditional"
      }
    ]
  },
  {
    "field_id": "release_timeline",
    "field_label_en": "Release timeline",
    "planet_key": "proof",
    "segment": "Observed Career History & Change",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-on-source-change",
    "method_ceiling": "not-assessable",
    "why_key": "release_timeline",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "refresh-on-source-change",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed history only; never rendered as a prediction",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "gig_timeline",
    "field_label_en": "Gig timeline",
    "planet_key": "proof",
    "segment": "Observed Career History & Change",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-on-source-change",
    "method_ceiling": "not-assessable",
    "why_key": "gig_timeline",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "refresh-on-source-change",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed history only; never rendered as a prediction",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "ticketing_timeline",
    "field_label_en": "Ticketing timeline",
    "planet_key": "proof",
    "segment": "Observed Career History & Change",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-on-source-change",
    "method_ceiling": "not-assessable",
    "why_key": "ticketing_timeline",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "refresh-on-source-change",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed history only; never rendered as a prediction",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "territory_timeline",
    "field_label_en": "Territory timeline",
    "planet_key": "proof",
    "segment": "Observed Career History & Change",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-on-source-change",
    "method_ceiling": "not-assessable",
    "why_key": "territory_timeline",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "refresh-on-source-change",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed history only; never rendered as a prediction",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "venue_timeline",
    "field_label_en": "Venue timeline",
    "planet_key": "proof",
    "segment": "Observed Career History & Change",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-on-source-change",
    "method_ceiling": "not-assessable",
    "why_key": "venue_timeline",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "refresh-on-source-change",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed history only; never rendered as a prediction",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "festival_timeline",
    "field_label_en": "Festival timeline",
    "planet_key": "proof",
    "segment": "Observed Career History & Change",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-on-source-change",
    "method_ceiling": "not-assessable",
    "why_key": "festival_timeline",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "refresh-on-source-change",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed history only; never rendered as a prediction",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "audience_band_history",
    "field_label_en": "Audience-band history",
    "planet_key": "proof",
    "segment": "Observed Career History & Change",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-on-source-change",
    "method_ceiling": "not-assessable",
    "why_key": "audience_band_history",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "refresh-on-source-change",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed history only; never rendered as a prediction",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "community_band_history",
    "field_label_en": "Community-band history",
    "planet_key": "proof",
    "segment": "Observed Career History & Change",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-on-source-change",
    "method_ceiling": "not-assessable",
    "why_key": "community_band_history",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "refresh-on-source-change",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed history only; never rendered as a prediction",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "booking_frequency_history",
    "field_label_en": "Booking-frequency history",
    "planet_key": "proof",
    "segment": "Observed Career History & Change",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-on-source-change",
    "method_ceiling": "not-assessable",
    "why_key": "booking_frequency_history",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "refresh-on-source-change",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed history only; never rendered as a prediction",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "repeat_booking_history",
    "field_label_en": "Repeat-booking history",
    "planet_key": "proof",
    "segment": "Observed Career History & Change",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-on-source-change",
    "method_ceiling": "not-assessable",
    "why_key": "repeat_booking_history",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "refresh-on-source-change",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed history only; never rendered as a prediction",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "fee_band_history",
    "field_label_en": "Fee-band history",
    "planet_key": "proof",
    "segment": "Observed Career History & Change",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-on-source-change",
    "method_ceiling": "not-assessable",
    "why_key": "fee_band_history",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "refresh-on-source-change",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed history only; never rendered as a prediction",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "representation_changes",
    "field_label_en": "Representation changes",
    "planet_key": "proof",
    "segment": "Observed Career History & Change",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-on-source-change",
    "method_ceiling": "not-assessable",
    "why_key": "representation_changes",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "refresh-on-source-change",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed history only; never rendered as a prediction",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "team_changes",
    "field_label_en": "Team changes",
    "planet_key": "proof",
    "segment": "Observed Career History & Change",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-on-source-change",
    "method_ceiling": "not-assessable",
    "why_key": "team_changes",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "refresh-on-source-change",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed history only; never rendered as a prediction",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "label_changes",
    "field_label_en": "Label changes",
    "planet_key": "proof",
    "segment": "Observed Career History & Change",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-on-source-change",
    "method_ceiling": "not-assessable",
    "why_key": "label_changes",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "refresh-on-source-change",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed history only; never rendered as a prediction",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "publisher_changes",
    "field_label_en": "Publisher changes",
    "planet_key": "proof",
    "segment": "Observed Career History & Change",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-on-source-change",
    "method_ceiling": "not-assessable",
    "why_key": "publisher_changes",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "refresh-on-source-change",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed history only; never rendered as a prediction",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "collaboration_timeline",
    "field_label_en": "Collaboration timeline",
    "planet_key": "proof",
    "segment": "Observed Career History & Change",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-on-source-change",
    "method_ceiling": "not-assessable",
    "why_key": "collaboration_timeline",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "refresh-on-source-change",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed history only; never rendered as a prediction",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "press_timeline",
    "field_label_en": "Press timeline",
    "planet_key": "proof",
    "segment": "Observed Career History & Change",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-on-source-change",
    "method_ceiling": "not-assessable",
    "why_key": "press_timeline",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "refresh-on-source-change",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed history only; never rendered as a prediction",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "career_milestone_record",
    "field_label_en": "Career milestone record",
    "planet_key": "proof",
    "segment": "Observed Career History & Change",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-on-source-change",
    "method_ceiling": "not-assessable",
    "why_key": "career_milestone_record",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "refresh-on-source-change",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed history only; never rendered as a prediction",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "evidence_freshness_state",
    "field_label_en": "Evidence freshness state",
    "planet_key": "proof",
    "segment": "Observed Career History & Change",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-on-source-change",
    "method_ceiling": "not-assessable",
    "why_key": "evidence_freshness_state",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "refresh-on-source-change",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed history only; never rendered as a prediction",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "source_contradiction_state",
    "field_label_en": "Source contradiction state",
    "planet_key": "proof",
    "segment": "Observed Career History & Change",
    "applicability": "supporting",
    "visibility": "working",
    "freshness": "refresh-on-source-change",
    "method_ceiling": "not-assessable",
    "why_key": "source_contradiction_state",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "refresh-on-source-change",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed history only; never rendered as a prediction",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "observed_change",
    "field_label_en": "Observed change",
    "planet_key": "proof",
    "segment": "Observed Career History & Change",
    "applicability": "supporting",
    "visibility": "artist",
    "freshness": "refresh-on-source-change",
    "method_ceiling": "not-assessable",
    "why_key": "observed_change",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "refresh-on-source-change",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed history only; never rendered as a prediction",
        "applicability": "supporting"
      }
    ]
  },
  {
    "field_id": "recheck_trigger",
    "field_label_en": "Recheck trigger",
    "planet_key": "proof",
    "segment": "Observed Career History & Change",
    "applicability": "supporting",
    "visibility": "working",
    "freshness": "refresh-on-source-change",
    "method_ceiling": "not-assessable",
    "why_key": "recheck_trigger",
    "sources": [
      {
        "source_brand": "LOCK",
        "source_channel": "system-derived record",
        "source_type": "document",
        "logo_asset": "generic:declared-manual",
        "connection_method": "derived",
        "evidence_ceiling": "not-assessable",
        "freshness_rule": "refresh-on-source-change",
        "consent_requirement": "system derivation",
        "limitation_text": "Observed history only; never rendered as a prediction",
        "applicability": "supporting"
      }
    ]
  }
]

// KEY NAMES only — see generator header. field_label_en_seed is a literal
// F1 label, NOT persuasive copy; he_seed is intentionally null (orchestrator
// owns HE + the actual "why a buyer cares" sentence per key).
export const WHY_KEY_MANIFEST = [
  {
    "why_key": "stage_name",
    "field_id": "stage_name",
    "field_label_en_seed": "Stage name",
    "he_seed": null
  },
  {
    "why_key": "legal_name",
    "field_id": "legal_name",
    "field_label_en_seed": "Legal name",
    "he_seed": null
  },
  {
    "why_key": "artist_alias",
    "field_id": "artist_alias",
    "field_label_en_seed": "Artist alias",
    "he_seed": null
  },
  {
    "why_key": "act_name",
    "field_id": "act_name",
    "field_label_en_seed": "Act name",
    "he_seed": null
  },
  {
    "why_key": "artist_family",
    "field_id": "artist_family",
    "field_label_en_seed": "Artist family",
    "he_seed": null
  },
  {
    "why_key": "canonical_subtype",
    "field_id": "canonical_subtype",
    "field_label_en_seed": "Canonical subtype",
    "he_seed": null
  },
  {
    "why_key": "primary_genre",
    "field_id": "primary_genre",
    "field_label_en_seed": "Primary genre",
    "he_seed": null
  },
  {
    "why_key": "secondary_genres",
    "field_id": "secondary_genres",
    "field_label_en_seed": "Secondary genres",
    "he_seed": null
  },
  {
    "why_key": "performance_format",
    "field_id": "performance_format",
    "field_label_en_seed": "Performance format",
    "he_seed": null
  },
  {
    "why_key": "act_structure",
    "field_id": "act_structure",
    "field_label_en_seed": "Act structure",
    "he_seed": null
  },
  {
    "why_key": "home_city",
    "field_id": "home_city",
    "field_label_en_seed": "Home city",
    "he_seed": null
  },
  {
    "why_key": "home_country",
    "field_id": "home_country",
    "field_label_en_seed": "Home country",
    "he_seed": null
  },
  {
    "why_key": "active_territories",
    "field_id": "active_territories",
    "field_label_en_seed": "Active territories",
    "he_seed": null
  },
  {
    "why_key": "performance_languages",
    "field_id": "performance_languages",
    "field_label_en_seed": "Performance languages",
    "he_seed": null
  },
  {
    "why_key": "official_website_url",
    "field_id": "official_website_url",
    "field_label_en_seed": "Official website",
    "he_seed": null
  },
  {
    "why_key": "spotify_artist_profile",
    "field_id": "spotify_artist_profile",
    "field_label_en_seed": "Spotify artist profile",
    "he_seed": null
  },
  {
    "why_key": "apple_music_artist_profile",
    "field_id": "apple_music_artist_profile",
    "field_label_en_seed": "Apple Music artist profile",
    "he_seed": null
  },
  {
    "why_key": "youtube_channel_url",
    "field_id": "youtube_channel_url",
    "field_label_en_seed": "YouTube channel",
    "he_seed": null
  },
  {
    "why_key": "instagram_profile_url",
    "field_id": "instagram_profile_url",
    "field_label_en_seed": "Instagram profile",
    "he_seed": null
  },
  {
    "why_key": "tiktok_profile_url",
    "field_id": "tiktok_profile_url",
    "field_label_en_seed": "TikTok profile",
    "he_seed": null
  },
  {
    "why_key": "facebook_page_url",
    "field_id": "facebook_page_url",
    "field_label_en_seed": "Facebook Page",
    "he_seed": null
  },
  {
    "why_key": "x_profile_url",
    "field_id": "x_profile_url",
    "field_label_en_seed": "X profile",
    "he_seed": null
  },
  {
    "why_key": "soundcloud_profile_url",
    "field_id": "soundcloud_profile_url",
    "field_label_en_seed": "SoundCloud profile",
    "he_seed": null
  },
  {
    "why_key": "bandcamp_artist_page",
    "field_id": "bandcamp_artist_page",
    "field_label_en_seed": "Bandcamp artist page",
    "he_seed": null
  },
  {
    "why_key": "beatport_artist_profile",
    "field_id": "beatport_artist_profile",
    "field_label_en_seed": "Beatport artist profile",
    "he_seed": null
  },
  {
    "why_key": "resident_advisor_artist_profile",
    "field_id": "resident_advisor_artist_profile",
    "field_label_en_seed": "Resident Advisor artist profile",
    "he_seed": null
  },
  {
    "why_key": "bandsintown_artist_profile",
    "field_id": "bandsintown_artist_profile",
    "field_label_en_seed": "Bandsintown artist profile",
    "he_seed": null
  },
  {
    "why_key": "songkick_artist_profile",
    "field_id": "songkick_artist_profile",
    "field_label_en_seed": "Songkick artist profile",
    "he_seed": null
  },
  {
    "why_key": "identity_manager_office",
    "field_id": "identity_manager_office",
    "field_label_en_seed": "Manager office",
    "he_seed": null
  },
  {
    "why_key": "authorized_representative",
    "field_id": "authorized_representative",
    "field_label_en_seed": "Authorized representative",
    "he_seed": null
  },
  {
    "why_key": "duplicate_profile_resolution",
    "field_id": "duplicate_profile_resolution",
    "field_label_en_seed": "Duplicate profile resolution",
    "he_seed": null
  },
  {
    "why_key": "buyer_facing_one_liner",
    "field_id": "buyer_facing_one_liner",
    "field_label_en_seed": "Buyer-facing one-liner",
    "he_seed": null
  },
  {
    "why_key": "short_biography",
    "field_id": "short_biography",
    "field_label_en_seed": "Short biography",
    "he_seed": null
  },
  {
    "why_key": "long_biography",
    "field_id": "long_biography",
    "field_label_en_seed": "Long biography",
    "he_seed": null
  },
  {
    "why_key": "genre_description",
    "field_id": "genre_description",
    "field_label_en_seed": "Genre description",
    "he_seed": null
  },
  {
    "why_key": "artist_proposition",
    "field_id": "artist_proposition",
    "field_label_en_seed": "Artist proposition",
    "he_seed": null
  },
  {
    "why_key": "distinctive_promise",
    "field_id": "distinctive_promise",
    "field_label_en_seed": "Distinctive promise",
    "he_seed": null
  },
  {
    "why_key": "target_audience",
    "field_id": "target_audience",
    "field_label_en_seed": "Target audience",
    "he_seed": null
  },
  {
    "why_key": "target_booking_contexts",
    "field_id": "target_booking_contexts",
    "field_label_en_seed": "Target booking contexts",
    "he_seed": null
  },
  {
    "why_key": "brand_story",
    "field_id": "brand_story",
    "field_label_en_seed": "Brand story",
    "he_seed": null
  },
  {
    "why_key": "tone_of_voice",
    "field_id": "tone_of_voice",
    "field_label_en_seed": "Tone of voice",
    "he_seed": null
  },
  {
    "why_key": "artist_logo_file",
    "field_id": "artist_logo_file",
    "field_label_en_seed": "Artist logo",
    "he_seed": null
  },
  {
    "why_key": "artist_wordmark_file",
    "field_id": "artist_wordmark_file",
    "field_label_en_seed": "Artist wordmark",
    "he_seed": null
  },
  {
    "why_key": "brand_color_palette",
    "field_id": "brand_color_palette",
    "field_label_en_seed": "Brand color palette",
    "he_seed": null
  },
  {
    "why_key": "brand_typography",
    "field_id": "brand_typography",
    "field_label_en_seed": "Brand typography",
    "he_seed": null
  },
  {
    "why_key": "primary_press_photo",
    "field_id": "primary_press_photo",
    "field_label_en_seed": "Primary press photo",
    "he_seed": null
  },
  {
    "why_key": "profile_image_file",
    "field_id": "profile_image_file",
    "field_label_en_seed": "Profile image",
    "he_seed": null
  },
  {
    "why_key": "cover_image_file",
    "field_id": "cover_image_file",
    "field_label_en_seed": "Cover image",
    "he_seed": null
  },
  {
    "why_key": "press_kit_file",
    "field_id": "press_kit_file",
    "field_label_en_seed": "Press kit",
    "he_seed": null
  },
  {
    "why_key": "brand_usage_guide",
    "field_id": "brand_usage_guide",
    "field_label_en_seed": "Brand usage guide",
    "he_seed": null
  },
  {
    "why_key": "brand_link_in_bio_url",
    "field_id": "brand_link_in_bio_url",
    "field_label_en_seed": "Brand link-in-bio page",
    "he_seed": null
  },
  {
    "why_key": "visual_consistency_review",
    "field_id": "visual_consistency_review",
    "field_label_en_seed": "Visual consistency review",
    "he_seed": null
  },
  {
    "why_key": "catalogue_release_record",
    "field_id": "catalogue_release_record",
    "field_label_en_seed": "Catalogue release record",
    "he_seed": null
  },
  {
    "why_key": "unreleased_material",
    "field_id": "unreleased_material",
    "field_label_en_seed": "Unreleased material",
    "he_seed": null
  },
  {
    "why_key": "representative_track",
    "field_id": "representative_track",
    "field_label_en_seed": "Representative track",
    "he_seed": null
  },
  {
    "why_key": "repertoire_duration",
    "field_id": "repertoire_duration",
    "field_label_en_seed": "Repertoire duration",
    "he_seed": null
  },
  {
    "why_key": "set_repertoire_type",
    "field_id": "set_repertoire_type",
    "field_label_en_seed": "Set repertoire type",
    "he_seed": null
  },
  {
    "why_key": "repertoire_languages",
    "field_id": "repertoire_languages",
    "field_label_en_seed": "Repertoire languages",
    "he_seed": null
  },
  {
    "why_key": "catalogue_master_rights_owner",
    "field_id": "catalogue_master_rights_owner",
    "field_label_en_seed": "Master rights owner",
    "he_seed": null
  },
  {
    "why_key": "catalogue_publishing_rights_owner",
    "field_id": "catalogue_publishing_rights_owner",
    "field_label_en_seed": "Publishing rights owner",
    "he_seed": null
  },
  {
    "why_key": "isrc_record",
    "field_id": "isrc_record",
    "field_label_en_seed": "ISRC record",
    "he_seed": null
  },
  {
    "why_key": "upc_record",
    "field_id": "upc_record",
    "field_label_en_seed": "UPC record",
    "he_seed": null
  },
  {
    "why_key": "catalogue_number",
    "field_id": "catalogue_number",
    "field_label_en_seed": "Catalogue number",
    "he_seed": null
  },
  {
    "why_key": "release_metadata_file",
    "field_id": "release_metadata_file",
    "field_label_en_seed": "Release metadata file",
    "he_seed": null
  },
  {
    "why_key": "producer_credit",
    "field_id": "producer_credit",
    "field_label_en_seed": "Producer credit",
    "he_seed": null
  },
  {
    "why_key": "composer_credit",
    "field_id": "composer_credit",
    "field_label_en_seed": "Composer credit",
    "he_seed": null
  },
  {
    "why_key": "remixer_credit",
    "field_id": "remixer_credit",
    "field_label_en_seed": "Remixer credit",
    "he_seed": null
  },
  {
    "why_key": "featured_artist_credit",
    "field_id": "featured_artist_credit",
    "field_label_en_seed": "Featured artist credit",
    "he_seed": null
  },
  {
    "why_key": "label_credit",
    "field_id": "label_credit",
    "field_label_en_seed": "Label credit",
    "he_seed": null
  },
  {
    "why_key": "signature_sound",
    "field_id": "signature_sound",
    "field_label_en_seed": "Signature sound",
    "he_seed": null
  },
  {
    "why_key": "signature_performance_capability",
    "field_id": "signature_performance_capability",
    "field_label_en_seed": "Signature performance capability",
    "he_seed": null
  },
  {
    "why_key": "creative_concept",
    "field_id": "creative_concept",
    "field_label_en_seed": "Creative concept",
    "he_seed": null
  },
  {
    "why_key": "sonic_identity",
    "field_id": "sonic_identity",
    "field_label_en_seed": "Sonic identity",
    "he_seed": null
  },
  {
    "why_key": "visual_show_concept",
    "field_id": "visual_show_concept",
    "field_label_en_seed": "Visual show concept",
    "he_seed": null
  },
  {
    "why_key": "customization_capability",
    "field_id": "customization_capability",
    "field_label_en_seed": "Customization capability",
    "he_seed": null
  },
  {
    "why_key": "creative_limitations",
    "field_id": "creative_limitations",
    "field_label_en_seed": "Creative limitations",
    "he_seed": null
  },
  {
    "why_key": "representative_audio_link",
    "field_id": "representative_audio_link",
    "field_label_en_seed": "Representative audio link",
    "he_seed": null
  },
  {
    "why_key": "representative_video_link",
    "field_id": "representative_video_link",
    "field_label_en_seed": "Representative video link",
    "he_seed": null
  },
  {
    "why_key": "gateway_live_clip",
    "field_id": "gateway_live_clip",
    "field_label_en_seed": "Gateway live clip",
    "he_seed": null
  },
  {
    "why_key": "full_live_set_video",
    "field_id": "full_live_set_video",
    "field_label_en_seed": "Full live-set video",
    "he_seed": null
  },
  {
    "why_key": "short_performance_clip",
    "field_id": "short_performance_clip",
    "field_label_en_seed": "Short performance clip",
    "he_seed": null
  },
  {
    "why_key": "unreleased_demo_file",
    "field_id": "unreleased_demo_file",
    "field_label_en_seed": "Unreleased demo",
    "he_seed": null
  },
  {
    "why_key": "visual_show_reference",
    "field_id": "visual_show_reference",
    "field_label_en_seed": "Visual show reference",
    "he_seed": null
  },
  {
    "why_key": "streaming_listener_band",
    "field_id": "streaming_listener_band",
    "field_label_en_seed": "Monthly listener band",
    "he_seed": null
  },
  {
    "why_key": "streaming_follower_band",
    "field_id": "streaming_follower_band",
    "field_label_en_seed": "Streaming follower band",
    "he_seed": null
  },
  {
    "why_key": "stream_band",
    "field_id": "stream_band",
    "field_label_en_seed": "Stream band",
    "he_seed": null
  },
  {
    "why_key": "save_band",
    "field_id": "save_band",
    "field_label_en_seed": "Save band",
    "he_seed": null
  },
  {
    "why_key": "repeat_listener_indicator",
    "field_id": "repeat_listener_indicator",
    "field_label_en_seed": "Repeat-listener indicator",
    "he_seed": null
  },
  {
    "why_key": "top_tracks",
    "field_id": "top_tracks",
    "field_label_en_seed": "Top tracks",
    "he_seed": null
  },
  {
    "why_key": "streaming_top_cities",
    "field_id": "streaming_top_cities",
    "field_label_en_seed": "Streaming top cities",
    "he_seed": null
  },
  {
    "why_key": "streaming_top_countries",
    "field_id": "streaming_top_countries",
    "field_label_en_seed": "Streaming top countries",
    "he_seed": null
  },
  {
    "why_key": "listener_territory_distribution",
    "field_id": "listener_territory_distribution",
    "field_label_en_seed": "Listener territory distribution",
    "he_seed": null
  },
  {
    "why_key": "editorial_playlist_placement",
    "field_id": "editorial_playlist_placement",
    "field_label_en_seed": "Editorial playlist placement",
    "he_seed": null
  },
  {
    "why_key": "user_playlist_placement",
    "field_id": "user_playlist_placement",
    "field_label_en_seed": "User playlist placement",
    "he_seed": null
  },
  {
    "why_key": "dj_tracklist_presence",
    "field_id": "dj_tracklist_presence",
    "field_label_en_seed": "DJ tracklist presence",
    "he_seed": null
  },
  {
    "why_key": "streaming_change_over_time",
    "field_id": "streaming_change_over_time",
    "field_label_en_seed": "Streaming change over time",
    "he_seed": null
  },
  {
    "why_key": "instagram_follower_band",
    "field_id": "instagram_follower_band",
    "field_label_en_seed": "Instagram follower band",
    "he_seed": null
  },
  {
    "why_key": "instagram_engagement_band",
    "field_id": "instagram_engagement_band",
    "field_label_en_seed": "Instagram engagement band",
    "he_seed": null
  },
  {
    "why_key": "instagram_top_cities",
    "field_id": "instagram_top_cities",
    "field_label_en_seed": "Instagram top cities",
    "he_seed": null
  },
  {
    "why_key": "instagram_audience_age_band",
    "field_id": "instagram_audience_age_band",
    "field_label_en_seed": "Instagram audience age band",
    "he_seed": null
  },
  {
    "why_key": "instagram_audience_gender_distribution",
    "field_id": "instagram_audience_gender_distribution",
    "field_label_en_seed": "Instagram audience gender distribution",
    "he_seed": null
  },
  {
    "why_key": "instagram_share_activity_band",
    "field_id": "instagram_share_activity_band",
    "field_label_en_seed": "Instagram share activity band",
    "he_seed": null
  },
  {
    "why_key": "instagram_save_activity_band",
    "field_id": "instagram_save_activity_band",
    "field_label_en_seed": "Instagram save activity band",
    "he_seed": null
  },
  {
    "why_key": "tiktok_follower_band",
    "field_id": "tiktok_follower_band",
    "field_label_en_seed": "TikTok follower band",
    "he_seed": null
  },
  {
    "why_key": "tiktok_engagement_band",
    "field_id": "tiktok_engagement_band",
    "field_label_en_seed": "TikTok engagement band",
    "he_seed": null
  },
  {
    "why_key": "tiktok_top_territories",
    "field_id": "tiktok_top_territories",
    "field_label_en_seed": "TikTok top territories",
    "he_seed": null
  },
  {
    "why_key": "tiktok_share_activity_band",
    "field_id": "tiktok_share_activity_band",
    "field_label_en_seed": "TikTok share activity band",
    "he_seed": null
  },
  {
    "why_key": "youtube_subscriber_band",
    "field_id": "youtube_subscriber_band",
    "field_label_en_seed": "YouTube subscriber band",
    "he_seed": null
  },
  {
    "why_key": "youtube_viewer_territories",
    "field_id": "youtube_viewer_territories",
    "field_label_en_seed": "YouTube viewer territories",
    "he_seed": null
  },
  {
    "why_key": "youtube_returning_viewer_indicator",
    "field_id": "youtube_returning_viewer_indicator",
    "field_label_en_seed": "YouTube returning-viewer indicator",
    "he_seed": null
  },
  {
    "why_key": "facebook_follower_band",
    "field_id": "facebook_follower_band",
    "field_label_en_seed": "Facebook follower band",
    "he_seed": null
  },
  {
    "why_key": "facebook_engagement_band",
    "field_id": "facebook_engagement_band",
    "field_label_en_seed": "Facebook engagement band",
    "he_seed": null
  },
  {
    "why_key": "audience_languages",
    "field_id": "audience_languages",
    "field_label_en_seed": "Audience languages",
    "he_seed": null
  },
  {
    "why_key": "core_audience_description",
    "field_id": "core_audience_description",
    "field_label_en_seed": "Core audience description",
    "he_seed": null
  },
  {
    "why_key": "user_generated_content_presence",
    "field_id": "user_generated_content_presence",
    "field_label_en_seed": "User-generated content presence",
    "he_seed": null
  },
  {
    "why_key": "repeat_audience_interaction",
    "field_id": "repeat_audience_interaction",
    "field_label_en_seed": "Repeat audience interaction",
    "he_seed": null
  },
  {
    "why_key": "event_related_engagement",
    "field_id": "event_related_engagement",
    "field_label_en_seed": "Event-related engagement",
    "he_seed": null
  },
  {
    "why_key": "instagram_feed_presence",
    "field_id": "instagram_feed_presence",
    "field_label_en_seed": "Instagram Feed presence",
    "he_seed": null
  },
  {
    "why_key": "instagram_reels_presence",
    "field_id": "instagram_reels_presence",
    "field_label_en_seed": "Instagram Reels presence",
    "he_seed": null
  },
  {
    "why_key": "instagram_stories_presence",
    "field_id": "instagram_stories_presence",
    "field_label_en_seed": "Instagram Stories presence",
    "he_seed": null
  },
  {
    "why_key": "instagram_live_presence",
    "field_id": "instagram_live_presence",
    "field_label_en_seed": "Instagram Live presence",
    "he_seed": null
  },
  {
    "why_key": "instagram_broadcast_channel",
    "field_id": "instagram_broadcast_channel",
    "field_label_en_seed": "Instagram Broadcast Channel",
    "he_seed": null
  },
  {
    "why_key": "tiktok_posts_presence",
    "field_id": "tiktok_posts_presence",
    "field_label_en_seed": "TikTok posts presence",
    "he_seed": null
  },
  {
    "why_key": "tiktok_live_presence",
    "field_id": "tiktok_live_presence",
    "field_label_en_seed": "TikTok Live presence",
    "he_seed": null
  },
  {
    "why_key": "youtube_video_presence",
    "field_id": "youtube_video_presence",
    "field_label_en_seed": "YouTube video presence",
    "he_seed": null
  },
  {
    "why_key": "youtube_shorts_presence",
    "field_id": "youtube_shorts_presence",
    "field_label_en_seed": "YouTube Shorts presence",
    "he_seed": null
  },
  {
    "why_key": "youtube_live_presence",
    "field_id": "youtube_live_presence",
    "field_label_en_seed": "YouTube Live presence",
    "he_seed": null
  },
  {
    "why_key": "facebook_page_presence",
    "field_id": "facebook_page_presence",
    "field_label_en_seed": "Facebook Page presence",
    "he_seed": null
  },
  {
    "why_key": "facebook_events_presence",
    "field_id": "facebook_events_presence",
    "field_label_en_seed": "Facebook Events presence",
    "he_seed": null
  },
  {
    "why_key": "facebook_group_presence",
    "field_id": "facebook_group_presence",
    "field_label_en_seed": "Facebook Group presence",
    "he_seed": null
  },
  {
    "why_key": "x_posts_presence",
    "field_id": "x_posts_presence",
    "field_label_en_seed": "X posts presence",
    "he_seed": null
  },
  {
    "why_key": "posting_cadence",
    "field_id": "posting_cadence",
    "field_label_en_seed": "Posting cadence",
    "he_seed": null
  },
  {
    "why_key": "release_campaign_presence",
    "field_id": "release_campaign_presence",
    "field_label_en_seed": "Release campaign presence",
    "he_seed": null
  },
  {
    "why_key": "gig_promotion_presence",
    "field_id": "gig_promotion_presence",
    "field_label_en_seed": "Gig-promotion presence",
    "he_seed": null
  },
  {
    "why_key": "behind_the_scenes_content",
    "field_id": "behind_the_scenes_content",
    "field_label_en_seed": "Behind-the-scenes content",
    "he_seed": null
  },
  {
    "why_key": "studio_content_presence",
    "field_id": "studio_content_presence",
    "field_label_en_seed": "Studio content presence",
    "he_seed": null
  },
  {
    "why_key": "live_content_presence",
    "field_id": "live_content_presence",
    "field_label_en_seed": "Live-performance content",
    "he_seed": null
  },
  {
    "why_key": "fan_content_presence",
    "field_id": "fan_content_presence",
    "field_label_en_seed": "Fan-content presence",
    "he_seed": null
  },
  {
    "why_key": "collaboration_content_presence",
    "field_id": "collaboration_content_presence",
    "field_label_en_seed": "Collaboration-content presence",
    "he_seed": null
  },
  {
    "why_key": "content_call_to_action",
    "field_id": "content_call_to_action",
    "field_label_en_seed": "Content call to action",
    "he_seed": null
  },
  {
    "why_key": "content_link_in_bio_url",
    "field_id": "content_link_in_bio_url",
    "field_label_en_seed": "Content link-in-bio page",
    "he_seed": null
  },
  {
    "why_key": "content_calendar_file",
    "field_id": "content_calendar_file",
    "field_label_en_seed": "Content calendar",
    "he_seed": null
  },
  {
    "why_key": "content_production_owner",
    "field_id": "content_production_owner",
    "field_label_en_seed": "Content production owner",
    "he_seed": null
  },
  {
    "why_key": "whatsapp_community_size_band",
    "field_id": "whatsapp_community_size_band",
    "field_label_en_seed": "WhatsApp community size band",
    "he_seed": null
  },
  {
    "why_key": "whatsapp_channel_follower_band",
    "field_id": "whatsapp_channel_follower_band",
    "field_label_en_seed": "WhatsApp Channel follower band",
    "he_seed": null
  },
  {
    "why_key": "telegram_group_member_band",
    "field_id": "telegram_group_member_band",
    "field_label_en_seed": "Telegram group member band",
    "he_seed": null
  },
  {
    "why_key": "telegram_channel_subscriber_band",
    "field_id": "telegram_channel_subscriber_band",
    "field_label_en_seed": "Telegram channel subscriber band",
    "he_seed": null
  },
  {
    "why_key": "discord_member_band",
    "field_id": "discord_member_band",
    "field_label_en_seed": "Discord member band",
    "he_seed": null
  },
  {
    "why_key": "email_subscriber_band",
    "field_id": "email_subscriber_band",
    "field_label_en_seed": "Email subscriber band",
    "he_seed": null
  },
  {
    "why_key": "email_open_rate_band",
    "field_id": "email_open_rate_band",
    "field_label_en_seed": "Email open-rate band",
    "he_seed": null
  },
  {
    "why_key": "email_click_rate_band",
    "field_id": "email_click_rate_band",
    "field_label_en_seed": "Email click-rate band",
    "he_seed": null
  },
  {
    "why_key": "patreon_member_band",
    "field_id": "patreon_member_band",
    "field_label_en_seed": "Patreon member band",
    "he_seed": null
  },
  {
    "why_key": "sms_list_size_band",
    "field_id": "sms_list_size_band",
    "field_label_en_seed": "SMS list size band",
    "he_seed": null
  },
  {
    "why_key": "community_territory",
    "field_id": "community_territory",
    "field_label_en_seed": "Community territory",
    "he_seed": null
  },
  {
    "why_key": "community_language",
    "field_id": "community_language",
    "field_label_en_seed": "Community language",
    "he_seed": null
  },
  {
    "why_key": "broadcast_reach_band",
    "field_id": "broadcast_reach_band",
    "field_label_en_seed": "Broadcast reach band",
    "he_seed": null
  },
  {
    "why_key": "opt_out_process",
    "field_id": "opt_out_process",
    "field_label_en_seed": "Opt-out process",
    "he_seed": null
  },
  {
    "why_key": "community_consent_record",
    "field_id": "community_consent_record",
    "field_label_en_seed": "Community consent record",
    "he_seed": null
  },
  {
    "why_key": "community_to_ticket_evidence",
    "field_id": "community_to_ticket_evidence",
    "field_label_en_seed": "Community-to-ticket evidence",
    "he_seed": null
  },
  {
    "why_key": "community_last_activity_date",
    "field_id": "community_last_activity_date",
    "field_label_en_seed": "Community last activity date",
    "he_seed": null
  },
  {
    "why_key": "past_performance",
    "field_id": "past_performance",
    "field_label_en_seed": "Past performance record",
    "he_seed": null
  },
  {
    "why_key": "artist_role_in_event",
    "field_id": "artist_role_in_event",
    "field_label_en_seed": "Artist role in event",
    "he_seed": null
  },
  {
    "why_key": "slot_type",
    "field_id": "slot_type",
    "field_label_en_seed": "Slot type held",
    "he_seed": null
  },
  {
    "why_key": "set_format",
    "field_id": "set_format",
    "field_label_en_seed": "Set format",
    "he_seed": null
  },
  {
    "why_key": "set_duration",
    "field_id": "set_duration",
    "field_label_en_seed": "Set duration",
    "he_seed": null
  },
  {
    "why_key": "open_format_capability",
    "field_id": "open_format_capability",
    "field_label_en_seed": "Open-format capability",
    "he_seed": null
  },
  {
    "why_key": "performance_frequency_band",
    "field_id": "performance_frequency_band",
    "field_label_en_seed": "Performance frequency band",
    "he_seed": null
  },
  {
    "why_key": "residency_record",
    "field_id": "residency_record",
    "field_label_en_seed": "Residency record",
    "he_seed": null
  },
  {
    "why_key": "live_video_link",
    "field_id": "live_video_link",
    "field_label_en_seed": "Live video",
    "he_seed": null
  },
  {
    "why_key": "full_set_video",
    "field_id": "full_set_video",
    "field_label_en_seed": "Full-set video",
    "he_seed": null
  },
  {
    "why_key": "fan_footage_link",
    "field_id": "fan_footage_link",
    "field_label_en_seed": "Fan footage",
    "he_seed": null
  },
  {
    "why_key": "live_repeat_booking",
    "field_id": "live_repeat_booking",
    "field_label_en_seed": "Repeat booking",
    "he_seed": null
  },
  {
    "why_key": "invited_back",
    "field_id": "invited_back",
    "field_label_en_seed": "Invited back",
    "he_seed": null
  },
  {
    "why_key": "performance_delivery_confirmation",
    "field_id": "performance_delivery_confirmation",
    "field_label_en_seed": "Performance delivery confirmation",
    "he_seed": null
  },
  {
    "why_key": "event_ticket_export",
    "field_id": "event_ticket_export",
    "field_label_en_seed": "Event ticket export",
    "he_seed": null
  },
  {
    "why_key": "ticket_sales_band",
    "field_id": "ticket_sales_band",
    "field_label_en_seed": "Ticket sales band",
    "he_seed": null
  },
  {
    "why_key": "tickets_scanned_band",
    "field_id": "tickets_scanned_band",
    "field_label_en_seed": "Tickets scanned band",
    "he_seed": null
  },
  {
    "why_key": "attendance_band",
    "field_id": "attendance_band",
    "field_label_en_seed": "Attendance band",
    "he_seed": null
  },
  {
    "why_key": "artist_attributed_sales_band",
    "field_id": "artist_attributed_sales_band",
    "field_label_en_seed": "Artist-attributed sales band",
    "he_seed": null
  },
  {
    "why_key": "personal_link_sales_band",
    "field_id": "personal_link_sales_band",
    "field_label_en_seed": "Personal-link sales band",
    "he_seed": null
  },
  {
    "why_key": "coupon_code_sales_band",
    "field_id": "coupon_code_sales_band",
    "field_label_en_seed": "Coupon-code sales band",
    "he_seed": null
  },
  {
    "why_key": "presale_velocity_band",
    "field_id": "presale_velocity_band",
    "field_label_en_seed": "Presale velocity band",
    "he_seed": null
  },
  {
    "why_key": "door_sales_band",
    "field_id": "door_sales_band",
    "field_label_en_seed": "Door sales band",
    "he_seed": null
  },
  {
    "why_key": "guest_list_band",
    "field_id": "guest_list_band",
    "field_label_en_seed": "Guest-list band",
    "he_seed": null
  },
  {
    "why_key": "paid_vs_complimentary_band",
    "field_id": "paid_vs_complimentary_band",
    "field_label_en_seed": "Paid-versus-complimentary band",
    "he_seed": null
  },
  {
    "why_key": "gross_settlement_band",
    "field_id": "gross_settlement_band",
    "field_label_en_seed": "Gross settlement band",
    "he_seed": null
  },
  {
    "why_key": "net_settlement_band",
    "field_id": "net_settlement_band",
    "field_label_en_seed": "Net settlement band",
    "he_seed": null
  },
  {
    "why_key": "self_produced_event",
    "field_id": "self_produced_event",
    "field_label_en_seed": "Self-produced event",
    "he_seed": null
  },
  {
    "why_key": "ticketing_repeat_booking",
    "field_id": "ticketing_repeat_booking",
    "field_label_en_seed": "Repeat booking",
    "he_seed": null
  },
  {
    "why_key": "venue_capacity_band",
    "field_id": "venue_capacity_band",
    "field_label_en_seed": "Venue capacity band",
    "he_seed": null
  },
  {
    "why_key": "booking_context",
    "field_id": "booking_context",
    "field_label_en_seed": "Booking context",
    "he_seed": null
  },
  {
    "why_key": "buyer_type",
    "field_id": "buyer_type",
    "field_label_en_seed": "Buyer type",
    "he_seed": null
  },
  {
    "why_key": "event_territory",
    "field_id": "event_territory",
    "field_label_en_seed": "Event territory",
    "he_seed": null
  },
  {
    "why_key": "availability_status",
    "field_id": "availability_status",
    "field_label_en_seed": "Availability status",
    "he_seed": null
  },
  {
    "why_key": "fee_band",
    "field_id": "fee_band",
    "field_label_en_seed": "Fee band",
    "he_seed": null
  },
  {
    "why_key": "booking_request_source",
    "field_id": "booking_request_source",
    "field_label_en_seed": "Booking request source",
    "he_seed": null
  },
  {
    "why_key": "booking_availability_process",
    "field_id": "booking_availability_process",
    "field_label_en_seed": "Availability process",
    "he_seed": null
  },
  {
    "why_key": "quote_document",
    "field_id": "quote_document",
    "field_label_en_seed": "Quote",
    "he_seed": null
  },
  {
    "why_key": "travel_terms",
    "field_id": "travel_terms",
    "field_label_en_seed": "Travel terms",
    "he_seed": null
  },
  {
    "why_key": "expense_terms",
    "field_id": "expense_terms",
    "field_label_en_seed": "Expense terms",
    "he_seed": null
  },
  {
    "why_key": "deposit_requirement",
    "field_id": "deposit_requirement",
    "field_label_en_seed": "Deposit requirement",
    "he_seed": null
  },
  {
    "why_key": "payment_terms",
    "field_id": "payment_terms",
    "field_label_en_seed": "Payment terms",
    "he_seed": null
  },
  {
    "why_key": "cancellation_terms",
    "field_id": "cancellation_terms",
    "field_label_en_seed": "Cancellation terms",
    "he_seed": null
  },
  {
    "why_key": "negotiator",
    "field_id": "negotiator",
    "field_label_en_seed": "Negotiator",
    "he_seed": null
  },
  {
    "why_key": "booking_contracting_entity",
    "field_id": "booking_contracting_entity",
    "field_label_en_seed": "Contracting entity",
    "he_seed": null
  },
  {
    "why_key": "booking_request_date",
    "field_id": "booking_request_date",
    "field_label_en_seed": "Booking request date",
    "he_seed": null
  },
  {
    "why_key": "event_date",
    "field_id": "event_date",
    "field_label_en_seed": "Event date",
    "he_seed": null
  },
  {
    "why_key": "lead_time_band",
    "field_id": "lead_time_band",
    "field_label_en_seed": "Booking lead-time band",
    "he_seed": null
  },
  {
    "why_key": "quote_status",
    "field_id": "quote_status",
    "field_label_en_seed": "Quote status",
    "he_seed": null
  },
  {
    "why_key": "booking_status",
    "field_id": "booking_status",
    "field_label_en_seed": "Booking status",
    "he_seed": null
  },
  {
    "why_key": "reason_closed",
    "field_id": "reason_closed",
    "field_label_en_seed": "Reason closed",
    "he_seed": null
  },
  {
    "why_key": "booking_next_action",
    "field_id": "booking_next_action",
    "field_label_en_seed": "Booking next action",
    "he_seed": null
  },
  {
    "why_key": "professional_reference",
    "field_id": "professional_reference",
    "field_label_en_seed": "Professional reference",
    "he_seed": null
  },
  {
    "why_key": "reliability_confirmation",
    "field_id": "reliability_confirmation",
    "field_label_en_seed": "Reliability confirmation",
    "he_seed": null
  },
  {
    "why_key": "punctuality_confirmation",
    "field_id": "punctuality_confirmation",
    "field_label_en_seed": "Punctuality confirmation",
    "he_seed": null
  },
  {
    "why_key": "communication_confirmation",
    "field_id": "communication_confirmation",
    "field_label_en_seed": "Communication confirmation",
    "he_seed": null
  },
  {
    "why_key": "technical_delivery_confirmation",
    "field_id": "technical_delivery_confirmation",
    "field_label_en_seed": "Technical delivery confirmation",
    "he_seed": null
  },
  {
    "why_key": "artistic_delivery_confirmation",
    "field_id": "artistic_delivery_confirmation",
    "field_label_en_seed": "Artistic delivery confirmation",
    "he_seed": null
  },
  {
    "why_key": "problem_resolution_confirmation",
    "field_id": "problem_resolution_confirmation",
    "field_label_en_seed": "Problem-resolution confirmation",
    "he_seed": null
  },
  {
    "why_key": "would_rebook",
    "field_id": "would_rebook",
    "field_label_en_seed": "Would rebook",
    "he_seed": null
  },
  {
    "why_key": "trust_repeat_booking",
    "field_id": "trust_repeat_booking",
    "field_label_en_seed": "Repeat booking",
    "he_seed": null
  },
  {
    "why_key": "testimonial_document",
    "field_id": "testimonial_document",
    "field_label_en_seed": "Testimonial",
    "he_seed": null
  },
  {
    "why_key": "published_review",
    "field_id": "published_review",
    "field_label_en_seed": "Published review",
    "he_seed": null
  },
  {
    "why_key": "reference_dispute_status",
    "field_id": "reference_dispute_status",
    "field_label_en_seed": "Reference dispute status",
    "he_seed": null
  },
  {
    "why_key": "reference_correction_status",
    "field_id": "reference_correction_status",
    "field_label_en_seed": "Reference correction status",
    "he_seed": null
  },
  {
    "why_key": "manager_office_relationship",
    "field_id": "manager_office_relationship",
    "field_label_en_seed": "Manager-office relationship",
    "he_seed": null
  },
  {
    "why_key": "production_company_relationship",
    "field_id": "production_company_relationship",
    "field_label_en_seed": "Production-company relationship",
    "he_seed": null
  },
  {
    "why_key": "venue_relationship",
    "field_id": "venue_relationship",
    "field_label_en_seed": "Venue relationship",
    "he_seed": null
  },
  {
    "why_key": "festival_relationship",
    "field_id": "festival_relationship",
    "field_label_en_seed": "Festival relationship",
    "he_seed": null
  },
  {
    "why_key": "promoter_relationship",
    "field_id": "promoter_relationship",
    "field_label_en_seed": "Promoter relationship",
    "he_seed": null
  },
  {
    "why_key": "label_relationship",
    "field_id": "label_relationship",
    "field_label_en_seed": "Label relationship",
    "he_seed": null
  },
  {
    "why_key": "publisher_relationship",
    "field_id": "publisher_relationship",
    "field_label_en_seed": "Publisher relationship",
    "he_seed": null
  },
  {
    "why_key": "media_relationship",
    "field_id": "media_relationship",
    "field_label_en_seed": "Media relationship",
    "he_seed": null
  },
  {
    "why_key": "a_and_r_relationship",
    "field_id": "a_and_r_relationship",
    "field_label_en_seed": "A&R relationship",
    "he_seed": null
  },
  {
    "why_key": "artist_collaboration_credit",
    "field_id": "artist_collaboration_credit",
    "field_label_en_seed": "Artist collaboration credit",
    "he_seed": null
  },
  {
    "why_key": "public_industry_affiliation",
    "field_id": "public_industry_affiliation",
    "field_label_en_seed": "Public industry affiliation",
    "he_seed": null
  },
  {
    "why_key": "referral_source",
    "field_id": "referral_source",
    "field_label_en_seed": "Referral source",
    "he_seed": null
  },
  {
    "why_key": "relationship_last_activity_date",
    "field_id": "relationship_last_activity_date",
    "field_label_en_seed": "Relationship last activity date",
    "he_seed": null
  },
  {
    "why_key": "legal_entity_name",
    "field_id": "legal_entity_name",
    "field_label_en_seed": "Legal entity name",
    "he_seed": null
  },
  {
    "why_key": "business_registration_type",
    "field_id": "business_registration_type",
    "field_label_en_seed": "Business registration type",
    "he_seed": null
  },
  {
    "why_key": "invoice_capability",
    "field_id": "invoice_capability",
    "field_label_en_seed": "Invoice capability",
    "he_seed": null
  },
  {
    "why_key": "tax_invoice_capability",
    "field_id": "tax_invoice_capability",
    "field_label_en_seed": "Tax-invoice capability",
    "he_seed": null
  },
  {
    "why_key": "receipt_capability",
    "field_id": "receipt_capability",
    "field_label_en_seed": "Receipt capability",
    "he_seed": null
  },
  {
    "why_key": "authorized_signatory",
    "field_id": "authorized_signatory",
    "field_label_en_seed": "Authorized signatory",
    "he_seed": null
  },
  {
    "why_key": "legal_master_rights_owner",
    "field_id": "legal_master_rights_owner",
    "field_label_en_seed": "Master rights owner",
    "he_seed": null
  },
  {
    "why_key": "legal_publishing_rights_owner",
    "field_id": "legal_publishing_rights_owner",
    "field_label_en_seed": "Publishing rights owner",
    "he_seed": null
  },
  {
    "why_key": "business_registration_number",
    "field_id": "business_registration_number",
    "field_label_en_seed": "Business registration number",
    "he_seed": null
  },
  {
    "why_key": "legal_contracting_entity",
    "field_id": "legal_contracting_entity",
    "field_label_en_seed": "Contracting entity",
    "he_seed": null
  },
  {
    "why_key": "label_agreement",
    "field_id": "label_agreement",
    "field_label_en_seed": "Label agreement",
    "he_seed": null
  },
  {
    "why_key": "publishing_agreement",
    "field_id": "publishing_agreement",
    "field_label_en_seed": "Publishing agreement",
    "he_seed": null
  },
  {
    "why_key": "management_agreement",
    "field_id": "management_agreement",
    "field_label_en_seed": "Management agreement",
    "he_seed": null
  },
  {
    "why_key": "representation_agreement",
    "field_id": "representation_agreement",
    "field_label_en_seed": "Representation agreement",
    "he_seed": null
  },
  {
    "why_key": "trademark_registration",
    "field_id": "trademark_registration",
    "field_label_en_seed": "Trademark registration",
    "he_seed": null
  },
  {
    "why_key": "image_usage_rights",
    "field_id": "image_usage_rights",
    "field_label_en_seed": "Image-usage rights",
    "he_seed": null
  },
  {
    "why_key": "music_usage_rights",
    "field_id": "music_usage_rights",
    "field_label_en_seed": "Music-usage rights",
    "he_seed": null
  },
  {
    "why_key": "sample_clearance",
    "field_id": "sample_clearance",
    "field_label_en_seed": "Sample clearance",
    "he_seed": null
  },
  {
    "why_key": "insurance_certificate",
    "field_id": "insurance_certificate",
    "field_label_en_seed": "Insurance certificate",
    "he_seed": null
  },
  {
    "why_key": "work_permit",
    "field_id": "work_permit",
    "field_label_en_seed": "Work permit",
    "he_seed": null
  },
  {
    "why_key": "visa_record",
    "field_id": "visa_record",
    "field_label_en_seed": "Visa record",
    "he_seed": null
  },
  {
    "why_key": "publication_consent_record",
    "field_id": "publication_consent_record",
    "field_label_en_seed": "Publication consent record",
    "he_seed": null
  },
  {
    "why_key": "performance_rights_organization",
    "field_id": "performance_rights_organization",
    "field_label_en_seed": "Performance-rights organization",
    "he_seed": null
  },
  {
    "why_key": "specialist_legal_review",
    "field_id": "specialist_legal_review",
    "field_label_en_seed": "Specialist legal review",
    "he_seed": null
  },
  {
    "why_key": "legal_document_expiry",
    "field_id": "legal_document_expiry",
    "field_label_en_seed": "Legal document expiry",
    "he_seed": null
  },
  {
    "why_key": "technical_rider_file",
    "field_id": "technical_rider_file",
    "field_label_en_seed": "Technical rider",
    "he_seed": null
  },
  {
    "why_key": "hospitality_rider_file",
    "field_id": "hospitality_rider_file",
    "field_label_en_seed": "Hospitality rider",
    "he_seed": null
  },
  {
    "why_key": "stage_plot_file",
    "field_id": "stage_plot_file",
    "field_label_en_seed": "Stage plot",
    "he_seed": null
  },
  {
    "why_key": "input_list_file",
    "field_id": "input_list_file",
    "field_label_en_seed": "Input list",
    "he_seed": null
  },
  {
    "why_key": "channel_list_file",
    "field_id": "channel_list_file",
    "field_label_en_seed": "Channel list",
    "he_seed": null
  },
  {
    "why_key": "patch_list_file",
    "field_id": "patch_list_file",
    "field_label_en_seed": "Patch list",
    "he_seed": null
  },
  {
    "why_key": "backline_list_file",
    "field_id": "backline_list_file",
    "field_label_en_seed": "Backline list",
    "he_seed": null
  },
  {
    "why_key": "equipment_list_file",
    "field_id": "equipment_list_file",
    "field_label_en_seed": "Equipment list",
    "he_seed": null
  },
  {
    "why_key": "lighting_plot_file",
    "field_id": "lighting_plot_file",
    "field_label_en_seed": "Lighting plot",
    "he_seed": null
  },
  {
    "why_key": "dj_equipment_requirements",
    "field_id": "dj_equipment_requirements",
    "field_label_en_seed": "DJ equipment requirements",
    "he_seed": null
  },
  {
    "why_key": "microphone_requirements",
    "field_id": "microphone_requirements",
    "field_label_en_seed": "Microphone requirements",
    "he_seed": null
  },
  {
    "why_key": "monitor_requirements",
    "field_id": "monitor_requirements",
    "field_label_en_seed": "Monitor requirements",
    "he_seed": null
  },
  {
    "why_key": "foh_requirements",
    "field_id": "foh_requirements",
    "field_label_en_seed": "FOH requirements",
    "he_seed": null
  },
  {
    "why_key": "video_requirements",
    "field_id": "video_requirements",
    "field_label_en_seed": "Video requirements",
    "he_seed": null
  },
  {
    "why_key": "led_requirements",
    "field_id": "led_requirements",
    "field_label_en_seed": "LED requirements",
    "he_seed": null
  },
  {
    "why_key": "power_requirements",
    "field_id": "power_requirements",
    "field_label_en_seed": "Power requirements",
    "he_seed": null
  },
  {
    "why_key": "stage_dimensions_required",
    "field_id": "stage_dimensions_required",
    "field_label_en_seed": "Stage dimensions required",
    "he_seed": null
  },
  {
    "why_key": "changeover_time",
    "field_id": "changeover_time",
    "field_label_en_seed": "Changeover time",
    "he_seed": null
  },
  {
    "why_key": "soundcheck_duration",
    "field_id": "soundcheck_duration",
    "field_label_en_seed": "Soundcheck duration",
    "he_seed": null
  },
  {
    "why_key": "load_in_time",
    "field_id": "load_in_time",
    "field_label_en_seed": "Load-in time",
    "he_seed": null
  },
  {
    "why_key": "load_out_time",
    "field_id": "load_out_time",
    "field_label_en_seed": "Load-out time",
    "he_seed": null
  },
  {
    "why_key": "crew_size",
    "field_id": "crew_size",
    "field_label_en_seed": "Crew size",
    "he_seed": null
  },
  {
    "why_key": "production_footprint",
    "field_id": "production_footprint",
    "field_label_en_seed": "Production footprint",
    "he_seed": null
  },
  {
    "why_key": "travel_requirements",
    "field_id": "travel_requirements",
    "field_label_en_seed": "Travel requirements",
    "he_seed": null
  },
  {
    "why_key": "accommodation_requirements",
    "field_id": "accommodation_requirements",
    "field_label_en_seed": "Accommodation requirements",
    "he_seed": null
  },
  {
    "why_key": "feasible_alternative_setup",
    "field_id": "feasible_alternative_setup",
    "field_label_en_seed": "Feasible alternative setup",
    "he_seed": null
  },
  {
    "why_key": "rider_version",
    "field_id": "rider_version",
    "field_label_en_seed": "Rider version",
    "he_seed": null
  },
  {
    "why_key": "technical_contact",
    "field_id": "technical_contact",
    "field_label_en_seed": "Technical contact",
    "he_seed": null
  },
  {
    "why_key": "production_contact",
    "field_id": "production_contact",
    "field_label_en_seed": "Production contact",
    "he_seed": null
  },
  {
    "why_key": "rider_review_date",
    "field_id": "rider_review_date",
    "field_label_en_seed": "Rider review date",
    "he_seed": null
  },
  {
    "why_key": "team_manager_office",
    "field_id": "team_manager_office",
    "field_label_en_seed": "Manager office",
    "he_seed": null
  },
  {
    "why_key": "booking_representative",
    "field_id": "booking_representative",
    "field_label_en_seed": "Booking representative",
    "he_seed": null
  },
  {
    "why_key": "artist_representative",
    "field_id": "artist_representative",
    "field_label_en_seed": "Artist representative",
    "he_seed": null
  },
  {
    "why_key": "tour_manager",
    "field_id": "tour_manager",
    "field_label_en_seed": "Tour manager",
    "he_seed": null
  },
  {
    "why_key": "production_manager",
    "field_id": "production_manager",
    "field_label_en_seed": "Production manager",
    "he_seed": null
  },
  {
    "why_key": "technical_manager",
    "field_id": "technical_manager",
    "field_label_en_seed": "Technical manager",
    "he_seed": null
  },
  {
    "why_key": "publicist",
    "field_id": "publicist",
    "field_label_en_seed": "Publicist",
    "he_seed": null
  },
  {
    "why_key": "record_label",
    "field_id": "record_label",
    "field_label_en_seed": "Record label",
    "he_seed": null
  },
  {
    "why_key": "music_publisher",
    "field_id": "music_publisher",
    "field_label_en_seed": "Music publisher",
    "he_seed": null
  },
  {
    "why_key": "legal_adviser",
    "field_id": "legal_adviser",
    "field_label_en_seed": "Legal adviser",
    "he_seed": null
  },
  {
    "why_key": "accountant",
    "field_id": "accountant",
    "field_label_en_seed": "Accountant",
    "he_seed": null
  },
  {
    "why_key": "authority_scope",
    "field_id": "authority_scope",
    "field_label_en_seed": "Authority scope",
    "he_seed": null
  },
  {
    "why_key": "authority_territory",
    "field_id": "authority_territory",
    "field_label_en_seed": "Authority territory",
    "he_seed": null
  },
  {
    "why_key": "authority_effective_date",
    "field_id": "authority_effective_date",
    "field_label_en_seed": "Authority effective date",
    "he_seed": null
  },
  {
    "why_key": "authority_expiry_date",
    "field_id": "authority_expiry_date",
    "field_label_en_seed": "Authority expiry date",
    "he_seed": null
  },
  {
    "why_key": "negotiation_authority",
    "field_id": "negotiation_authority",
    "field_label_en_seed": "Negotiation authority",
    "he_seed": null
  },
  {
    "why_key": "signing_authority",
    "field_id": "signing_authority",
    "field_label_en_seed": "Signing authority",
    "he_seed": null
  },
  {
    "why_key": "invoice_authority",
    "field_id": "invoice_authority",
    "field_label_en_seed": "Invoice authority",
    "he_seed": null
  },
  {
    "why_key": "payment_receipt_authority",
    "field_id": "payment_receipt_authority",
    "field_label_en_seed": "Payment-receipt authority",
    "he_seed": null
  },
  {
    "why_key": "calendar_owner",
    "field_id": "calendar_owner",
    "field_label_en_seed": "Calendar owner",
    "he_seed": null
  },
  {
    "why_key": "availability_owner",
    "field_id": "availability_owner",
    "field_label_en_seed": "Availability owner",
    "he_seed": null
  },
  {
    "why_key": "primary_contact",
    "field_id": "primary_contact",
    "field_label_en_seed": "Primary contact",
    "he_seed": null
  },
  {
    "why_key": "response_process",
    "field_id": "response_process",
    "field_label_en_seed": "Response process",
    "he_seed": null
  },
  {
    "why_key": "response_time_band",
    "field_id": "response_time_band",
    "field_label_en_seed": "Response-time band",
    "he_seed": null
  },
  {
    "why_key": "handoff_process",
    "field_id": "handoff_process",
    "field_label_en_seed": "Handoff process",
    "he_seed": null
  },
  {
    "why_key": "emergency_contact",
    "field_id": "emergency_contact",
    "field_label_en_seed": "Emergency contact",
    "he_seed": null
  },
  {
    "why_key": "access_status",
    "field_id": "access_status",
    "field_label_en_seed": "Access status",
    "he_seed": null
  },
  {
    "why_key": "access_revocation_process",
    "field_id": "access_revocation_process",
    "field_label_en_seed": "Access-revocation process",
    "he_seed": null
  },
  {
    "why_key": "team_member_profile",
    "field_id": "team_member_profile",
    "field_label_en_seed": "Team-member profile",
    "he_seed": null
  },
  {
    "why_key": "primary_contact_channel",
    "field_id": "primary_contact_channel",
    "field_label_en_seed": "Primary contact channel",
    "he_seed": null
  },
  {
    "why_key": "team_availability_process",
    "field_id": "team_availability_process",
    "field_label_en_seed": "Availability process",
    "he_seed": null
  },
  {
    "why_key": "team_operations_channel",
    "field_id": "team_operations_channel",
    "field_label_en_seed": "Team operations channel",
    "he_seed": null
  },
  {
    "why_key": "team_operations_workspace",
    "field_id": "team_operations_workspace",
    "field_label_en_seed": "Team operations workspace",
    "he_seed": null
  },
  {
    "why_key": "booking_fee_band",
    "field_id": "booking_fee_band",
    "field_label_en_seed": "Booking fee band",
    "he_seed": null
  },
  {
    "why_key": "guarantee_band",
    "field_id": "guarantee_band",
    "field_label_en_seed": "Guarantee band",
    "he_seed": null
  },
  {
    "why_key": "performance_revenue_band",
    "field_id": "performance_revenue_band",
    "field_label_en_seed": "Performance revenue band",
    "he_seed": null
  },
  {
    "why_key": "private_event_revenue_band",
    "field_id": "private_event_revenue_band",
    "field_label_en_seed": "Private-event revenue band",
    "he_seed": null
  },
  {
    "why_key": "corporate_event_revenue_band",
    "field_id": "corporate_event_revenue_band",
    "field_label_en_seed": "Corporate-event revenue band",
    "he_seed": null
  },
  {
    "why_key": "teaching_revenue_band",
    "field_id": "teaching_revenue_band",
    "field_label_en_seed": "Teaching revenue band",
    "he_seed": null
  },
  {
    "why_key": "production_revenue_band",
    "field_id": "production_revenue_band",
    "field_label_en_seed": "Production revenue band",
    "he_seed": null
  },
  {
    "why_key": "average_event_expense_band",
    "field_id": "average_event_expense_band",
    "field_label_en_seed": "Average event-expense band",
    "he_seed": null
  },
  {
    "why_key": "travel_expense_band",
    "field_id": "travel_expense_band",
    "field_label_en_seed": "Travel-expense band",
    "he_seed": null
  },
  {
    "why_key": "crew_cost_band",
    "field_id": "crew_cost_band",
    "field_label_en_seed": "Crew-cost band",
    "he_seed": null
  },
  {
    "why_key": "commission_band",
    "field_id": "commission_band",
    "field_label_en_seed": "Commission band",
    "he_seed": null
  },
  {
    "why_key": "settlement_terms",
    "field_id": "settlement_terms",
    "field_label_en_seed": "Settlement terms",
    "he_seed": null
  },
  {
    "why_key": "deposit_terms",
    "field_id": "deposit_terms",
    "field_label_en_seed": "Deposit terms",
    "he_seed": null
  },
  {
    "why_key": "payment_timing",
    "field_id": "payment_timing",
    "field_label_en_seed": "Payment timing",
    "he_seed": null
  },
  {
    "why_key": "revenue_territory",
    "field_id": "revenue_territory",
    "field_label_en_seed": "Revenue territory",
    "he_seed": null
  },
  {
    "why_key": "revenue_period",
    "field_id": "revenue_period",
    "field_label_en_seed": "Revenue period",
    "he_seed": null
  },
  {
    "why_key": "streaming_revenue_band",
    "field_id": "streaming_revenue_band",
    "field_label_en_seed": "Streaming revenue band",
    "he_seed": null
  },
  {
    "why_key": "video_revenue_band",
    "field_id": "video_revenue_band",
    "field_label_en_seed": "Video revenue band",
    "he_seed": null
  },
  {
    "why_key": "direct_music_sales_band",
    "field_id": "direct_music_sales_band",
    "field_label_en_seed": "Direct music-sales band",
    "he_seed": null
  },
  {
    "why_key": "patron_revenue_band",
    "field_id": "patron_revenue_band",
    "field_label_en_seed": "Patron revenue band",
    "he_seed": null
  },
  {
    "why_key": "merchandise_revenue_band",
    "field_id": "merchandise_revenue_band",
    "field_label_en_seed": "Merchandise revenue band",
    "he_seed": null
  },
  {
    "why_key": "royalty_revenue_band",
    "field_id": "royalty_revenue_band",
    "field_label_en_seed": "Royalty revenue band",
    "he_seed": null
  },
  {
    "why_key": "publishing_revenue_band",
    "field_id": "publishing_revenue_band",
    "field_label_en_seed": "Publishing revenue band",
    "he_seed": null
  },
  {
    "why_key": "neighboring_rights_revenue_band",
    "field_id": "neighboring_rights_revenue_band",
    "field_label_en_seed": "Neighbouring-rights revenue band",
    "he_seed": null
  },
  {
    "why_key": "sync_revenue_band",
    "field_id": "sync_revenue_band",
    "field_label_en_seed": "Sync revenue band",
    "he_seed": null
  },
  {
    "why_key": "brand_partnership_revenue_band",
    "field_id": "brand_partnership_revenue_band",
    "field_label_en_seed": "Brand-partnership revenue band",
    "he_seed": null
  },
  {
    "why_key": "supporting_financial_statement",
    "field_id": "supporting_financial_statement",
    "field_label_en_seed": "Supporting financial statement",
    "he_seed": null
  },
  {
    "why_key": "royalty_source_affiliation",
    "field_id": "royalty_source_affiliation",
    "field_label_en_seed": "Royalty-source affiliation",
    "he_seed": null
  },
  {
    "why_key": "release_timeline",
    "field_id": "release_timeline",
    "field_label_en_seed": "Release timeline",
    "he_seed": null
  },
  {
    "why_key": "gig_timeline",
    "field_id": "gig_timeline",
    "field_label_en_seed": "Gig timeline",
    "he_seed": null
  },
  {
    "why_key": "ticketing_timeline",
    "field_id": "ticketing_timeline",
    "field_label_en_seed": "Ticketing timeline",
    "he_seed": null
  },
  {
    "why_key": "territory_timeline",
    "field_id": "territory_timeline",
    "field_label_en_seed": "Territory timeline",
    "he_seed": null
  },
  {
    "why_key": "venue_timeline",
    "field_id": "venue_timeline",
    "field_label_en_seed": "Venue timeline",
    "he_seed": null
  },
  {
    "why_key": "festival_timeline",
    "field_id": "festival_timeline",
    "field_label_en_seed": "Festival timeline",
    "he_seed": null
  },
  {
    "why_key": "audience_band_history",
    "field_id": "audience_band_history",
    "field_label_en_seed": "Audience-band history",
    "he_seed": null
  },
  {
    "why_key": "community_band_history",
    "field_id": "community_band_history",
    "field_label_en_seed": "Community-band history",
    "he_seed": null
  },
  {
    "why_key": "booking_frequency_history",
    "field_id": "booking_frequency_history",
    "field_label_en_seed": "Booking-frequency history",
    "he_seed": null
  },
  {
    "why_key": "repeat_booking_history",
    "field_id": "repeat_booking_history",
    "field_label_en_seed": "Repeat-booking history",
    "he_seed": null
  },
  {
    "why_key": "fee_band_history",
    "field_id": "fee_band_history",
    "field_label_en_seed": "Fee-band history",
    "he_seed": null
  },
  {
    "why_key": "representation_changes",
    "field_id": "representation_changes",
    "field_label_en_seed": "Representation changes",
    "he_seed": null
  },
  {
    "why_key": "team_changes",
    "field_id": "team_changes",
    "field_label_en_seed": "Team changes",
    "he_seed": null
  },
  {
    "why_key": "label_changes",
    "field_id": "label_changes",
    "field_label_en_seed": "Label changes",
    "he_seed": null
  },
  {
    "why_key": "publisher_changes",
    "field_id": "publisher_changes",
    "field_label_en_seed": "Publisher changes",
    "he_seed": null
  },
  {
    "why_key": "collaboration_timeline",
    "field_id": "collaboration_timeline",
    "field_label_en_seed": "Collaboration timeline",
    "he_seed": null
  },
  {
    "why_key": "press_timeline",
    "field_id": "press_timeline",
    "field_label_en_seed": "Press timeline",
    "he_seed": null
  },
  {
    "why_key": "career_milestone_record",
    "field_id": "career_milestone_record",
    "field_label_en_seed": "Career milestone record",
    "he_seed": null
  },
  {
    "why_key": "evidence_freshness_state",
    "field_id": "evidence_freshness_state",
    "field_label_en_seed": "Evidence freshness state",
    "he_seed": null
  },
  {
    "why_key": "source_contradiction_state",
    "field_id": "source_contradiction_state",
    "field_label_en_seed": "Source contradiction state",
    "he_seed": null
  },
  {
    "why_key": "observed_change",
    "field_id": "observed_change",
    "field_label_en_seed": "Observed change",
    "he_seed": null
  },
  {
    "why_key": "recheck_trigger",
    "field_id": "recheck_trigger",
    "field_label_en_seed": "Recheck trigger",
    "he_seed": null
  }
]
