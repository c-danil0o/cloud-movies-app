import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Movie } from '../../models/movie';

import { MovieService } from "../../services/movie.service";
import { DialogModule } from 'primeng/dialog';

import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileSaverModule } from 'ngx-filesaver'

import { FileSaverService } from 'ngx-filesaver';
import { RatingModule } from "primeng/rating";
import { InputTextareaModule } from "primeng/inputtextarea";
import { Rating } from "../../models/rating";
import { AuthService } from "../../services/auth.service";
import { UserInfo } from "../../models/UserInfo";
import { SubscriptionAndFeedInfo } from "../../models/subscription_and_feed_info";
import { MessageService } from "primeng/api";
import { DropdownModule } from 'primeng/dropdown';


@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [ButtonModule, FormsModule, CommonModule, DialogModule, RatingModule, InputTextareaModule, FileSaverModule, DropdownModule],
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.css'],
})
export class MovieDetailsComponent implements OnInit {

  movie!: Movie;
  movieId!: string;
  videoUrl!: string;
  visible = false;
  rate_button_label: string = "Rate movie"
  movieRatingVisible: boolean = false;
  movie_rating_value: number = -1;
  user_id!: string;
  selectedResolution: { name: string, code: string } | null = { name: "Original", code: "initial" };
  resolutions = [
    { name: 'Original', code: 'initial' },
    { name: '720p', code: '720' },
    { name: '480p', code: '480' },
    { name: '360p', code: '360' },
  ];
  role: string = "none";

  constructor(private router: Router, private route: ActivatedRoute, private movieService: MovieService, private fileSaverService: FileSaverService, private authService: AuthService, private messageService: MessageService, private elRef: ElementRef) { }


  ngOnInit(): void {
    this.authService.currentRole.subscribe(role => this.role = role)
    this.route.params.subscribe(params => {
      this.movieId = params['id'];
      this.movieService.getMovieById(this.movieId).subscribe({
        next: (data) => {
          console.log(data.Item);
          this.movie = data.Item;
        }
      })
      this.authService.getUserInfo().subscribe({
        next: (info) => {
          if (info) {
            this.user_id = info.id;
            this.movieService.getMovieRate(this.user_id, this.movieId).subscribe({
              next: (data) => {
                if (data) {
                  if (data.Rate) {
                    this.rate_button_label = "Your Rate: " + String(data.Rate);
                  }
                }
              }
            })
          }
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

  download() {
    this.authService.getUserInfo().subscribe({
      next: (data) => {
        if (data != null) {
          const downloadInfo: SubscriptionAndFeedInfo = {
            user_id: data.id,
            email: data.email,
            type: "download",
            value: this.movie.genre
          };
          if (this.selectedResolution) {
            this.movieService.getDownloadUrl(this.movieId, this.selectedResolution['code'], downloadInfo).subscribe({
              next: (data) => {
                console.log(data.url);
                this.videoUrl = data.url;
                this.downloadFile(this.videoUrl);
              }
            });

          }
        }
      },
      error: err => console.log(err)
    })


  }

  play() {
    this.visible = true;
    this.authService.getUserInfo().subscribe({
      next: (data) => {
        if (data != null) {
          const downloadInfo: SubscriptionAndFeedInfo = {
            user_id: data.id,
            email: data.email,
            type: "download",
            value: this.movie.genre
          };
          if (this.selectedResolution) {
            this.movieService.getDownloadUrl(this.movieId, this.selectedResolution['code'], downloadInfo).subscribe({
              next: (data) => {
                this.videoUrl = data.url;
                const player = this.elRef.nativeElement.querySelector('video');
                player.load();
              }
            });

          }
        }
      },
      error: err => console.log(err)
    })

  }

  delete() {
    this.movieService.deleteMovieById(this.movieId, "full").subscribe({
      next: (result: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          key: 'bc',
          detail: 'Movie deleted successfully!',
          life: 2000
        })
        console.log(result)
        this.router.navigate(['/catalog'])

      },
      error: (err: any) => console.log(err)
    })
  }
  edit() {
    this.router.navigate(['/edit-movie/', this.movieId])
  }

  showRateDialog() {
    this.movieRatingVisible = true;
  }

  addMovieRate(movie_id: string | undefined) {
    if (this.movie_rating_value == -1)
      return

    this.authService.getUserInfo().subscribe({
      next: (data: UserInfo | null) => {
        if (data != null) {
          const rating: Rating = {
            user: data.id,
            email: data.email,
            movie_id: movie_id as string,
            grade: this.movie_rating_value,
            genre: this.movie.genre
          }
          this.movieService.rateMovie(rating).subscribe({
            next: (data) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                key: 'bc',
                detail: 'Successfully rated movie!',
                life: 2000
              })
              this.rate_button_label = "Your Rate: " + String(data.item['grade']);
              console.log(data.item)
            },
            error: (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                key: 'bc',
                detail: 'Already rated this movie!',
                life: 2000
              })
              console.log(err)
            }
          })
          this.movieRatingVisible = false;
          this.movie_rating_value = -1
        }

      },
      error: (err) => console.log(err)
    })
  }

  protected readonly Math = Math;

  subscribe(type: string, value: string) {
    this.authService.getUserInfo().subscribe({
      next: (data: UserInfo | null) => {
        if (data != null) {
          const sub: SubscriptionAndFeedInfo = {
            user_id: data.id,
            email: data.email,
            type: type,
            value: value
          }
          this.movieService.subscribe(sub).subscribe({
            next: (data) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                key: 'bc',
                detail: 'Successfully subscribed!',
                life: 2000
              })
              console.log(data)
            },
            error: (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                key: 'bc',
                detail: 'Subscribe failed!',
                life: 2000
              })
              console.log(err)
            }
          })
        }

      },
      error: (err) => console.log(err)
    })
  }

}
