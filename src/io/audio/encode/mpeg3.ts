import {AudioSamples} from '../contracts'
import {createMp3Encoder} from 'wasm-media-encoders'
import {Lame} from '@flemist/lame-wasm'
import {Readable} from 'stream'
import lamejs from 'lamejs'
import {fetchFile, createFFmpeg, FFmpeg} from '@ffmpeg/ffmpeg'

export type Mp3CbrValues = 8 | 16 | 24 | 32 | 40 | 48 | 64 | 80 | 96 | 112 | 128 | 160 | 192 | 224 | 256 | 320
export type Mp3VbrValues = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

// export async function encodeMpeg3(samples: AudioSamples, options?: {
//   /* kb per sec */
//   bitrate?: Mp3CbrValues,
//   vbrQuality?: Mp3VbrValues,
// }): Promise<Uint8Array> {
//   const encoder = await createMp3Encoder()
//   encoder.configure(options?.bitrate
//     ? {
//       bitrate   : options?.bitrate,
//       channels  : samples.channelsData.length > 1 ? 2 : 1,
//       sampleRate: samples.sampleRate,
//     }
//     : {
//       vbrQuality: options?.vbrQuality,
//       channels  : samples.channelsData.length > 1 ? 2 : 1,
//       sampleRate: samples.sampleRate,
//     })
//   const result = encoder.encode(samples.channelsData)
//   return result
// }

// export async function encodeMpeg3(samples: AudioSamples, options?: {
//   /* kb per sec */
//   bitrate?: Mp3CbrValues,
//   vbrQuality?: Mp3VbrValues,
// }): Promise<Uint8Array> {
//   const lame = await Lame.load({
//     vbrQuality: 3,
//     // debug: true,
//   })
//
//   const buffer = Buffer.concat(Array.from(lame.encode(samples.channelsData[0], samples.channelsData[1])))
//
//   // const encoder = await createMp3Encoder()
//   // encoder.configure(options?.bitrate
//   //   ? {
//   //     bitrate   : options?.bitrate,
//   //     channels  : samples.channelsData.length > 1 ? 2 : 1,
//   //     sampleRate: samples.sampleRate,
//   //   }
//   //   : {
//   //     vbrQuality: options?.vbrQuality,
//   //     channels  : samples.channelsData.length > 1 ? 2 : 1,
//   //     sampleRate: samples.sampleRate,
//   //   })
//   // const result = encoder.encode(samples.channelsData)
//   return new Uint8Array(buffer)
// }

// export async function encodeMpeg3(samples: AudioSamples, options?: {
//   /* kb per sec */
//   bitrate?: Mp3CbrValues,
//   vbrQuality?: Mp3VbrValues,
// }): Promise<Uint8Array> {
//   const mp3Encoder = new lamejs.Mp3Encoder(2, 16000, options.bitrate)
//   const data = samples.channelsData.map(channel => {
//     const result = new Int16Array(channel.length)
//     channel.forEach((o, i) => {
//       result[i] = o * 32767
//     })
//     return result
//   })
//   const mp3Buffer1 = Buffer.from(mp3Encoder.encodeBuffer(data[0], data[1]))
//   const mp3Buffer2 = Buffer.from(mp3Encoder.flush())
//   const mp3Buffer = Buffer.concat([mp3Buffer1, mp3Buffer2])
//   return new Uint8Array(mp3Buffer)
// }

let ffmpegLoadPromise: Promise<FFmpeg>
export function getFFmpeg() {
  if (!ffmpegLoadPromise) {
    const ffmpeg = createFFmpeg({ log: false })
    ffmpegLoadPromise = ffmpeg.load().then(() => ffmpeg)
  }

  return ffmpegLoadPromise
}

// ffmpeg.load().catch(err => console.error(err))

export async function encodeMpeg3(samples: AudioSamples, options?: {
  /* kb per sec */
  bitrate?: Mp3CbrValues,
  vbrQuality?: Mp3VbrValues,
}): Promise<Uint8Array> {
  const ffmpeg = await getFFmpeg()

  let samplesCombined: Float32Array
  if (samples.channelsData.length === 1) {
    samplesCombined = samples.channelsData[0]
  } else {
    const channelsCount = samples.channelsData.length
    const samplesCount = samples.channelsData[0].length
    samplesCombined = new Float32Array(samplesCount * channelsCount)
    for (let i = 0; i < samplesCount; i++) {
      for (let j = 0; j < channelsCount; j++) {
        samplesCombined[i * channelsCount + j] = samples.channelsData[j][i]
      }
    }
  }

  const pcmData = new Uint8Array(
    samplesCombined.buffer,
    samplesCombined.byteOffset,
    samplesCombined.byteLength,
  )

  // docs: https://github.com/ffmpegwasm/ffmpeg.wasm/blob/master/docs/api.md
  ffmpeg.FS(
    'writeFile',
    'input.pcm',
    pcmData,
  )

  await ffmpeg.run(
    '-f', 'f32le',
    '-ar', samples.sampleRate + '',
    '-ac', samples.channelsData.length + '',
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
