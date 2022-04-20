import {AudioSamples} from '../contracts'
import {createMp3Encoder} from 'wasm-media-encoders'

export type Mp3CbrValues = 8 | 16 | 24 | 32 | 40 | 48 | 64 | 80 | 96 | 112 | 128 | 160 | 192 | 224 | 256 | 320;

export async function encodeMpeg3(samples: AudioSamples, options?: {
  /* kb per sec */
  bitrate: Mp3CbrValues,
}): Promise<Uint8Array> {
  const encoder = await createMp3Encoder()
  encoder.configure({
    bitrate   : options?.bitrate || 128,
    channels  : samples.channelsData.length > 1 ? 2 : 1,
    sampleRate: samples.sampleRate,
  })
  const result = encoder.encode(samples.channelsData)
  return result
}
