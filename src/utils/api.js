const BASE_URL = 'https://api.stellarfrp.top'

export async function request(endpoint, options = {}) {
  const { method = 'GET', data } = options
  
  // 从 localStorage 获取 token
  const token = localStorage.getItem('token')
  
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  }

  // 所有请求都带上 token
  const requestData = {
    ...data,
    token
  }

  if (method === 'POST') {
    config.body = JSON.stringify(requestData)
  } else {
    endpoint = `${endpoint}${endpoint.includes('?') ? '&' : '?'}token=${token}`
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config)
    const responseData = await response.json()

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