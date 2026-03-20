import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import request from '../utils/request'
import { useAuth } from '../context/useAuth'

function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (values) => {
    setLoading(true)

    try {
      if (isRegister) {
        await request.post('/api/user/register', values)
        message.success('注册成功，请登录')
        setIsRegister(false)
      } else {
        const res = await request.post('/api/user/login', values)
        login(res.data.token, res.data.userInfo.username)
        message.success('登录成功')
        navigate('/articles')
      }
    } catch (err) {
      const msg = err.response?.data?.message || '操作失败'
      message.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center pt-20">
      <Card
        className="w-96 shadow-md"
        title={<div className="text-center text-xl">{isRegister ? '注册' : '登录'}</div>}
      >
        <Form onFinish={handleSubmit} size="large">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="用户名" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {isRegister ? '注册' : '登录'}
            </Button>
          </Form.Item>

          <div className="text-center text-sm text-gray-500">
            {isRegister ? '已有账号？' : '没有账号？'}
            <button
              type="button"
              className="text-blue-500 underline cursor-pointer border-none bg-transparent text-sm"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? '去登录' : '去注册'}
            </button>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default Login
