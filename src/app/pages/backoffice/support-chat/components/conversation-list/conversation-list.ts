import { Component, inject, input, output } from '@angular/core';
import { API_BASE_URL } from '../../../../../../core/shared/http/api-config';
import { buildAvatarUrl } from '../../../../../../core/shared/util/media-url';
import {
  SupportInboxItem,
  SupportPartyType,
} from '../../../../../../core/features/support-chat/models/support-chat.model';

export type ConversationFilter = 'Todas' | 'Clientes' | 'Prestadores' | 'Não lidas';

const WEEKDAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

@Component({
  imports: [],
  selector: 'app-conversation-list',
  styleUrl: './conversation-list.css',
  templateUrl: './conversation-list.html',
})
export class ConversationList {
  private readonly baseUrl = inject(API_BASE_URL);

  readonly conversations = input<SupportInboxItem[]>([]);
  readonly selectedId = input<number | null>(null);
  readonly activeFilter = input<ConversationFilter>('Todas');
  readonly searchTerm = input('');
  readonly hasMore = input(false);
  readonly loading = input(false);

  readonly filters: ConversationFilter[] = ['Todas', 'Clientes', 'Prestadores', 'Não lidas'];

  readonly select = output<number>();
  readonly filterChange = output<ConversationFilter>();
  readonly searchChange = output<string>();
  readonly loadMore = output<void>();

  filterButtonClass(filter: ConversationFilter): string {
    return this.activeFilter() === filter
      ? 'bg-white shadow-sm text-[#0B2E13]'
      : 'text-gray-500';
  }

  rowClass(conversation: SupportInboxItem): string {
    if (conversation.id === this.selectedId()) {
      return 'bg-[#F2F4F3] border-l-4 border-l-primary';
    }
    if (conversation.unread_count > 0) {
      return 'bg-primary/10 border-l-4 border-l-primary';
    }
    return 'border-l-4 border-l-transparent';
  }

  avatarUrl(conversation: SupportInboxItem): string | null {
    const folder = conversation.party.role === SupportPartyType.CLIENT ? 'clients' : 'professionals';
    return buildAvatarUrl(this.baseUrl, folder, conversation.party.image);
  }

  roleLabel(conversation: SupportInboxItem): string {
    return conversation.party.role === SupportPartyType.CLIENT ? 'Cliente' : 'Profissional';
  }

  timestamp(iso: string | null): string {
    if (!iso) {
      return '';
    }
    const date = new Date(iso);
    const now = new Date();
    const sameDay =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();

    if (sameDay) {
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (
      date.getFullYear() === yesterday.getFullYear() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getDate() === yesterday.getDate()
    ) {
      return 'Ontem';
    }

    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const daysAgo = Math.round((dayStart.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo >= 0 && daysAgo < 7) {
      return WEEKDAY_NAMES[date.getDay()];
    }

    return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
  }
}
