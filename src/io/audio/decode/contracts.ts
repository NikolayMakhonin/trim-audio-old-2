import {Readable} from 'stream'
import {AudioSamples} from '../contracts'

export type AudioDecode = (stream: Readable) => Promise<AudioSamples>
