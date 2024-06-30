import { NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import {MoviesCatalogComponent} from "./movies-catalog/movies-catalog.component";
import {MovieCardComponent} from "./movie-card/movie-card.component";
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';


@NgModule({
  declarations: [
    MoviesCatalogComponent,
    MovieCardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DropdownModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule
  ],
  exports: [
    MoviesCatalogComponent
  ]
})
export class MoviesModule { }