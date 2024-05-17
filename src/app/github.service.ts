import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, throwError } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GithubService {
  private apiUrl = 'https://api.github.com/users/';

  constructor(private http: HttpClient) {}

  private handleError(error: any) {
    console.error('Error occurred:', error);
    let errorMessage = 'An unknown error occurred!';
    if (error.status === 403 && error.headers.get('X-RateLimit-Remaining') === '0') {
      errorMessage = 'GitHub API rate limit exceeded. Please wait and try again later.';
    } else if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }

  getUserData(username: string): Observable<any> {
    return this.http.get(`${this.apiUrl}${username}`).pipe(
      catchError(this.handleError)
    );
  }

  getUserRepos(username: string, page: number, perPage: number): Observable<any[]> {
    let params = new HttpParams();
    params = params.append('page', page.toString());
    params = params.append('per_page', perPage.toString());

    return this.http.get<any[]>(`${this.apiUrl}${username}/repos`, { params: params }).pipe(
      catchError(this.handleError)
    );
  }

  getRepoLanguages(repoUrl: string): Observable<string[]> {
    return this.http.get<any>(repoUrl).pipe(
      map(data => Object.keys(data)),
      catchError(this.handleError)
    );
  }

  getUserDataAndRepos(username: string, page: number, perPage: number): Observable<{ userData: any, reposData: any[], totalRepos: number }> {
    return this.getUserData(username).pipe(
      switchMap(userData => {
        const totalRepos = userData.public_repos !== undefined ? userData.public_repos : 0;

        return this.getUserRepos(username, page, perPage).pipe(
          switchMap(reposData => {
            const reposWithLanguages$ = reposData.map(repo =>
              this.getRepoLanguages(repo.languages_url).pipe(
                map(languages => ({
                  ...repo,
                  languages: languages
                }))
              )
            );

            return forkJoin(reposWithLanguages$).pipe(
              map(reposWithLanguages => ({
                userData,
                reposData: reposWithLanguages,
                totalRepos
              }))
            );
          })
        );
      }),
      catchError(this.handleError)
    );
  }

  getRateLimitStatus(): Observable<any> {
    return this.http.get('https://api.github.com/rate_limit').pipe(
      catchError(this.handleError)
    );
  }
}
