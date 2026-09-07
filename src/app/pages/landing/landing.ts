import { Component } from '@angular/core';
import { Hero } from './components/hero/hero';
import { HowItWork } from './components/how-it-work/how-it-work';
import { WhatWeOffer } from './components/what-we-offer/what-we-offer';
import { PopularServices } from './components/popular-services/popular-services';
import { Faqs } from './components/faqs/faqs';

@Component({
  imports: [Hero, HowItWork, WhatWeOffer, PopularServices, Faqs],
  selector: 'app-landing',
  styleUrl: './landing.css',
  templateUrl: './landing.html',
})
export class Landing {}
