// 计算字符串的字节大小
const getByteSize = (str) => {
  return new Blob([str]).size;
}

// 分析JSON的函数
const analyzeJson = (obj, depth = 0) => {
  let stats = {
    depth: depth,
    keyCount: 0,
    arrayCount: 0,
    objectCount: 0,
    byteSize: 0
  }

  if (Array.isArray(obj)) {
    stats.arrayCount++
    obj.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        const childStats = analyzeJson(item, depth + 1)
        stats = {
          depth: Math.max(stats.depth, childStats.depth),
          keyCount: stats.keyCount + childStats.keyCount,
          arrayCount: stats.arrayCount + childStats.arrayCount,
          objectCount: stats.objectCount + childStats.objectCount,
          byteSize: stats.byteSize + childStats.byteSize
        }
      } else if (typeof item === 'string') {
        stats.byteSize += getByteSize(item)
      }
    })
  } else if (typeof obj === 'object' && obj !== null) {
    stats.objectCount++
    const keys = Object.keys(obj)
    stats.keyCount += keys.length
    
    // 计算键名的字节大小
    keys.forEach(key => {
      stats.byteSize += getByteSize(key)
    })
    
    Object.values(obj).forEach(value => {
      if (typeof value === 'object' && value !== null) {
        const childStats = analyzeJson(value, depth + 1)
        stats = {
          depth: Math.max(stats.depth, childStats.depth),
          keyCount: stats.keyCount + childStats.keyCount,
          arrayCount: stats.arrayCount + childStats.arrayCount,
          objectCount: stats.objectCount + childStats.objectCount,
          byteSize: stats.byteSize + childStats.byteSize
        }
      } else if (typeof value === 'string') {
        stats.byteSize += getByteSize(value)
      }
    })
  }

  return stats
}

// 格式化字节大小显示
const formatByteSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 监听主线程消息
self.addEventListener('message', (e) => {
  try {
    const jsonString = e.data
    const parsedJson = JSON.parse(jsonString)
    const formatted = JSON.stringify(parsedJson, null, 2)
    const analysis = analyzeJson(parsedJson)
    const totalBytes = getByteSize(jsonString)
    
    // 发送结果回主线程
    self.postMessage({
      success: true,
      data: {
        formatted,
        stats: {
          size: jsonString.length,
          ...analysis,
          byteSize: totalBytes,
          formattedByteSize: formatByteSize(totalBytes)
        }
      }
    })
  } catch (err) {
    self.postMessage({
      success: false,
      error: err.message
    })
  }
}) 