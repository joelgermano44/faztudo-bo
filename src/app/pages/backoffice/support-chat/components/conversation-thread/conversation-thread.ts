import { Component, computed, ElementRef, HostListener, inject, input, output, signal } from '@angular/core';
import { ImageViewer } from '../../../../../shared/ui/image-viewer/image-viewer';
import { API_BASE_URL } from '../../../../../../core/shared/http/api-config';
import { buildAvatarUrl, buildMediaUrl } from '../../../../../../core/shared/util/media-url';
import {
  SupportInboxItem,
  SupportMessage,
  SupportPartyType,
  SupportSenderType,
} from '../../../../../../core/features/support-chat/models/support-chat.model';

export interface OutgoingSupportMessage {
  content: string;
  images: File[];
}

const EMOJIS = [
  '😀', '😁', '😂', '🤣', '😊', '😍', '😘', '😉', '😎', '🤔',
  '😐', '😢', '😭', '😡', '😱', '😴', '🥳', '🤗', '🙏', '👍',
  '👎', '👏', '🙌', '💪', '✅', '❌', '❤️', '🔥', '🎉', '⏰',
];

@Component({
  imports: [ImageViewer],
  selector: 'app-conversation-thread',
  styleUrl: './conversation-thread.css',
  templateUrl: './conversation-thread.html',
})
export class ConversationThread {
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly elementRef = inject(ElementRef);

  readonly emojis = EMOJIS;
  readonly isEmojiPickerOpen = signal(false);

  readonly conversation = input<SupportInboxItem | null>(null);
  readonly messages = input<SupportMessage[]>([]);
  readonly hasMore = input(false);
  readonly loading = input(false);
  readonly sending = input(false);

  readonly loadMore = output<void>();
  readonly send = output<OutgoingSupportMessage>();

  readonly draftText = signal('');
  readonly draftImages = signal<File[]>([]);
  readonly draftImagePreviews = computed(() =>
    this.draftImages().map((file) => URL.createObjectURL(file)),
  );

  readonly lightboxOpen = signal(false);
  readonly lightboxImages = signal<string[]>([]);
  readonly lightboxIndex = signal(0);

  readonly SupportSenderType = SupportSenderType;

  partyAvatar(): string | null {
    const conversation = this.conversation();
    if (!conversation) {
      return null;
    }
    const folder =
      conversation.party.role === SupportPartyType.CLIENT ? 'clients' : 'professionals';
    return buildAvatarUrl(this.baseUrl, folder, conversation.party.image);
  }

  isIncoming(message: SupportMessage): boolean {
    return (
      message.sender_type === SupportSenderType.CLIENT ||
      message.sender_type === SupportSenderType.PROFESSIONAL
    );
  }

  bubbleClass(message: SupportMessage): string {
    if (message.sender_type === SupportSenderType.SYSTEM) {
      return 'bg-gray-100 text-gray-500 text-xs italic mx-auto';
    }
    return this.isIncoming(message)
      ? 'bg-[#F2F4F3] text-[#191C1D]'
      : 'bg-[#094908] text-white rounded-br-none';
  }

  imagesFor(message: SupportMessage): string[] {
    return (message.images ?? []).map((media) => buildMediaUrl(this.baseUrl, media));
  }

  showDateDivider(index: number): boolean {
    const list = this.messages();
    if (index === 0) {
      return true;
    }
    const current = new Date(list[index].created_at);
    const previous = new Date(list[index - 1].created_at);
    return (
      current.getFullYear() !== previous.getFullYear() ||
      current.getMonth() !== previous.getMonth() ||
      current.getDate() !== previous.getDate()
    );
  }

  dateDividerLabel(iso: string): string {
    const date = new Date(iso);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const isSameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    if (isSameDay(date, now)) {
      return 'Hoje';
    }
    if (isSameDay(date, yesterday)) {
      return 'Ontem';
    }
    return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  formatTime(iso: string): string {
    const date = new Date(iso);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  onAttachImages(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (files.length === 0) {
      return;
    }
    this.draftImages.update((current) => [...current, ...files].slice(0, 10));
    input.value = '';
  }

  removeDraftImage(index: number): void {
    this.draftImages.update((current) => current.filter((_, i) => i !== index));
  }

  openLightbox(message: SupportMessage, index: number): void {
    this.lightboxImages.set(this.imagesFor(message));
    this.lightboxIndex.set(index);
    this.lightboxOpen.set(true);
  }

  closeLightbox(): void {
    this.lightboxOpen.set(false);
  }

  toggleEmojiPicker(): void {
    this.isEmojiPickerOpen.update((open) => !open);
  }

  insertEmoji(emoji: string): void {
    this.draftText.update((text) => text + emoji);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isEmojiPickerOpen.set(false);
    }
  }

  submit(): void {
    const content = this.draftText().trim();
    const images = this.draftImages();
    if ((!content && images.length === 0) || this.sending()) {
      return;
    }
    this.send.emit({ content, images });
    this.draftText.set('');
    this.draftImages.set([]);
  }
}
