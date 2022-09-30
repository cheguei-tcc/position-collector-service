import ws from 'k6/ws'
import { check } from 'k6'

export default function () {
  const url = 'ws://echo.websocket.org'
  const params = { tags: { my_tag: 'hello' } }

  const res = ws.connect(url, params, function (socket) {
    socket.on('open', function open () {
      // ...
    })

    socket.on('error', function (e) {
      if (e.error() !== 'websocket: close sent') {
        console.log('An unexpected error occured: ', e.error())
      }
    })
  })

  check(res, { 'status is 101': (r) => r && r.status === 101 })
}
