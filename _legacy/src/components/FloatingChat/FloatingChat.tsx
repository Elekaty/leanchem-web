import { useState } from 'react'
import { SITE } from '../../data/marketing'
import './FloatingChat.css'

export function FloatingChat() {
  const [open, setOpen] = useState(false)

  return (
    <div className="floating-chat">
      {open ? (
        <div className="floating-chat__panel" role="dialog" aria-label="Chat with LeanChem">
          <p className="floating-chat__title">Talk to LeanChem</p>
          <a
            className="floating-chat__link"
            href={SITE.chat.whatsapp}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
          <a
            className="floating-chat__link"
            href={SITE.chat.telegram}
            target="_blank"
            rel="noreferrer"
          >
            Telegram
          </a>
        </div>
      ) : null}
      <button
        type="button"
        className="floating-chat__toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? 'Close' : 'Chat'}
      </button>
    </div>
  )
}
