import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ConfirmComponent } from './confirm/confirm.component';
import { HomeComponent } from './home/home.component';
import { MoviesCatalogComponent } from './movies/movies-catalog/movies-catalog.component'
import { MovieDetailsComponent } from './movies/movie-details/movie-details.component';
import { authGuard, authGuard_admin } from './auth/guard';


export const routes: Routes = [
  { component: LoginComponent, path: "login" },
  { component: RegisterComponent, path: "register" },
  { component: ConfirmComponent, path: "confirm/:email", canActivate: [authGuard] },
  { component: HomeComponent, path: "home", canActivate: [authGuard_admin] },
  { component: MoviesCatalogComponent, path: "catalog", canActivate: [authGuard] },
  { component: MovieDetailsComponent, path: "details/:id", canActivate: [authGuard] }
];
