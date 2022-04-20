import path from 'path'
import fse from 'fs-extra'
import {AudioDecode} from '../decoders/contracts'
import {AudioEncode} from '../encoders/contracts'
import {AudioSamples} from '../contracts'
import {fileURLToPath} from 'url'

/**
 * left: 1Hz-100%-2sec silence-2sec 2Hz-50%-3sec
 * right: 2Hz-50%-3sec silence-2sec 1Hz-100%-2sec
 */
export function testAudioFunc(time: number, channel: number): number {
  if (time > 7) {
    return 0
  }

  switch (channel) {
    case 0:
      if (time <= 2) {
        return Math.sin(time * 2 * Math.PI)
      }
      if (time <= 4) {
        return 0
      }
      return Math.sin((time - 4) * 4 * Math.PI)
    case 1:
      if (time <= 3) {
        return Math.sin(time * 4 * Math.PI)
      }
      if (time <= 5) {
        return 0
      }
      return Math.sin((time - 5) * 2 * Math.PI)
    default:
      throw new Error('channel === ' + channel)
  }
}

function getFirstMaximum({
  getSample,
  windowSize,
  samplesCount,
}: {
  getSample: (index: number) => number,
  windowSize: number,
  samplesCount: number,
}) {
  let sum = 0
  let prevAvg
  let maximumStart
  let maximumEnd
  for (let i = 0; i < samplesCount; i++) {
    const sample = getSample(i)
    sum += Math.abs(sample)
    if (i >= windowSize) {
      const prevSample = getSample(i - windowSize)
      sum -= prevSample
    }
    if (i >= windowSize - 1) {
      const avg = sum / windowSize
      if (i === windowSize - 1 || avg > prevAvg) {
        prevAvg = avg
      } else if (avg === prevAvg) {
        maximumStart = i
      } else if (avg < prevAvg) {
        maximumEnd = i
      }
    }
  }

  if (prevAvg == null || maximumStart == null || maximumEnd == null) {
    throw new Error('Cannot find first maximum')
  }

  return Math.round((maximumEnd + maximumStart - windowSize) / 2)
}

export function checkSamples({
  samples,
  checkAudioFunc,
  checkAudioDurationSec,
  checkChannelCount,
  amplitude,
}: {
  samples: AudioSamples,
  checkAudioFunc: (time: number, channel: number) => number,
  checkAudioDurationSec: number,
  checkChannelCount: number,
  amplitude: number,
}) {
  const channelCount = samples.channelsData.length
  assert.strictEqual(channelCount, checkChannelCount)

  const samplesCount = samples.channelsData[0].length
  const sampleRate = samples.sampleRate
  const checkFirstMaximum = getFirstMaximum({
    samplesCount,
    windowSize: Math.round(0.001 * sampleRate),
    getSample : o => checkAudioFunc(o / sampleRate, 0),
  })
  const firstMaximum = getFirstMaximum({
    samplesCount,
    windowSize: Math.round(0.001 * sampleRate),
    getSample : o => samples.channelsData[0][o],
  })
  const startSample = firstMaximum - checkFirstMaximum

  assert.ok(firstMaximum >= checkFirstMaximum - Math.round(0.05 * sampleRate), firstMaximum + '')
  assert.ok(firstMaximum <= checkFirstMaximum - Math.round(0.1 * sampleRate), firstMaximum + '')

  const totalDuration = (samplesCount - startSample) / samples.sampleRate
  assert.ok(totalDuration >= checkAudioDurationSec - 0.05, totalDuration + '')
  assert.ok(totalDuration <= checkAudioDurationSec + 0.05, totalDuration + '')
  
  for (let channel = 0; channel < channelCount; channel++) {
    const channelData = samples.channelsData[channel]
    assert.strictEqual(channelData.length, samplesCount, channelData.length + '')

    let sumError = 0
    for (let i = startSample; i < samplesCount; i++) {
      const sample = channelData[i]
      const checkSample = checkAudioFunc((i - startSample) / sampleRate, channel) * amplitude
      const error = Math.abs(checkSample - sample)
      sumError += error * error
    }

    const avgError = sumError / samplesCount
    assert.ok(avgError < 0.1, avgError + '')
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export function createAssetStream(assetFileName: string) {
  const filePath = path.resolve(__dirname, 'assets', assetFileName)
  const stream = fse.createReadStream(filePath)
  return stream
}

// export async function testDecodeEncode<TOptions>({
//   inputFilePath,
//   decode,
//   encode,
//   options,
//   checkDecoded,
//   checkEncoded,
// }: {
//   inputFilePath: string,
//   decode : AudioDecode,
//   encode : AudioEncode<TOptions>,
//   options?: TOptions,
//   checkDecoded?: (samples: AudioSamples) => void,
//   checkEncoded?: (samples: AudioSamples, data: Uint8Array, options: TOptions) => void,
// }) {
//   const outputFilePath = path.resolve('./tmp/', path.relative('./src', inputFilePath))
//   if (fse.existsSync(outputFilePath)) {
//     await fse.unlink(outputFilePath)
//   }
//   const dir = path.dirname(outputFilePath)
//   if (!fse.existsSync(dir)) {
//     await fse.mkdirp(dir)
//   }
//
//   const stream = fse.createReadStream(inputFilePath)
//   const samples = await decode(stream)
//   checkDecoded && checkDecoded(samples)
//   const data = await encode(samples, options)
//   checkEncoded && checkEncoded(samples, data, options)
//   await fse.writeFile(outputFilePath, data)
// }
