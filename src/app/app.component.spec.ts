import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { GithubService } from './github.service';
import { of, throwError } from 'rxjs';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let githubService: jasmine.SpyObj<GithubService>;

  beforeEach(async () => {
    const githubServiceSpy = jasmine.createSpyObj('GithubService', ['getUserDataAndRepos']);
    
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        { provide: GithubService, useValue: githubServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    githubService = TestBed.inject(GithubService) as jasmine.SpyObj<GithubService>;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should call getUserDataAndRepos when searchUser is called', () => {
    component.username = 'testuser';
    githubService.getUserDataAndRepos.and.returnValue(of({
      userData: {},
      reposData: [],
      totalRepos: 0
    }));

    component.searchUser();
    expect(githubService.getUserDataAndRepos).toHaveBeenCalledWith('testuser', 1, 10);
  });

  it('should update userData and repositories when getUserDataAndRepos succeeds', () => {
    const userData = { id: 1, login: 'testuser' };
    const reposData = [{ id: 1, name: 'repo1' }];
    const totalRepos = 1;
    githubService.getUserDataAndRepos.and.returnValue(of({
      userData,
      reposData,
      totalRepos
    }));

    component.getUserDataAndRepos();
    expect(component.userData).toEqual(userData);
    expect(component.repositories).toEqual(reposData);
    expect(component.totalPages).toEqual(1);
    expect(component.userNotFound).toBeFalsy();
    expect(component.errorMessage).toEqual('');
  });

  it('should handle error when getUserDataAndRepos fails with 404 status', () => {
    const error = { status: 404 };
    githubService.getUserDataAndRepos.and.returnValue(throwError(error));

    component.getUserDataAndRepos();
    expect(component.userNotFound).toBeTruthy();
    expect(component.userData).toBeNull();
    expect(component.repositories.length).toEqual(0);
    expect(component.errorMessage).toEqual(`User '${component.username}' not found.`);
  });

  it('should handle other errors when getUserDataAndRepos fails with non-404 status', () => {
    const error = { status: 500 };
    githubService.getUserDataAndRepos.and.returnValue(throwError(error));

    component.getUserDataAndRepos();
    expect(component.userNotFound).toBeFalsy();
    expect(component.errorMessage).toEqual('Error fetching user data and repositories. Please try again later.');
  });
});
