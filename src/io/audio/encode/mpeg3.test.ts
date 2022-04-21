import {encodeMpeg3} from './mpeg3'
import {
  checkSamples,
  createAssetStream, generateTestSamples, saveFile,
  testAudioFunc,
} from '../test/testDecodeEncode'
import {Readable} from 'stream'
import {decodeMpeg123Stream} from '../decode/mpeg123'
import {toReadable} from '../../helpers/stream'

describe('io > audio > encode > mpeg3', function () {
  this.timeout(60000)

  it('mp3-joint-stereo-vbr', async function () {
    const originalSamples = generateTestSamples({
      audioFunc  : testAudioFunc,
      sampleRate : 16000,
      durationSec: 7,
    })
    const data = await encodeMpeg3(originalSamples, {
      bitrate: 8,
      // vbrQuality: 0,
    })
    assert.ok(data instanceof Uint8Array)
    assert.ok(data.length > 1)

    await saveFile('mpeg3.mp3', data)

    const stream = toReadable(data)
    const samples = await decodeMpeg123Stream(stream)
    // const samples = originalSamples

    checkSamples({
      samples,
      checkAudioFunc       : testAudioFunc,
      checkAudioDurationSec: 7,
      checkChannelCount    : 2,
    })
  })
})
