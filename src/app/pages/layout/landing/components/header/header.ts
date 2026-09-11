import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { scrollToSection as scrollToSectionId } from '../../../../../../core/shared/util/scroll';

interface NavItem {
  label: string;
  /** Id da secção da landing page para onde faz scroll; `null` volta ao topo. */
  sectionId: string | null;
}

@Component({
  imports: [],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  navItems: NavItem[] = [
    { label: 'Início', sectionId: null },
    { label: 'Como Funciona', sectionId: 'como-funciona' },
    { label: 'Serviços', sectionId: 'servicos' },
    { label: 'FAQs', sectionId: 'faqs' },
  ];

  readonly isMobileMenuOpen = signal(false);

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  scrollToSection(sectionId: string | null): void {
    this.closeMobileMenu();
    if (!this.isBrowser) {
      return;
    }
    scrollToSectionId(sectionId);
  }
}
