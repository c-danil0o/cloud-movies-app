import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ConfirmComponent } from './confirm/confirm.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { component: LoginComponent, path: "login" },
  { component: RegisterComponent, path: "register" },
  { component: ConfirmComponent, path: "confirm/:email" },
  { component: HomeComponent, path: "home" },

];
