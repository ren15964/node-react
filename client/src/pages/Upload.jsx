import { useState } from 'react'
import { Upload as AntUpload, Button, Card, message, Image, List } from 'antd'
import { UploadOutlined, InboxOutlined } from '@ant-design/icons'

const BASE_URL = 'http://localhost:3000'

function Upload() {
  const [fileList, setFileList] = useState([])

  const token = localStorage.getItem('token')

  const uploadProps = {
    name: 'file',
    action: BASE_URL + '/api/upload',
    headers: {
      Authorization: 'Bearer ' + token
    },
    accept: 'image/jpeg,image/png,image/gif,image/webp',
    beforeUpload: (file) => {
      const isImage = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)
      if (!isImage) {
        message.error('只能上传 JPG、PNG、GIF、WEBP 格式的图片')
        return false
      }

      const isLt5M = file.size / 1024 / 1024 < 5
      if (!isLt5M) {
        message.error('图片大小不能超过 5MB')
        return false
      }

      return true
    },
    onChange: (info) => {
      setFileList(info.fileList)

      if (info.file.status === 'done') {
        const res = info.file.response
        if (res.code === 200) {
          message.success('上传成功')
        } else {
          message.error(res.message || '上传失败')
        }
      } else if (info.file.status === 'error') {
        message.error('上传失败')
      }
    }
  }

  // 获取已上传成功的图片列表
  const uploadedFiles = fileList
    .filter((f) => f.status === 'done' && f.response?.code === 200)
    .map((f) => ({
      url: BASE_URL + f.response.data.url,
      name: f.name,
      size: f.response.data.size
    }))

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">文件上传</h2>

      <Card className="mb-6">
        <AntUpload.Dragger {...uploadProps} fileList={fileList}>
          <p className="text-4xl text-gray-300 mb-2">
            <InboxOutlined />
          </p>
          <p className="text-base text-gray-600">点击或拖拽图片到此区域上传</p>
          <p className="text-sm text-gray-400 mt-1">支持 JPG、PNG、GIF、WEBP 格式，最大 5MB</p>
        </AntUpload.Dragger>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card title="已上传的图片">
          <div className="grid grid-cols-3 gap-4">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="text-center">
                <Image src={file.url} width={200} height={150} className="object-cover rounded" />
                <div className="text-sm text-gray-500 mt-2">{file.name}</div>
                <div className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default Upload
