import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './landing/components/header/header';
import { Footer } from './landing/components/footer/footer';

@Component({
  imports: [RouterOutlet, Header, Footer],
  selector: 'app-layout',
  styleUrl: './layout.css',
  templateUrl: './layout.html',
})
export class Layout {}
