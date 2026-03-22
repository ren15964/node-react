import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Space, Input, Popconfirm, message, Tag, Typography, Select } from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons'
import request from '../utils/request'
import { useAuth } from '../context/useAuth'
import { fetchCategories } from '../api/category'

const statusMap = {
  draft: { color: 'orange', text: '草稿' },
  published: { color: 'green', text: '已发布' }
}

const getDefaultStatus = (isLoggedIn) => (isLoggedIn ? 'all' : 'published')

function Articles() {
  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState('published')
  const [categoryFilter, setCategoryFilter] = useState()
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const navigate = useNavigate()
  const { isLoggedIn, isInitializing, userInfo } = useAuth()

  const loadCategories = async () => {
    try {
      const res = await fetchCategories()
      setCategories(res.data)
    } catch (err) {
      message.error(err.response?.data?.message || '获取分类列表失败')
    }
  }

  const fetchArticles = async (
    page = 1,
    pageSize = 10,
    search = keyword,
    status = statusFilter,
    categoryId = categoryFilter
  ) => {
    setLoading(true)

    try {
      const params = { page, pageSize, keyword: search, status }

      if (categoryId) {
        params.categoryId = categoryId
      }

      const res = await request.get('/api/articles', { params })

      setArticles(res.data.list)
      setPagination({
        current: res.data.pagination.page,
        pageSize: res.data.pagination.pageSize,
        total: res.data.pagination.total
      })
    } catch (err) {
      message.error(err.response?.data?.message || '获取文章列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await request.delete('/api/articles/' + id)
      message.success('删除成功')
      fetchArticles(pagination.current, pagination.pageSize, keyword, statusFilter, categoryFilter)
    } catch (err) {
      message.error(err.response?.data?.message || '删除失败')
    }
  }

  const handleSearch = () => {
    fetchArticles(1, pagination.pageSize, keyword, statusFilter, categoryFilter)
  }

  const handleStatusChange = (value) => {
    setStatusFilter(value)
    fetchArticles(1, pagination.pageSize, keyword, value, categoryFilter)
  }

  const handleCategoryChange = (value) => {
    setCategoryFilter(value)
    fetchArticles(1, pagination.pageSize, keyword, statusFilter, value)
  }

  const handleTableChange = (pag) => {
    fetchArticles(pag.current, pag.pageSize, keyword, statusFilter, categoryFilter)
  }

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (isInitializing) {
      return
    }

    const defaultStatus = getDefaultStatus(isLoggedIn)

    if (statusFilter !== defaultStatus) {
      setStatusFilter(defaultStatus)
      fetchArticles(1, pagination.pageSize, keyword, defaultStatus, categoryFilter)
      return
    }

    fetchArticles(1, pagination.pageSize, keyword, defaultStatus, categoryFilter)
  }, [isInitializing, isLoggedIn])

  const statusOptions = isLoggedIn
    ? [
        { label: '全部状态', value: 'all' },
        { label: '已发布', value: 'published' },
        { label: '草稿', value: 'draft' }
      ]
    : [{ label: '已发布', value: 'published' }]

  const categoryOptions = [
    { label: '全部分类', value: '' },
    ...categories.map((category) => ({
      label: category.name,
      value: category.id
    }))
  ]

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
        <Typography.Link onClick={() => navigate('/articles/' + record.id)}>{text}</Typography.Link>
      )
    },
    {
      title: '分类',
      dataIndex: 'category_name',
      width: 130,
      render: (text) => <Tag color="geekblue">{text || '未分类'}</Tag>
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (status) => {
        const currentStatus = statusMap[status] || { color: 'default', text: status || '未知' }
        return <Tag color={currentStatus.color}>{currentStatus.text}</Tag>
      }
    },
    {
      title: '作者',
      dataIndex: 'author_name',
      width: 170,
      render: (text, record) => (
        <Space size="small">
          <span>{text || '未知作者'}</span>
          {userInfo?.id === record.author_id && <Tag color="blue">我的文章</Tag>}
        </Space>
      )
    },
    {
      title: '内容摘要',
      dataIndex: 'content',
      render: (text) => (
        <span className="text-sm text-gray-500">
          {text && text.length > 50 ? text.slice(0, 50) + '...' : text || '-'}
        </span>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      width: 180,
      render: (text) => <Tag color="blue">{new Date(text).toLocaleDateString('zh-CN')}</Tag>
    },
    {
      title: '操作',
      width: 220,
      render: (_, record) => {
        const isOwner = userInfo?.id === record.author_id

        return (
          <Space>
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate('/articles/' + record.id)}
            >
              查看
            </Button>

            {isOwner ? (
              <>
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
              </>
            ) : (
              <span className="text-sm text-gray-400">仅作者可编辑</span>
            )}
          </Space>
        )
      }
    }
  ]

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">文章列表</h2>

        <Space wrap>
          <Input
            placeholder="搜索文章标题"
            prefix={<SearchOutlined className="text-gray-400" />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            className="w-60"
          />
          <Select
            value={statusFilter}
            options={statusOptions}
            onChange={handleStatusChange}
            className="w-32"
          />
          <Select
            value={categoryFilter ?? ''}
            options={categoryOptions}
            onChange={handleCategoryChange}
            className="w-36"
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

      <div className="rounded-lg bg-white shadow-sm">
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
