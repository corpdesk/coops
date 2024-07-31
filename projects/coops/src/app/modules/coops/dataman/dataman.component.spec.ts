import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatamanComponent } from './dataman.component';

describe('DatamanComponent', () => {
  let component: DatamanComponent;
  let fixture: ComponentFixture<DatamanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatamanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatamanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
