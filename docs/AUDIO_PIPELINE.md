# Audio Processing Pipeline & Playback

This document details the audio ingestion, transcoding, compression, storage, and mobile streaming lifecycle.

## Audio Processing Lifecycle

```
[Source Audio] ──> Admin Dashboard Upload ──> Object Storage (S3/GCS Temp)
                                                      │
NestJS API Gateway <── Trigger Transcode Job <────────┘
        │
[pg-boss queue] ──> NestJS Worker App ──> Spawn FFmpeg Process
                                                  │
Object Storage (Mobile Optimized M4A/AAC) <──────┘
```

1. **Upload:** Admin uploads high-fidelity source audio (e.g. WAV or high-bitrate MP3) via the Next.js Admin Panel.
2. **Dispatch:** The API stores the source file reference in the database as a `MediaAsset` and schedules a `transcode_audio` job in `pg-boss`.
3. **Transcode (FFmpeg):** The background worker fetches the job, downloads the source audio, and invokes FFmpeg to transcode it:
   - **Codec:** AAC (Advanced Audio Coding) in M4A container.
   - **Bitrate:** Constant 64 kbps (Mono) or 96 kbps (Stereo) for mobile streaming (balancing quality and low data usage).
   - **Sample Rate:** 44.1 kHz.
4. **Storage:** Saves the generated variant in the public storage bucket and marks the `MediaAsset` status as `PROCESSED`.

## Mobile Background Playback

The Flutter mobile application plays audio using the **`just_audio`** and **`audio_service`** packages:

- **Lock Screen Integration:** Displays media controls (Play/Pause, Seek, Skip, Title, Artwork) on the lock screen.
- **Audio Focus Management:** Responds dynamically to system events (e.g., pausing when a phone call is received, ducking volume during GPS navigation announcements).
- **Caching:** Audio streams are cached locally in temporary directories on the mobile device, preventing duplicate network data consumption during repeated listens.
