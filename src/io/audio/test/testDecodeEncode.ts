import path from 'path'
import fse from 'fs-extra'
import {AudioDecode} from '../decoders/contracts'
import {AudioEncode} from '../encoders/contracts'
import {AudioSamples} from '../contracts'

export async function testDecodeEncode<TOptions>({
  inputFilePath,
  decode,
  encode,
  options,
  checkDecoded,
  checkEncoded,
}: {
  inputFilePath: string,
  decode : AudioDecode,
  encode : AudioEncode<TOptions>,
  options?: TOptions,
  checkDecoded?: (samples: AudioSamples) => void,
  checkEncoded?: (samples: AudioSamples, data: Uint8Array, options: TOptions) => void,
}) {
  const outputFilePath = path.resolve('./tmp/', path.relative('./src', inputFilePath))
  if (fse.existsSync(outputFilePath)) {
    await fse.unlink(outputFilePath)
  }
  const dir = path.dirname(outputFilePath)
  if (!fse.existsSync(dir)) {
    await fse.mkdirp(dir)
  }

  const stream = fse.createReadStream(inputFilePath)
  const samples = await decode(stream)
  checkDecoded && checkDecoded(samples)
  const data = await encode(samples, options)
  checkEncoded && checkEncoded(samples, data, options)
  await fse.writeFile(outputFilePath, data)
}
