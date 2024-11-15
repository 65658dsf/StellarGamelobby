// 创建获取隧道信息的API函数
export async function getUserTunnels(token) {
  try {
    const response = await fetch('https://api.stellarfrp.top/GetUserTunnel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });
    
    const data = await response.json();
    
    if (data.code === 200) {
      // 将隧道数据转换为更易用的格式
      const tunnels = Object.entries(data.tunnel).map(([proxy_name, info]) => ({
        proxy_name,
        link: info.link,
        node_name: info.node_name
      }));
      return tunnels;
    } else {
      throw new Error(data.msg || '获取隧道信息失败');
    }
  } catch (error) {
    console.error('获取隧道列表失败:', error);
    throw error;
  }
} 