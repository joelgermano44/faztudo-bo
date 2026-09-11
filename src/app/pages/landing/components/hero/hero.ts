import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-hero',
  styleUrl: './hero.css',
  templateUrl: './hero.html',
})
/**
 * A landing page é pública (sem sessão) e todos os endpoints de
 * clientes/profissionais exigem Bearer token de admin — por isso não há como
 * buscar fotos reais de utilizadores aqui. Usamos sempre o ícone padrão de
 * "sem foto" já usado no resto da aplicação.
 */
export class Hero {
  users = [
    { id: 1, name: 'Utilizador da plataforma', image: '/icons/user.svg' },
    { id: 2, name: 'Utilizador da plataforma', image: '/icons/user.svg' },
    { id: 3, name: 'Utilizador da plataforma', image: '/icons/user.svg' },
  ];
}
