import {ffmpegEncodeOpusParams} from './ffmpegEncodeOpusParams'
import {ffmpegTestVariants} from './test/ffmpegTest'

describe('io > audio > ffmpeg > ffmpegEncodeOpusParams', function () {
  this.timeout(60000)

  it('audio', async function () {
    await ffmpegTestVariants({
      encode: {
        encodeArgs: {
          outputFormat: 'opus',
          params      : ffmpegEncodeOpusParams({
            bitrate      : 8,
            application  : 'audio',
            vbr          : 'off',
            compression  : 3,
            cutoff       : 0,
            frameDuration: 20,
          }),
        },
        checkEncodedMetadata: null,
      },
    })
  })
})
