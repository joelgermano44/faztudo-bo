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
      answer:
        'Basta descarregar a aplicação Faz Tudo na App Store ou Google Play. Se pretende apenas contratar serviços, pode começar a pesquisar profissionais de imediato. Se quer prestar serviços, precisa de submeter um pedido com os seus dados e o BI (Bilhete de Identidade), que fica sujeito a análise da nossa equipa antes de ser aprovado e ficar visível na plataforma.',
      open: false,
    },
    {
      question: 'Como posso obter receitas através da plataforma?',
      answer:
        'Depois de aprovado como prestador, recebe pedidos de clientes que procuram serviços na sua área e categoria. A cada serviço concluído, a Faz Tudo retém uma pequena comissão e transfere o valor restante para si, ficando o histórico de pagamentos sempre disponível na sua conta.',
      open: false,
    },
    {
      question: 'Quais são as vantagens face a estratégias de publicidade normais?',
      answer:
        'Em vez de anúncios genéricos, a Faz Tudo liga-o directamente a clientes que já estão à procura do serviço que presta, na sua zona de actuação. Isto significa contactos mais qualificados e maior probabilidade de fecho de negócio, além de poder destacar ainda mais o seu perfil através de anúncios promovidos dentro da própria plataforma.',
      open: false,
    },
    {
      question: 'Contratar um serviço na Faz Tudo é Seguro?',
      answer:
        'Sim. Todos os prestadores passam por um processo de verificação de identidade com o BI e são aprovados manualmente pela nossa equipa antes de poderem operar na plataforma. Além disso, cada serviço prestado pode ser avaliado pelos clientes, criando um histórico de classificações que ajuda toda a comunidade a escolher com confiança.',
      open: false,
    },
  ];

  toggle(item: (typeof this.faqs)[number]) {
    item.open = !item.open;
  }
}
