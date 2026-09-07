import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-how-it-work',
  styleUrl: './how-it-work.css',
  templateUrl: './how-it-work.html',
})
export class HowItWork {
  stepItems = [
    {
      step: '01',
      icon: '/icons/landing/search.svg',
      title: 'Pesquisar',
      description: `Encontre profissionais verificados
navegando pelas categorias de serviços
disponíveis na sua área.`,
    },
    {
      step: '02',
      icon: '/icons/landing/contact.svg',
      title: 'Contactar',
      description: `Fale directamente com o prestador,
esclareça dúvidas, peça orçamentos e
agende o serviço.`,
    },
    {
      step: '03',
      icon: '/icons/landing/contract.svg',
      title: 'Contratar',
      description: `Feche negócio com confiança. Avalie o
serviço prestado para ajudar a
comunidade.`,
    },
  ];
}
