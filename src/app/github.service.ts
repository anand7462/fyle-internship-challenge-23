import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, throwError } from 'rxjs';
import { catchError, switchMap, map, mergeMap, toArray } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GithubService {
  private apiUrl = 'https://api.github.com/users/';

  constructor(private http: HttpClient) {}

  private handleError(message: string) {
    return (error: any) => {
      console.error(message, error);
      return throwError(message); // Throw a custom error message
    };
  }

  getUserData(username: string): Observable<any> {
    return this.http.get(`${this.apiUrl}${username}`).pipe(
      catchError(this.handleError('Error fetching user data'))
    );
  }

  getUserRepos(username: string, page: number, perPage: number): Observable<any[]> {
    let params = new HttpParams();
    params = params.append('page', page.toString());
    params = params.append('per_page', perPage.toString());

    return this.http.get<any[]>(`${this.apiUrl}${username}/repos`, { params: params }).pipe(
      catchError(this.handleError('Error fetching repositories'))
    );
  }

  getRepoLanguages(repoUrl: string): Observable<string[]> {
    return this.http.get<any>(repoUrl).pipe(
      map(data => Object.keys(data)),
      catchError(this.handleError('Error fetching repository languages'))
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
      catchError(this.handleError('Error fetching user data and repositories'))
    );
  }
}
