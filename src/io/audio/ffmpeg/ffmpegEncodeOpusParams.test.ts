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

  // it('abr', async function () {
  //   await ffmpegTestVariants({
  //     encode: {
  //       encodeArgs: {
  //         outputFormat: 'opus',
  //         params      : ffmpegEncodeOpusParams({
  //           bitrate    : 8,
  //           mode       : 'abr',
  //           jointStereo: false,
  //         }),
  //       },
  //       checkEncodedMetadata(metadata) {
  //         assert.strictEqual(metadata.format.lossless, false)
  //         assert.strictEqual(metadata.format.codec, 'MPEG 2 Layer 3')
  //         assert.ok(metadata.format.bitrate > 7000, metadata.format.bitrate + '')
  //         assert.ok(metadata.format.bitrate <= 9500, metadata.format.bitrate + '')
  //         assert.strictEqual(metadata.format.codecProfile, 'V10')
  //       },
  //     },
  //   })
  // })
  //
  // it('vbr', async function () {
  //   await ffmpegTestVariants({
  //     encode: {
  //       encodeArgs: {
  //         outputFormat: 'opus',
  //         params      : ffmpegEncodeOpusParams({
  //           vbrQuality : 5,
  //           mode       : 'vbr',
  //           jointStereo: false,
  //         }),
  //       },
  //       checkEncodedMetadata(metadata) {
  //         assert.strictEqual(metadata.format.lossless, false)
  //         assert.strictEqual(metadata.format.codec, 'MPEG 2 Layer 3')
  //         assert.ok(metadata.format.bitrate > 7000, metadata.format.bitrate + '')
  //         assert.ok(metadata.format.bitrate <= 9500, metadata.format.bitrate + '')
  //         assert.strictEqual(metadata.format.codecProfile, 'V10')
  //       },
  //     },
  //   })
  // })
})
