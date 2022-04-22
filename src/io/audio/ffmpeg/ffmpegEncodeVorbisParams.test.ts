import {ffmpegEncodeVorbisParams} from './ffmpegEncodeVorbisParams'
import {ffmpegTestVariants} from './test/ffmpegTest'

describe('io > audio > ffmpeg > ffmpegEncodeVorbisParams', function () {
  this.timeout(60000)

  it('abr', async function () {
    await ffmpegTestVariants({
      encode: {
        encodeArgs: {
          outputFormat: 'ogg',
          params      : ffmpegEncodeVorbisParams({
            bitrate: 8,
            vbr    : false,
            cutoff : 0,
          }),
        },
        checkEncodedMetadata: null,
      },
    })
  })
})
