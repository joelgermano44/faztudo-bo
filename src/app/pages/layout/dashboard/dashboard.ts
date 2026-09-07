import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from "./components/sidebar/sidebar";
import { Header } from "./components/header/header";

@Component({
  imports: [RouterOutlet, Sidebar, Header],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {

}
