import {AudioSamples} from '../contracts'

export type Mp3Bitrate = 8 | 16 | 24 | 32 | 40 | 48 | 64 | 80 | 96 | 112 | 128 | 160 | 192 | 224 | 256 | 320
export type Mp3VbrQuality = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export function ffmpegMp3Params(samples: AudioSamples, options: {
  bitrate: Mp3Bitrate,
  vbrQuality: Mp3VbrQuality,
  params?: string[],
}): string[] {
  return [
    options.bitrate ? '-b:a' : '-q:a', options.bitrate ? options.bitrate + 'k' : options.vbrQuality + '',
    ...options.params || [],
  ]
}
