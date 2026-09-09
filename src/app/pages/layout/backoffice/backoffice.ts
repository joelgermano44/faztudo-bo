import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './components/sidebar/sidebar';
import { Header } from './components/header/header';

@Component({
  imports: [RouterOutlet, Sidebar, Header],
  selector: 'app-backoffice',
  styleUrl: './backoffice.css',
  templateUrl: './backoffice.html',
})
export class BackOffice {}
