import {AudioSamples} from '../contracts'
import {getFFmpeg} from '../common/ffmpeg'

export type Mp3CbrValues = 8 | 16 | 24 | 32 | 40 | 48 | 64 | 80 | 96 | 112 | 128 | 160 | 192 | 224 | 256 | 320
export type Mp3VbrValues = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export async function encodeMpeg3(samples: AudioSamples, options?: {
  /** kb per sec */
  bitrate?: Mp3CbrValues,
  vbrQuality?: Mp3VbrValues,
}): Promise<Uint8Array> {
  const ffmpeg = await getFFmpeg()

  const pcmData = new Uint8Array(
    samples.data.buffer,
    samples.data.byteOffset,
    samples.data.byteLength,
  )

  // docs: https://github.com/ffmpegwasm/ffmpeg.wasm/blob/master/docs/api.md
  ffmpeg.FS(
    'writeFile',
    'input.pcm',
    pcmData,
  )

  await ffmpeg.run(
    '-f', 'f32le',
    '-ac', samples.channels + '',
    '-ar', samples.sampleRate + '',
    '-i', 'input.pcm',
    // '-codec:a', 'libmp3lame',
    options.bitrate ? '-b:a' : '-q:a', options.bitrate ? options.bitrate + 'k' : options.vbrQuality + '',
    'output.mp3',
  )

  const mp3Data = ffmpeg.FS(
    'readFile',
    'output.mp3',
  )

  ffmpeg.FS('unlink', 'input.pcm')
  ffmpeg.FS('unlink', 'output.mp3')

  return mp3Data
}
