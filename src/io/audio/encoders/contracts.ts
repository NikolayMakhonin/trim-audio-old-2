import {AudioSamples} from '../contracts'

export type AudioEncode<TOptions> = (
  samples: AudioSamples,
  options: TOptions,
) => Promise<Uint8Array>
