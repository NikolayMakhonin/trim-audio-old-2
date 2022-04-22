import {decodeMpeg123} from './mpeg123'
import {
  checkSamples,
  getAssetData,
  testAudioFunc,
} from '../test/testDecodeEncode'

describe('io > audio > decode > mpeg123', function () {
  this.timeout(60000)

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
