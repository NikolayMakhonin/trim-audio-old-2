import {decodeMpeg123} from './mpeg123'
import {
  saveFile,

} from '../test/saveFile'
import {encodeMpeg3} from '../encode/mpeg3'
import {testAudioFunc} from '../test/generateTestSamples'
import {checkSamples} from '../test/checkSamples'
import {getAssetData} from '../test/getAsset'

describe('io > audio > decode > mpeg123', function () {
  this.timeout(60000)

  it('opus-stereo-vbr', async function () {
    const data = await getAssetData('test.wav')
    const samples = await decodeMpeg123({
      data,
      channels  : 2,
      sampleRate: 16000,
    })

    const mp3Data = await encodeMpeg3(samples, {
      bitrate: 8,
      // vbrQuality: 0,
    })
    await saveFile('mpeg3.opus', mp3Data)

    checkSamples({
      samples,
      checkAudioFunc       : testAudioFunc,
      checkAudioDurationSec: 7,
    })
  })

  describe('base', function () {
    it('mp3-stereo-vbr', async function () {
      const data = await getAssetData('mp3-stereo-vbr.mp3')
      const samples = await decodeMpeg123({
        data,
        channels  : 2,
        sampleRate: 16000,
      })
      checkSamples({
        samples,
        checkAudioFunc       : testAudioFunc,
        checkAudioDurationSec: 7,
      })
    })

    it('mp3-joint-stereo-vbr', async function () {
      const data = await getAssetData('mp3-joint-stereo-vbr.mp3')
      const samples = await decodeMpeg123({
        data,
        channels  : 2,
        sampleRate: 16000,
      })
      checkSamples({
        samples,
        checkAudioFunc       : testAudioFunc,
        checkAudioDurationSec: 7,
      })
    })

    it('mp3-stereo', async function () {
      const data = await getAssetData('mp3-stereo.mp3')
      const samples = await decodeMpeg123({
        data,
        channels  : 2,
        sampleRate: 16000,
      })
      checkSamples({
        samples,
        checkAudioFunc       : testAudioFunc,
        checkAudioDurationSec: 7,
      })
    })

    it('mp3-mono', async function () {
      const data = await getAssetData('mp3-mono.mp3')
      const samples = await decodeMpeg123({
        data,
        channels  : 1,
        sampleRate: 16000,
      })
      checkSamples({
        samples,
        checkAudioFunc       : testAudioFunc,
        checkAudioDurationSec: 7,
        isMono               : true,
      })
    })

    it('mp3-mono-vbr', async function () {
      const data = await getAssetData('mp3-mono-vbr.mp3')
      const samples = await decodeMpeg123({
        data,
        channels  : 1,
        sampleRate: 16000,
      })
      checkSamples({
        samples,
        checkAudioFunc       : testAudioFunc,
        checkAudioDurationSec: 7,
        isMono               : true,
      })
    })
  })

  describe('stereo to mono', function () {
    it('mp3-mono-as-stereo', async function () {
      const data = await getAssetData('mp3-mono-as-stereo.mp3')
      const samples = await decodeMpeg123({
        data,
        channels  : 1,
        sampleRate: 16000,
      })
      checkSamples({
        samples,
        checkAudioFunc       : testAudioFunc,
        checkAudioDurationSec: 7,
        isMono               : true,
        minAmplitude         : 0.6,
      })
    })

    it('mp3-mono-as-joint-stereo-vbr', async function () {
      const data = await getAssetData('mp3-mono-as-joint-stereo-vbr.mp3')
      const samples = await decodeMpeg123({
        data,
        channels  : 1,
        sampleRate: 16000,
      })
      checkSamples({
        samples,
        checkAudioFunc       : testAudioFunc,
        checkAudioDurationSec: 7,
        isMono               : true,
        minAmplitude         : 0.6,
      })
    })
  })

  describe('mono to stereo', function () {
    it('mp3-mono', async function () {
      const data = await getAssetData('mp3-mono.mp3')
      const samples = await decodeMpeg123({
        data,
        channels  : 2,
        sampleRate: 16000,
      })
      checkSamples({
        samples,
        checkAudioFunc       : testAudioFunc,
        checkAudioDurationSec: 7,
        isMono               : true,
        minAmplitude         : 0.6,
      })
    })

    it('mp3-mono-vbr', async function () {
      const data = await getAssetData('mp3-mono-vbr.mp3')
      const samples = await decodeMpeg123({
        data,
        channels  : 2,
        sampleRate: 16000,
      })
      checkSamples({
        samples,
        checkAudioFunc       : testAudioFunc,
        checkAudioDurationSec: 7,
        isMono               : true,
        minAmplitude         : 0.6,
      })
    })
  })
})
