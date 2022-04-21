import {createFFmpeg, FFmpeg} from '@ffmpeg/ffmpeg'

let ffmpegLoadPromise: Promise<FFmpeg>
export function getFFmpeg() {
  if (!ffmpegLoadPromise) {
    const ffmpeg = createFFmpeg({ log: false })
    ffmpegLoadPromise = ffmpeg.load().then(() => ffmpeg)
  }

  return ffmpegLoadPromise
}
