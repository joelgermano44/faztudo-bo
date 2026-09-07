import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  route: string;
  exactMatch?: boolean;
}

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  navItems: NavItem[] = [
    { label: 'Início', route: '/', exactMatch: true },
    { label: 'Como Funciona', route: '#', exactMatch: true },
    { label: 'Serviços', route: '#', exactMatch: true },
    { label: 'FAQs', route: '#', exactMatch: true },
  ];
}
