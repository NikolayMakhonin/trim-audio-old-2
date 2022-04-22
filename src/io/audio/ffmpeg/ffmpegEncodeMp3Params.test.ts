import {ffmpegDecode, ffmpegEncode} from './ffmpeg'
import {ffmpegEncodeMp3Params} from './ffmpegEncodeMp3Params'
import {testSamplesStereo} from '../test/testSamples'
import {testAudioFunc} from '../test/generateTestSamples'
import {checkSamples} from '../test/checkSamples'
import {saveFile} from '../test/saveFile'

describe('io > audio > ffmpeg > ffmpegEncodeMp3Params', function () {
  this.timeout(60000)

  it('stereo', async function () {
    const data = await ffmpegEncode(testSamplesStereo, {
      outputFormat: 'mp3',
      params      : ffmpegEncodeMp3Params({
        bitrate    : 8,
        mode       : 'cbr',
        jointStereo: false,
      }),
    })

    // await saveFile('mpeg.mp3', data)

    const samples = await ffmpegDecode(data, {
      channels  : 2,
      sampleRate: 32000,
    })

    checkSamples({
      samples,
      checkAudioFunc       : testAudioFunc,
      checkAudioDurationSec: 7,
    })
  })
})
