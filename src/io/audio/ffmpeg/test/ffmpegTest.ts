import {ffmpegDecode, FFmpegDecodeArgs, ffmpegEncode, FFmpegEncodeArgs} from '../ffmpeg'
import {testSamplesStereo} from '../../test/testSamples'
import {checkSamples} from '../../test/checkSamples'
import {testAudioFunc} from '../../test/generateTestSamples'

export async function ffmpegTest({
  encodeArgs,
  decodeArgs,
  checkDecoded: {
    isMono,
    minAmplitude,
  },
}: {
  encodeArgs: FFmpegEncodeArgs,
  decodeArgs: FFmpegDecodeArgs,
  checkDecoded: {
    isMono?: boolean,
    minAmplitude?: number,
  }
}) {
  const data = await ffmpegEncode(testSamplesStereo, encodeArgs)

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
