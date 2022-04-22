import {ffmpegEncodeMp3Params} from './ffmpegEncodeMp3Params'
import {ffmpegTest} from './test/ffmpegTest'

describe('io > audio > ffmpeg > ffmpegEncodeMp3Params', function () {
  this.timeout(60000)

  it('stereo', async function () {
    await ffmpegTest({
      encodeArgs: {
        outputFormat: 'mp3',
        params      : ffmpegEncodeMp3Params({
          bitrate    : 8,
          mode       : 'cbr',
          jointStereo: false,
        }),
      },
      decodeArgs: {
        channels  : 2,
        sampleRate: 32000,
      },
      checkDecoded: {

      },
    })
  })
})
