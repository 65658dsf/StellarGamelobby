const BASE_URL = 'https://api.stellarfrp.top'

export async function request(endpoint, options = {}) {
  try {
    const { method = 'GET', data } = options
    
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    
    // 简化请求头，只保留必要的
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors',  // 明确指定 CORS 模式
      credentials: 'omit'  // 不发送 cookies
    }

    // 构建请求数据
    const requestData = {
      token,
      ...data
    }

    if (method === 'POST') {
      config.body = JSON.stringify(requestData)
    }

    // 添加请求日志
    console.log('Request:', {
      url: `${BASE_URL}${endpoint}`,
      method,
      data: requestData
    })

    const response = await fetch(`${BASE_URL}${endpoint}`, config)
    const responseData = await response.json()

    // 添加响应日志
    console.log('Response:', responseData)

    if (responseData.code !== 200) {
      throw new Error(responseData.msg || '请求失败')
    }

    return responseData
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

export const api = {
  // 认证相关
  auth: {
    login: (credentials) => request('/login', {
      method: 'POST',
      data: credentials
    }),
    
    getUserInfo: () => request('/GetUserInfo', {
      method: 'POST'
    })
  },
  
  // 房间相关
  rooms: {
    create: (roomData) => request('/CreateGameRoom', {
      method: 'POST',
      data: roomData
    }),
    
    join: (roomId) => request('/JoinGameRoom', {
      method: 'POST',
      data: { roomId }
    }),
    
    list: () => request('/GetGameRooms', {
      method: 'POST'
    }),
    
    delete: (roomId) => request('/DeleteGameRoom', {
      method: 'POST',
      data: { roomId }
    }),
    
    verifyPassword: (data) => request('/VerifyRoomPassword', {
      method: 'POST',
      data
    })
  }
} 