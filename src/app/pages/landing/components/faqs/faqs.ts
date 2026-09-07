import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-faqs',
  styleUrl: './faqs.css',
  templateUrl: './faqs.html',
})
export class Faqs {
  faqs = [
    {
      question: 'Qual é o procedimento de inscrição?',
      answer: 'Resposta...',
      open: false,
    },
    {
      question: 'Como posso obter receitas através da plataforma?',
      answer: 'Resposta...',
      open: false,
    },
    {
      question: 'Quais são as vantagens face a estratégias de publicidade normais?',
      answer: 'Resposta...',
      open: false,
    },
    {
      question: 'Contratar um serviço na Faz Tudo é Seguro?',
      answer: 'Resposta...',
      open: false,
    },
  ];

  toggle(item: (typeof this.faqs)[number]) {
    item.open = !item.open;
  }
}
