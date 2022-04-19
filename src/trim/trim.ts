import {globby} from 'globby'
import fse from 'fs-extra'
import path from 'path'
import prism from 'prism-media'
import lamejs from 'lamejs'
import * as musicMetadata from 'music-metadata'
import {ReadStream} from 'fs'
import BufferListStream from 'bl'
import BufferList from 'bl/BufferList'
import MultiStream from 'multistream'
import {Duplex, Transform} from 'stream'
import CodecParser from 'codec-parser'
import { OpusDecoderWebWorker } from 'opus-decoder'
import { MPEGDecoderWebWorker } from 'mpg123-decoder'
// import ogv from 'ogv/dist/ogv-decoder-audio-vorbis-wasm'
import { createMp3Encoder, createOggEncoder } from 'wasm-media-encoders'

const SILENCE_LEVEL_START_DEFAULT = -1.1 // use -1.5 for 'ф..'
const SILENCE_LEVEL_END_DEFAULT = -2

export function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const bufs = []
    stream
      .on('error', err => {
        reject(err)
      })
      .on('end', () => {
        const buf = Buffer.concat(bufs)
        resolve(buf)
      })
      .on('data', o => bufs.push(o))
  })
}

export async function readOgg(stream: ReadStream): Promise<Int16Array> {
  const replayBuffers = new BufferList()
  //
  // const transform = new Transform({
  //   writableObjectMode: true,
  //   transform(chunk, encoding, callback) {
  //     replayBuffers.append(chunk)
  //     callback(null, chunk)
  //   },
  // })

  // const metadata = await musicMetadata.parseStream(stream.pipe(transform), {
  //   path: 'music.ogg',
  // }, {
  //   duration: false,
  //   includeChapters: false,
  //   skipCovers: true,
  //   skipPostHeaders: true,
  // })

  // stream.pipe(transform)
  //
  // await new Promise((resolve) => {
  //   transform.once('data', (chunk) => {
  //     // console.log('data', chunk)
  //     resolve(null)
  //   })
  //   transform.read(1)
  // })
  //
  // stream.unpipe(transform)
  // transform.end()
  //
  // const replayStream = new BufferListStream(replayBuffers)
  //
  // stream.resume()

  // const _ogv = ogv
  // console.log(_ogv)

  // const parser = new CodecParser('audio/ogg', {})
  // const wasmDecoder = new OpusDecoderWebWorker()

  const parser = new CodecParser('audio/mpeg', {})
  const wasmDecoder = new MPEGDecoderWebWorker()

  const allFrames = []

  const decode = new Transform({
    writableObjectMode: true,
    transform(chunk, encoding, callback) {
      try {
        for (const chunkParsed of parser.parseChunk(new Uint8Array(chunk))) {
          if (chunkParsed.codecFrames) {
            for (let i = 0, len = chunkParsed.codecFrames.length; i < len; i++) {
              const frame = chunkParsed.codecFrames[i]
              allFrames.push(frame.data)
              this.push(frame.data)
            }
          } else {
            allFrames.push(chunkParsed.data)
            this.push(chunkParsed.data)
          }
        }
        callback()
      } catch (err) {
        callback(err)
      }
    },
  })

  const convert = new Transform({
    writableObjectMode: true,
    async transform(chunk, encoding, callback) {
      try {
        const { channelData, samplesDecoded, sampleRate } =
          await wasmDecoder.decodeFrames(chunk)
        callback(null, chunk)
      } catch (err) {
        callback(err)
      }
    },
  })

  // const { channelData, samplesDecoded, sampleRate } =
  //   await this._wasmDecoder.decodeFrames(frames.map((f) => f.data));

  const buf = await streamToBuffer(stream.pipe(decode))

  const { channelData, samplesDecoded, sampleRate } =
    await wasmDecoder.decodeFrames(allFrames)

  const encoder = await createMp3Encoder()
  encoder.configure({
    bitrate : 128,
    channels: channelData.length > 1 ? 2 : 1,
    sampleRate,
  })
  const result = encoder.encode(channelData)

  await fse.writeFile('./tmp/test/test.mp3', result)

  // const buf = await streamToBuffer(new MultiStream([replayStream, stream]))

  // const result = parser.parseAll(buf)
  // const result = [...parser.parseChunk(stream)]

  const resultStream =
    // new MultiStream([replayStream, stream], {
    //   objectMode: true,
    // })
  stream
    .pipe(new prism.opus.WebmDemuxer())
    .pipe(new prism.opus.Decoder(
      {
        rate     : 44100,
        channels : 1,
        frameSize: 960,
        // rate     : 16000,
        // channels : 1,
        // frameSize: 960,
      } as any,
    ))

  const buffer = await streamToBuffer(resultStream)

  return new Int16Array(buffer.buffer)
}

export function readOggFile(filePath): Promise<Int16Array> {
  return readOgg(fse.createReadStream(filePath))
}

export function saveToMp3File(filePath, samples: Int16Array) {
  const mp3Encoder = new lamejs.Mp3Encoder(1, 16000, 128)
  const mp3Buffer1 = Buffer.from(mp3Encoder.encodeBuffer(samples))
  const mp3Buffer2 = Buffer.from(mp3Encoder.flush())
  const mp3Buffer = Buffer.concat([mp3Buffer1, mp3Buffer2])

  return fse.writeFile(filePath, mp3Buffer)
}

