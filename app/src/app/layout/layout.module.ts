import {NgModule} from '@angular/core';
import { NavbarComponent } from './navbar/navbar.component';
import {CommonModule} from '@angular/common';
import {RouterModule} from "@angular/router";
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

@NgModule({
    declarations: [
      NavbarComponent
    ],
    exports: [
      NavbarComponent
    ],
    imports: [
      CommonModule,
      RouterModule,
      FormsModule,
      ButtonModule
    ]
})
export class LayoutModule {
}
  