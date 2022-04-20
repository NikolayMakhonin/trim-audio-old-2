import {decodeMpeg123Stream} from './mpeg123'
import {
  checkSamples,
  createAssetStream,
  testAudioFunc,
} from '../test/testDecodeEncode'

describe('io > audio > decode > mpeg123', function () {
  this.timeout(30000)

  it('mp3-joint-stereo-vbr', async function () {
    const stream = createAssetStream('mp3-joint-stereo-vbr.mp3')
    const samples = await decodeMpeg123Stream(stream)
    checkSamples({
      samples,
      checkAudioFunc       : testAudioFunc,
      checkAudioDurationSec: 7,
      checkChannelCount    : 2,
      amplitude            : 0.9,
    })
  })
})
