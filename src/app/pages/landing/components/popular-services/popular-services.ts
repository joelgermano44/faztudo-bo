import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-popular-services',
  styleUrl: './popular-services.css',
  templateUrl: './popular-services.html',
})
export class PopularServices {
  services = [
    {
      id: 1,
      imageUrl: '/landing/service-1.jpg',
      popular: true,
      category: 'Manutenção',
      name: 'Electricidade',
      description: `Instalações, reparações e
manutenção de redes eléctricas`,
    },
  ];
}
