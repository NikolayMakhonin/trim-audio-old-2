import {ffmpegDecode, FFmpegDecodeArgs, ffmpegEncode, FFmpegEncodeArgs} from '../ffmpeg'
import {testSamplesMono, testSamplesMonoSplit, testSamplesStereo} from '../../test/testSamples'
import {checkSamples} from '../../test/checkSamples'
import {testAudioFunc} from '../../test/generateTestSamples'
import * as musicMetadata from 'music-metadata'
import {IAudioMetadata} from 'music-metadata/lib/type'
import {AudioSamples} from '../../contracts'

export async function ffmpegTest({
  inputType,
  encode: {
    encodeArgs,
    checkEncodedMetadata,
  },
  decode: {
    decodeArgs,
    checkDecoded: {
      isMono,
      minAmplitude,
    },
  },
}: {
  inputType: 'mono' | 'stereo' | 'mono-split',
  encode: {
    encodeArgs: FFmpegEncodeArgs,
    checkEncodedMetadata: (metadata: IAudioMetadata) => void,
  },
  decode: {
    decodeArgs: FFmpegDecodeArgs,
    checkDecoded: {
      isMono?: boolean,
      minAmplitude?: number,
    },
  },
}) {
  let input: AudioSamples
  switch (inputType) {
    case 'mono':
      input = testSamplesMono
      break
    case 'stereo':
      input = testSamplesStereo
      break
    case 'mono-split':
      input = testSamplesMonoSplit
      break
    default:
      throw new Error('Unknown inputType: ' + inputType)
  }

  const data = await ffmpegEncode(input, encodeArgs)

  const metadata = await musicMetadata.parseBuffer(data)

  assert.strictEqual(metadata.format.sampleRate, 16000)
  assert.strictEqual(metadata.format.numberOfChannels, 2)
  assert.ok(metadata.format.duration >= 6.95, metadata.format.duration + '')
  assert.ok(metadata.format.duration <= 7.15, metadata.format.duration + '')
  checkEncodedMetadata(metadata)

  // await saveFile('mpeg.mp3', data)

  const samples = await ffmpegDecode(data, decodeArgs)

  checkSamples({
    samples,
    checkAudioFunc       : testAudioFunc,
    checkAudioDurationSec: 7,
    isMono,
    minAmplitude,
  })
}
