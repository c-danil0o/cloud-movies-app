import { Component, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Movie } from '../../models/movie';

import {MovieService} from "../../services/movie.service";
import { DialogModule } from 'primeng/dialog';

import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {FileSaverModule} from 'ngx-filesaver'

import { FileSaverService } from 'ngx-filesaver';

@Component({
    selector: 'app-movie-details',
    standalone: true,
    imports : [ButtonModule, FormsModule, CommonModule, DialogModule, FileSaverModule],
    templateUrl: './movie-details.component.html',
    styleUrls: ['./movie-details.component.css'],
})
export class MovieDetailsComponent implements OnInit {

    movie!: Movie;
    actors!: string;
    movieId!: string;
    videoUrl!: string;
    visible = false;
    

    constructor(private route: ActivatedRoute, private movieService: MovieService, private fileSaverService: FileSaverService) { }

    ngOnInit(): void {
      this.route.params.subscribe(params => {
        this.movieId = params['id'];
        this.movieService.getMovieById(this.movieId).subscribe({
          next: (data) =>{
            this.movie = data.Item;
            this.actors = data.Item.actors;
            this.movie.actors = this.actors.split(",");
          }
        })
      });
    }

    downloadFile(url: string) {
      fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = this.movie.name + ".mp4";
        link.click();
    })
    .catch(error => {
      console.error('Error downloading the file:', error);
    });
    }

    download(){
      this.movieService.getDownloadUrl(this.movieId).subscribe({
        next: (data) =>{
          console.log(data.url);
          this.videoUrl = data.url;
          this.downloadFile(this.videoUrl);
        }
      });
    }

    play(){
      this.visible=true;
      this.movieService.getDownloadUrl(this.movieId).subscribe({
        next: (data) =>{
          this.videoUrl = data.url;
        }
      });
    }
}
