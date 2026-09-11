import { Component, computed, inject, signal } from '@angular/core';
import { toast } from 'ngx-sonner';
import { TitleHeader } from '../../layout/backoffice/components/title-header/title-header';
import {
  ConversationFilter,
  ConversationList,
} from './components/conversation-list/conversation-list';
import { ConversationThread, OutgoingSupportMessage } from './components/conversation-thread/conversation-thread';
import { SupportChatService } from '../../../../core/features/support-chat/services/support-chat.service';
import {
  SupportInboxItem,
  SupportMessage,
  SupportMessageType,
  SupportPartyType,
} from '../../../../core/features/support-chat/models/support-chat.model';

@Component({
  imports: [TitleHeader, ConversationList, ConversationThread],
  selector: 'app-support-chat',
  styleUrl: './support-chat.css',
  templateUrl: './support-chat.html',
})
export class SupportChat {
  private readonly supportChatService = inject(SupportChatService);

  private readonly conversations = signal<SupportInboxItem[]>([]);
  readonly conversationsNextCursor = signal<number | null>(null);
  readonly conversationsHasMore = signal(false);
  readonly conversationsLoading = signal(false);

  readonly activeFilter = signal<ConversationFilter>('Todas');
  readonly searchTerm = signal('');
  private searchDebounce?: ReturnType<typeof setTimeout>;

  readonly selectedId = signal<number | null>(null);
  readonly selectedConversation = computed<SupportInboxItem | null>(
    () => this.conversations().find((conversation) => conversation.id === this.selectedId()) ?? null,
  );

  readonly messages = signal<SupportMessage[]>([]);
  readonly messagesNextCursor = signal<number | null>(null);
  readonly messagesHasMore = signal(false);
  readonly messagesLoading = signal(false);
  readonly sending = signal(false);

  readonly filteredConversations = computed<SupportInboxItem[]>(() => {
    const filter = this.activeFilter();
    return this.conversations().filter((conversation) => {
      if (filter === 'Clientes') {
        return conversation.party.role === SupportPartyType.CLIENT;
      }
      if (filter === 'Prestadores') {
        return conversation.party.role === SupportPartyType.PROFESSIONAL;
      }
      if (filter === 'Não lidas') {
        return conversation.unread_count > 0;
      }
      return true;
    });
  });

  constructor() {
    this.loadConversations();
  }

  private loadConversations(before?: number): void {
    this.conversationsLoading.set(true);
    const query: { search?: string; before?: number } = {};
    if (this.searchTerm()) {
      query.search = this.searchTerm();
    }
    if (before !== undefined) {
      query.before = before;
    }

    this.supportChatService.listConversations(query).subscribe({
        next: (page) => {
          this.conversationsLoading.set(false);
          this.conversations.update((current) =>
            before ? [...current, ...page.data] : page.data,
          );
          this.conversationsNextCursor.set(page.next_cursor);
          this.conversationsHasMore.set(page.has_more);
        },
        error: (err) => {
          this.conversationsLoading.set(false);
          console.error('Erro ao carregar conversas', err);
        },
      });
  }

  loadMoreConversations(): void {
    const cursor = this.conversationsNextCursor();
    if (cursor !== null && !this.conversationsLoading()) {
      this.loadConversations(cursor);
    }
  }

  setFilter(filter: ConversationFilter): void {
    this.activeFilter.set(filter);
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => this.loadConversations(), 300);
  }

  selectConversation(id: number): void {
    this.selectedId.set(id);
    this.messages.set([]);
    this.messagesNextCursor.set(null);
    this.messagesHasMore.set(false);
    this.loadMessages(id);

    const conversation = this.conversations().find((item) => item.id === id);
    if (conversation && conversation.unread_count > 0) {
      this.supportChatService.markAsRead(id).subscribe({
        next: () => {
          this.conversations.update((current) =>
            current.map((item) => (item.id === id ? { ...item, unread_count: 0 } : item)),
          );
        },
        error: (err) => console.error('Erro ao marcar conversa como lida', err),
      });
    }
  }

  private loadMessages(id: number, before?: number): void {
    this.messagesLoading.set(true);
    this.supportChatService.listMessages(id, before ? { before } : {}).subscribe({
      next: (page) => {
        this.messagesLoading.set(false);
        this.messages.update((current) => (before ? [...page.data, ...current] : page.data));
        this.messagesNextCursor.set(page.next_cursor);
        this.messagesHasMore.set(page.has_more);
      },
      error: (err) => {
        this.messagesLoading.set(false);
        toast.error('Não foi possível carregar as mensagens', {
          description: err?.error?.message ?? 'Tente novamente mais tarde.',
        });
      },
    });
  }

  loadMoreMessages(): void {
    const id = this.selectedId();
    const cursor = this.messagesNextCursor();
    if (id !== null && cursor !== null && !this.messagesLoading()) {
      this.loadMessages(id, cursor);
    }
  }

  sendMessage(outgoing: OutgoingSupportMessage): void {
    const id = this.selectedId();
    if (id === null || this.sending()) {
      return;
    }

    this.sending.set(true);
    this.supportChatService
      .sendMessage(id, {
        content: outgoing.content || undefined,
        type: outgoing.images.length > 0 ? SupportMessageType.IMAGE : SupportMessageType.TEXT,
        images: outgoing.images.length > 0 ? outgoing.images : undefined,
      })
      .subscribe({
        next: (message) => {
          this.sending.set(false);
          this.messages.update((current) => [...current, message]);
          this.conversations.update((current) =>
            current.map((item) =>
              item.id === id
                ? {
                    ...item,
                    last_message_at: message.created_at,
                    last_message_preview: message.content ?? 'Imagem',
                  }
                : item,
            ),
          );
        },
        error: (err) => {
          this.sending.set(false);
          toast.error('Não foi possível enviar a mensagem', {
            description: err?.error?.message ?? 'Tente novamente mais tarde.',
          });
        },
      });
  }
}
