import {createFFmpeg, FFmpeg} from '@ffmpeg/ffmpeg'
import {AudioSamples} from '../contracts'

let ffmpegLoadPromise: Promise<FFmpeg>
export function getFFmpeg() {
  if (!ffmpegLoadPromise) {
    const ffmpeg = createFFmpeg({ log: false })
    ffmpegLoadPromise = ffmpeg.load().then(() => ffmpeg)
  }

  return ffmpegLoadPromise
}

export async function ffmpegConvert(inputData: Uint8Array, {
  inputFormat,
  outputFormat,
  channels,
  sampleRate,
  params,
}: {
  /** same as file extension */
  inputFormat?: string,
  /** same as file extension */
  outputFormat?: string,
  channels: number,
  sampleRate: number,
  params?: string[],
}): Promise<Uint8Array> {
  const ffmpeg = await getFFmpeg()

  const inputFile = 'input' + (inputFormat ? '.' + inputFormat : '')
  const outputFile = 'output' + (outputFormat ? '.' + outputFormat : '')
  
  // docs: https://github.com/ffmpegwasm/ffmpeg.wasm/blob/master/docs/api.md
  ffmpeg.FS(
    'writeFile',
    inputFile,
    inputData,
  )

  await ffmpeg.run(
    '-i', 'input',
    '-f', 'f32le',
    '-ac', channels + '',
    '-ar', sampleRate + '',
    ...params || [],
    outputFile,
  )

  const outputData = ffmpeg.FS(
    'readFile',
    outputFile,
  )

  ffmpeg.FS('unlink', inputFile)
  ffmpeg.FS('unlink', outputFile)

  return outputData
}

export async function ffmpegDecode(inputData: Uint8Array, {
  /** same as file extension */
  inputFormat,
  channels,
  sampleRate,
}: {
  inputFormat?: string,
  channels: number,
  sampleRate: number,
}): Promise<AudioSamples> {
  const outputData = await ffmpegConvert(inputData, {
    inputFormat,
    outputFormat: 'pcm',
    channels,
    sampleRate,
    params      : ['-acodec', 'pcm_f32le'],
  })
  
  return {
    data: new Float32Array(outputData.buffer, outputData.byteOffset, outputData.byteLength / 4),
    channels,
    sampleRate,
  }
}

export async function ffmpegEncode(samples: AudioSamples, {
  outputFormat,
  params,
}: {
  /** same as file extension */
  outputFormat: string,
  params?: string[],
}): Promise<Uint8Array> {
  const pcmData = new Uint8Array(
    samples.data.buffer,
    samples.data.byteOffset,
    samples.data.byteLength,
  )
  
  const outputData = await ffmpegConvert(pcmData, {
    inputFormat: 'pcm',
    outputFormat,
    channels   : samples.channels,
    sampleRate : samples.sampleRate,
    params,
  })

  return outputData
}

