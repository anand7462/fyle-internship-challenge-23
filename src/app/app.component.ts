import { Component } from '@angular/core';
import { GithubService } from './github.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  username: string = '';
  userData: any;
  repositories: any[] = [];
  userNotFound: boolean = false;
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  errorMessage: string = '';

  constructor(private githubService: GithubService) {}

  searchUser() {
    if (this.username.trim() === '') {
      return;
    }
    this.currentPage = 1;
    this.getUserDataAndRepos();
  }

  getUserDataAndRepos() {
    this.githubService.getUserDataAndRepos(this.username, this.currentPage, this.pageSize).subscribe(
      (data: { userData: any, reposData: any[], totalRepos: number }) => {
        this.updateUserDataAndRepos(data);
      },
      (error: any) => {
        this.handleError(error);
      }
    );
  }

  updateUserDataAndRepos(data: { userData: any, reposData: any[], totalRepos: number }) {
    this.userData = data.userData;
    this.repositories = data.reposData;
    this.totalPages = Math.ceil(data.totalRepos / this.pageSize);
    this.userNotFound = false;
    this.errorMessage = ''; // Clear any previous error message
  }

  handleError(error: any) {
    console.error('Error fetching user data and repositories:', error);
    if (error.status === 404) {
      this.userNotFound = true;
      this.userData = null;
      this.repositories = [];
      this.errorMessage = `User '${this.username}' not found.`;
    } else if (error.status === 401) {
      this.errorMessage = 'Unauthorized: Invalid access token.';
    } else {
      this.errorMessage = 'Error fetching user data and repositories. Please try again later.';
    }
  }

  getLanguageLogos(languages: string[]): string[] {
    return languages
      .map(language => this.getLanguageLogo(language))
      .filter((logo): logo is string => logo !== null); // Type guard to filter out null values
  }

  private getLanguageLogo(language: string): string | null {
    const logos: { [key: string]: string } = {
      JavaScript: 'https://cdn.jsdelivr.net/npm/simple-icons@v5/icons/javascript.svg',
      Python: 'https://cdn.jsdelivr.net/npm/simple-icons@v5/icons/python.svg',
      Java: 'https://cdn.jsdelivr.net/npm/simple-icons@v5/icons/java.svg',
      TypeScript: 'https://cdn.jsdelivr.net/npm/simple-icons@v5/icons/typescript.svg',
      Ruby: 'https://cdn.jsdelivr.net/npm/simple-icons@v5/icons/ruby.svg',
      PHP: 'https://cdn.jsdelivr.net/npm/simple-icons@v5/icons/php.svg',
      'C#': 'https://cdn.jsdelivr.net/npm/simple-icons@v5/icons/csharp.svg',
      'C++': 'https://cdn.jsdelivr.net/npm/simple-icons@v5/icons/cplusplus.svg',
      Go: 'https://cdn.jsdelivr.net/npm/simple-icons@v5/icons/go.svg',
      HTML: 'https://cdn.jsdelivr.net/npm/simple-icons@v5/icons/html5.svg',
      CSS: 'https://cdn.jsdelivr.net/npm/simple-icons@v5/icons/css3.svg',
      Angular: 'https://cdn.jsdelivr.net/npm/simple-icons@v5/icons/angular.svg', // Added Angular logo
      // Add more languages and their corresponding logo URLs as needed
    };
    return logos[language] || null;
  }

  setPage(page: number) {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.getUserDataAndRepos();
  }

  getPager() {
    let startPage: number, endPage: number;
    if (this.totalPages <= 10) {
      startPage = 1;
      endPage = this.totalPages;
    } else {
      if (this.currentPage <= 6) {
        startPage = 1;
        endPage = 10;
      } else if (this.currentPage + 4 >= this.totalPages) {
        startPage = this.totalPages - 9;
        endPage = this.totalPages;
      } else {
        startPage = this.currentPage - 5;
        endPage = this.currentPage + 4;
      }
    }
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }
}
