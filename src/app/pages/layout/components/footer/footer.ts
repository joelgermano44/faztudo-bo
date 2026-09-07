import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  imports: [RouterLink],
  selector: 'app-footer',
  styleUrl: './footer.css',
  templateUrl: './footer.html',
})
export class Footer {
  year = new Date().getFullYear();

  footerItems = [
    {
      title: 'Legal',
      subItems: [
        {
          link: '#',
          title: 'Termos e Condições',
        },
        {
          link: '#',
          title: 'Privacidade',
        },
      ],
    },
    {
      title: 'Social',
      subItems: [
        {
          link: '#',
          title: 'Facebook',
        },
        {
          link: '#',
          title: 'Instagram',
        },
      ],
    },
    {
      title: 'Contactos',
      subItems: [
        {
          link: '#',
          title: 'apoio@faztudo.ao',
        },
        {
          link: '#',
          title: '+244 923 456 789',
        },
      ],
    },
  ];
}
