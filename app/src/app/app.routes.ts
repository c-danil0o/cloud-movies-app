import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ConfirmComponent } from './confirm/confirm.component';
import { HomeComponent } from './home/home.component';
import { MoviesCatalogComponent } from './movies/movies-catalog/movies-catalog.component'
import { MovieDetailsComponent } from './movies/movie-details/movie-details.component';


export const routes: Routes = [
  { component: LoginComponent, path: "login" },
  { component: RegisterComponent, path: "register" },
  { component: ConfirmComponent, path: "confirm/:email" },
  { component: HomeComponent, path: "home" },
  { component: MoviesCatalogComponent, path: "catalog"},
  { component: MovieDetailsComponent, path: "details/:id"}
];
