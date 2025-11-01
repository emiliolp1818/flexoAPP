import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Diseno } from './diseno';

describe('Diseno', () => {
  let component: Diseno;
  let fixture: ComponentFixture<Diseno>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Diseno]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Diseno);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
