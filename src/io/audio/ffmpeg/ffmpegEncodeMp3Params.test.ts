import {ffmpegEncodeMp3Params} from './ffmpegEncodeMp3Params'
import {ffmpegTestVariants} from './test/ffmpegTest'

describe('io > audio > ffmpeg > ffmpegEncodeMp3Params', function () {
  this.timeout(60000)

  it('cbr', async function () {
    await ffmpegTestVariants({
      encode: {
        encodeArgs: {
          outputFormat: 'mp3',
          params      : ffmpegEncodeMp3Params({
            bitrate    : 8,
            mode       : 'cbr',
            jointStereo: false,
          }),
        },
        checkEncodedMetadata(metadata) {
          assert.strictEqual(metadata.format.lossless, false)
          assert.strictEqual(metadata.format.codec, 'MPEG 2 Layer 3')
          assert.strictEqual(metadata.format.bitrate, 8000)
          assert.strictEqual(metadata.format.codecProfile, 'CBR')
        },
      },
    })
  })

  it('abr', async function () {
    await ffmpegTestVariants({
      encode: {
        encodeArgs: {
          outputFormat: 'mp3',
          params      : ffmpegEncodeMp3Params({
            bitrate    : 8,
            mode       : 'abr',
            jointStereo: false,
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

  it('vbr', async function () {
    await ffmpegTestVariants({
      encode: {
        encodeArgs: {
          outputFormat: 'mp3',
          params      : ffmpegEncodeMp3Params({
            vbrQuality : 5,
            mode       : 'vbr',
            jointStereo: false,
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
})
