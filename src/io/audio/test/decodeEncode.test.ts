import path from 'path'
import {decodeMpeg123Stream} from '../decoders/mpeg123'
import {encodeMpeg3} from '../encoders/mpeg3'
import {testDecodeEncode} from './testDecodeEncode'
import {fileURLToPath} from 'url'
import {AudioSamples} from 'src/io/audio/contracts'

describe('io > audio > decode-encode', function () {
  this.timeout(30000)
  const __dirname = path.dirname(fileURLToPath(import.meta.url))

  /**
   * left: 1Hz-100%-2sec silence-2sec 2Hz-50%-3sec
   * right: 2Hz-50%-3sec silence-2sec 1Hz-100%-2sec
   */
  function testAudioFunc(time: number, channel: number): number {
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

  function checkSamples({
    samples,
    checkAudioFunc,
    checkAudioDurationSec,
  }: {
    samples: AudioSamples,
    checkAudioFunc: (time: number, channel: number) => number,
    checkAudioDurationSec: number,
  }) {
    const channelCount = samples.channelsData.length
    assert.ok(
      channelCount === 1 || channelCount === 2,
      channelCount + '',
    )

    const samplesCount = samples[0].length
    const sampleRate = samples.sampleRate
    const totalDuration = samplesCount / samples.sampleRate
    assert.ok(Math.abs(totalDuration - checkAudioDurationSec) < 0.01, totalDuration + '')

    for (let channel = 0; channel < channelCount; channel++) {
      assert.strictEqual(samples[0].length, samplesCount, samples[0].length + '')

      let sumError = 0
      for (let i = 0; i < samplesCount; i++) {
        const sample = samples[i]
        const checkSample = checkAudioFunc(i / sampleRate, channel)
        const error = Math.abs(checkSample - sample)
        sumError += error * error
      }

      const avgError = sumError / samplesCount
      assert.ok(avgError < 0.001, avgError + '')
    }
  }

  it('mpeg123', async function () {
    await testDecodeEncode({
      inputFilePath: path.resolve(__dirname, './assets/mp3-joint-stereo-vbr.mp3'),
      decode       : decodeMpeg123Stream,
      encode       : encodeMpeg3,
      options      : null,
      checkDecoded(samples) {
        checkSamples({
          samples,
          checkAudioFunc       : testAudioFunc,
          checkAudioDurationSec: 7,
        })
        console.log('checkDecoded')
      },
      checkEncoded(samples, data, options) {
        console.log('checkEncoded')
      },
    })
  })
})
