import path from 'path'
import {decodeMpeg123Stream} from '../decoders/mpeg123'
import {encodeMpeg3} from '../encoders/mpeg3'
import {testDecodeEncode} from './testDecodeEncode'
import {fileURLToPath} from 'url'

describe('io > audio > decode-encode', function () {
  this.timeout(30000)
  const __dirname = path.dirname(fileURLToPath(import.meta.url))

  it('mpeg123', async function () {
    await testDecodeEncode({
      inputFilePath: path.resolve(__dirname, '../test/assets/music.mp3'),
      decode       : decodeMpeg123Stream,
      encode       : encodeMpeg3,
      options      : null,
      checkDecoded(samples) {
        console.log('checkDecoded')
      },
      checkEncoded(samples, data, options) {
        console.log('checkEncoded')
      },
    })
  })
})
