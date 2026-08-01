import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const viewPwd = process.env.VIEW_PASSWORD || '123456';
  const adminPwd = process.env.ADMIN_PASSWORD || 'admin123';

  try {
    if (req.method === 'POST') {
      const { password, adminPassword, content } = req.body;

      // 管理员保存内容
      if (adminPassword !== undefined) {
        if (adminPassword !== adminPwd) {
          return res.status(403).json({ success: false, message: '管理员密码错误' });
        }
        const data = {
          content: content || '',
          title: '在线文本信箱',
          updateTime: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
        };
        await kv.set('mailbox_data', data);
        return res.status(200).json({ success: true, message: '保存成功' });
      }

      // 普通用户查看内容
      if (password !== undefined) {
        if (password !== viewPwd) {
          return res.status(403).json({ success: false, message: '查看密码错误' });
        }
        const data = await kv.get('mailbox_data');
        const result = data || {
          title: '在线文本信箱',
          content: '欢迎使用，请管理员编辑内容。',
          updateTime: ''
        };
        return res.status(200).json({ success: true, data: result });
      }

      return res.status(400).json({ success: false, message: '参数错误' });
    }

    return res.status(200).json({ success: true, needPassword: true });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, message: '服务器错误，请检查KV配置' });
  }
}
