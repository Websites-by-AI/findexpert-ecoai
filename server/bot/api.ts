export type InlineButton = {
  text: string;
  callback_data?: string;
  url?: string;
};

export type ReplyButton = { text: string };

export type OutgoingMessage = {
  chatId: string | number;
  text: string;
  parseMode?: 'HTML';
  inlineKeyboard?: InlineButton[][];
  replyKeyboard?: ReplyButton[][];
  removeKeyboard?: boolean;
};

export class Messenger {
  readonly platform: 'telegram' | 'bale';
  readonly token: string;
  readonly baseUrl: string;
  private offset = 0;
  private polling = false;

  constructor(platform: 'telegram' | 'bale', token: string) {
    this.platform = platform;
    this.token = token;
    this.baseUrl =
      platform === 'bale'
        ? `https://tapi.bale.ai/bot${token}`
        : `https://api.telegram.org/bot${token}`;
  }

  async call(method: string, body: Record<string, unknown> = {}) {
    const res = await fetch(`${this.baseUrl}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data: any = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) {
      const desc = data.description || res.statusText || 'API error';
      throw new Error(`${this.platform} ${method}: ${desc}`);
    }
    return data.result;
  }

  async getMe() {
    return this.call('getMe');
  }

  async send(msg: OutgoingMessage) {
    const payload: Record<string, unknown> = {
      chat_id: msg.chatId,
      text: clip(msg.text, 3900),
    };
    if (msg.parseMode) payload.parse_mode = msg.parseMode;
    if (msg.inlineKeyboard?.length) {
      payload.reply_markup = { inline_keyboard: msg.inlineKeyboard };
    } else if (msg.replyKeyboard?.length) {
      payload.reply_markup = {
        keyboard: msg.replyKeyboard.map((row) => row.map((b) => ({ text: b.text }))),
        resize_keyboard: true,
      };
    } else if (msg.removeKeyboard) {
      payload.reply_markup = { remove_keyboard: true };
    }
    try {
      return await this.call('sendMessage', payload);
    } catch (err) {
      if (msg.parseMode) {
        delete payload.parse_mode;
        payload.text = stripHtml(String(payload.text));
        return this.call('sendMessage', payload);
      }
      throw err;
    }
  }

  async answerCallback(id: string, text?: string) {
    try {
      await this.call('answerCallbackQuery', {
        callback_query_id: id,
        text: text || '',
      });
    } catch {
      // Bale sometimes rejects empty answers; ignore.
    }
  }

  async sendChatAction(chatId: string | number, action = 'typing') {
    try {
      await this.call('sendChatAction', { chat_id: chatId, action });
    } catch {
      /* optional on Bale */
    }
  }

  async getUpdates(timeout = 25) {
    const result = await this.call('getUpdates', {
      offset: this.offset,
      timeout,
      allowed_updates: ['message', 'callback_query'],
    });
    const updates = Array.isArray(result) ? result : [];
    for (const u of updates) {
      if (typeof u.update_id === 'number') this.offset = u.update_id + 1;
    }
    return updates;
  }

  startPolling(onUpdate: (update: any) => Promise<void>) {
    if (this.polling) return;
    this.polling = true;
    const loop = async () => {
      while (this.polling) {
        try {
          const updates = await this.getUpdates();
          for (const update of updates) {
            try {
              await onUpdate(update);
            } catch (err) {
              console.error(`[${this.platform}] handler`, err);
            }
          }
        } catch (err) {
          console.error(`[${this.platform}] poll (will retry; process death stops the bot unless Cloudflare webhook is set)`, err);
          await sleep(4000);
        }
      }
    };
    loop();
  }

  stopPolling() {
    this.polling = false;
  }
}

export function clip(text: string, max = 3900) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 16)}\n…`;
}

export function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

export function httpLink(link?: string) {
  return /^https?:\/\//i.test(String(link || '')) ? String(link) : '';
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
