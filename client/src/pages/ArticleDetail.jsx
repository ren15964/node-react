import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, Descriptions, message, Space, Spin, Tag } from 'antd'
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons'
import request from '../utils/request'
import { useAuth } from '../context/useAuth'

const statusMap = {
  draft: { color: 'orange', text: '草稿' },
  published: { color: 'green', text: '已发布' }
}

function ArticleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { userInfo } = useAuth()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true)

      try {
        const res = await request.get('/api/articles/' + id)
        setArticle(res.data)
      } catch (err) {
        message.error(err.response?.data?.message || '加载文章详情失败')
        navigate('/articles', { replace: true })
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [id, navigate])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spin size="large" tip="正在加载文章详情..." />
      </div>
    )
  }

  if (!article) {
    return null
  }

  const isOwner = userInfo?.id === article.author_id
  const currentStatus = statusMap[article.status] || { color: 'default', text: article.status || '未知' }

  return (
    <div>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/articles')}
        className="mb-4 px-0 text-gray-500"
      >
        返回列表
      </Button>

      <Card
        title={<span className="text-xl font-semibold">{article.title}</span>}
        extra={
          isOwner ? (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate('/articles/edit/' + article.id)}
            >
              编辑文章
            </Button>
          ) : null
        }
      >
        <Space className="mb-6" wrap>
          <Tag color={currentStatus.color}>{currentStatus.text}</Tag>
          <Tag color="geekblue">分类：{article.category_name || '未分类'}</Tag>
          <Tag color="blue">作者：{article.author_name || '未知作者'}</Tag>
          <Tag color="default">创建时间：{new Date(article.created_at).toLocaleString('zh-CN')}</Tag>
          {isOwner && <Tag color="green">这是你的文章</Tag>}
        </Space>

        <div className="mb-6">
          <div className="mb-2 text-sm font-medium text-gray-600">文章标签</div>
          <Space size={[6, 6]} wrap>
            {(article.tags || []).length > 0 ? (
              article.tags.map((tag) => <Tag key={tag.id}>{tag.name}</Tag>)
            ) : (
              <span className="text-sm text-gray-400">暂无标签</span>
            )}
          </Space>
        </div>

        <Descriptions column={1} bordered size="small" className="mb-6">
          <Descriptions.Item label="文章 ID">{article.id}</Descriptions.Item>
          <Descriptions.Item label="作者 ID">{article.author_id}</Descriptions.Item>
          <Descriptions.Item label="分类 Slug">{article.category_slug || '-'}</Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {new Date(article.updated_at).toLocaleString('zh-CN')}
          </Descriptions.Item>
        </Descriptions>

        <div className="whitespace-pre-wrap rounded-lg bg-gray-50 p-5 leading-8 text-gray-700">
          {article.content || '这篇文章还没有填写正文内容。'}
        </div>
      </Card>
    </div>
  )
}

export default ArticleDetail
