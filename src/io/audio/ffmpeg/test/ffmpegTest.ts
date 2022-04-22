import {ffmpegDecode, FFmpegDecodeArgs, ffmpegEncode, FFmpegEncodeArgs} from '../ffmpeg'
import {testSamplesMono, testSamplesMonoSplit, testSamplesStereo} from '../../test/testSamples'
import {checkSamples} from '../../test/checkSamples'
import {testAudioFunc} from '../../test/generateTestSamples'
import * as musicMetadata from 'music-metadata'
import {IAudioMetadata} from 'music-metadata/lib/type'
import {AudioSamples} from '../../contracts'
import {ffmpegEncodeMp3Params} from '../ffmpegEncodeMp3Params'

export async function ffmpegTestEncode({
  inputType,
  encode: {
    encodeArgs,
    checkEncodedMetadata,
  },
}: {
  inputType: 'mono' | 'stereo' | 'mono-split',
  encode: {
    encodeArgs: FFmpegEncodeArgs,
    checkEncodedMetadata: (metadata: IAudioMetadata) => void,
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

  return data
}

export async function ffmpegTestDecode({
  inputData,
  decode: {
    decodeArgs,
    checkDecoded: {
      isMono,
      minAmplitude,
    },
  },
}: {
  inputData: Uint8Array,
  decode: {
    decodeArgs: FFmpegDecodeArgs,
    checkDecoded: {
      isMono?: boolean,
      minAmplitude?: number,
    },
  },
}) {
  const samples = await ffmpegDecode(inputData, decodeArgs)

  checkSamples({
    samples,
    checkAudioFunc       : testAudioFunc,
    checkAudioDurationSec: 7,
    isMono,
    minAmplitude,
  })

  return samples
}

export async function ffmpegTestStereo({
  encode,
}: {
  encode: {
    encodeArgs: FFmpegEncodeArgs,
    checkEncodedMetadata: (metadata: IAudioMetadata) => void,
  },
}) {
  const data = await ffmpegTestEncode({
    inputType: 'stereo',
    encode,
  })

  await ffmpegTestDecode({
    inputData: data,
    decode   : {
      decodeArgs: {
        channels  : 2,
        sampleRate: 32000,
      },
      checkDecoded: {},
    },
  })
}

export async function ffmpegTestMono({
  encode,
}: {
  encode: {
    encodeArgs: FFmpegEncodeArgs,
    checkEncodedMetadata: (metadata: IAudioMetadata) => void,
  },
}) {
  const data = await ffmpegTestEncode({
    inputType: 'mono',
    encode,
  })

  await ffmpegTestDecode({
    inputData: data,
    decode   : {
      decodeArgs: {
        channels  : 1,
        sampleRate: 32000,
      },
      checkDecoded: {
        isMono: true,
        // minAmplitude: 0.6,
      },
    },
  })

  await ffmpegTestDecode({
    inputData: data,
    decode   : {
      decodeArgs: {
        channels  : 2,
        sampleRate: 32000,
      },
      checkDecoded: {
        isMono: true,
        // minAmplitude: 0.6,
      },
    },
  })
}

export async function ffmpegTestMonoSplit({
  encode,
}: {
  encode: {
    encodeArgs: FFmpegEncodeArgs,
    checkEncodedMetadata: (metadata: IAudioMetadata) => void,
  },
}) {
  const data = await ffmpegTestEncode({
    inputType: 'mono-split',
    encode,
  })

  await ffmpegTestDecode({
    inputData: data,
    decode   : {
      decodeArgs: {
        channels  : 1,
        sampleRate: 32000,
      },
      checkDecoded: {
        isMono      : true,
        minAmplitude: 0.6,
      },
    },
  })

  await ffmpegTestDecode({
    inputData: data,
    decode   : {
      decodeArgs: {
        channels  : 2,
        sampleRate: 32000,
      },
      checkDecoded: {
        isMono      : true,
        minAmplitude: 0.6,
      },
    },
  })
}

export async function ffmpegTestVariants(options: {
  encode: {
    encodeArgs: FFmpegEncodeArgs,
    checkEncodedMetadata: (metadata: IAudioMetadata) => void,
  },
}) {
  await ffmpegTestStereo(options)
  await ffmpegTestMono(options)
  await ffmpegTestMonoSplit(options)
}
