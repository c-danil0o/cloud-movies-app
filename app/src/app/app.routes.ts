import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ConfirmComponent } from './confirm/confirm.component';
import { HomeComponent } from './home/home.component';
import { MoviesCatalogComponent } from './movies/movies-catalog/movies-catalog.component'
import { MovieDetailsComponent } from './movies/movie-details/movie-details.component';
import { authGuard, authGuard_admin } from './auth/guard';
import { AddMovieComponent } from './movies/add-movie/add-movie.component';
import { SubscriptionsComponent } from "./subscriptions/subscriptions.component";
import { EditMovieComponent } from './movies/edit-movie/edit-movie.component';


export const routes: Routes = [
  { path: '', redirectTo: 'catalog', pathMatch: 'full' },
  { component: LoginComponent, path: "login" },
  { component: RegisterComponent, path: "register" },
  { component: ConfirmComponent, path: "confirm/:email" },
  { component: HomeComponent, path: "home", canActivate: [authGuard_admin] },
  { component: MoviesCatalogComponent, path: "catalog", canActivate: [authGuard] },
  { component: MovieDetailsComponent, path: "details/:id", canActivate: [authGuard] },
  { component: AddMovieComponent, path: "add-movie", canActivate: [authGuard_admin] },
  { component: EditMovieComponent, path: "edit-movie/:id", canActivate: [authGuard_admin] },
  { component: SubscriptionsComponent, path: "subscriptions", canActivate: [authGuard] },
];
