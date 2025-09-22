import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Programaciones } from './programaciones';

describe('Programaciones', () => {
  let component: Programaciones;
  let fixture: ComponentFixture<Programaciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Programaciones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Programaciones);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