export function normalize(samples: Int16Array, coef: number) {
  const len = samples.length
  let max = 0
  let min = 1 << 15
  let sum = 0
  for (let i = 0; i < len; i++) {
    const value = samples[i]
    if (value > max) {
      max = value
    }
    if (value < min) {
      min = value
    }
    sum += value
  }

  const avg = sum / len
  const offset = -avg
  const mult = coef * (1 << 15) / Math.max(max + offset, -(min + offset))
  for (let i = 0; i < len; i++) {
    samples[i] = (samples[i] + offset) * mult
  }
}

export function trimSamples({
  samples,
  silenceLevelStart,
  silenceLevelEnd,
  minSilenceSamples,
}: {
  samples: Int16Array,
  silenceLevelStart: number,
  silenceLevelEnd: number,
  minSilenceSamples: number,
}) {
  let len = samples.length
  const minDispersionStart = calcMinDispersion(silenceLevelStart)
  const minDispersionEnd = calcMinDispersion(silenceLevelEnd)

  function calcMinDispersion(silenceLevel: number) {
    const silenceLevelInt16 = (10 ** silenceLevel) * (1 << 15)
    return silenceLevelInt16 * silenceLevelInt16
  }

  function searchContent(backward: boolean) {
    let sum = 0
    let sumSqr = 0

    for (let i = 0; i < len; i++) {
      const value = samples[
        backward
          ? len - i - 1
          : i
        ]

      sum += value
      sumSqr += value * value
      if (i >= minSilenceSamples) {
        const prevValue = samples[
          backward
            ? len - (i - minSilenceSamples) - 1
            : i - minSilenceSamples
          ]
        sum -= prevValue
        sumSqr -= prevValue * prevValue

        const avg = sum / minSilenceSamples
        const sqrAvg = sumSqr / minSilenceSamples
        const dispersion = sqrAvg - avg * avg

        if (dispersion > (backward ? minDispersionEnd : minDispersionStart)) {
          return backward
            ? len - (i - minSilenceSamples) - 1
            : i - minSilenceSamples
        }
      }
    }

    return null
  }

  const from = searchContent(false)
  if (from == null) {
    throw new Error('Audio is empty')
  }

  const to = searchContent(true)

  samples = samples.slice(from || 0, to || len)
  len = samples.length

  // Amplify
  if (from != null) {
    for (let i = 0; i < minSilenceSamples; i++) {
      samples[i] *= (i / minSilenceSamples)
    }
  }
  if (to != null) {
    for (let i = 0; i < minSilenceSamples; i++) {
      samples[len - i - 1] *= (i / minSilenceSamples)
    }
  }

  return samples
}

export async function trimAudioFile({
  inputFilePath,
  outputFilePath,
  silenceLevelStart = SILENCE_LEVEL_START_DEFAULT,
  silenceLevelEnd = SILENCE_LEVEL_END_DEFAULT,
}: {
  inputFilePath: string,
  outputFilePath: string,
  silenceLevelStart?: number,
  silenceLevelEnd?: number,
}) {
  inputFilePath = path.resolve(inputFilePath)
  outputFilePath = path.resolve(outputFilePath)

  const samples = await readOggFile(inputFilePath)

  const dir = path.dirname(outputFilePath)
  if (!fse.existsSync(dir)) {
    await fse.mkdirp(dir)
  }
  if (fse.existsSync(outputFilePath)) {
    await fse.unlink(outputFilePath)
  }

  normalize(samples, 0.95)
  // samples = await trimSamples({
  //     samples,
  //     silenceLevelStart,
  //     silenceLevelEnd,
  //     minSilenceSamples: Math.round(40 / 1000 * 16000), // 40 ms
  // })

  await saveToMp3File(outputFilePath, samples)
}

export function trimAudioFilesFromDir({
  inputDir,
  inputFilesRelativeGlobs,
  outputDir,
  silenceLevelStart = SILENCE_LEVEL_START_DEFAULT,
  silenceLevelEnd = SILENCE_LEVEL_END_DEFAULT,
}: {
  inputDir: string,
  inputFilesRelativeGlobs: string[],
  outputDir: string,
  silenceLevelStart?: number,
  silenceLevelEnd?: number,
}) {
  return trimAudioFiles({
    inputFilesGlobs: inputFilesRelativeGlobs.map(o => path.resolve(inputDir, o)),
    getOutputFilePath(filePath) {
      return path.resolve(outputDir, path.relative(inputDir, filePath))
        .replace(/\.\w+$/, '') + '.mp3'
    },
    silenceLevelStart,
    silenceLevelEnd,
  })
}

export async function trimAudioFiles({
  inputFilesGlobs,
  getOutputFilePath,
  silenceLevelStart = SILENCE_LEVEL_START_DEFAULT,
  silenceLevelEnd = SILENCE_LEVEL_END_DEFAULT,
}: {
  inputFilesGlobs: string[],
  getOutputFilePath: (inputFilePath: string) => string,
  silenceLevelStart?: number,
  silenceLevelEnd?: number,
}) {
  const inputFilesPaths = await globby(inputFilesGlobs.map(o => o.replace(/\\/g, '/')))

  await Promise.all(inputFilesPaths.map(async (inputFilePath) => {
    const outputFilePath = getOutputFilePath(inputFilePath)

    if (fse.existsSync(outputFilePath)) {
      return
    }

    try {
      await trimAudioFile({
        inputFilePath,
        outputFilePath,
        silenceLevelStart,
        silenceLevelEnd,
      })
      console.log('OK: ' + outputFilePath)
    } catch (err) {
      console.log('ERROR: ' + inputFilePath + '\r\n' + (err.stack || err.message || err))
    }
  }))

  console.log('Completed!')
}
