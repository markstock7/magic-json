import { useState } from 'react'
import JsonFormatter from './components/JsonFormatter'
import JsonCompare from './components/JsonCompare'
import JsonMock from './components/JsonMock'
import JsonDiff from './components/JsonDiff'

function App() {
  const [activeTab, setActiveTab] = useState('formatter')

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">JSON工具箱</h1>
              </div>
              <div className="flex space-x-4">
                <button 
                  className={`px-3 py-2 ${activeTab === 'formatter' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                  onClick={() => setActiveTab('formatter')}
                >
                  JSON格式化
                </button>
                <button 
                  className={`px-3 py-2 ${activeTab === 'compare' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                  onClick={() => setActiveTab('compare')}
                >
                  JSON对比
                </button>
                <button 
                  className={`px-3 py-2 ${activeTab === 'mock' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                  onClick={() => setActiveTab('mock')}
                >
                  JSON生成
                </button>
                <button 
                  className={`px-3 py-2 ${activeTab === 'diff' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                  onClick={() => setActiveTab('diff')}
                >
                  JSON差异
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'formatter' && <JsonFormatter />}
        {activeTab === 'compare' && <JsonCompare />}
        {activeTab === 'mock' && <JsonMock />}
        {activeTab === 'diff' && <JsonDiff />}
      </main>
    </div>
  )
}

export default App
