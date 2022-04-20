/* eslint-disable no-shadow */
import path from 'path'
import {trimAudioFile, trimAudioFiles, trimAudioFilesFromDir} from './trim'

xdescribe('node > trim', function () {
	this.timeout(60000000)

	it('base', async function () {
		await trimAudioFile({
			inputFilePath : 'src/trim/assets-test/music.mp3',
			outputFilePath: './tmp/test/test.mp3',
		})
		await trimAudioFile({
			inputFilePath : 'src/trim/assets-test/test2.ogg',
			outputFilePath: './tmp/test/test2.mp3',
		})
	})

	xit('bulk', async function () {
		await trimAudioFilesFromDir({
			inputDir               : 'l:/Work/_GIT/GitHub/NodeJs/apps/counter-sapper/docs/materials/speech/ogg',
			inputFilesRelativeGlobs: ['**/*.ogg'],
			outputDir              : 'l:/Work/_GIT/GitHub/NodeJs/apps/counter-sapper/static/client/speech/mp3',
		})
	})
})
