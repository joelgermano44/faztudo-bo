import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-hero',
  styleUrl: './hero.css',
  templateUrl: './hero.html',
})
export class Hero {
  users = [
    {
      id: 1,
      name: 'João Silva',
      image: 'assets/users/user-1.jpg',
    },
    {
      id: 2,
      name: 'Maria Silva',
      image: 'assets/users/user-2.jpg',
    },
    {
      id: 3,
      name: 'Pedro Silva',
      image: 'assets/users/user-3.jpg',
    },
  ];
}
