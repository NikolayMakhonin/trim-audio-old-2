import {getFFmpeg} from '../common/ffmpeg'
import {AudioSamples} from '../contracts'

export async function decodeMpeg123(mp3Data: Uint8Array): Promise<AudioSamples> {
  const channels = 2
  const sampleRate = 16000

  const ffmpeg = await getFFmpeg()

  // docs: https://github.com/ffmpegwasm/ffmpeg.wasm/blob/master/docs/api.md
  ffmpeg.FS(
    'writeFile',
    'input.mp3',
    mp3Data,
  )

  await ffmpeg.run(
    '-i', 'input.mp3',
    '-f', 'f32le',
    '-ac', channels + '',
    '-ar', sampleRate + '',
    '-acodec', 'pcm_f32le',
    // '-codec:a', 'libmp3lame',
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
