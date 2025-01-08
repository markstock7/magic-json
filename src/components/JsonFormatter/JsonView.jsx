import { useState, useEffect } from 'react'

const JsonView = ({ data, globalExpanded }) => {
  const [expanded, setExpanded] = useState(true)

  // 响应全局展开状态变化
  useEffect(() => {
    setExpanded(globalExpanded)
  }, [globalExpanded])

  // 复制功能
  const copyToClipboard = (value) => {
    navigator.clipboard.writeText(JSON.stringify(value, null, 2))
  }

  const renderValue = (value) => {
    if (value === null) return <SimpleValue value="null" className="text-gray-500" />
    if (typeof value === 'boolean') return <SimpleValue value={String(value)} className="text-orange-600" />
    if (typeof value === 'number') return <SimpleValue value={value} className="text-blue-600" />
    if (typeof value === 'string') return <SimpleValue value={`"${value}"`} className="text-green-600" />
    if (Array.isArray(value)) return <JsonArray data={value} parentExpanded={expanded} />
    if (typeof value === 'object') return <JsonObject data={value} parentExpanded={expanded} />
    return String(value)
  }

  // 简单类型的值组件（带行高亮）
  const SimpleValue = ({ value, className }) => {
    const [showCopyTip, setShowCopyTip] = useState(false)
    const [isCopied, setIsCopied] = useState(false)

    const handleCopy = (e) => {
      e.stopPropagation()
      navigator.clipboard.writeText(String(value))
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 1500)
    }

    return (
      <span
        className="group/item relative inline-flex items-center"
        onMouseEnter={() => setShowCopyTip(true)}
        onMouseLeave={() => setShowCopyTip(false)}
      >
        <span className={`${className} relative -mx-1 px-1 rounded group-hover/item:bg-yellow-50`}>
          {value}
        </span>
        {showCopyTip && (
          <button
            onClick={handleCopy}
            className="ml-2 p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover/item:opacity-100 transition-opacity"
            title="复制值"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          </button>
        )}
        {isCopied && (
          <div className="absolute right-0 top-0 translate-x-full ml-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
            已复制
          </div>
        )}
      </span>
    )
  }

  const JsonObject = ({ data, parentExpanded }) => {
    const [isExpanded, setIsExpanded] = useState(parentExpanded)
    const [showCopyTip, setShowCopyTip] = useState(false)
    const [isCopied, setIsCopied] = useState(false)
    
    useEffect(() => {
      setIsExpanded(parentExpanded)
    }, [parentExpanded])

    const toggleExpand = (e) => {
      e.stopPropagation()
      setIsExpanded(!isExpanded)
    }

    const handleCopy = (e) => {
      e.stopPropagation()
      copyToClipboard(data)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 1500)
    }

    if (Object.keys(data).length === 0) return '{}'

    return (
      <div 
        className="group/object relative"
        onMouseEnter={() => setShowCopyTip(true)}
        onMouseLeave={() => setShowCopyTip(false)}
      >
        <div className="flex items-start">
          <div className="flex-grow">
            <div className="group/line relative hover:bg-yellow-50 rounded flex items-center">
              <span 
                className="cursor-pointer select-none"
                onClick={toggleExpand}
              >
                {isExpanded ? '▼' : '▶'} {'{'}
              </span>
              {!isExpanded && <span className="text-gray-500 ml-1">{'... }'}</span>}
              {showCopyTip && (
                <button
                  onClick={handleCopy}
                  className="ml-2 p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover/line:opacity-100 transition-opacity flex-shrink-0"
                  title="复制对象"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              )}
            </div>
            
            {isExpanded && (
              <>
                <div className="ml-4 border-l-2 border-gray-200 pl-2">
                  {Object.entries(data).map(([key, value], index) => (
                    <div key={key} className="group/line relative hover:bg-yellow-50 rounded flex items-center">
                      <div className="flex-grow">
                        <span className="text-purple-600">"{key}"</span>: {renderValue(value)}
                        {index < Object.keys(data).length - 1 && ','}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="group/line relative hover:bg-yellow-50 rounded">
                  {'}'}
                </div>
              </>
            )}
          </div>
        </div>
        {isCopied && (
          <div className="absolute right-0 top-0 translate-x-full ml-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
            已复制
          </div>
        )}
      </div>
    )
  }

  const JsonArray = ({ data, parentExpanded }) => {
    const [isExpanded, setIsExpanded] = useState(parentExpanded)
    const [showCopyTip, setShowCopyTip] = useState(false)
    const [isCopied, setIsCopied] = useState(false)
    
    useEffect(() => {
      setIsExpanded(parentExpanded)
    }, [parentExpanded])

    const toggleExpand = (e) => {
      e.stopPropagation()
      setIsExpanded(!isExpanded)
    }

    const handleCopy = (e) => {
      e.stopPropagation()
      copyToClipboard(data)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 1500)
    }

    if (data.length === 0) return '[]'

    return (
      <div 
        className="group/array relative"
        onMouseEnter={() => setShowCopyTip(true)}
        onMouseLeave={() => setShowCopyTip(false)}
      >
        <div className="flex items-start">
          <div className="flex-grow">
            <div className="group/line relative hover:bg-yellow-50 rounded flex items-center">
              <span 
                className="cursor-pointer select-none"
                onClick={toggleExpand}
              >
                {isExpanded ? '▼' : '▶'} {'['}
              </span>
              {!isExpanded && <span className="text-gray-500 ml-1">{'... ]'}</span>}
              {showCopyTip && (
                <button
                  onClick={handleCopy}
                  className="ml-2 p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover/line:opacity-100 transition-opacity flex-shrink-0"
                  title="复制数组"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              )}
            </div>
            
            {isExpanded && (
              <>
                <div className="ml-4 border-l-2 border-gray-200 pl-2">
                  {data.map((value, index) => (
                    <div key={index} className="group/line relative hover:bg-yellow-50 rounded flex items-center">
                      <div className="flex-grow">
                        {renderValue(value)}
                        {index < data.length - 1 && ','}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="group/line relative hover:bg-yellow-50 rounded">
                  {']'}
                </div>
              </>
            )}
          </div>
        </div>
        {isCopied && (
          <div className="absolute right-0 top-0 translate-x-full ml-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
            已复制
          </div>
        )}
      </div>
    )
  }

  return renderValue(data)
}

export default JsonView 