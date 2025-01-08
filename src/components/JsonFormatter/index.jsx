import { useState, useCallback, useEffect } from 'react'
import JsonView from './JsonView'

function JsonFormatter() {
  const [inputJson, setInputJson] = useState('')
  const [parsedJson, setParsedJson] = useState(null)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    size: 0,
    depth: 0,
    keyCount: 0,
    arrayCount: 0,
    objectCount: 0,
    byteSize: 0,
    formattedByteSize: '0 Bytes'
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [worker, setWorker] = useState(null)
  const [isAllExpanded, setIsAllExpanded] = useState(true)
  const [sortDirection, setSortDirection] = useState(null)
  const [originalJson, setOriginalJson] = useState(null)

  // 初始化 worker
  useEffect(() => {
    const jsonWorker = new Worker(new URL('../../workers/jsonWorker.js', import.meta.url))
    
    jsonWorker.onmessage = (e) => {
      const { success, data, error: workerError } = e.data
      setIsProcessing(false)

      if (success) {
        const parsed = JSON.parse(data.formatted)
        setParsedJson(parsed)
        setOriginalJson(parsed)
        setStats(data.stats)
        setError('')
      } else {
        setError('无效的JSON格式: ' + workerError)
        setParsedJson(null)
        setOriginalJson(null)
      }
    }

    setWorker(jsonWorker)

    return () => {
      jsonWorker.terminate()
    }
  }, [])

  const formatJson = useCallback(() => {
    if (!inputJson.trim()) {
      setError('请输入JSON字符串')
      setParsedJson(null)
      setStats({
        size: 0,
        depth: 0,
        keyCount: 0,
        arrayCount: 0,
        objectCount: 0,
        byteSize: 0,
        formattedByteSize: '0 Bytes'
      })
      return
    }

    setIsProcessing(true)
    worker?.postMessage(inputJson)
  }, [inputJson, worker])

  const copyToClipboard = () => {
    if (parsedJson) {
      navigator.clipboard.writeText(JSON.stringify(parsedJson, null, 2))
    }
  }

  const clearContent = () => {
    setInputJson('')
    setParsedJson(null)
    setOriginalJson(null)
    setError('')
    setSortDirection(null)
    setStats({
      size: 0,
      depth: 0,
      keyCount: 0,
      arrayCount: 0,
      objectCount: 0,
      byteSize: 0,
      formattedByteSize: '0 Bytes'
    })
  }

  const sortJson = (direction) => {
    if (!parsedJson) return
    
    if (direction === null) {
      setParsedJson(JSON.parse(JSON.stringify(originalJson)))
      setSortDirection(null)
      return
    }
    
    const sortObject = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map(item => {
          if (item && typeof item === 'object') {
            return sortObject(item)
          }
          return item
        })
      }
      
      if (obj && typeof obj === 'object') {
        const sorted = {}
        const keys = Object.keys(obj)
        
        keys.sort((a, b) => {
          if (direction === 'asc') {
            return a.localeCompare(b)
          }
          return b.localeCompare(a)
        })
        
        keys.forEach(key => {
          const value = obj[key]
          sorted[key] = value && typeof value === 'object' ? sortObject(value) : value
        })
        
        return sorted
      }
      
      return obj
    }

    const sortedJson = sortObject(parsedJson)
    setParsedJson(sortedJson)
    setSortDirection(direction)
  }

  return (
    <div className="min-w-[1024px] h-screen flex flex-col">
      {/* 顶部工具栏 */}
      <div className="bg-white shadow-sm flex-shrink-0">
        {/* 主要操作区 */}
        <div className="p-4 border-b flex items-center space-x-4">
          <button
            className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center`}
            onClick={formatJson}
            disabled={isProcessing}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            {isProcessing ? '处理中...' : '格式化'}
          </button>

          <button
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 flex items-center"
            onClick={copyToClipboard}
            disabled={!parsedJson}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            复制
          </button>
          
          <button
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 flex items-center"
            onClick={clearContent}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            清空
          </button>

          {/* JSON分析结果 */}
          {!error && parsedJson && (
            <div className="ml-auto flex space-x-6 text-sm text-gray-500">
              <div>字符数：{stats.size}</div>
              <div>大小：{stats.formattedByteSize}</div>
              <div>最大深度：{stats.depth}</div>
              <div>键值对：{stats.keyCount}</div>
              <div>数组数量：{stats.arrayCount}</div>
              <div>对象数量：{stats.objectCount}</div>
            </div>
          )}
        </div>

        {/* JSON工具栏 - 仅在有数据时显示 */}
        {parsedJson && (
          <div className="px-4 py-2 flex items-center space-x-6 border-b bg-gray-50">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">视图：</span>
              <div className="flex rounded-lg overflow-hidden border border-gray-200">
                <button
                  className={`px-3 py-1.5 text-sm flex items-center ${
                    isAllExpanded
                      ? 'bg-white text-gray-700 shadow-sm'
                      : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsAllExpanded(true)}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  展开
                </button>
                <button
                  className={`px-3 py-1.5 text-sm flex items-center ${
                    !isAllExpanded
                      ? 'bg-white text-gray-700 shadow-sm'
                      : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsAllExpanded(false)}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  折叠
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">排序：</span>
              <div className="flex rounded-lg overflow-hidden border border-gray-200">
                <button
                  className={`px-3 py-1.5 text-sm flex items-center ${
                    sortDirection === 'asc'
                      ? 'bg-white text-gray-700 shadow-sm'
                      : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => sortJson('asc')}
                >
                  升序
                </button>
                <button
                  className={`px-3 py-1.5 text-sm flex items-center ${
                    sortDirection === 'desc'
                      ? 'bg-white text-gray-700 shadow-sm'
                      : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => sortJson('desc')}
                >
                  降序
                </button>
                <button
                  className={`px-3 py-1.5 text-sm flex items-center ${
                    sortDirection === null
                      ? 'bg-white text-gray-700 shadow-sm'
                      : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => sortJson(null)}
                >
                  默认
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 flex overflow-hidden p-4 space-x-4 bg-gray-100">
        <div className="flex-1 min-w-[450px] flex flex-col">
          <textarea
            className="w-full flex-1 p-4 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
            placeholder="请输入JSON字符串..."
          />
        </div>
        <div className="flex-1 min-w-[450px] flex flex-col">
          <div className="w-full flex-1 p-4 font-mono text-sm bg-white border rounded-lg overflow-auto">
            {error ? (
              <span className="text-red-500">{error}</span>
            ) : isProcessing ? (
              <span className="text-gray-500">处理中...</span>
            ) : parsedJson ? (
              <JsonView data={parsedJson} globalExpanded={isAllExpanded} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default JsonFormatter 