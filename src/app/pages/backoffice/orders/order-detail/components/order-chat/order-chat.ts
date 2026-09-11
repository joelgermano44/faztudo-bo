import { Component, computed, inject, input, output, signal } from '@angular/core';
import { ImageViewer } from '../../../../../../shared/ui/image-viewer/image-viewer';
import { API_BASE_URL } from '../../../../../../../core/shared/http/api-config';
import { buildMediaUrl } from '../../../../../../../core/shared/util/media-url';
import { OrderChatMessage } from '../../../../../../../core/features/orders/models/order.model';

@Component({
  imports: [ImageViewer],
  selector: 'app-order-chat',
  styleUrl: './order-chat.css',
  templateUrl: './order-chat.html',
})
export class OrderChat {
  private readonly baseUrl = inject(API_BASE_URL);

  readonly clientName = input.required<string>();
  readonly clientAvatar = input<string | null>(null);
  readonly professionalName = input.required<string>();
  readonly professionalAvatar = input<string | null>(null);

  readonly messages = input<OrderChatMessage[]>([]);
  readonly hasConversation = input(false);
  readonly hasMore = input(false);
  readonly loading = input(false);

  readonly loadMore = output<void>();

  readonly lightboxOpen = signal(false);
  readonly lightboxImages = signal<string[]>([]);
  readonly lightboxIndex = signal(0);

  readonly isEmpty = computed(() => this.hasConversation() && this.messages().length === 0);

  avatarFor(message: OrderChatMessage): string | null {
    return message.sender_type === 'client' ? this.clientAvatar() : this.professionalAvatar();
  }

  nameFor(message: OrderChatMessage): string {
    return message.sender_type === 'client' ? this.clientName() : this.professionalName();
  }

  bubbleClass(message: OrderChatMessage): string {
    return message.sender_type === 'professional'
      ? 'bg-primary text-[#0B2E13]'
      : 'bg-[#F2F4F3] text-[#191C1D]';
  }

  imagesFor(message: OrderChatMessage): string[] {
    return (message.images ?? []).map((media) => buildMediaUrl(this.baseUrl, media));
  }

  openLightbox(message: OrderChatMessage, index: number): void {
    this.lightboxImages.set(this.imagesFor(message));
    this.lightboxIndex.set(index);
    this.lightboxOpen.set(true);
  }

  closeLightbox(): void {
    this.lightboxOpen.set(false);
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleString('pt-PT', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
