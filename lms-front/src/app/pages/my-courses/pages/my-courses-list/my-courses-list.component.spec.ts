import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyCoursesListComponent } from './my-courses-list.component';

describe('MyCoursesListComponent', () => {
  let component: MyCoursesListComponent;
  let fixture: ComponentFixture<MyCoursesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyCoursesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyCoursesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
