import CodecParser from 'codec-parser'
import { MPEGDecoderWebWorker } from 'mpg123-decoder'
import {Readable} from 'stream'
import {streamForEach} from '../../helpers/stream'
import {AudioSamples} from '../contracts'

const parser = new CodecParser('audio/mpeg', {})

export async function decodeMpeg123Stream(stream: Readable): Promise<AudioSamples> {
  const wasmDecoder = new MPEGDecoderWebWorker()
  try {
    const allFrames: Uint8Array[] = []
    await streamForEach(stream, chunk => {
      for (const chunkParsed of parser.parseChunk(new Uint8Array(chunk))) {
        if (chunkParsed.codecFrames) {
          for (let i = 0, len = chunkParsed.codecFrames.length; i < len; i++) {
            const frame = chunkParsed.codecFrames[i]
            allFrames.push(frame.data)
          }
        } else {
          allFrames.push(chunkParsed.data)
        }
      }
    })

    const result = await wasmDecoder.decodeFrames(allFrames)

    return {
      channelsData: result.channelData,
      sampleRate  : result.sampleRate,
    }
  } finally {
    await wasmDecoder.free()
  }
}
