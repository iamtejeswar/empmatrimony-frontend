// src/pages/ChatPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import api from '../services/api';
import { MessageCircle, Send, Loader2, User, ArrowLeft, Circle } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'https://empmatrimony-backend-production.up.railway.app';

const timeStr = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
const dateStr = (d) => {
  const date = new Date(d);
  const today = new Date();
  const diff = today.toDateString() === date.toDateString();
  if (diff) return 'Today';
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (yesterday.toDateString() === date.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

let socketInstance = null;

function ConversationItem({ conv, isActive, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
        cursor: 'pointer', borderBottom: '1px solid rgba(200,150,45,0.08)',
        background: isActive ? 'rgba(200,150,45,0.12)' : 'transparent',
        transition: 'background 0.2s',
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{
          width: 46, height: 46, borderRadius: '50%', overflow: 'hidden',
          background: conv.other_gender === 'female' ? 'rgba(236,72,153,0.2)' : 'rgba(59,130,246,0.2)',
          border: `2px solid ${conv.other_gender === 'female' ? 'rgba(236,72,153,0.3)' : 'rgba(59,130,246,0.3)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {conv.other_picture
            ? <img src={conv.other_picture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <User size={20} color={conv.other_gender === 'female' ? 'rgba(236,72,153,0.7)' : 'rgba(59,130,246,0.7)'} />}
        </div>
        {conv.unread_count > 0 && (
          <div style={{ position: 'absolute', top: -2, right: -2, background: '#c8962d', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#1a1a00' }}>
            {conv.unread_count > 9 ? '9+' : conv.unread_count}
          </div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
          <span style={{ color: '#f5f0e8', fontSize: 14, fontWeight: conv.unread_count > 0 ? 700 : 500, fontFamily: 'Inter, sans-serif' }}>
            {conv.other_first_name} {conv.other_last_name?.[0]}.
          </span>
          {conv.last_message_at && (
            <span style={{ color: '#9a8f7e', fontSize: 11 }}>{timeStr(conv.last_message_at)}</span>
          )}
        </div>
        <p style={{ color: conv.unread_count > 0 ? '#c8962d' : '#9a8f7e', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {conv.last_message || 'Start a conversation'}
        </p>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [input, setInput] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);
  const socketRef = useRef(null);

  // Init socket
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const socket = io(API_URL, { auth: { token }, transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => console.log('Socket connected'));
    socket.on('connect_error', (err) => console.error('Socket error:', err.message));

    socket.on('message_received', (msg) => {
      setMessages(prev => {
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      // Update last message in conversations list
      setConversations(prev => prev.map(c =>
        c.id === msg.conversation_id
          ? { ...c, last_message: msg.content, last_message_at: msg.created_at,
              unread_count: msg.sender_id !== user.id ? (parseInt(c.unread_count) || 0) + 1 : c.unread_count }
          : c
      ));
    });

    socket.on('user_typing', ({ userId: typingId }) => {
      if (typingId !== user.id) setTypingUsers(prev => new Set([...prev, typingId]));
    });
    socket.on('user_stop_typing', ({ userId: typingId }) => {
      setTypingUsers(prev => { const s = new Set(prev); s.delete(typingId); return s; });
    });
    socket.on('messages_read', ({ conversationId: cId }) => {
      setMessages(prev => prev.map(m => ({ ...m, is_read: true })));
    });
    socket.on('new_message_notification', ({ conversationId: cId }) => {
      fetchConversations();
    });

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);

    return () => {
      socket.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/chat/conversations');
      setConversations(data.data.conversations);
    } catch { toast.error('Failed to load conversations'); }
    finally { setLoadingConvs(false); }
  };

  useEffect(() => { fetchConversations(); }, []);

  // Open conversation from URL param
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find(c => c.id === conversationId);
      if (conv) openConversation(conv);
    }
  }, [conversationId, conversations]);

  const openConversation = async (conv) => {
    if (activeConv?.id === conv.id) return;

    // Leave previous room
    if (activeConv && socketRef.current) {
      socketRef.current.emit('leave_conversation', activeConv.id);
    }

    setActiveConv(conv);
    setLoadingMsgs(true);
    navigate(`/chat/${conv.id}`, { replace: true });

    try {
      const { data } = await api.get(`/chat/conversations/${conv.id}/messages`);
      setMessages(data.data.messages);
      // Clear unread for this conv
      setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread_count: 0 } : c));
    } catch { toast.error('Failed to load messages'); }
    finally { setLoadingMsgs(false); }

    // Join socket room
    if (socketRef.current) {
      socketRef.current.emit('join_conversation', conv.id);
      socketRef.current.emit('mark_read', { conversationId: conv.id });
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !activeConv || !socketRef.current) return;
    socketRef.current.emit('send_message', { conversationId: activeConv.id, content: input.trim() });
    setInput('');
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    socketRef.current.emit('stop_typing', { conversationId: activeConv.id });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!activeConv || !socketRef.current) return;
    socketRef.current.emit('typing', { conversationId: activeConv.id });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socketRef.current?.emit('stop_typing', { conversationId: activeConv.id });
    }, 1500);
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = dateStr(msg.created_at);
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  const showConvList = !isMobile || !activeConv;
  const showChatWindow = !isMobile || activeConv;

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', height: 'calc(100vh - 140px)', display: 'flex', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(200,150,45,0.2)' }}>

      {/* Conversations List */}
      {showConvList && (
        <div style={{ width: isMobile ? '100%' : 320, background: 'rgba(26,26,46,0.9)', borderRight: '1px solid rgba(200,150,45,0.15)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '20px 16px 14px', borderBottom: '1px solid rgba(200,150,45,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <MessageCircle size={20} color="#c8962d" />
              <h2 style={{ color: '#f0c050', fontSize: 18, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif" }}>Messages</h2>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingConvs ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <Loader2 size={28} color="#c8962d" style={{ animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            ) : conversations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', color: '#9a8f7e' }}>
                <MessageCircle size={40} color="rgba(200,150,45,0.3)" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontSize: 14 }}>No conversations yet</p>
                <p style={{ fontSize: 12, marginTop: 6 }}>Send an interest and start chatting</p>
              </div>
            ) : conversations.map(conv => (
              <ConversationItem
                key={conv.id}
                conv={conv}
                isActive={activeConv?.id === conv.id}
                onClick={() => openConversation(conv)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Chat Window */}
      {showChatWindow && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(15,15,26,0.95)' }}>
          {!activeConv ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9a8f7e' }}>
              <MessageCircle size={56} color="rgba(200,150,45,0.2)" style={{ marginBottom: 16 }} />
              <p style={{ fontSize: 16, color: '#f5f0e8', marginBottom: 8 }}>Select a conversation</p>
              <p style={{ fontSize: 13 }}>Choose from your messages on the left</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(200,150,45,0.15)', display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(26,26,46,0.8)' }}>
                {isMobile && (
                  <button onClick={() => setActiveConv(null)} style={{ background: 'none', border: 'none', color: '#c8962d', cursor: 'pointer', padding: 4 }}>
                    <ArrowLeft size={20} />
                  </button>
                )}
                <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', background: 'rgba(200,150,45,0.15)', border: '1px solid rgba(200,150,45,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {activeConv.other_picture
                    ? <img src={activeConv.other_picture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <User size={18} color="rgba(200,150,45,0.6)" />}
                </div>
                <div>
                  <div style={{ color: '#f5f0e8', fontWeight: 600, fontSize: 15 }}>
                    {activeConv.other_first_name} {activeConv.other_last_name?.[0]}.
                  </div>
                  {typingUsers.size > 0 && (
                    <div style={{ color: '#c8962d', fontSize: 11 }}>typing...</div>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {loadingMsgs ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                    <Loader2 size={28} color="#c8962d" style={{ animation: 'spin 1s linear infinite' }} />
                  </div>
                ) : (
                  Object.entries(groupedMessages).map(([date, msgs]) => (
                    <div key={date}>
                      {/* Date divider */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0 12px' }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(200,150,45,0.1)' }} />
                        <span style={{ fontSize: 11, color: '#9a8f7e', fontWeight: 500 }}>{date}</span>
                        <div style={{ flex: 1, height: 1, background: 'rgba(200,150,45,0.1)' }} />
                      </div>
                      {msgs.map((msg, i) => {
                        const isMine = msg.sender_id === user.id;
                        const prevMsg = msgs[i - 1];
                        const showTime = !prevMsg || new Date(msg.created_at) - new Date(prevMsg.created_at) > 5 * 60 * 1000;
                        return (
                          <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: 4 }}>
                            <div style={{ maxWidth: '70%' }}>
                              <div style={{
                                background: isMine ? 'linear-gradient(135deg,#c8962d,#f0c050)' : 'rgba(255,255,255,0.07)',
                                color: isMine ? '#1a1a00' : '#f5f0e8',
                                padding: '10px 14px', borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word',
                              }}>
                                {msg.content}
                              </div>
                              {showTime && (
                                <div style={{ fontSize: 10, color: '#9a8f7e', textAlign: isMine ? 'right' : 'left', marginTop: 3, paddingInline: 4 }}>
                                  {timeStr(msg.created_at)}
                                  {isMine && <span style={{ marginLeft: 4 }}>{msg.is_read ? '✓✓' : '✓'}</span>}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(200,150,45,0.15)', display: 'flex', gap: 10, background: 'rgba(26,26,46,0.8)', alignItems: 'flex-end' }}>
                <textarea
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  rows={1}
                  style={{
                    flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,150,45,0.25)',
                    borderRadius: 12, padding: '10px 14px', color: '#f5f0e8', fontSize: 14,
                    fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'none',
                    maxHeight: 100, overflowY: 'auto', lineHeight: 1.5,
                  }}
                  onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'; }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  style={{
                    background: input.trim() ? 'linear-gradient(135deg,#c8962d,#f0c050)' : 'rgba(255,255,255,0.07)',
                    border: 'none', borderRadius: 12, padding: '10px 14px', cursor: input.trim() ? 'pointer' : 'default',
                    color: input.trim() ? '#1a1a00' : '#9a8f7e', display: 'flex', alignItems: 'center', transition: 'all 0.2s', flexShrink: 0,
                  }}
                >
                  <Send size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
