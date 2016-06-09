var dragDrop = require('drag-drop')
var path = require('path')
var debug = require('debug')('hackday-drag-and-drop-poc')
var uploadElement = require('upload-element')
var util = require('./util')
var prettyBytes = require('pretty-bytes')

// Seed via upload input element
var upload = document.querySelector('input[name=upload]')
uploadElement(upload, function (err, files) {
  if (err) return util.error(err)
  files = files.map(function (file) { return file.file })
  onFiles(files)
})

// Seed via drag-and-drop
dragDrop('body', onFiles)

// Warn when leaving and there are no other peers
window.addEventListener('beforeunload', onBeforeUnload)

function seed(files) {
  if (files.length === 0) return
  util.log('found ' + files.length + ' files')

  getClient(function (err, client) {
    if (err) return util.error(err)
    client.seed(files, onTorrent)
  })
}

var getClient = function () {
  debug('getClient')
}

function onFiles (files) {
  debug('got files:')
  files.forEach(function (file) {
    debug(' - %s (%s)', file.name, prettyBytes(file.size))
  })
  seed(files.filter(false))
}

function onBeforeUnload (e) {
  if (!e) e = window.event

  if (e) e.returnValue = message // IE, Firefox
  return message // Safari, Chrome
}

function onTorrent (torrent) {
  torrent.on('warning', util.warning)
  torrent.on('error', util.error)

  upload.value = upload.defaultValue // reset upload element

  util.log('"' + torrent.name + '" contains ' + torrent.files.length + ' files:')
  torrent.files.forEach(function (file) {
    util.log('&nbsp;&nbsp;- ' + file.name + ' (' + prettyBytes(file.length) + ')')
  })
}