import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-what-we-offer',
  styleUrl: './what-we-offer.css',
  templateUrl: './what-we-offer.html',
})
export class WhatWeOffer {
  offerItems = [
    {
      icon: '/icons/landing/services.svg',
      title: 'Serviços',
      description: `A Faz Tudo oferece serviços básicos e
complexos, muito mais na palma da sua mão.
Uma vasta rede de profissionais qualificados.`,
    },
    {
      icon: '/icons/landing/security.svg',
      title: 'Segurança',
      description: `Oferecemos a comodidade na contratação e a
garantia de cumprimento. Tanto o cliente
como o prestador terão confiança um no
outro.`,
    },
    {
      icon: '/icons/landing/clients.svg',
      title: 'Clientes',
      description: `Um bom profissional deve saber quais
clientes na sua zona de actuação precisam de
si. Expanda a sua rede facilmente.`,
    },
  ];
}
