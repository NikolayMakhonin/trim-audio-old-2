// import path from 'path'
// import {decodeMpeg123Stream} from '../decoders/mpeg123'
// import {encodeMpeg3} from '../encoders/mpeg3'
// import {testDecodeEncode} from './testDecodeEncode'
// import {fileURLToPath} from 'url'
// import {AudioSamples} from 'src/io/audio/contracts'
// import fse from 'fs-extra'
//
// describe('io > audio > decode-encode', function () {
//   this.timeout(30000)
//   const __dirname = path.dirname(fileURLToPath(import.meta.url))
//
//   it('mpeg123', async function () {
//     const stream = fse.createReadStream(inputFilePath)
//     const samples = await decodeMpeg123Stream(stream)
//     checkSamples({
//       samples,
//       checkAudioFunc       : testAudioFunc,
//       checkAudioDurationSec: 7,
//       checkChannelCount    : 2,
//       amplitude: 0.9,
//       startTimeSec: 0.069,
//     })
//
//     await testDecodeEncode({
//       inputFilePath: path.resolve(__dirname, './assets/mp3-joint-stereo-vbr.mp3'),
//       decode       : decodeMpeg123Stream,
//       encode       : encodeMpeg3,
//       options      : null,
//       checkDecoded(samples) {
//         checkSamples({
//           samples,
//           checkAudioFunc       : testAudioFunc,
//           checkAudioDurationSec: 7,
//           checkChannelCount    : 2,
//           amplitude: 0.9,
//           startTimeSec: 0.069,
//         })
//         console.log('checkDecoded')
//       },
//       checkEncoded(samples, data, options) {
//         console.log('checkEncoded')
//       },
//     })
//   })
// })
