import {getFFmpeg} from '../ffmpeg/ffmpeg'
import {AudioSamples} from '../contracts'

export async function decodeMpeg123({
  data,
  channels,
  sampleRate,
}: {
  data: Uint8Array,
  channels: number,
  sampleRate: number,
}): Promise<AudioSamples> {
  const ffmpeg = await getFFmpeg()

  // docs: https://github.com/ffmpegwasm/ffmpeg.wasm/blob/master/docs/api.md
  ffmpeg.FS(
    'writeFile',
    'input.mp3',
    data,
  )

  await ffmpeg.run(
    '-i', 'input.mp3',
    '-f', 'f32le',
    '-ac', channels + '',
    '-ar', sampleRate + '',
    '-acodec', 'pcm_f32le',
    'output.pcm',
  )

  const pcmData = ffmpeg.FS(
    'readFile',
    'output.pcm',
  )

  ffmpeg.FS('unlink', 'input.mp3')
  ffmpeg.FS('unlink', 'output.pcm')

  return {
    data: new Float32Array(pcmData.buffer, pcmData.byteOffset, pcmData.byteLength / 4),
    channels,
    sampleRate,
  }
}
