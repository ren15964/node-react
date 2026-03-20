import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Space, Input, Popconfirm, message, Tag } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import request from '../utils/request'
import { useAuth } from '../context/useAuth'

function Articles() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()

  const fetchArticles = async (page = 1, pageSize = 10, search = keyword) => {
    setLoading(true)
    try {
      const res = await request.get('/api/articles', {
        params: { page, pageSize, keyword: search }
      })
      setArticles(res.data.list)
      setPagination({
        current: res.data.pagination.page,
        pageSize: res.data.pagination.pageSize,
        total: res.data.pagination.total
      })
    } catch (err) {
      message.error('获取文章列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await request.delete('/api/articles/' + id)
      message.success('删除成功')
      fetchArticles(pagination.current, pagination.pageSize)
    } catch (err) {
      message.error(err.response?.data?.message || '删除失败')
    }
  }

  const handleSearch = () => {
    fetchArticles(1, pagination.pageSize, keyword)
  }

  const handleTableChange = (pag) => {
    fetchArticles(pag.current, pag.pageSize)
  }

  useEffect(() => {
    fetchArticles()
  }, [])

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60
    },
    {
      title: '标题',
      dataIndex: 'title',
      render: (text, record) => (
        <span
          className="text-blue-500 cursor-pointer hover:underline"
          onClick={() => navigate('/articles/edit/' + record.id)}
        >
          {text}
        </span>
      )
    },
    {
      title: '内容摘要',
      dataIndex: 'content',
      render: (text) => (
        <span className="text-gray-500 text-sm">
          {text && text.length > 50 ? text.slice(0, 50) + '...' : text || '-'}
        </span>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      width: 180,
      render: (text) => (
        <Tag color="blue">
          {new Date(text).toLocaleDateString('zh-CN')}
        </Tag>
      )
    },
    {
      title: '操作',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate('/articles/edit/' + record.id)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除这篇文章吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">文章列表</h2>

        <Space>
          <Input
            placeholder="搜索文章标题"
            prefix={<SearchOutlined className="text-gray-400" />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            className="w-60"
          />
          <Button onClick={handleSearch}>搜索</Button>
          {isLoggedIn && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/articles/new')}
            >
              写文章
            </Button>
          )}
        </Space>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <Table
          columns={columns}
          dataSource={articles}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </div>
    </div>
  )
}

export default Articles