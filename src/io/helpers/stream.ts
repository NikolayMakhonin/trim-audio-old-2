import {Readable} from 'stream'

export function streamForEach(stream: Readable, callback: (chunk) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    subscribe()

    function subscribe() {
      stream
        .on('error', _reject)
        .on('end', _resolve)
        .on('data', _data)
    }

    function unsubscribe() {
      stream
        .off('error', _reject)
        .off('end', _resolve)
        .off('data', _data)
    }

    function _reject(err) {
      unsubscribe()
      reject(err)
    }

    function _resolve() {
      unsubscribe()
      resolve()
    }

    function _data(chunk) {
      try {
        callback(chunk)
      } catch (err) {
        _reject(err)
      }
    }
  })
}

// from: https://github.com/sindresorhus/to-readable-stream/blob/main/index.js
export function toReadable(value) {
  return new Readable({
    read() {
      this.push(value)
      this.push(null)
    },
  })
}
