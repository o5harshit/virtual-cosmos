import { useEffect, useState } from 'react'

export function SidePanel({ connections, messages, onSendMessage, onTypingChange }) {
  const [messageText, setMessageText] = useState('')
  const hasConnections = connections.length > 0

  useEffect(() => {
    if (!hasConnections) {
      onTypingChange(false)
    }

    return () => onTypingChange(false)
  }, [hasConnections, onTypingChange])

  function submitMessage(event) {
    event.preventDefault()
    if (!messageText.trim()) return

    onSendMessage(messageText)
    setMessageText('')
  }

  return (
    <aside className="side-panel">
      <h2>Active connections</h2>

      {!hasConnections ? (
        <p className="muted">No one nearby. Move close to another avatar.</p>
      ) : (
        <ul className="connection-list">
          {connections.map((user) => (
            <li key={user.id}>
              <span style={{ background: user.color }}></span>
              {user.name}
            </li>
          ))}
        </ul>
      )}

      {hasConnections && (
        <div className="chat-box">
          <h2>Nearby chat</h2>
          <div className="messages">
            {messages.slice(-8).map((message, index) => (
              <p key={index} className={message.system ? 'system-message' : ''}>
                {message.system ? message.text : `${message.name}: ${message.text}`}
              </p>
            ))}
          </div>
          <form onSubmit={submitMessage}>
            <input
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              onFocus={() => onTypingChange(true)}
              onBlur={() => onTypingChange(false)}
              placeholder="Type message"
            />
            <button>Send</button>
          </form>
        </div>
      )}
    </aside>
  )
}
