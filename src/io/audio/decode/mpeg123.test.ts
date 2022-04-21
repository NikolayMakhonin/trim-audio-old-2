import {decodeMpeg123} from './mpeg123'
import {
  checkSamples,
  getAssetData,
  testAudioFunc,
} from '../test/testDecodeEncode'

describe('io > audio > decode > mpeg123', function () {
  this.timeout(60000)

  it('mp3-joint-stereo-vbr', async function () {
    const data = await getAssetData('mp3-joint-stereo-vbr.mp3')
    const samples = await decodeMpeg123(data)
    checkSamples({
      samples,
      checkAudioFunc       : testAudioFunc,
      checkAudioDurationSec: 7,
      checkChannelCount    : 2,
    })
  })

  it('mp3-stereo-vbr', async function () {
    const data = await getAssetData('mp3-stereo-vbr.mp3')
    const samples = await decodeMpeg123(data)
    checkSamples({
      samples,
      checkAudioFunc       : testAudioFunc,
      checkAudioDurationSec: 7,
      checkChannelCount    : 2,
    })
  })

  it('mp3-mono-vbr', async function () {
    const data = await getAssetData('mp3-mono-vbr.mp3')
    const samples = await decodeMpeg123(data)
    checkSamples({
      samples,
      checkAudioFunc       : testAudioFunc,
      checkAudioDurationSec: 7,
      checkChannelCount    : 1,
    })
  })

  it('mp3-mono', async function () {
    const data = await getAssetData('mp3-mono.mp3')
    const samples = await decodeMpeg123(data)
    checkSamples({
      samples,
      checkAudioFunc       : testAudioFunc,
      checkAudioDurationSec: 7,
      checkChannelCount    : 1,
    })
  })
})
