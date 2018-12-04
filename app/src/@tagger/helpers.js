export const isVideo = (media) => {
  let isVideo = false
  Array.from(['mkv', 'avi', 'mp4']).forEach((extension) => {
    const ext = media.split('.')[1]
    if (!isVideo && ext.includes(extension)) {
      isVideo = true
    }
  })

  return isVideo
}

export const isImage = (media) => {
  let isImage = false
  Array.from(['jpg', 'png', 'jpeg', 'gif', 'tiff']).forEach((extension) => {
    const ext = media.split('.')[1]
    if (!isImage && ext.includes(extension)) {
      isImage = true
    }
  })

  return isImage
}

export const stringHash = (v) => {
  var hash = 0, i, chr
  if (v.length === 0) return hash
  for (i = 0; i < v.length; i++) {
    chr   = v.charCodeAt(i)
    hash  = ((hash << 5) - hash) + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}