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
        checkEncodedMetadata(metadata) {
          assert.strictEqual(metadata.format.lossless, false)
          assert.strictEqual(metadata.format.codec, 'MPEG 2 Layer 3')
          assert.ok(metadata.format.bitrate > 7000, metadata.format.bitrate + '')
          assert.ok(metadata.format.bitrate <= 9500, metadata.format.bitrate + '')
          assert.strictEqual(metadata.format.codecProfile, 'V10')
        },
      },
    })
  })

  // it('abr', async function () {
  //   await ffmpegTestVariants({
  //     encode: {
  //       encodeArgs: {
  //         outputFormat: 'ogg',
  //         params      : ffmpegEncodeVorbisParams({
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
  //         outputFormat: 'ogg',
  //         params      : ffmpegEncodeVorbisParams({
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
