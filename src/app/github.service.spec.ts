import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { GithubService } from './github.service';

describe('GithubService', () => {
  let service: GithubService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GithubService]
    });
    service = TestBed.inject(GithubService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch user data', () => {
    const mockUserData = { id: 1, login: 'testuser' };
    const username = 'testuser';

    service.getUserData(username).subscribe(userData => {
      expect(userData).toEqual(mockUserData);
    });

    const req = httpMock.expectOne(`https://api.github.com/users/${username}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUserData);
  });

  it('should fetch user repositories', () => {
    const mockReposData = [{ id: 1, name: 'repo1' }, { id: 2, name: 'repo2' }];
    const username = 'testuser';
    const page = 1;
    const perPage = 10;

    service.getUserRepos(username, page, perPage).subscribe(reposData => {
      expect(reposData).toEqual(mockReposData);
    });

    const req = httpMock.expectOne(`https://api.github.com/users/${username}/repos?page=${page}&per_page=${perPage}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockReposData);
  });

  it('should fetch repo languages', () => {
    const mockLanguages = ['JavaScript', 'TypeScript'];
    const repoUrl = 'https://api.github.com/repos/testuser/repo1/languages';

    service.getRepoLanguages(repoUrl).subscribe(languages => {
      expect(languages).toEqual(mockLanguages);
    });

    const req = httpMock.expectOne(repoUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockLanguages);
  });

  it('should fetch user data and repositories', () => {
    const mockUserData = { id: 1, login: 'testuser', public_repos: 2 };
    const mockReposData = [{ id: 1, name: 'repo1' }, { id: 2, name: 'repo2' }];
    const totalRepos = 2;
    const username = 'testuser';
    const page = 1;
    const perPage = 10;

    service.getUserDataAndRepos(username, page, perPage).subscribe(data => {
      expect(data.userData).toEqual(mockUserData);
      expect(data.reposData).toEqual(mockReposData);
      expect(data.totalRepos).toEqual(totalRepos);
    });

    const userDataReq = httpMock.expectOne(`https://api.github.com/users/${username}`);
    expect(userDataReq.request.method).toBe('GET');
    userDataReq.flush(mockUserData);

    const reposReq = httpMock.expectOne(`https://api.github.com/users/${username}/repos?page=${page}&per_page=${perPage}`);
    expect(reposReq.request.method).toBe('GET');
    reposReq.flush(mockReposData);
  });
});
