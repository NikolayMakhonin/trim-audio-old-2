import {encodeMpeg3} from './mpeg3'
import {
  saveFile,

} from '../test/saveFile'
import {decodeMpeg123} from '../decode/mpeg123'
import {generateTestSamples, testAudioFunc} from '../test/generateTestSamples'
import {checkSamples} from '../test/checkSamples'

describe('io > audio > encode > mpeg3', function () {
  this.timeout(60000)

  it('mp3-joint-stereo-vbr', async function () {
    const originalSamples = generateTestSamples({
      audioFunc  : testAudioFunc,
      sampleRate : 16000,
      durationSec: 7,
    })
    const mp3Data = await encodeMpeg3(originalSamples, {
      bitrate: 8,
      // vbrQuality: 0,
    })
    assert.ok(mp3Data instanceof Uint8Array)
    assert.ok(mp3Data.length > 1)

    await saveFile('mpeg3.mp3', mp3Data)

    const samples = await decodeMpeg123({
      data      : mp3Data,
      channels  : 2,
      sampleRate: 16000,
    })
    // const samples = originalSamples

    checkSamples({
      samples,
      checkAudioFunc       : testAudioFunc,
      checkAudioDurationSec: 7,
    })
  })
})
