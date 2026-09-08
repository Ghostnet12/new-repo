# Moonlit background music

Six distinct user-supplied recordings are served as AAC/M4A. Duplicate MP3/M4A exports are represented once. Source recording IDs, in asset order:

1. 538d24ca-4a74-41d8-bb26-169670314748
2. 68da870b-b94f-4bcd-b7a6-786ecc88b0fd
3. 657cf7dc-108c-4420-9f60-95ba345b5960
4. a6f4ca71-62b8-4e3e-8fcf-6eb31a4c671d
5. 221439a9-e497-410b-8eaf-ead1575e7b7d
6. ae58cf9d-746f-489b-be0f-1d6a1b7c8432

Original uploads are preserved. Web derivatives use FFmpeg `loudnorm=I=-27:TP=-9:LRA=11,volume=-3dB,afade=t=in:d=1.5`, AAC 80 kb/s stereo at 44.1 kHz, and fast-start metadata. The resulting quiet master targets approximately -30 LUFS before the player's additional attenuation. Device volume still affects actual listening loudness.

The player attempts audible autoplay, handles rejection, and retries on a visitor click or Enter/Space interaction. Browser autoplay restrictions remain in force: https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay

The music switch remembers an off preference. Only the current song is requested; no audio is requested when the saved preference is off. The six-song shuffle bag repeats continuously, avoiding an immediate repeat at cycle boundaries. In-app navigation preserves playback. Failed tracks are skipped; failure of the whole playlist offers a manual retry.

Validation: `node --test client/test/ambientPlayer.test.js` covers shuffle cycles, remembered off, autoplay rejection/retry, pending-play cancellation, bounded media failures, and cleanup. Production client build also required. No claim of browser playback testing is made by these controller tests.
