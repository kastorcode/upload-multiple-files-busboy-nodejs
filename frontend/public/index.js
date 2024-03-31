const API_URL = 'http://localhost:3000'
const ON_UPLOAD_EVENT = 'file-uploaded'

let bytesAmount = 0


function configureForm (targetUrl) {
  const form = document.getElementById('form')
  form.action = targetUrl
}


function formatBytes (bytes, decimals = 2) {
  if (bytes === 0) return '0 bytes'
  const k = 1024
  const ds = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (parseFloat((bytes / Math.pow(k, i)).toFixed(ds)) + ' ' + sizes[i])
}


function showMessage () {
  const urlParams = new URLSearchParams(window.location.search)
  const message = urlParams.get('message')
  if (!message) return
  updateMessage(message)
}


function showSize () {
  const files = Array.from(document.getElementById('files').files)
  if (!files.length) return
  const { size } = files.reduce((previous, next) =>
    ({ size: previous.size + next.size }), { size: 0 })
  bytesAmount = size
  updateStatus(size)
}


function updateMessage (message) {
  const element = document.getElementById('message')
  element.classList.add('alert', 'alert-success')
  element.innerText = message
  setTimeout(() => {
    element.hidden = true
  }, 3000)
}


function updateStatus (size) {
  const text = `Pending bytes to upload: <strong>${formatBytes(size)}</strong>`
  document.getElementById('size').innerHTML = text
}


window.onload = function () {
  showMessage()
  const ioClient = io.connect(API_URL, { withCredentials: false })
  ioClient.on('connect', message => {
    console.log('Connected', ioClient.id)
    const targetUrl = `${API_URL}/?socketId=${ioClient.id}`
    configureForm(targetUrl)
  })
  ioClient.on(ON_UPLOAD_EVENT, bytesReceived => {
    bytesAmount -= bytesReceived
    updateStatus(bytesAmount)
  })
  updateStatus(0)
}